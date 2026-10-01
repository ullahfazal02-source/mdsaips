import mongoose from 'mongoose';

/**
 * Notification Schema
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'booking_request',
        'booking_accepted',
        'booking_rejected',
        'booking_expired',
        'chat_message',
        'offer_activated',
        'offer_expired',
        'vacation_mode',
        'service_area_updated',
        'payment',
        'refund',
        'system',
      ],
      default: 'system',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
