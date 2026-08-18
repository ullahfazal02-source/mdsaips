import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  submitReview,
  getServiceReviews,
  getVendorReviews,
  replyToReview,
  markReviewHelpful,
  deleteReview,
} from '../controllers/review.controller.js';

const router = Router();

// Public routes for fetching reviews
/**
 * @openapi
 * /reviews/service/{serviceId}:
 *   get:
 *     summary: Get reviews and rating summary for a service
 *     tags: [Reviews]
 */
router.get('/service/:serviceId', getServiceReviews);

/**
 * @openapi
 * /reviews/vendor/{vendorId}:
 *   get:
 *     summary: Get reviews for a vendor profile
 *     tags: [Reviews]
 */
router.get('/vendor/:vendorId', getVendorReviews);

// Protected routes
router.use(protect);

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Submit a verified review for a completed booking
 *     tags: [Reviews]
 */
router.post('/', submitReview);

/**
 * @openapi
 * /reviews/{id}/reply:
 *   put:
 *     summary: Vendor reply to a customer review
 *     tags: [Reviews]
 */
router.put('/:id/reply', replyToReview);

/**
 * @openapi
 * /reviews/{id}/helpful:
 *   put:
 *     summary: Mark a review as helpful
 *     tags: [Reviews]
 */
router.put('/:id/helpful', markReviewHelpful);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review (Admin only)
 *     tags: [Reviews]
 */
router.delete('/:id', authorizeRoles('admin'), deleteReview);

export default router;
