import mongoose from 'mongoose';

/**
 * Wishlist Item Sub-schema
 */
const wishlistItemSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Wishlist item must specify a serviceId'],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Wishlist item must specify a vendorId'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Note cannot exceed 300 characters'],
    },
  },
  { _id: true }
);

/**
 * Wishlist Schema
 * 
 * One Wishlist document per user containing an array of saved service items.
 */
const wishlistSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist must belong to a Customer (User)'],
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Getter mapping user -> customerId
wishlistSchema.virtual('user').get(function () {
  return this.customerId;
});

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);

// Clean up legacy MongoDB Atlas collection indexes if present
Wishlist.collection.dropIndex('user_1_service_1').catch(() => {});
Wishlist.collection.dropIndex('user_1').catch(() => {});

export default Wishlist;
