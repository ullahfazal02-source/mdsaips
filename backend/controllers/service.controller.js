import mongoose from 'mongoose';
import Service from '../models/Service.js';
import Vendor from '../models/Vendor.js';
import { Offer } from '../models/index.js';
import { checkLocationCoverage, getDistanceKm } from '../utils/geoUtils.js';
import logger from '../utils/logger.js';
import {
  createServiceSchema,
  updateServiceSchema,
  toggleServiceStatusSchema,
} from '../validations/service.validation.js';
import { isValidSubcategoryForDomain } from '../config/domains.js';

/**
 * @desc    Create a new Service Listing
 * @route   POST /api/v1/services
 * @access  Private (Vendor)
 */
export const createService = async (req, res, next) => {
  try {
    // 1. Check if user has an active Vendor profile
    const userIdObj = mongoose.Types.ObjectId.isValid(req.user.id)
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;

    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }, { userId: userIdObj }, { user: userIdObj }],
    });

    if (!vendor) {
      return res.status(403).json({
        success: false,
        message: 'You must register a Vendor profile before creating service listings.',
      });
    }

    if (!vendor.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your vendor profile is pending admin verification. You cannot create service listings until approved.',
      });
    }

    // 2. Joi Validation
    const { error, value } = createServiceSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    if (value.subCategory && !isValidSubcategoryForDomain(value.category, value.subCategory)) {
      return res.status(400).json({
        success: false,
        message: `Subcategory '${value.subCategory}' is invalid for domain '${value.category}'.`,
      });
    }

    // 3. Create Service document linked to Vendor (1 Vendor can have multiple Services)
    const newService = new Service({
      ...value,
      vendorId: vendor._id,
      vendor: vendor._id,
      ratings: { average: 0, count: 0 },
      totalBookings: 0,
      wishlistCount: 0,
      isActive: true,
    });

    await newService.save();

    logger.info(`Service listing created: "${newService.title}" (ID: ${newService._id}) for Vendor ${vendor._id}`);

    const populatedService = await Service.findById(newService._id).populate(
      'vendorId',
      'businessName category isVerified ratings location'
    );

    return res.status(201).json({
      success: true,
      message: 'Service listing created successfully.',
      service: populatedService,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all active service listings with search, filter, pagination & sorting
 * @route   GET /api/v1/services
 * @access  Public
 */
export const getServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const {
      q,
      category,
      subCategory,
      city,
      minPrice,
      maxPrice,
      minRating,
      priceUnit,
      vendorId,
      sortBy,
      includeInactive,
    } = req.query;

    const query = {};

    // By default, non-admins only see active services
    if (includeInactive === 'true' && req.user?.role === 'admin') {
      // Admin override: include inactive
    } else {
      query.isActive = true;
    }

    // Text / Keyword Search
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
        { subCategory: regex },
        { city: regex },
      ];
    }

    if (category) query.category = category;
    if (subCategory) query.subCategory = { $regex: subCategory, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (priceUnit) query.priceUnit = priceUnit;
    if (vendorId) {
      query.$or = [{ vendorId }, { vendor: vendorId }];
    }

    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'rating') {
      sortOptions = { 'ratings.average': -1, totalBookings: -1 };
    } else if (sortBy === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'popularity') {
      sortOptions = { totalBookings: -1, 'ratings.average': -1 };
    }

    const [services, total] = await Promise.all([
      Service.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('vendorId', 'businessName category subCategory isVerified ratings location portfolio pricing'),
      Service.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        services,
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
 * @desc    Get Service Details by ID
 * @route   GET /api/v1/services/:id
 * @access  Public
 */
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate(
      'vendorId',
      'businessName description category subCategory location pricing ratings cancellationPolicy availability portfolio isVerified'
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Services owned by current Vendor
 * @route   GET /api/v1/services/my-services
 * @access  Private (Vendor)
 */
export const getMyServices = async (req, res, next) => {
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

    const services = await Service.find({
      $or: [{ vendorId: vendor._id }, { vendor: vendor._id }],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update Service Listing
 * @route   PUT /api/v1/services/:id
 * @access  Private (Owner, Admin)
 */
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    // Ownership Security Check
    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    const isOwner = vendor && (service.vendorId || service.vendor)?.toString() === vendor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to modify this service listing.',
      });
    }

    // Validation
    const { error, value } = updateServiceSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const targetCategory = value.category || service.category;
    if (value.subCategory && !isValidSubcategoryForDomain(targetCategory, value.subCategory)) {
      return res.status(400).json({
        success: false,
        message: `Subcategory '${value.subCategory}' is invalid for domain '${targetCategory}'.`,
      });
    }

    // Protect system-managed fields
    delete value.ratings;
    delete value.totalBookings;
    delete value.wishlistCount;
    delete value.vendorId;
    delete value.vendor;

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate('vendorId', 'businessName category isVerified ratings location');

    logger.info(`Service listing updated: ${id} by user ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Service listing updated successfully',
      data: updatedService,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle Service Active Status
 * @route   PATCH /api/v1/services/:id/status
 * @access  Private (Owner, Admin)
 */
export const toggleServiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    // Ownership Security Check
    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    const isOwner = vendor && (service.vendorId || service.vendor)?.toString() === vendor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to change status for this service listing.',
      });
    }

    const { error, value } = toggleServiceStatusSchema.validate(req.body);
    if (!error && value.isActive !== undefined) {
      service.isActive = value.isActive;
    } else {
      service.isActive = !service.isActive;
    }

    await service.save();

    logger.info(`Service status toggled for ${id}: isActive = ${service.isActive}`);

    return res.status(200).json({
      success: true,
      message: `Service listing ${service.isActive ? 'activated' : 'deactivated'} successfully.`,
      isActive: service.isActive,
      service,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete Service Listing
 * @route   DELETE /api/v1/services/:id
 * @access  Private (Owner, Admin)
 */
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    // Ownership Security Check
    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    const isOwner = vendor && (service.vendorId || service.vendor)?.toString() === vendor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this service listing.',
      });
    }

    await Service.findByIdAndDelete(id);

    logger.info(`Service listing deleted: ${id} by user ${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: 'Service listing deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add / Edit / Delete / Reorder FAQs for a Service
 * @route   PUT /api/v1/services/:id/faqs
 * @access  Private (Vendor Owner)
 */
export const updateServiceFaqs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { faqs } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service listing not found' });
    }

    const vendor = await Vendor.findOne({
      $or: [{ userId: req.user.id }, { user: req.user.id }],
    });

    if (!vendor || (service.vendorId || service.vendor)?.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit FAQs for this service.' });
    }

    if (!Array.isArray(faqs)) {
      return res.status(400).json({ success: false, message: 'FAQs must be an array of questions and answers.' });
    }

    service.faqs = faqs;
    await service.save();

    return res.status(200).json({
      success: true,
      message: 'Service FAQs updated successfully.',
      data: { faqs: service.faqs },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Check customer location coverage against service area
 * @route   POST /api/v1/services/:id/check-coverage
 * @access  Public
 */
export const checkServiceAreaCoverage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lat, lng, city } = req.body;

    const service = await Service.findById(id).populate('vendorId', 'serviceArea location');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service listing not found' });
    }

    const vendorObj = service.vendorId || service.vendor;
    const activeArea = (service.serviceArea?.cities?.length || service.serviceArea?.type === 'Polygon' || (service.serviceArea?.type === 'Radius' && service.serviceArea?.radiusZone?.center?.lat !== 0))
      ? service.serviceArea
      : (vendorObj?.serviceArea || vendorObj);

    const result = checkLocationCoverage({ lat, lng, city }, activeArea);

    return res.status(200).json({
      success: true,
      data: {
        isAvailable: result.isAvailable,
        message: result.message,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Map-based search for Home Services & Construction & Renovation
 * @route   GET /api/v1/services/map-search
 * @access  Public
 */
export const getMapSearchServices = async (req, res, next) => {
  try {
    const {
      category = 'home',
      subCategory,
      city,
      lat,
      lng,
      radiusKm = 10,
      minPrice,
      maxPrice,
      minRating,
    } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }
    if (subCategory) {
      query.subCategory = subCategory;
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) {
      query['ratings.average'] = { $gte: Number(minRating) };
    }

    const services = await Service.find(query)
      .populate('vendorId', 'businessName category location phone ratings serviceArea availability isVerified')
      .limit(100);

    const centerLat = lat ? Number(lat) : null;
    const centerLng = lng ? Number(lng) : null;
    const maxRadius = Number(radiusKm) || 10;

    const defaultCityCoordinates = {
      bangalore: { lat: 12.9716, lng: 77.5946 },
      mumbai: { lat: 19.0760, lng: 72.8777 },
      delhi: { lat: 28.6139, lng: 77.2090 },
      hyderabad: { lat: 17.3850, lng: 78.4867 },
      chennai: { lat: 13.0827, lng: 80.2707 },
    };

    const formattedServices = services.map((s) => {
      const sObj = s.toObject({ virtuals: true });
      const vendor = s.vendorId || {};
      const vendorCoords = vendor.location?.coordinates || vendor.serviceArea?.radiusZone?.center;

      let sLat = vendorCoords?.lat || 0;
      let sLng = vendorCoords?.lng || 0;

      if ((!sLat || !sLng) && s.city) {
        const cityClean = s.city.toLowerCase().trim();
        const cityLookup = defaultCityCoordinates[cityClean];
        if (cityLookup) {
          sLat = cityLookup.lat;
          sLng = cityLookup.lng;
        }
      }

      sObj.locationCoordinates = { lat: sLat, lng: sLng };

      let distanceKm = null;
      if (centerLat !== null && centerLng !== null && sLat && sLng) {
        distanceKm = getDistanceKm(centerLat, centerLng, sLat, sLng);
      }

      sObj.distanceKm = distanceKm !== null ? Number(distanceKm.toFixed(1)) : null;
      return sObj;
    });

    let results = formattedServices;
    if (centerLat !== null && centerLng !== null) {
      results = formattedServices.filter(
        (s) => s.distanceKm === null || s.distanceKm <= maxRadius
      );
      results.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    logger.error(`Error in getMapSearchServices: ${err.message}`);
    next(err);
  }
};

