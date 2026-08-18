import mongoose from 'mongoose';

/**
 * Booking Schema
 * 
 * Manages multi-domain service reservations connecting Customers, Vendors, and Services.
 * Supports domain-specific booking details for Event, Construction, Home, and Accommodation services.
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
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must specify a customer'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Booking must specify a vendor'],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Booking must specify a service'],
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    bidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
    packageSelected: {
      type: String,
      trim: true,
      default: null,
    },
    eventDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startDate: Date,
    endDate: Date,

    // Multi-Domain Booking Details Schema (Event, Construction, Home, Accommodation)
    eventDetails: {
      // Common / Event Domain
      eventType: { type: String, trim: true },
      guestCount: { type: Number, min: 1 },
      venue: { type: String, trim: true },
      address: { type: String, trim: true },
      specialRequirements: { type: String, trim: true },

      // Construction Domain
      projectType: { type: String, trim: true },
      propertyType: { type: String, trim: true },
      area: { type: Number, min: 0 },
      unit: { type: String, trim: true, default: 'sqft' },
      projectLocation: { type: String, trim: true },
      estimatedBudget: { type: Number, min: 0 },
      preferredStartDate: { type: Date },
      projectDescription: { type: String, trim: true },

      // Home Services Domain
      serviceType: { type: String, trim: true },
      problemDescription: { type: String, trim: true },
      preferredDate: { type: Date },
      preferredTime: { type: String, trim: true },
      serviceAddress: { type: String, trim: true },
      urgency: { type: String, trim: true, default: 'Normal' },

      // Accommodation Domain
      checkInDate: { type: Date },
      checkOutDate: { type: Date },
      guests: { type: Number, min: 1 },
      rooms: { type: Number, min: 1 },
      guestDetails: { type: String, trim: true },
      specialRequests: { type: String, trim: true },
    },

    pricing: {
      baseAmount: {
        type: Number,
        required: true,
        min: [0, 'Base amount cannot be negative'],
      },
      taxes: {
        type: Number,
        required: true,
        min: [0, 'Taxes cannot be negative'],
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative'],
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected', 'expired'],
        message: '{VALUE} is not a valid booking status',
      },
      default: 'pending',
    },
    responseDeadline: {
      type: Date,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'partially_paid', 'paid', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'unpaid',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    cancellationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cancellation',
      default: null,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
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
bookingSchema.virtual('customer').get(function () {
  return this.customerId;
}).set(function (val) {
  this.customerId = val;
});

bookingSchema.virtual('vendor').get(function () {
  return this.vendorId;
}).set(function (val) {
  this.vendorId = val;
});

bookingSchema.virtual('service').get(function () {
  return this.serviceId;
}).set(function (val) {
  this.serviceId = val;
});

bookingSchema.virtual('bookingStatus').get(function () {
  return this.status;
}).set(function (val) {
  this.status = val;
});

bookingSchema.virtual('totalAmount').get(function () {
  return this.pricing ? this.pricing.totalAmount : undefined;
}).set(function (val) {
  if (!this.pricing) this.pricing = {};
  this.pricing.totalAmount = val;
});

bookingSchema.virtual('bookingDetails').get(function () {
  return this.eventDetails;
}).set(function (val) {
  this.eventDetails = val;
});

// Indexes for Booking Management & Queries
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ vendorId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound Index for Availability & Conflict checking
bookingSchema.index({ vendorId: 1, eventDate: 1, status: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
