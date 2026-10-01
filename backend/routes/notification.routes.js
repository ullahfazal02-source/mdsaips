import express from 'express';
import { getMyNotifications, markNotificationRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;
