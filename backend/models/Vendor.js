import mongoose from 'mongoose';

/**
 * Vendor Schema
 * 
 * Profile for registered service providers linked 1-to-1 with a User account.
 * Stores business metadata, domain category, geo-location, verification status, and ratings.
 */
const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor must be associated with a User account'],
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters long'],
    },
    domain: {
      type: String,
      enum: {
        values: ['venue', 'catering', 'logistics', 'media', 'decor', 'entertainment', 'other'],
        message: '{VALUE} is not a valid vendor domain category',
      },
      required: [true, 'Primary domain category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    address: {
      street: String,
      city: { type: String, required: [true, 'City is required'] },
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
      geoCoordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'pending',
    },
    documents: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    contactPhone: String,
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for Spatial & Category Searches
vendorSchema.index({ domain: 1 });
vendorSchema.index({ verificationStatus: 1 });
vendorSchema.index({ 'rating.average': -1 });
vendorSchema.index({ 'address.geoCoordinates': '2dsphere' });

export const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
export default Vendor;
