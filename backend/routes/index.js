/**
 * Master API Router Configuration
 * 
 * Aggregates sub-routers and defines system status / health routes.
 */

import { Router } from 'express';

const router = Router();

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
