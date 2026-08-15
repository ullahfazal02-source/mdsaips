import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import OTP from '../../models/OTP.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';

/**
 * Generate a cryptographically secure 6-digit numeric OTP code
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Invalidate all existing active OTP records for a user and type
 */
export const invalidateExistingOTPs = async (userId, type) => {
  await OTP.updateMany(
    { userId, type, isUsed: false },
    { $set: { isUsed: true } }
  );
};

/**
 * Create, hash, and persist a new OTP record
 * Returns plain OTP solely for transient dispatch (e.g. email delivery).
 */
export const createOTP = async (userId, email, type = 'email_verify') => {
  // Invalidate previous OTPs of same type
  await invalidateExistingOTPs(userId, type);

  const plainOtp = generateOTP();
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(plainOtp, salt);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const otpRecord = await OTP.create({
    userId,
    email: email.toLowerCase(),
    otp: hashedOtp,
    type,
    expiresAt,
    isUsed: false,
    attempts: 0,
  });

  return { otpRecord, plainOtp };
};

/**
 * Verify a user-submitted OTP against the stored bcrypt hash
 */
export const verifyOTP = async (userId, userSubmittedOtp, type = 'email_verify') => {
  // Find active, unexpired OTP for user
  const storedOtp = await OTP.findOne({
    userId,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!storedOtp) {
    return {
      success: false,
      reason: 'expired_or_not_found',
      message: 'Your verification code has expired. Please request a new code.',
    };
  }

  // Check if attempts limit exceeded
  if (storedOtp.attempts >= 3) {
    storedOtp.isUsed = true;
    await storedOtp.save();
    return {
      success: false,
      reason: 'too_many_attempts',
      message: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  // Compare submitted OTP with hash
  const isMatch = await bcrypt.compare(userSubmittedOtp.toString(), storedOtp.otp);

  if (!isMatch) {
    storedOtp.attempts += 1;
    if (storedOtp.attempts >= 3) {
      storedOtp.isUsed = true;
    }
    await storedOtp.save();

    if (storedOtp.attempts >= 3) {
      return {
        success: false,
        reason: 'too_many_attempts',
        message: 'Too many incorrect attempts. Please request a new verification code.',
      };
    }

    return {
      success: false,
      reason: 'invalid_otp',
      message: 'Incorrect verification code.',
    };
  }

  // Mark OTP as used
  storedOtp.isUsed = true;
  await storedOtp.save();

  return {
    success: true,
    message: 'Verification successful.',
  };
};

/**
 * Handle Resend OTP with cooldown and rate limiting checks
 */
export const resendOTP = async (userId, email, type = 'email_verify') => {
  // Check user existence & verification status
  const user = await User.findById(userId);
  if (!user) {
    return {
      success: false,
      reason: 'user_not_found',
      message: 'Unable to verify this account.',
    };
  }

  if (type === 'email_verify' && user.isEmailVerified) {
    return {
      success: false,
      reason: 'already_verified',
      message: 'Your email is already verified.',
    };
  }

  // Check 60-second cooldown from last created OTP
  const latestOtp = await OTP.findOne({ userId, type }).sort({ createdAt: -1 });
  if (latestOtp) {
    const timePassedMs = Date.now() - new Date(latestOtp.createdAt).getTime();
    if (timePassedMs < 60000) {
      const waitSeconds = Math.ceil((60000 - timePassedMs) / 1000);
      return {
        success: false,
        reason: 'cooldown',
        message: `Please wait ${waitSeconds} seconds before requesting another code.`,
      };
    }
  }

  // Check hourly rate limit (max 3 resend attempts per hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const hourlyCount = await OTP.countDocuments({
    userId,
    type,
    createdAt: { $gte: oneHourAgo },
  });

  if (hourlyCount >= 3) {
    return {
      success: false,
      reason: 'rate_limit',
      message: 'Maximum OTP resend requests reached for this hour. Please try again later.',
    };
  }

  // Generate and save new OTP
  const { plainOtp } = await createOTP(userId, email || user.email, type);

  return {
    success: true,
    message: 'A new verification code has been sent.',
    plainOtp,
    user,
  };
};

export default {
  generateOTP,
  invalidateExistingOTPs,
  createOTP,
  verifyOTP,
  resendOTP,
};
