import mongoose from 'mongoose';

/**
 * Cancellation Schema
 * 
 * Manages booking cancellations, refund calculations, and dispute records.
 */
const cancellationSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Cancellation must refer to a Booking'],
      unique: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who requested cancellation is required'],
    },
    userRole: {
      type: String,
      enum: {
        values: ['customer', 'vendor', 'admin'],
        message: '{VALUE} is not a valid user role',
      },
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Cancellation reason is required'],
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative'],
    },
    refundStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'processed', 'rejected'],
        message: '{VALUE} is not a valid refund status',
      },
      default: 'pending',
    },
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
cancellationSchema.index({ cancelledBy: 1 });
cancellationSchema.index({ refundStatus: 1 });

export const Cancellation = mongoose.models.Cancellation || mongoose.model('Cancellation', cancellationSchema);
export default Cancellation;
