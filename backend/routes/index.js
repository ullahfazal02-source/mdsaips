/**
 * Master API Router Configuration
 * 
 * Aggregates sub-routers and defines system status / health routes.
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import vendorRoutes from './vendor.routes.js';
import adminRoutes from './admin.routes.js';
import serviceRoutes from './service.routes.js';
import bookingRoutes from './booking.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import wishlistRoutes from './wishlist.routes.js';

const router = Router();

// Mount Authentication Module Routes
router.use('/auth', authRoutes);

// Mount Vendor Management Module Routes
router.use('/vendors', vendorRoutes);

// Mount Admin Management Module Routes
router.use('/admin', adminRoutes);

// Mount Service Listings Module Routes
router.use('/services', serviceRoutes);

// Mount Booking System Module Routes
router.use('/bookings', bookingRoutes);

// Mount Payment System Module Routes
router.use('/payments', paymentRoutes);

// Mount Reviews & Ratings Module Routes
router.use('/reviews', reviewRoutes);

// Mount Wishlist System Module Routes
router.use('/wishlist', wishlistRoutes);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System Health Check Endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server status operational
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MDSAIPS Core API Service Operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
