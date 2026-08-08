import mongoose from 'mongoose';

/**
 * Wishlist Schema
 * 
 * Customer saved services and favorites with compound unique constraints.
 */
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist item must belong to a User'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Wishlist item must refer to a Service'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Prevent duplicate saved services for same user
wishlistSchema.index({ user: 1, service: 1 }, { unique: true });
wishlistSchema.index({ user: 1 });

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
