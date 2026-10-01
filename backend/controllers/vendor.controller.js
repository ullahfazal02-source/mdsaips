import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { Booking, Service, AnalyticsEvent, Notification } from '../models/index.js';
import { calculateVendorTier } from '../config/tierConfig.js';
import logger from '../utils/logger.js';
import {
  registerVendorSchema,
  updateVendorSchema,
  updateAvailabilitySchema,
  updateCancellationPolicySchema,
  verifyDocumentsSchema,
} from '../validations/vendor.validation.js';

/**
 * @desc    Register a new Vendor profile
 * @route   POST /api/v1/vendors/register
 * @access  Private (Customer, Vendor)
 */
export const registerVendor = async (req, res, next) => {
  try {
    // 1. Role validation: Admins are not allowed to create vendor profiles via this endpoint
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot register vendor profiles.',
      });
    }

    // 2. Check if Vendor profile already exists for user
    const existingVendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: 'Vendor profile already exists.',
      });
    }

    // 3. Joi Validation
    const { error, value } = registerVendorSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    // 4. Create Vendor Profile
    const newVendor = new Vendor({
      ...value,
      userId: req.user.id,
      user: req.user.id,
      isVerified: false,
      isActive: true,
      ratings: { average: 0, count: 0 },
      totalEarnings: 0,
    });

    await newVendor.save();

    // 5. Update user role to vendor if currently customer
    if (req.user.role === 'customer') {
      await User.findByIdAndUpdate(req.user.id, { role: 'vendor' });
    }

    logger.info(`Vendor profile created for user: ${req.user.id} (${newVendor.businessName})`);

    const populatedVendor = await Vendor.findById(newVendor._id)
      .populate('userId', 'name email phone avatar')
      .populate('user', 'name email phone avatar');

    return res.status(201).json({
      success: true,
      message: 'Vendor profile created successfully and is pending verification.',
      data: {
        vendor: populatedVendor,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all active vendors with filtering, pagination & sorting
 * @route   GET /api/v1/vendors
 * @access  Public
 */
export const getVendors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const {
      category,
      subCategory,
      city,
      state,
      minPrice,
      maxPrice,
      minRating,
      isVerified,
      sortBy,
    } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }
    if (subCategory) {
      query.subCategory = { $regex: subCategory, $options: 'i' };
    }
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }
    if (isVerified !== undefined && isVerified !== '') {
      query.isVerified = isVerified === 'true' || isVerified === true;
    }
    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Default Sorting: Verified vendors first, then rating descending
    let sortOptions = { isVerified: -1, 'ratings.average': -1, createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortOptions = { 'pricing.basePrice': 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { 'pricing.basePrice': -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { 'ratings.average': -1 };
    }

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .select('-documents') // Omit private documents from public list
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone avatar')
        .populate('user', 'name email phone avatar'),
      Vendor.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Vendor Public Profile by ID
 * @route   GET /api/v1/vendors/:id
 * @access  Public
 */
export const getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id)
      .select('-documents') // Do NOT return private documents in public view
      .populate('userId', 'name email phone avatar')
      .populate('user', 'name email phone avatar');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Vendor Profile
 * @route   PUT /api/v1/vendors/:id
 * @access  Private (Owner, Admin)
 */
export const updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    // Ownership Security Check
    const vendorUserId = (vendor.userId || vendor.user)?.toString();
    const isOwner = vendorUserId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to modify this vendor profile.',
      });
    }

    // Validation
    const { error, value } = updateVendorSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Explicitly protect system-managed fields if vendor owner is updating
    if (!isAdmin) {
      delete value.isVerified;
      delete value.ratings;
      delete value.totalEarnings;
      delete value.userId;
      delete value.user;
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(id, { $set: value }, { new: true, runValidators: true })
      .select('-documents')
      .populate('userId', 'name email phone avatar')
      .populate('user', 'name email phone avatar');

    logger.info(`Vendor profile updated: ${id} by user ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: updatedVendor,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Vendor Availability
 * @route   GET /api/v1/vendors/:id/availability
 * @access  Public
 */
export const getAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const vendor = await Vendor.findById(id).select('availability');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    let availability = vendor.availability || [];

    if (startDate || endDate) {
      availability = availability.filter((item) => {
        let matches = true;
        if (startDate && item.date < startDate) matches = false;
        if (endDate && item.date > endDate) matches = false;
        return matches;
      });
    }

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Vendor Availability
 * @route   PUT /api/v1/vendors/:id/availability
 * @access  Private (Owner)
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    // Ownership Security Check
    const vendorUserId = (vendor.userId || vendor.user)?.toString();
    if (vendorUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own vendor availability.',
      });
    }

    // Validation
    const { error, value } = updateAvailabilitySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    vendor.availability = value.availability;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Vendor availability schedule updated successfully',
      data: vendor.availability,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Vendor Cancellation Policy
 * @route   PUT /api/v1/vendors/:id/cancellation-policy
 * @access  Private (Owner)
 */
export const updateCancellationPolicy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    // Ownership Security Check
    const vendorUserId = (vendor.userId || vendor.user)?.toString();
    if (vendorUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own cancellation policy.',
      });
    }

    // Validation
    const { error, value } = updateCancellationPolicySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    vendor.cancellationPolicy = value;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Cancellation policy updated successfully',
      data: vendor.cancellationPolicy,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Upload / Submit Verification Document URLs
 * @route   POST /api/v1/vendors/verify-documents
 * @access  Private (Vendor Owner)
 */
export const uploadVerificationDocuments = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found for authenticated user.',
      });
    }

    // Validation
    const { error, value } = verifyDocumentsSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    vendor.documents = value.documents;
    vendor.isVerified = false; // Reset verification status to pending review
    await vendor.save();

    logger.info(`Verification documents submitted for vendor ${vendor._id}`);

    return res.status(200).json({
      success: true,
      message: 'Verification documents submitted successfully for admin review.',
      isVerified: vendor.isVerified,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Vendor Dashboard Statistics with Real Performance Metrics & Tier
 * @route   GET /api/v1/vendors/dashboard/stats
 * @access  Private (Vendor Owner)
 */
export const getVendorDashboardStats = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found for authenticated user.',
      });
    }

    const totalServices = await Service.countDocuments({ vendorId: vendor._id });
    const activeServices = await Service.countDocuments({ vendorId: vendor._id, isActive: true });

    const pendingRequests = await Booking.countDocuments({ vendorId: vendor._id, status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ vendorId: vendor._id, status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ vendorId: vendor._id, status: 'completed' });
    const expiredBookings = await Booking.countDocuments({ vendorId: vendor._id, status: 'expired' });
    const totalBookings = await Booking.countDocuments({ vendorId: vendor._id });

    // Revenue calculation
    const completedBookingDocs = await Booking.find({ vendorId: vendor._id, status: 'completed' });
    const revenue = completedBookingDocs.reduce((acc, b) => acc + (b.pricing?.totalAmount || 0), 0);

    // Profile & Service Views from AnalyticsEvent
    const profileViews = await AnalyticsEvent.countDocuments({ vendorId: vendor._id, eventType: 'profile_view' });
    const serviceViews = await AnalyticsEvent.countDocuments({ vendorId: vendor._id, eventType: 'service_view' });

    const uniqueVisitorEvents = await AnalyticsEvent.find({ vendorId: vendor._id });
    const uniqueVisitors = new Set(uniqueVisitorEvents.map((e) => e.userId?.toString() || e.visitorIp)).size;

    const conversionRate = uniqueVisitors > 0
      ? Number(((totalBookings / uniqueVisitors) * 100).toFixed(1))
      : 0;

    // Dynamic Tier Calculation
    const accountAgeDays = Math.floor((Date.now() - new Date(vendor.createdAt || Date.now())) / (1000 * 60 * 60 * 24));
    const tier = calculateVendorTier({
      isVerified: vendor.isVerified,
      completedBookings,
      averageRating: vendor.ratings?.average || 0,
      reviewCount: vendor.ratings?.count || 0,
      responseRate: 95,
      cancellationRate: 0,
      accountAgeDays,
    });

    const stats = {
      totalServices,
      activeServices,
      pendingRequests,
      confirmedBookings,
      completedBookings,
      expiredBookings,
      totalBookings,
      revenue,
      monthlyRevenue: revenue,
      averageRating: vendor.ratings?.average || 0,
      reviewCount: vendor.ratings?.count || 0,
      profileViews,
      serviceViews,
      uniqueVisitors,
      conversionRate,
      currentTier: tier,
      isVerified: vendor.isVerified,
      isActive: vendor.isActive,
      vacationMode: vendor.vacationMode || false,
      serviceArea: vendor.serviceArea || null,
      businessName: vendor.businessName,
      category: vendor.category,
      vendorId: vendor._id,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle Vacation Mode ON / OFF (Vendor)
 * @route   PATCH /api/v1/vendors/vacation-mode
 * @access  Private (Vendor Owner)
 */
export const toggleVacationMode = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    const { vacationMode } = req.body;
    vendor.vacationMode = typeof vacationMode === 'boolean' ? vacationMode : !vendor.vacationMode;
    await vendor.save();

    await Notification.create({
      userId: req.user.id,
      title: 'Vacation Mode Status Updated',
      message: vendor.vacationMode
        ? 'Vacation Mode is now ON. New booking requests are paused.'
        : 'Vacation Mode is now OFF. You are accepting new booking requests.',
      type: 'vacation_mode',
    });

    logger.info(`Vendor [${vendor._id}] updated Vacation Mode to: ${vendor.vacationMode}`);

    return res.status(200).json({
      success: true,
      message: vendor.vacationMode
        ? 'Vacation Mode activated — New bookings paused.'
        : 'Vacation Mode deactivated — Accepting new bookings.',
      data: { vacationMode: vendor.vacationMode },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Vendor Service Area Definition
 * @route   PUT /api/v1/vendors/service-area
 * @access  Private (Vendor Owner)
 */
export const updateServiceArea = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    const { serviceArea } = req.body;
    if (!serviceArea) {
      return res.status(400).json({ success: false, message: 'Service area configuration is required.' });
    }

    vendor.serviceArea = serviceArea;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Vendor service area updated successfully.',
      data: { serviceArea: vendor.serviceArea },
    });
  } catch (err) {
    next(err);
  }
};

