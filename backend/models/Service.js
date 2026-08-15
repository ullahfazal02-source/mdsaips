import mongoose from 'mongoose';

/**
 * Package Sub-schema
 */
const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: {
        values: ['basic', 'standard', 'premium'],
        message: '{VALUE} is not a valid package name. Allowed: basic, standard, premium',
      },
      required: [true, 'Package name is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Package price is required'],
      min: [0, 'Package price cannot be negative'],
    },
    features: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

/**
 * Service Schema
 * 
 * Aggregated services offered by Vendors. Contains pricing structures,
 * packages (basic, standard, premium), domain categories, locations, and search indexes.
 */
const serviceSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Service must belong to a Vendor'],
      index: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      minlength: [3, 'Service title must be at least 3 characters long'],
      maxlength: [150, 'Service title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      minlength: [10, 'Service description must be at least 10 characters long'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Service category domain is required'],
      enum: {
        values: ['event', 'construction', 'home', 'accommodation'],
        message: '{VALUE} is not a valid service category. Allowed: event, construction, home, accommodation',
      },
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    packages: {
      type: [packageSchema],
      default: [],
      validate: [
        function (pkgs) {
          if (!pkgs || pkgs.length === 0) return true;
          const names = pkgs.map((p) => p.name);
          return names.length === new Set(names).size;
        },
        'Duplicate package names are not allowed within a single service.',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
      index: true,
    },
    priceUnit: {
      type: String,
      enum: ['per_hour', 'per_day', 'per_event', 'per_person', 'fixed', 'per_sqft'],
      default: 'per_event',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        index: true,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    wishlistCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook: Sync vendorId and vendor fields
serviceSchema.pre('validate', function (next) {
  if (this.vendorId && !this.vendor) {
    this.vendor = this.vendorId;
  } else if (this.vendor && !this.vendorId) {
    this.vendorId = this.vendor;
  }
  next();
});

// Search & Catalog Indexes
serviceSchema.index({ vendorId: 1, isActive: 1 });
serviceSchema.index({ category: 1, city: 1, isActive: 1 });
serviceSchema.index({ category: 1, subCategory: 1, isActive: 1 });
serviceSchema.index({ 'ratings.average': -1, totalBookings: -1 });
serviceSchema.index(
  {
    title: 'text',
    description: 'text',
    tags: 'text',
    city: 'text',
    subCategory: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 8,
      subCategory: 6,
      city: 4,
      description: 2,
    },
    name: 'ServiceTextSearchIndex',
  }
);

export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;

