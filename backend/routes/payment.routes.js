import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createPaymentOrder,
  verifyPayment,
  paymentFailure,
  getPaymentHistory,
  getPaymentDetails,
} from '../controllers/payment.controller.js';

const router = Router();

// All payment endpoints require authentication
router.use(protect);

/**
 * @openapi
 * /payments/create-order:
 *   post:
 *     summary: Create Razorpay payment order for booking
 *     tags: [Payments]
 */
router.post('/create-order', createPaymentOrder);

/**
 * @openapi
 * /payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payments]
 */
router.post('/verify', verifyPayment);

/**
 * @openapi
 * /payments/failure:
 *   post:
 *     summary: Record Razorpay payment failure
 *     tags: [Payments]
 */
router.post('/failure', paymentFailure);

/**
 * @openapi
 * /payments/history:
 *   get:
 *     summary: Get payment history for authenticated user/vendor/admin
 *     tags: [Payments]
 */
router.get('/history', getPaymentHistory);

/**
 * @openapi
 * /payments/{bookingId}:
 *   get:
 *     summary: Get payment details for a specific booking
 *     tags: [Payments]
 */
router.get('/:bookingId', getPaymentDetails);

export default router;
