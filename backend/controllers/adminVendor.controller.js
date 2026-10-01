import Vendor from '../models/Vendor.js';
import sendEmail from '../utils/sendEmail.js';
import logger from '../utils/logger.js';
import { verifyVendorSchema } from '../validations/vendor.validation.js';

/**
 * @desc    Get List of Pending Vendor Profiles (for Admin Verification)
 * @route   GET /api/v1/admin/vendors/pending
 * @access  Private (Admin)
 */
export const getPendingVendors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      Vendor.find({ isVerified: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone avatar'),
      Vendor.countDocuments({ isVerified: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin Approve or Reject Vendor Verification
 * @route   PUT /api/v1/admin/vendors/:id/verify
 * @access  Private (Admin)
 */
export const verifyVendor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = verifyVendorSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { approved, reason } = value;

    const vendor = await Vendor.findById(id).populate('userId', 'email name');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    vendor.isVerified = approved;
    await vendor.save();

    logger.info(`Admin ${req.user.id} ${approved ? 'approved' : 'rejected'} vendor ${id}. Reason: ${reason || 'N/A'}`);

    // Send email notification to vendor using Nodemailer
    if (vendor.userId && vendor.userId.email) {
      const subject = 'MDSAIPS Vendor Verification Update';
      const statusText = approved ? 'APPROVED' : 'REJECTED';
      const bodyHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: ${approved ? '#10B981' : '#EF4444'};">Vendor Verification ${statusText}</h2>
          <p>Hello <strong>${vendor.userId.name || vendor.businessName}</strong>,</p>
          <p>Your vendor profile for <strong>${vendor.businessName}</strong> has been <strong>${statusText.toLowerCase()}</strong> by MDSAIPS Administration.</p>
          ${reason ? `<p><strong>Note / Reason:</strong> ${reason}</p>` : ''}
          <br/>
          <p>Regards,<br/><strong>MDSAIPS Team</strong></p>
        </div>
      `;

      // Non-blocking background email dispatch (fails gracefully if SMTP is unconfigured)
      sendEmail({
        to: vendor.userId.email,
        subject,
        html: bodyHtml,
        text: `Your vendor verification for ${vendor.businessName} is ${statusText}. ${reason || ''}`,
      }).catch((emailErr) => {
        logger.warn(`Failed to dispatch vendor verification email: ${emailErr.message}`);
      });
    }

    return res.status(200).json({
      success: true,
      message: `Vendor verification ${approved ? 'approved' : 'rejected'} successfully.`,
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        isVerified: vendor.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Real Platform Statistics for Admin Panel
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const { User, Vendor, Service, Booking, Payment, Cancellation } = await import('../models/index.js');

    const [
      totalUsers,
      totalCustomers,
      totalVendors,
      verifiedVendors,
      pendingVendors,
      totalServices,
      activeServices,
      totalBookings,
      completedBookings,
      pendingBookings,
      rejectedBookings,
      cancelledBookings,
      refundsCount,
      payments,
      refundsAgg,
      popularDomains,
      popularSubcategories,
      popularServices,
      topVendors,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ isVerified: true }),
      Vendor.countDocuments({ isVerified: false }),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'rejected' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Cancellation.countDocuments(),
      Payment.aggregate([
        { $match: { status: { $in: ['paid', 'completed'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
      Cancellation.aggregate([
        { $match: { refundStatus: { $in: ['approved', 'processed'] } } },
        { $group: { _id: null, totalRefunded: { $sum: '$refundAmount' } } },
      ]),
      Service.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalBookings: { $sum: '$totalBookings' } } },
        { $sort: { totalBookings: -1 } },
        { $limit: 4 },
      ]),
      Service.aggregate([
        { $group: { _id: '$subCategory', category: { $first: '$category' }, count: { $sum: 1 }, totalBookings: { $sum: '$totalBookings' } } },
        { $sort: { totalBookings: -1 } },
        { $limit: 5 },
      ]),
      Service.find()
        .sort({ totalBookings: -1, 'ratings.average': -1 })
        .limit(5)
        .select('title category subCategory price totalBookings ratings images'),
      Vendor.find({ isVerified: true })
        .sort({ 'ratings.average': -1, totalEarnings: -1 })
        .limit(5)
        .select('businessName category ratings totalEarnings location isVerified'),
    ]);

    const totalRevenue = payments.length > 0 ? payments[0].totalRevenue : 0;
    const totalRefundedAmount = refundsAgg.length > 0 ? refundsAgg[0].totalRefunded : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalVendors,
        verifiedVendors,
        pendingVendors,
        totalServices,
        activeServices,
        totalBookings,
        completedBookings,
        pendingBookings,
        rejectedBookings,
        cancelledBookings,
        refundsCount,
        totalRefundedAmount,
        totalRevenue,
        popularDomains,
        popularSubcategories,
        popularServices,
        topVendors,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Detailed Vendor Overview for Admin (Tiers, Offers, Vacation Mode, Analytics)
 * @route   GET /api/v1/admin/vendors/overview
 * @access  Private (Admin)
 */
export const getAdminVendorOverview = async (req, res, next) => {
  try {
    const { Offer, Booking, AnalyticsEvent } = await import('../models/index.js');
    const { calculateVendorTier } = await import('../config/tierConfig.js');

    const vendors = await Vendor.find().populate('userId', 'name email phone avatar');

    const vendorList = await Promise.all(
      vendors.map(async (v) => {
        const completedBookings = await Booking.countDocuments({ vendorId: v._id, status: 'completed' });
        const totalBookings = await Booking.countDocuments({ vendorId: v._id });
        const activeOffers = await Offer.countDocuments({ vendorId: v._id, isActive: true });
        const profileViews = await AnalyticsEvent.countDocuments({ vendorId: v._id, eventType: 'profile_view' });

        const tier = calculateVendorTier({
          isVerified: v.isVerified,
          completedBookings,
          averageRating: v.ratings?.average || 0,
          reviewCount: v.ratings?.count || 0,
          responseRate: 95,
          cancellationRate: 0,
          accountAgeDays: 30,
        });

        return {
          id: v._id,
          businessName: v.businessName,
          category: v.category,
          owner: v.userId,
          isVerified: v.isVerified,
          isActive: v.isActive,
          vacationMode: v.vacationMode || false,
          tier,
          activeOffers,
          completedBookings,
          totalBookings,
          profileViews,
          serviceArea: v.serviceArea,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { vendors: vendorList },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Moderate/Deactivate an Inappropriate Offer (Admin)
 * @route   PATCH /api/v1/admin/offers/:id/moderate
 * @access  Private (Admin)
 */
export const moderateOffer = async (req, res, next) => {
  try {
    const { Offer } = await import('../models/index.js');
    const { id } = req.params;
    const { isActive, reason = 'Offer deactivated by administrator' } = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    offer.isActive = typeof isActive === 'boolean' ? isActive : false;
    await offer.save();

    logger.info(`Admin ${req.user.id} moderated offer ${id}. Active set to: ${offer.isActive}`);

    return res.status(200).json({
      success: true,
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} by admin.`,
      data: { offer, reason },
    });
  } catch (err) {
    next(err);
  }
};


