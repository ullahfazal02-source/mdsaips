import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  verifyUserOTP,
  resendUserOTP,
  getCurrentUser,
  logoutUser,
  googleAuth,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 auth attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// Dedicated Rate Limiter for OTP Verification: Max 5 attempts per 15 minutes per IP
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 15 minutes.',
  },
});

// Dedicated Rate Limiter for OTP Resends: Max 3 attempts per hour per IP
const resendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many resend requests from this IP. Please try again after an hour.',
  },
});

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new Customer or Vendor
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               password:
 *                 type: string
 *                 example: StrongPassword@123
 *               role:
 *                 type: string
 *                 enum: [customer, vendor]
 *                 example: customer
 *     responses:
 *       201:
 *         description: Registration successful and verification code sent
 *       400:
 *         description: Validation error or duplicate account
 *       403:
 *         description: Admin registration forbidden
 */
router.post('/register', authLimiter, registerUser);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     summary: Verify 6-digit OTP email verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6a7a099146fd882dc78345f0
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               type:
 *                 type: string
 *                 example: email_verify
 *     responses:
 *       200:
 *         description: Email verified successfully and JWT issued
 *       400:
 *         description: Incorrect or expired OTP code
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/verify-otp', verifyOtpLimiter, verifyUserOTP);

/**
 * @openapi
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP verification code to user's email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6a7a099146fd882dc78345f0
 *               type:
 *                 type: string
 *                 example: email_verify
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       429:
 *         description: Cooldown active or hourly rate limit reached
 */
router.post('/resend-otp', resendOtpLimiter, resendUserOTP);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user & obtain JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: StrongPassword@123
 *     responses:
 *       200:
 *         description: Login successful or verification required
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account suspended or inactive
 */
router.post('/login', authLimiter, loginUser);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', logoutUser);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     summary: Authenticate user via Google OAuth ID Token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google authentication successful and JWT issued
 *       400:
 *         description: Invalid or unverified Google token
 */
router.post('/google', authLimiter, googleAuth);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized or missing token
 */
router.get('/me', protect, getCurrentUser);

export default router;
