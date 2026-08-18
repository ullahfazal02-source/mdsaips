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
    const { User, Vendor, Service, Booking, Payment } = await import('../models/index.js');

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
      payments,
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
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
      ]),
    ]);

    const totalRevenue = payments.length > 0 ? payments[0].totalRevenue : 0;

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
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

