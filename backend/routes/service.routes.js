import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  updateService,
  toggleServiceStatus,
  deleteService,
} from '../controllers/service.controller.js';
import protect from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

/**
 * @openapi
 * /services:
 *   post:
 *     summary: Create a new service listing (Vendor)
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - price
 *               - city
 *             properties:
 *               title:
 *                 type: string
 *                 example: Full Wedding Decoration & Stage Setup
 *               description:
 *                 type: string
 *                 example: Complete floral, lighting, and stage decoration setup.
 *               category:
 *                 type: string
 *                 enum: [event, construction, home, accommodation]
 *                 example: event
 *               subCategory:
 *                 type: string
 *                 example: wedding_decor
 *               price:
 *                 type: number
 *                 example: 45000
 *               priceUnit:
 *                 type: string
 *                 example: per_event
 *               city:
 *                 type: string
 *                 example: Bangalore
 *               packages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       enum: [basic, standard, premium]
 *                     price:
 *                       type: number
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Service listing created successfully
 *       403:
 *         description: Vendor profile required
 */
router.post('/', protect, authorizeRoles('vendor', 'customer'), createService);

/**
 * @openapi
 * /services:
 *   get:
 *     summary: Search, filter, and discover public service listings
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, price_asc, price_desc, popularity, newest]
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
 *         description: Paginated service search results
 */
router.get('/', getServices);

/**
 * @openapi
 * /services/my-services:
 *   get:
 *     summary: Get service listings owned by logged-in vendor
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of vendor's service listings
 */
router.get('/my-services', protect, getMyServices);

/**
 * @openapi
 * /services/{id}:
 *   get:
 *     summary: Get public service details by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detailed service listing info
 *       404:
 *         description: Service listing not found
 */
router.get('/:id', getServiceById);

/**
 * @openapi
 * /services/{id}:
 *   put:
 *     summary: Update service listing (Owner/Admin)
 *     tags: [Services]
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
 *         description: Service listing updated
 *       403:
 *         description: Forbidden - Ownership mismatch
 */
router.put('/:id', protect, updateService);

/**
 * @openapi
 * /services/{id}/status:
 *   patch:
 *     summary: Toggle service active status
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service status updated
 */
router.patch('/:id/status', protect, toggleServiceStatus);

/**
 * @openapi
 * /services/{id}:
 *   delete:
 *     summary: Delete service listing
 *     tags: [Services]
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
 *         description: Service listing deleted
 */
router.delete('/:id', protect, deleteService);

export default router;
