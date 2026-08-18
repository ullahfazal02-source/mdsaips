import mongoose from 'mongoose';
import { Review, Booking, Vendor, Service } from '../models/index.js';
import { createReviewSchema, vendorReplySchema, reviewQuerySchema } from '../validations/review.validation.js';
import { recalculateAllRatings } from '../utils/ratingCalculator.js';
import logger from '../utils/logger.js';

/**
 * @desc    Submit a Review for a Completed Booking
 * @route   POST /api/v1/reviews
 * @access  Private (Customer)
 */
export const submitReview = async (req, res, next) => {
  try {
    const { error, value } = createReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map((d) => d.message),
      });
    }

    const { bookingId, serviceId, rating, title, comment, images = [], tags = [] } = value;
    const customerId = req.user.id;

    // 1. Fetch Booking from DB
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // 2. Verify Customer Ownership
    if (booking.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only review your own bookings',
      });
    }

    // 3. Verify Booking Status === 'completed'
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Reviews can only be submitted for completed bookings. Current status is '${booking.status}'`,
      });
    }

    // 4. Verify Service Match
    if (booking.serviceId.toString() !== serviceId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Service ID does not match the booking record',
      });
    }

    // 5. Prevent Duplicate Reviews (booking.isReviewed === false)
    if (booking.isReviewed) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this booking',
      });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'A review document already exists for this booking',
      });
    }

    // 6. Create Review (Derive identities from booking)
    const review = await Review.create({
      booking: booking._id,
      service: booking.serviceId,
      vendor: booking.vendorId,
      customer: booking.customerId,
      rating,
      title: title || '',
      comment: comment || '',
      images,
      tags,
      isVerified: true,
    });

    // 7. Update Booking.isReviewed = true
    booking.isReviewed = true;
    await booking.save();

    // 8. Safely Recalculate Service & Vendor Ratings using MongoDB Aggregation
    await recalculateAllRatings(booking.serviceId, booking.vendorId);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    logger.error(`Error submitting review: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get Reviews & Rating Summary for a Service
 * @route   GET /api/v1/reviews/service/:serviceId
 * @access  Public / Private
 */
export const getServiceReviews = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Check service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Build Sorting Criteria
    let sortOptions = { createdAt: -1 };
    if (sort === 'highest') sortOptions = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortOptions = { rating: 1, createdAt: -1 };
    if (sort === 'helpful') sortOptions = { helpfulCount: -1, createdAt: -1 };

    const sObjectId = new mongoose.Types.ObjectId(serviceId);

    // 1. Fetch Reviews List
    const total = await Review.countDocuments({ service: serviceId });
    const reviews = await Review.find({ service: serviceId })
      .populate('customer', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // 2. Rating Distribution Aggregation
    const distributionRaw = await Review.aggregate([
      { $match: { service: sObjectId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distributionRaw.forEach((item) => {
      if (distribution[item._id] !== undefined) {
        distribution[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        summary: {
          average: service.ratings?.average || 0,
          count: service.ratings?.count || 0,
          distribution,
        },
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    logger.error(`Error fetching service reviews: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get Reviews for a Vendor Profile
 * @route   GET /api/v1/reviews/vendor/:vendorId
 * @access  Public / Private
 */
export const getVendorReviews = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'highest') sortOptions = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortOptions = { rating: 1, createdAt: -1 };
    if (sort === 'helpful') sortOptions = { helpfulCount: -1, createdAt: -1 };

    const total = await Review.countDocuments({ vendor: vendorId });
    const reviews = await Review.find({ vendor: vendorId })
      .populate('customer', 'name avatar')
      .populate('service', 'title category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const vObjectId = new mongoose.Types.ObjectId(vendorId);
    const distributionRaw = await Review.aggregate([
      { $match: { vendor: vObjectId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    distributionRaw.forEach((item) => {
      if (distribution[item._id] !== undefined) {
        distribution[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        summary: {
          average: vendor.ratings?.average || 0,
          count: vendor.ratings?.count || 0,
          distribution,
        },
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    logger.error(`Error fetching vendor reviews: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Vendor Reply to a Review
 * @route   PUT /api/v1/reviews/:id/reply
 * @access  Private (Vendor)
 */
export const replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = vendorReplySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.details.map((d) => d.message),
      });
    }

    const { message } = value;
    const userId = req.user.id;

    // 1. Fetch Review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // 2. Fetch Vendor Profile of Authenticated User
    const vendorProfile = await Vendor.findOne({ userId });
    if (!vendorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only registered vendors can reply to reviews',
      });
    }

    // 3. Verify Vendor Ownership (Vendor owns the service/review)
    if (vendorProfile._id.toString() !== review.vendor.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only reply to reviews written for your own services',
      });
    }

    // 4. Save Vendor Reply
    review.vendorReply = {
      message,
      repliedAt: new Date(),
    };
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Vendor reply posted successfully',
      data: review,
    });
  } catch (error) {
    logger.error(`Error saving vendor reply: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Mark Review as Helpful
 * @route   PUT /api/v1/reviews/:id/helpful
 * @access  Private
 */
export const markReviewHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Prevent duplicate votes from same user
    const hasVoted = review.helpfulVotes.some((voterId) => voterId.toString() === userId.toString());
    if (hasVoted) {
      return res.status(200).json({
        success: true,
        message: 'You have already marked this review as helpful',
        data: {
          helpfulCount: review.helpfulCount,
          alreadyVoted: true,
        },
      });
    }

    review.helpfulVotes.push(userId);
    review.helpfulCount = review.helpfulVotes.length;
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpfulCount,
      },
    });
  } catch (error) {
    logger.error(`Error marking review helpful: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete Review (Admin only)
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (Admin)
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const { booking, service, vendor } = review;

    // Delete review
    await Review.findByIdAndDelete(id);

    // Reset Booking.isReviewed = false
    if (booking) {
      await Booking.findByIdAndUpdate(booking, { isReviewed: false });
    }

    // Recalculate ratings for Service & Vendor
    await recalculateAllRatings(service, vendor);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully and ratings recalculated',
    });
  } catch (error) {
    logger.error(`Error deleting review: ${error.message}`);
    next(error);
  }
};
