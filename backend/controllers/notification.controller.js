import { Notification } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    logger.error(`Error in getMyNotifications: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isRead: true }
    );

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    logger.error(`Error in markNotificationRead: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};
