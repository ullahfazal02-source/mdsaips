import mongoose from 'mongoose';

/**
 * User Schema
 * 
 * Central identity model for system users (Customers, Vendors, Admins).
 * Enforces role-based permissions, authentication flags, and status controls.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Omit password by default in queries
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number (E.164 format)'],
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'vendor', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'customer',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'suspended'],
        message: '{VALUE} is not a valid user status',
      },
      default: 'active',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loyaltyPoints: {
      current: { type: Number, default: 0, min: 0 },
      earned: { type: Number, default: 0, min: 0 },
      redeemed: { type: Number, default: 0, min: 0 },
    },
    loyaltyHistory: [
      {
        points: { type: Number, required: true },
        type: { type: String, enum: ['earned', 'redeemed'], required: true },
        description: { type: String, trim: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Performance & Lookup Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ phone: 1 }, { sparse: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
