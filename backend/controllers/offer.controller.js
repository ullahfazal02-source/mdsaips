import { Offer, Vendor, Service } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Helper to calculate authoritative offer discount amount
 */
export const calculateDiscountAmount = (offer, baseAmount) => {
  if (!offer || !offer.isActive) return 0;

  const now = new Date();
  if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) return 0;
  if (offer.minBookingAmount && baseAmount < offer.minBookingAmount) return 0;
  if (offer.usageLimit && offer.usageCount >= offer.usageLimit) return 0;

  if (offer.offerType === 'percentage') {
    const calculated = (baseAmount * offer.discountValue) / 100;
    return Math.min(calculated, baseAmount); // Discount cannot exceed base amount
  } else if (offer.offerType === 'fixed') {
    return Math.min(offer.discountValue, baseAmount);
  }

  return 0;
};

/**
 * @desc    Create a promotional offer (Vendor)
 * @route   POST /api/v1/offers
 * @access  Private (Vendor)
 */
export const createOffer = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ $or: [{ userId }, { user: userId }] });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    const {
      title,
      description,
      offerType,
      discountValue,
      addonDetails,
      startDate,
      endDate,
      applicableServices = [],
      applicablePackage = 'all',
      minBookingAmount = 0,
      usageLimit = null,
      termsAndConditions,
      code,
    } = req.body;

    if (!title || !offerType || discountValue == null || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required offer fields (title, offerType, discountValue, startDate, endDate).',
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ success: false, message: 'Start date must be before end date.' });
    }

    const newOffer = new Offer({
      vendorId: vendor._id,
      title,
      description,
      offerType,
      discountValue,
      addonDetails,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      applicableServices,
      applicablePackage,
      minBookingAmount,
      usageLimit,
      termsAndConditions,
      code,
      isActive: true,
    });

    await newOffer.save();

    return res.status(201).json({
      success: true,
      message: 'Promotional offer created successfully.',
      data: { offer: newOffer },
    });
  } catch (error) {
    logger.error(`Error in createOffer: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error creating offer' });
  }
};

/**
 * @desc    Get vendor's active offers
 * @route   GET /api/v1/offers/my-offers
 * @access  Private (Vendor)
 */
export const getMyOffers = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ $or: [{ userId }, { user: userId }] });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    const offers = await Offer.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { offers },
    });
  } catch (error) {
    logger.error(`Error in getMyOffers: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving offers' });
  }
};

/**
 * @desc    Get active offers for a specific service or vendor
 * @route   GET /api/v1/offers/service/:serviceId
 * @access  Public
 */
export const getServiceOffers = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const now = new Date();
    const offers = await Offer.find({
      vendorId: service.vendorId || service.vendor,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { applicableServices: { $size: 0 } },
        { applicableServices: serviceId },
      ],
    });

    return res.status(200).json({
      success: true,
      data: { offers },
    });
  } catch (error) {
    logger.error(`Error in getServiceOffers: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error retrieving service offers' });
  }
};

/**
 * @desc    Update or deactivate offer
 * @route   PUT /api/v1/offers/:offerId
 * @access  Private (Vendor)
 */
export const updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ $or: [{ userId }, { user: userId }] });

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this offer.' });
    }

    Object.assign(offer, req.body);
    await offer.save();

    return res.status(200).json({
      success: true,
      message: 'Offer updated successfully.',
      data: { offer },
    });
  } catch (error) {
    logger.error(`Error in updateOffer: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error updating offer' });
  }
};

/**
 * @desc    Delete offer
 * @route   DELETE /api/v1/offers/:offerId
 * @access  Private (Vendor)
 */
export const deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user.id;
    const vendor = await Vendor.findOne({ $or: [{ userId }, { user: userId }] });

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this offer.' });
    }

    await Offer.findByIdAndDelete(offerId);

    return res.status(200).json({
      success: true,
      message: 'Offer deleted successfully.',
    });
  } catch (error) {
    logger.error(`Error in deleteOffer: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error deleting offer' });
  }
};
