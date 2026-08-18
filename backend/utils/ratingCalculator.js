import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Service from '../models/Service.js';
import Vendor from '../models/Vendor.js';
import logger from './logger.js';

/**
 * Safely recalculates Service rating stats using MongoDB Aggregation.
 * Updates ratings.average and ratings.count on Service model.
 */
export const recalculateServiceRating = async (serviceId) => {
  try {
    const sId = new mongoose.Types.ObjectId(serviceId.toString());

    const result = await Review.aggregate([
      { $match: { service: sId } },
      {
        $group: {
          _id: '$service',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    let average = 0;
    let count = 0;

    if (result && result.length > 0) {
      average = Math.round(result[0].average * 10) / 10; // Round to 1 decimal place
      count = result[0].count;
    }

    await Service.findByIdAndUpdate(sId, {
      'ratings.average': average,
      'ratings.count': count,
    });

    return { average, count };
  } catch (error) {
    logger.error(`Failed to recalculate Service rating for ${serviceId}: ${error.message}`);
    throw error;
  }
};

/**
 * Safely recalculates Vendor rating stats using MongoDB Aggregation.
 * Updates ratings.average and ratings.count on Vendor model.
 */
export const recalculateVendorRating = async (vendorId) => {
  try {
    const vId = new mongoose.Types.ObjectId(vendorId.toString());

    const result = await Review.aggregate([
      { $match: { vendor: vId } },
      {
        $group: {
          _id: '$vendor',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    let average = 0;
    let count = 0;

    if (result && result.length > 0) {
      average = Math.round(result[0].average * 10) / 10; // Round to 1 decimal place
      count = result[0].count;
    }

    await Vendor.findByIdAndUpdate(vId, {
      'ratings.average': average,
      'ratings.count': count,
    });

    return { average, count };
  } catch (error) {
    logger.error(`Failed to recalculate Vendor rating for ${vendorId}: ${error.message}`);
    throw error;
  }
};

/**
 * Combined recalculation helper for both Service and Vendor
 */
export const recalculateAllRatings = async (serviceId, vendorId) => {
  const serviceStats = await recalculateServiceRating(serviceId);
  const vendorStats = await recalculateVendorRating(vendorId);
  return { serviceStats, vendorStats };
};

export default {
  recalculateServiceRating,
  recalculateVendorRating,
  recalculateAllRatings,
};
