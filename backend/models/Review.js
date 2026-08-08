import mongoose from 'mongoose';

/**
 * Review Schema
 * 
 * Verified customer reviews and ratings tied 1-to-1 with a completed Booking.
 */
const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must be linked to a Booking'],
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must record the Customer'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Review must record the Vendor'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Review must record the Service'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [
      {
        type: String,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ vendor: 1 });
reviewSchema.index({ service: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ rating: -1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
