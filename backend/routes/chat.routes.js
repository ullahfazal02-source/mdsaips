import express from 'express';
import { getBookingChat, sendMessage, getMyConversations } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/my-conversations', getMyConversations);
router.get('/booking/:bookingId', getBookingChat);
router.post('/booking/:bookingId/messages', sendMessage);

export default router;
