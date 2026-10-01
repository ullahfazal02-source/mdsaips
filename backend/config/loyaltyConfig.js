/**
 * Centralized Loyalty Points & Rewards Configuration
 * 
 * Rules:
 * 1. Customer earns points ONLY when booking status === 'completed' AND paymentStatus === 'paid'.
 * 2. EARN_RATE: 1 point earned for every ₹100 spent.
 * 3. REDEMPTION_CONVERSION: 100 points = ₹50 discount.
 * 4. Business rules are centralized here — do NOT hardcode across multiple files.
 */

export const LOYALTY_CONFIG = {
  // 1 point per ₹100 spent
  EARN_RATE_PER_INR: 0.01,
  
  // 100 points = ₹50 discount (₹0.50 discount per point)
  DISCOUNT_PER_POINT_INR: 0.5,
  
  // Minimum points needed for redemption
  MIN_REDEMPTION_POINTS: 100,
  
  // Maximum discount percentage allowed per booking (e.g. max 30% of total amount)
  MAX_DISCOUNT_PERCENTAGE: 30,
};

/**
 * Calculate loyalty points earned for a booking amount
 * @param {number} amount - Total paid booking amount
 * @returns {number} Points earned
 */
export const calculatePointsEarned = (amount) => {
  if (!amount || amount <= 0) return 0;
  return Math.floor(amount * LOYALTY_CONFIG.EARN_RATE_PER_INR);
};

/**
 * Calculate discount amount for a given number of points
 * @param {number} points - Points to redeem
 * @returns {number} Discount amount in INR
 */
export const calculatePointsDiscount = (points) => {
  if (!points || points < LOYALTY_CONFIG.MIN_REDEMPTION_POINTS) return 0;
  return Math.floor(points * LOYALTY_CONFIG.DISCOUNT_PER_POINT_INR);
};

export default LOYALTY_CONFIG;
