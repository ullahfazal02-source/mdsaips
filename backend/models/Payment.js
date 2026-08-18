import mongoose from 'mongoose';

/**
 * Payment Schema - Module 8 Financial System
 * 
 * Razorpay TEST Mode payments and transaction records for Bookings.
 */
const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Payment must be associated with a Booking'],
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must record a customer'],
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Payment must record a vendor'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay Order ID is required'],
      trim: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['created', 'paid', 'failed', 'refunded', 'partial_refund'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'created',
      index: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative'],
    },
    refundId: {
      type: String,
      trim: true,
      default: null,
    },
    paymentGateway: {
      type: String,
      default: 'razorpay',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for clean API access
paymentSchema.virtual('bookingId').get(function () {
  return this.booking;
}).set(function (val) {
  this.booking = val;
});

paymentSchema.virtual('customerId').get(function () {
  return this.customer;
}).set(function (val) {
  this.customer = val;
});

paymentSchema.virtual('vendorId').get(function () {
  return this.vendor;
}).set(function (val) {
  this.vendor = val;
});

paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
