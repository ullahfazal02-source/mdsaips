import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
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
 *         description: Registration successful
 *       400:
 *         description: Validation error or duplicate account
 *       403:
 *         description: Admin registration forbidden
 */
router.post('/register', authLimiter, registerUser);

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
