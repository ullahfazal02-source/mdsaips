import mongoose from 'mongoose';

/**
 * Plan Schema
 * 
 * Aggregated multi-service event itineraries (AI-generated or custom configured).
 * Contains lists of domain service references and budget breakdowns.
 */
const planSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Plan must belong to a User'],
    },
    title: {
      type: String,
      required: [true, 'Plan title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    totalEstimatedBudget: {
      type: Number,
      default: 0,
      min: [0, 'Estimated budget cannot be negative'],
    },
    eventDate: {
      type: Date,
    },
    domainServices: [
      {
        domain: {
          type: String,
          enum: ['venue', 'catering', 'logistics', 'media', 'decor', 'entertainment', 'other'],
          required: true,
        },
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vendor',
        },
        estimatedCost: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ['suggested', 'selected', 'booked'],
          default: 'suggested',
        },
      },
    ],
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiPromptParameters: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'booked', 'archived'],
        message: '{VALUE} is not a valid plan status',
      },
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
planSchema.index({ user: 1 });
planSchema.index({ status: 1 });
planSchema.index({ eventDate: 1 });

export const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);
export default Plan;
