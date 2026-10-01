import { Router } from 'express';
import { 
  getPendingVendors, 
  verifyVendor, 
  getAdminStats, 
  getAdminVendorOverview, 
  moderateOffer 
} from '../controllers/adminVendor.controller.js';
import protect from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

// Protect all admin routes with JWT authentication and admin RBAC role check
router.use(protect);
router.use(authorizeRoles('admin'));

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     summary: Get overall platform statistics for Admin Panel
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Real platform stats
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/stats', getAdminStats);

/**
 * @openapi
 * /admin/vendors/pending:
 *   get:
 *     summary: View pending vendor verification requests
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of unverified vendor profiles
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/vendors/pending', getPendingVendors);

/**
 * @openapi
 * /admin/vendors/{id}/verify:
 *   put:
 *     summary: Approve or reject vendor verification
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor verification status updated successfully
 *       404:
 *         description: Vendor not found
 */
router.put('/vendors/:id/verify', verifyVendor);

export default router;
