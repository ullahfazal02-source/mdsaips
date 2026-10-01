import mongoose from 'mongoose';

/**
 * Vendor Schema
 * 
 * Profile for registered service providers linked 1-to-1 with a User account.
 * Stores business details, domain categories, geo-location, availability schedules,
 * pricing tiers, cancellation policies, ratings, and document URLs.
 */
const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor profile must be associated with a User account'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters long'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Vendor primary category is required'],
      enum: {
        values: ['event', 'construction', 'home', 'accommodation'],
        message: '{VALUE} is not a valid vendor category. Allowed: event, construction, home, accommodation',
      },
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
    },
    servicesOffered: {
      type: [String],
      default: [],
    },
    pricing: {
      basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative'],
        default: 0,
      },
      priceUnit: {
        type: String,
        default: 'per_event',
        trim: true,
      },
      currency: {
        type: String,
        default: 'INR',
        trim: true,
      },
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true,
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
      pincode: {
        type: String,
        trim: true,
        default: '',
      },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    availability: [
      {
        date: { type: String, required: true }, // Format YYYY-MM-DD
        isAvailable: { type: Boolean, default: true },
        slots: { type: [String], default: [] },
      },
    ],
    cancellationPolicy: {
      type: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        default: 'flexible',
      },
      rules: [
        {
          hoursBeforeEvent: { type: Number, min: 0 },
          refundPercentage: { type: Number, min: 0, max: 100 },
        },
      ],
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
        index: true,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Total earnings cannot be negative'],
    },
    portfolio: {
      type: [String], // Array of media/image URLs
      default: [],
    },
    documents: {
      type: [String], // Array of document URLs
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    vacationMode: {
      type: Boolean,
      default: false,
      index: true,
    },
    serviceArea: {
      type: {
        type: String,
        enum: ['Polygon', 'Radius', 'Cities'],
        default: 'Cities',
      },
      polygon: {
        type: {
          type: String,
          enum: ['Polygon'],
          default: 'Polygon',
        },
        coordinates: {
          type: [[[Number]]],
          default: [],
        },
      },
      radiusZone: {
        center: {
          lat: { type: Number, default: 0 },
          lng: { type: Number, default: 0 },
        },
        radiusKm: { type: Number, default: 10 },
      },
      cities: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate middleware: Guarantee both user and userId fields are in sync
vendorSchema.pre('validate', function (next) {
  if (this.userId && !this.user) {
    this.user = this.userId;
  } else if (this.user && !this.userId) {
    this.userId = this.user;
  }
  next();
});

// Compound Indexes for fast public search & filter
vendorSchema.index({ category: 1, 'location.city': 1, isVerified: -1, 'ratings.average': -1 });

export const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
export default Vendor;
