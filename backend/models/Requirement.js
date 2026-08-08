import mongoose from 'mongoose';

/**
 * Requirement Schema
 * 
 * RFP / Custom request posted by Customers for Vendors to submit bids.
 * Supports single and multi-domain requirements with budget ranges.
 */
const requirementSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requirement must belong to a Customer'],
    },
    title: {
      type: String,
      required: [true, 'Requirement title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Requirement description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    domain: {
      type: String,
      enum: {
        values: ['venue', 'catering', 'logistics', 'media', 'decor', 'entertainment', 'multi_domain'],
        message: '{VALUE} is not a valid domain category',
      },
      required: [true, 'Domain category is required'],
    },
    budget: {
      min: {
        type: Number,
        default: 0,
        min: [0, 'Minimum budget cannot be negative'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum budget is required'],
        min: [0, 'Maximum budget cannot be negative'],
      },
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      city: { type: String, required: true },
      state: String,
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'bidding_closed', 'fulfilled', 'cancelled'],
        message: '{VALUE} is not a valid requirement status',
      },
      default: 'open',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Search & Status Indexes
requirementSchema.index({ customer: 1 });
requirementSchema.index({ domain: 1 });
requirementSchema.index({ status: 1 });
requirementSchema.index({ eventDate: 1 });

export const Requirement = mongoose.models.Requirement || mongoose.model('Requirement', requirementSchema);
export default Requirement;
