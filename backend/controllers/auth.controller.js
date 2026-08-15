import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from '../validations/user.validation.js';
import { createOTP, verifyOTP, resendOTP } from '../services/otp.service.js';
import sendOTPEmail from '../utils/sendOTP.js';
import logger from '../utils/logger.js';

/**
 * Generate JWT signed token helper
 * @param {string} userId User ID
 * @param {string} role User Role
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'mdsaips_default_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * @desc    Register a new Customer or Vendor
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const { name, email, phone, password, role } = value;

    // Reject public admin registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Public registration as administrator is strictly prohibited',
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Check duplicate phone
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'An account with this phone number already exists',
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User record with isEmailVerified = false
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || 'customer',
      isEmailVerified: false,
      isPhoneVerified: false,
      status: 'active',
    });

    logger.info(`User registered successfully: [${user._id}] ${user.email} (${user.role})`);

    // Create OTP and send email
    try {
      const { plainOtp } = await createOTP(user._id, user.email, 'email_verify');
      await sendOTPEmail(user.email, user.name, plainOtp);
    } catch (otpErr) {
      logger.error(`Error during registration OTP creation/sending: ${otpErr.message}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Verification code sent to your email.',
      userId: user._id.toString(),
      email: user.email,
      requiresVerification: true,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify OTP for email verification
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyUserOTP = async (req, res, next) => {
  try {
    const { error, value } = verifyOtpSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: errorMessages[0] || 'Validation failed',
        errors: errorMessages,
      });
    }

    const { userId, otp, type } = value;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Unable to verify this account.',
      });
    }

    if (type === 'email_verify' && user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your email is already verified.',
      });
    }

    const verificationResult = await verifyOTP(userId, otp, type);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
      });
    }

    // Mark email as verified
    if (type === 'email_verify') {
      user.isEmailVerified = true;
      await user.save();
    }

    // Issue JWT Token upon verification
    const token = generateToken(user._id, user.role);

    logger.info(`User email verified successfully: [${user._id}] ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Resend OTP verification code
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
export const resendUserOTP = async (req, res, next) => {
  try {
    const { error, value } = resendOtpSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: errorMessages[0] || 'Validation failed',
        errors: errorMessages,
      });
    }

    const { userId, type } = value;

    const result = await resendOTP(userId, null, type);

    if (!result.success) {
      const statusCode = result.reason === 'cooldown' || result.reason === 'rate_limit' ? 429 : 400;
      return res.status(statusCode).json({
        success: false,
        message: result.message,
      });
    }

    // Send email
    if (result.plainOtp && result.user) {
      await sendOTPEmail(result.user.email, result.user.name, result.plainOtp);
    }

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    const { email, password } = value;

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check user account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.status}. Please contact support.`,
      });
    }

    // Check email verification status
    if (!user.isEmailVerified) {
      return res.status(200).json({
        success: false,
        requiresVerification: true,
        userId: user._id.toString(),
        email: user.email,
        message: 'Please verify your email before logging in.',
      });
    }

    // Issue JWT token
    const token = generateToken(user._id, user.role);

    logger.info(`User logged in: [${user._id}] ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user & instruct client state clearing
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
export const logoutUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};
