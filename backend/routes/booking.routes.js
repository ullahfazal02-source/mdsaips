import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  getVendorRequests,
  getVendorBookings,
  confirmBooking,
  startBooking,
  completeBooking,
  rejectBooking,
} from '../controllers/booking.controller.js';
import protect from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

/**
 * @openapi
 * /bookings:
 *   post:
 *     summary: Create a new service booking request (Customer)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - eventDate
 *               - eventDetails
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: 65123456789abcdef0123456
 *               packageSelected:
 *                 type: string
 *                 enum: [basic, standard, premium]
 *                 example: standard
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-20
 *               eventDetails:
 *                 type: object
 *                 required:
 *                   - eventType
 *                   - address
 *                 properties:
 *                   eventType:
 *                     type: string
 *                     example: Wedding
 *                   guestCount:
 *                     type: integer
 *                     example: 200
 *                   venue:
 *                     type: string
 *                     example: Grand Palace
 *                   address:
 *                     type: string
 *                     example: Bangalore
 *                   specialRequirements:
 *                     type: string
 *                     example: Floral stage decoration
 *               notes:
 *                 type: string
 *                 example: Please contact me before the event.
 *     responses:
 *       201:
 *         description: Booking request submitted successfully
 *       400:
 *         description: Validation error or past date
 *       404:
 *         description: Service or vendor not found
 *       409:
 *         description: Vendor unavailable or date conflict
 */
router.post('/', protect, createBooking);

/**
 * @openapi
 * /bookings:
 *   get:
 *     summary: Get logged-in customer's bookings
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in_progress, completed, cancelled, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated customer bookings
 */
router.get('/', protect, authorizeRoles('customer', 'admin'), getMyBookings);

/**
 * @openapi
 * /bookings/customer/all:
 *   get:
 *     summary: Get all customer bookings (Customer)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of customer bookings
 */
router.get('/customer/all', protect, authorizeRoles('customer', 'admin'), getMyBookings);

/**
 * @openapi
 * /bookings/vendor/requests:
 *   get:
 *     summary: Get pending booking requests for authenticated vendor
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of pending booking requests
 */
router.get('/vendor/requests', protect, authorizeRoles('vendor', 'customer', 'admin'), getVendorRequests);

/**
 * @openapi
 * /bookings/vendor/all:
 *   get:
 *     summary: Get all bookings for authenticated vendor
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of vendor bookings
 */
router.get('/vendor/all', protect, authorizeRoles('vendor', 'customer', 'admin'), getVendorBookings);

/**
 * @openapi
 * /bookings/{id}:
 *   get:
 *     summary: Get booking details by ID (Customer, Vendor, or Admin)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking details object
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get('/:id', protect, getBookingById);

/**
 * @openapi
 * /bookings/{id}/confirm:
 *   put:
 *     summary: Vendor confirms a pending booking request
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking confirmed
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden - Ownership mismatch
 */
router.put('/:id/confirm', protect, authorizeRoles('vendor', 'customer', 'admin'), confirmBooking);

/**
 * @openapi
 * /bookings/{id}/start:
 *   put:
 *     summary: Vendor starts a confirmed service booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service started
 *       400:
 *         description: Booking must be confirmed first
 */
router.put('/:id/start', protect, authorizeRoles('vendor', 'customer', 'admin'), startBooking);

/**
 * @openapi
 * /bookings/{id}/complete:
 *   put:
 *     summary: Vendor marks booking service as completed
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service completed and totalBookings incremented
 *       400:
 *         description: Booking must be in_progress first
 */
router.put('/:id/complete', protect, authorizeRoles('vendor', 'customer', 'admin'), completeBooking);

/**
 * @openapi
 * /bookings/{id}/reject:
 *   put:
 *     summary: Vendor rejects a pending booking request
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking request rejected
 *       400:
 *         description: Booking must be pending first
 *     
 */
router.put('/:id/reject', protect, authorizeRoles('vendor', 'customer', 'admin'), rejectBooking);

export default router;
