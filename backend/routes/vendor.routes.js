import { Router } from 'express';
import {
  registerVendor,
  getVendors,
  getVendorById,
  updateVendor,
  getAvailability,
  updateAvailability,
  updateCancellationPolicy,
  uploadVerificationDocuments,
  getVendorDashboardStats,
} from '../controllers/vendor.controller.js';
import protect from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

/**
 * @openapi
 * /vendors/register:
 *   post:
 *     summary: Register a new Vendor profile
 *     tags: [Vendors]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - category
 *               - pricing
 *               - location
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: Royal Events
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [event, construction, home, accommodation]
 *                 example: event
 *               subCategory:
 *                 type: string
 *                 example: event_planner
 *               servicesOffered:
 *                 type: array
 *                 items:
 *                   type: string
 *               pricing:
 *                 type: object
 *                 properties:
 *                   basePrice:
 *                     type: number
 *                     example: 50000
 *                   priceUnit:
 *                     type: string
 *                     example: per_event
 *                   currency:
 *                     type: string
 *                     example: INR
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                     example: Bangalore
 *                   state:
 *                     type: string
 *                     example: Karnataka
 *                   pincode:
 *                     type: string
 *                     example: 560001
 *     responses:
 *       201:
 *         description: Vendor profile created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Vendor profile already exists
 */
router.post('/register', protect, authorizeRoles('customer', 'vendor'), registerVendor);

/**
 * @openapi
 * /vendors:
 *   get:
 *     summary: Search and filter vendors with pagination
 *     tags: [Vendors]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Paginated vendor search results
 */
router.get('/', getVendors);

/**
 * @openapi
 * /vendors/dashboard/stats:
 *   get:
 *     summary: Get vendor portal dashboard statistics
 *     tags: [Vendors]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor dashboard stats
 *       404:
 *         description: Vendor profile not found
 */
router.get('/dashboard/stats', protect, getVendorDashboardStats);

/**
 * @openapi
 * /vendors/verify-documents:
 *   post:
 *     summary: Submit document URLs for admin verification
 *     tags: [Vendors]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       200:
 *         description: Documents submitted successfully
 */
router.post('/verify-documents', protect, uploadVerificationDocuments);

/**
 * @openapi
 * /vendors/{id}:
 *   get:
 *     summary: Get vendor public profile by ID
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor public profile details
 *       404:
 *         description: Vendor not found
 */
router.get('/:id', getVendorById);

/**
 * @openapi
 * /vendors/{id}:
 *   put:
 *     summary: Update vendor business profile
 *     tags: [Vendors]
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
 *         description: Vendor profile updated
 *       403:
 *         description: Forbidden - ownership violation
 */
router.put('/:id', protect, updateVendor);

/**
 * @openapi
 * /vendors/{id}/availability:
 *   get:
 *     summary: Get vendor availability schedules
 *     tags: [Vendors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor availability schedule
 */
router.get('/:id/availability', getAvailability);

/**
 * @openapi
 * /vendors/{id}/availability:
 *   put:
 *     summary: Update vendor availability schedule
 *     tags: [Vendors]
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
 *         description: Availability schedule updated
 */
router.put('/:id/availability', protect, updateAvailability);

/**
 * @openapi
 * /vendors/{id}/cancellation-policy:
 *   put:
 *     summary: Update vendor cancellation policy
 *     tags: [Vendors]
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
 *         description: Cancellation policy updated
 */
router.put('/:id/cancellation-policy', protect, updateCancellationPolicy);

export default router;
