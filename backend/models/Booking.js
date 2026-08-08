import mongoose from 'mongoose';

/**
 * Booking Schema
 * 
 * Manages service reservations connecting Customers, Vendors, and Services.
 * Tracks lifecycle status, scheduling dates, and payment states.
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must specify a customer'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Booking must specify a vendor'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Booking must specify a service'],
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startDate: Date,
    endDate: Date,
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: [0, 'Deposit amount cannot be negative'],
    },
    bookingStatus: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'partially_paid', 'paid', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'unpaid',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for Booking Management & Queries
bookingSchema.index({ customer: 1 });
bookingSchema.index({ vendor: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ eventDate: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
