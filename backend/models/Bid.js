import mongoose from 'mongoose';

/**
 * Bid Schema
 * 
 * Bids submitted by Vendors in response to Customer Requirements.
 * Enforces unique bids per vendor-requirement pair.
 */
const bidSchema = new mongoose.Schema(
  {
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: [true, 'Bid must be linked to a Requirement'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Bid must be submitted by a Vendor'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    proposedAmount: {
      type: Number,
      required: [true, 'Proposed amount is required'],
      min: [0, 'Proposed amount cannot be negative'],
    },
    proposalDetails: {
      type: String,
      required: [true, 'Proposal details are required'],
      trim: true,
      maxlength: [2000, 'Proposal details cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['submitted', 'accepted', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid bid status',
      },
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: One bid per vendor per requirement
bidSchema.index({ requirement: 1, vendor: 1 }, { unique: true });
bidSchema.index({ requirement: 1 });
bidSchema.index({ vendor: 1 });
bidSchema.index({ status: 1 });

export const Bid = mongoose.models.Bid || mongoose.model('Bid', bidSchema);
export default Bid;
