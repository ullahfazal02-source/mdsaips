import { Booking } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * MDSAIPS Booking 1-Hour Response Deadline Expiry Monitor
 * Automatically transitions pending booking requests to 'expired' if vendor does not respond within 1 hour.
 */
export const checkAndExpireBookings = async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: 'pending',
      responseDeadline: { $lte: now },
    });

    if (expiredBookings.length === 0) return;

    logger.info(`[Expiry Monitor] Found ${expiredBookings.length} expired pending booking request(s). Processing...`);

    for (const booking of expiredBookings) {
      booking.status = 'expired';
      booking.timeline.push({
        status: 'expired',
        message: 'Booking expired: Vendor did not respond within the required 1-hour window.',
        timestamp: now,
      });
      await booking.save();
      logger.info(`[Expiry Monitor] Booking ${booking.bookingNumber} marked as EXPIRED.`);
    }
  } catch (error) {
    logger.error(`[Expiry Monitor Error] Failed to expire bookings: ${error.message}`);
  }
};

/**
 * Initialize Expiry Monitor Schedule (Runs every 5 minutes using native timer)
 */
export const initBookingExpiryCron = () => {
  logger.info('[Expiry Monitor] Initializing Booking 1-Hour Response Expiry Monitor (Every 5 minutes)...');
  
  // Run every 5 minutes (300,000 ms)
  setInterval(async () => {
    await checkAndExpireBookings();
  }, 5 * 60 * 1000);
};

export default initBookingExpiryCron;
