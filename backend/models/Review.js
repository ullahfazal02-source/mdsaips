import mongoose from 'mongoose';

/**
 * Review Schema - Module 9 Customer Reviews & Ratings System
 * 
 * Verified customer reviews tied 1-to-1 with a completed Booking.
 */
const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must be linked to a Booking'],
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must record the Customer'],
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Review must record the Vendor'],
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Review must record the Service'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        enum: {
          values: ['on_time', 'professional', 'good_value', 'great_quality', 'would_recommend'],
          message: '{VALUE} is not an allowed review tag',
        },
      },
    ],
    vendorReply: {
      message: {
        type: String,
        trim: true,
        default: null,
      },
      comment: {
        type: String,
        trim: true,
        default: null,
      },
      repliedAt: {
        type: Date,
        default: null,
      },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases
reviewSchema.virtual('bookingId').get(function () {
  return this.booking;
}).set(function (val) {
  this.booking = val;
});

reviewSchema.virtual('serviceId').get(function () {
  return this.service;
}).set(function (val) {
  this.service = val;
});

reviewSchema.virtual('vendorId').get(function () {
  return this.vendor;
}).set(function (val) {
  this.vendor = val;
});

reviewSchema.virtual('customerId').get(function () {
  return this.customer;
}).set(function (val) {
  this.customer = val;
});

// Compound & Performance Indexes
reviewSchema.index({ vendor: 1, createdAt: -1 });
reviewSchema.index({ service: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
