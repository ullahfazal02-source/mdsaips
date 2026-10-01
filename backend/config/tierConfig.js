/**
 * MDSAIPS Centralized Vendor Performance Tier Configuration & Calculations
 */

export const TIER_LEVELS = {
  NEW_VENDOR: {
    key: 'New Vendor',
    label: 'New Vendor',
    badge: '🌱',
    color: '#6B7280', // Gray
  },
  VERIFIED_VENDOR: {
    key: 'Verified Vendor',
    label: 'Verified Vendor ✓',
    badge: '✓',
    color: '#3B82F6', // Blue
  },
  TRUSTED_VENDOR: {
    key: 'Trusted Vendor',
    label: 'Trusted Vendor ★',
    badge: '★',
    color: '#8B5CF6', // Purple
  },
  TOP_VENDOR: {
    key: 'Top Vendor',
    label: 'Top Vendor 🏆',
    badge: '🏆',
    color: '#EAB308', // Gold
  },
};

/**
 * Calculates Vendor Tier dynamically based on real performance criteria:
 * @param {Object} stats
 * @param {boolean} stats.isVerified
 * @param {number} stats.completedBookings
 * @param {number} stats.averageRating
 * @param {number} stats.reviewCount
 * @param {number} stats.responseRate - Percentage 0..100
 * @param {number} stats.cancellationRate - Percentage 0..100
 * @param {number} stats.accountAgeDays - Days since vendor creation
 * @returns {Object} Tier level details
 */
export const calculateVendorTier = (stats = {}) => {
  const {
    isVerified = false,
    completedBookings = 0,
    averageRating = 0,
    reviewCount = 0,
    responseRate = 100,
    cancellationRate = 0,
    accountAgeDays = 0,
  } = stats;

  // 1. Top Vendor criteria: Completed >= 20, rating >= 4.6, reviews >= 10, cancellationRate <= 5%, responseRate >= 85%
  if (
    completedBookings >= 20 &&
    averageRating >= 4.6 &&
    reviewCount >= 10 &&
    cancellationRate <= 5 &&
    responseRate >= 85
  ) {
    return TIER_LEVELS.TOP_VENDOR;
  }

  // 2. Trusted Vendor criteria: Completed >= 8, rating >= 4.0, cancellationRate <= 10%, responseRate >= 75%
  if (
    completedBookings >= 8 &&
    averageRating >= 4.0 &&
    cancellationRate <= 10 &&
    responseRate >= 75
  ) {
    return TIER_LEVELS.TRUSTED_VENDOR;
  }

  // 3. Verified Vendor criteria: Verified profile or completed >= 3
  if (isVerified || completedBookings >= 3) {
    return TIER_LEVELS.VERIFIED_VENDOR;
  }

  // 4. Default: New Vendor
  return TIER_LEVELS.NEW_VENDOR;
};

export default {
  TIER_LEVELS,
  calculateVendorTier,
};
