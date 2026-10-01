import { Router } from 'express';
import {
  getWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  updateWishlistNote,
  moveToBooking,
  getShareLink,
  getSharedWishlistByToken,
} from '../controllers/wishlist.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router();

// Public shared wishlist route
router.get('/shared/:shareToken', getSharedWishlistByToken);

// Customer generate share link route
router.get('/share-link', protect, getShareLink);

/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Get authenticated customer's wishlist items
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist details and items list
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getWishlist);

/**
 * @openapi
 * /wishlist/count:
 *   get:
 *     summary: Get count of saved items in customer's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist item count
 */
router.get('/count', protect, getWishlistCount);

/**
 * @openapi
 * /wishlist/clear:
 *   delete:
 *     summary: Clear all items from customer's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
 */
router.delete('/clear', protect, clearWishlist);

/**
 * @openapi
 * /wishlist/move-to-booking/{serviceId}:
 *   post:
 *     summary: Get redirection details to configure booking for a wishlisted service
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Redirection info to booking configuration page
 *       400:
 *         description: Service is inactive
 *       404:
 *         description: Service not found
 */
router.post('/move-to-booking/:serviceId', protect, moveToBooking);

/**
 * @openapi
 * /wishlist/{serviceId}:
 *   post:
 *     summary: Add a service listing to customer's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: Important for December wedding
 *     responses:
 *       201:
 *         description: Service added to wishlist
 *       400:
 *         description: Cannot add own service to wishlist
 *       409:
 *         description: Service already in wishlist
 */
router.post('/:serviceId', protect, addToWishlist);

/**
 * @openapi
 * /wishlist/{serviceId}:
 *   delete:
 *     summary: Remove a service listing from customer's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service removed from wishlist
 */
router.delete('/:serviceId', protect, removeFromWishlist);

/**
 * @openapi
 * /wishlist/{serviceId}/note:
 *   put:
 *     summary: Update personal note for a wishlisted service
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 example: Good venue option for reception
 *     responses:
 *       200:
 *         description: Wishlist note updated
 *       404:
 *         description: Item not found in wishlist
 */
router.put('/:serviceId/note', protect, updateWishlistNote);

export default router;
