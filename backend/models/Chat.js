import mongoose from 'mongoose';

/**
 * Chat Schema
 * 
 * Secure booking-based messaging between customer and vendor.
 */
const chatSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Chat message must be linked to a booking'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must specify a sender'],
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Message must specify a receiver'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ bookingId: 1, createdAt: 1 });
chatSchema.index({ senderId: 1, receiverId: 1 });

export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
export default Chat;
