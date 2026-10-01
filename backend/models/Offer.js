import mongoose from 'mongoose';

/**
 * Promotional Offer & Discount Schema
 */
const offerSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Offer must belong to a Vendor'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    offerType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed', 'free_addon'],
        message: '{VALUE} is not a valid offer type',
      },
      required: [true, 'Offer type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount cannot be negative'],
    },
    addonDetails: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    applicableServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    applicablePackage: {
      type: String,
      default: 'all', // 'all', 'basic', 'standard', 'premium'
      trim: true,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum booking amount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    termsAndConditions: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ vendorId: 1, isActive: 1 });
offerSchema.index({ startDate: 1, endDate: 1 });

export const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);
export default Offer;
