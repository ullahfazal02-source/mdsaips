import mongoose from 'mongoose';

/**
 * Payment Schema
 * 
 * Financial records for transactions processed against Bookings.
 * Tracks payment gateways, transaction IDs, statuses, and payment types.
 */
const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Payment must be associated with a Booking'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must record a customer'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Payment must record a vendor'],
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
    },
    paymentGateway: {
      type: String,
      enum: {
        values: ['stripe', 'paypal', 'razorpay', 'bank_transfer', 'cash'],
        message: '{VALUE} is not a supported payment gateway',
      },
      default: 'razorpay',
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentType: {
      type: String,
      enum: {
        values: ['deposit', 'full', 'balance', 'refund'],
        message: '{VALUE} is not a valid payment type',
      },
      default: 'full',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'successful', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
    gatewayResponse: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Performance & Unique Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ vendor: 1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
