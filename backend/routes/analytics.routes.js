import express from 'express';
import { trackEvent, getVendorAnalytics } from '../controllers/analytics.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/track', optionalAuth, trackEvent);
router.get('/my-analytics', protect, authorize('vendor'), getVendorAnalytics);

export default router;
