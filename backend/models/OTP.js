import mongoose from 'mongoose';

/**
 * OTP Schema
 * 
 * Short-lived verification tokens for email verification, password resets, and 2FA.
 * Uses a TTL index to automatically purge expired documents.
 */
const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: [true, 'OTP recipient identifier (email or phone) is required'],
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP code is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['email_verification', 'password_reset', 'login_2fa'],
        message: '{VALUE} is not a valid OTP type',
      },
      required: [true, 'OTP type is required'],
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // Default 10 minutes TTL
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index & Automatic MongoDB TTL Expire Index
otpSchema.index({ identifier: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);
export default OTP;
