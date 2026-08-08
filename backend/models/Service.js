import mongoose from 'mongoose';

/**
 * Service Schema
 * 
 * Aggregated services offered by Vendors. Contains pricing structures,
 * domain categories, availability specifications, and search text indexes.
 */
const serviceSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Service must belong to a Vendor'],
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      minlength: [3, 'Service title must be at least 3 characters long'],
      maxlength: [150, 'Service title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['venue', 'catering', 'logistics', 'media', 'decor', 'entertainment', 'other'],
        message: '{VALUE} is not a valid service category',
      },
      required: [true, 'Service category domain is required'],
    },
    price: {
      amount: {
        type: Number,
        required: [true, 'Price amount is required'],
        min: [0, 'Price amount cannot be negative'],
      },
      unit: {
        type: String,
        enum: ['per_hour', 'per_day', 'per_event', 'per_person', 'fixed'],
        default: 'per_event',
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    images: [
      {
        type: String,
      },
    ],
    specifications: {
      capacity: Number,
      features: [String],
      customFields: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'archived'],
        message: '{VALUE} is not a valid service status',
      },
      default: 'active',
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Search & Catalog Indexes
serviceSchema.index({ vendor: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ 'price.amount': 1 });
serviceSchema.index({ title: 'text', description: 'text' });

export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
