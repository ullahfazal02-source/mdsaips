import mongoose from 'mongoose';

/**
 * OTP Schema
 * 
 * Short-lived verification tokens for email verification, phone verification,
 * password resets, and login 2FA.
 * Stores bcrypt hashed OTPs for security and uses a TTL index to purge expired documents.
 */
const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Recipient email address is required'],
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: [true, 'Hashed OTP code is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['email_verify', 'phone_verify', 'password_reset', 'login'],
        message: '{VALUE} is not a valid OTP type',
      },
      required: [true, 'OTP type is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes TTL
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance and automatic expiration
otpSchema.index({ userId: 1, type: 1, isUsed: 1 });
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
export default OTP;
