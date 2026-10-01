import mongoose from 'mongoose';

/**
 * Profile & Service Analytics Tracking Schema
 */
const analyticsEventSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['profile_view', 'service_view', 'enquiry', 'booking'],
      required: true,
      index: true,
    },
    visitorIp: {
      type: String,
      default: '',
    },
    visitorToken: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

analyticsEventSchema.index({ vendorId: 1, eventType: 1, createdAt: -1 });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
