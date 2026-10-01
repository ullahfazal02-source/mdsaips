import { Chat, Booking, User, Vendor, Notification } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Helper to verify if req.user is authorized participant (Customer or Vendor) of booking
 */
const verifyBookingParticipant = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId).populate('vendorId');
  if (!booking) return null;

  const isCustomer = booking.customerId.toString() === userId.toString();
  const isVendorUser = booking.vendorId && booking.vendorId.userId
    ? booking.vendorId.userId.toString() === userId.toString()
    : false;

  if (!isCustomer && !isVendorUser) {
    return null;
  }

  const receiverId = isCustomer
    ? (booking.vendorId?.userId || booking.vendorId?.user)
    : booking.customerId;

  return { booking, isCustomer, isVendorUser, receiverId };
};

/**
 * @desc    Get chat messages for a specific booking
 * @route   GET /api/v1/chats/booking/:bookingId
 * @access  Private (Customer, Vendor associated with booking)
 */
export const getBookingChat = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const authInfo = await verifyBookingParticipant(bookingId, req.user.id);

    if (!authInfo) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view messages for this booking.',
      });
    }

    const messages = await Chat.find({ bookingId })
      .populate('senderId', 'name email avatar role')
      .populate('receiverId', 'name email avatar role')
      .sort({ createdAt: 1 });

    // Mark unread messages sent to current user as read
    await Chat.updateMany(
      { bookingId, receiverId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      data: {
        bookingId,
        messages,
      },
    });
  } catch (error) {
    logger.error(`Error in getBookingChat: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving chat messages' });
  }
};

/**
 * @desc    Send a message in a booking chat
 * @route   POST /api/v1/chats/booking/:bookingId/messages
 * @access  Private (Customer, Vendor associated with booking)
 */
export const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const authInfo = await verifyBookingParticipant(bookingId, req.user.id);
    if (!authInfo) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only assigned customer or vendor can participate in this chat.',
      });
    }

    const newMessage = new Chat({
      bookingId,
      senderId: req.user.id,
      receiverId: authInfo.receiverId,
      message: message.trim(),
    });

    await newMessage.save();

    // Trigger Notification to receiver
    await Notification.create({
      userId: authInfo.receiverId,
      title: 'New Chat Message',
      message: `New message on Booking #${authInfo.booking.bookingNumber}`,
      type: 'chat_message',
      link: `/chat/${bookingId}`,
    });

    const populatedMsg = await Chat.findById(newMessage._id)
      .populate('senderId', 'name email avatar role')
      .populate('receiverId', 'name email avatar role');

    return res.status(201).json({
      success: true,
      data: {
        message: populatedMsg,
      },
    });
  } catch (error) {
    logger.error(`Error in sendMessage: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

/**
 * @desc    Get user's active booking conversation list
 * @route   GET /api/v1/chats/my-conversations
 * @access  Private
 */
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    let vendor = null;

    if (req.user.role === 'vendor') {
      vendor = await Vendor.findOne({ $or: [{ userId }, { user: userId }] });
    }

    const query = vendor
      ? { $or: [{ customerId: userId }, { vendorId: vendor._id }] }
      : { customerId: userId };

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email avatar')
      .populate({
        path: 'vendorId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .populate('serviceId', 'title category images')
      .sort({ updatedAt: -1 });

    const conversations = await Promise.all(
      bookings.map(async (b) => {
        const lastMessage = await Chat.findOne({ bookingId: b._id }).sort({ createdAt: -1 });
        const unreadCount = await Chat.countDocuments({
          bookingId: b._id,
          receiverId: userId,
          isRead: false,
        });

        return {
          bookingId: b._id,
          bookingNumber: b.bookingNumber,
          status: b.status,
          serviceTitle: b.serviceId?.title || 'Service',
          customer: b.customerId,
          vendor: b.vendorId,
          lastMessage,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        conversations,
      },
    });
  } catch (error) {
    logger.error(`Error in getMyConversations: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving conversations' });
  }
};
