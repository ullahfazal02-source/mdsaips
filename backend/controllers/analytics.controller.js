import { AnalyticsEvent, Vendor, Service, Booking } from '../models/index.js';
import { calculateVendorTier } from '../config/tierConfig.js';
import logger from '../utils/logger.js';

/**
 * @desc    Track a profile or service view event with IP/user deduplication window (1 hour)
 * @route   POST /api/v1/analytics/track
 * @access  Public
 */
export const trackEvent = async (req, res) => {
  try {
    const { vendorId, serviceId, eventType } = req.body;
    if (!vendorId || !eventType) {
      return res.status(400).json({ success: false, message: 'vendorId and eventType are required' });
    }

    const visitorIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userId = req.user ? req.user.id : null;

    // Deduplication check: ignore duplicate view from same IP/User within last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await AnalyticsEvent.findOne({
      vendorId,
      serviceId: serviceId || null,
      eventType,
      createdAt: { $gte: oneHourAgo },
      $or: [
        { visitorIp },
        ...(userId ? [{ userId }] : []),
      ],
    });

    if (!existing) {
      await AnalyticsEvent.create({
        vendorId,
        serviceId: serviceId || null,
        eventType,
        visitorIp,
        userId,
      });
    }

    return res.status(200).json({ success: true, message: 'Event tracked successfully.' });
  } catch (error) {
    logger.error(`Error in trackEvent: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error tracking analytics' });
  }
};

/**
 * @desc    Get Vendor Analytics Dashboard Data
 * @route   GET /api/v1/analytics/my-analytics
 * @access  Private (Vendor)
 */
export const getVendorAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ $or: [{ userId }, { user: userId }] });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    const timeframe = req.query.timeframe || '30days';
    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === '30days') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeframe === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const events = await AnalyticsEvent.find({
      vendorId: vendor._id,
      createdAt: { $gte: startDate },
    });

    const profileViews = events.filter((e) => e.eventType === 'profile_view').length;
    const serviceViews = events.filter((e) => e.eventType === 'service_view').length;
    const enquiries = events.filter((e) => e.eventType === 'enquiry').length;

    // Unique visitors calculation based on IP or userId
    const uniqueVisitorSet = new Set(events.map((e) => e.userId?.toString() || e.visitorIp));
    const uniqueVisitors = uniqueVisitorSet.size;

    // Bookings count from Booking collection
    const bookingsCount = await Booking.countDocuments({
      vendorId: vendor._id,
      createdAt: { $gte: startDate },
    });

    const completedBookings = await Booking.countDocuments({
      vendorId: vendor._id,
      status: 'completed',
    });

    const totalBookingsAllTime = await Booking.countDocuments({
      vendorId: vendor._id,
    });

    const cancelledBookings = await Booking.countDocuments({
      vendorId: vendor._id,
      status: 'cancelled',
    });

    const cancellationRate = totalBookingsAllTime > 0
      ? Number(((cancelledBookings / totalBookingsAllTime) * 100).toFixed(1))
      : 0;

    // Conversion rate: Bookings generated / Unique visitors (or views if unique is 0)
    const baseVisitors = uniqueVisitors > 0 ? uniqueVisitors : (profileViews + serviceViews);
    const conversionRate = baseVisitors > 0
      ? Number(((bookingsCount / baseVisitors) * 100).toFixed(1))
      : 0;

    // Vendor Tier calculation
    const accountAgeDays = Math.floor((now - new Date(vendor.createdAt || Date.now())) / (1000 * 60 * 60 * 24));
    const currentTier = calculateVendorTier({
      isVerified: vendor.isVerified,
      completedBookings,
      averageRating: vendor.ratings?.average || 0,
      reviewCount: vendor.ratings?.count || 0,
      responseRate: 95, // Default active vendor response rate
      cancellationRate,
      accountAgeDays,
    });

    return res.status(200).json({
      success: true,
      data: {
        timeframe,
        metrics: {
          profileViews,
          serviceViews,
          uniqueVisitors,
          enquiries,
          bookingsCount,
          completedBookings,
          conversionRate,
          cancellationRate,
          currentTier,
        },
      },
    });
  } catch (error) {
    logger.error(`Error in getVendorAnalytics: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics' });
  }
};
