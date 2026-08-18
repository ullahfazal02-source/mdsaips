import mongoose from 'mongoose';
import { Wishlist, Service, Vendor } from '../models/index.js';
import { serviceParamSchema, updateNoteSchema } from '../validations/wishlist.validation.js';

/**
 * Get current user's wishlist with populated active services & vendors
 * GET /api/v1/wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    const customerId = req.user.id;

    let wishlist = await Wishlist.findOne({
      $or: [
        { customerId: customerId },
        { customerId: new mongoose.Types.ObjectId(customerId) },
      ],
    })
      .populate({
        path: 'items.serviceId',
        model: 'Service',
        populate: {
          path: 'vendorId',
          model: 'Vendor',
          select: 'businessName category isVerified ratings location',
        },
      })
      .populate({
        path: 'items.vendorId',
        model: 'Vendor',
        select: 'businessName category isVerified ratings location',
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        customerId,
        items: [],
      });
    }

    // Gracefully handle inactive or deleted services
    const sanitizedItems = wishlist.items.map((item) => {
      const service = item.serviceId;
      const isAvailable = service && service.isActive !== false;
      return {
        _id: item._id,
        serviceId: service ? service._id : item.serviceId,
        service: service || null,
        vendor: item.vendorId || (service ? service.vendorId : null),
        addedAt: item.addedAt,
        note: item.note || '',
        isAvailable,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        _id: wishlist._id,
        customerId: wishlist.customerId,
        items: sanitizedItems,
        count: sanitizedItems.length,
        updatedAt: wishlist.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message,
    });
  }
};

/**
 * Get wishlist item count for navbar badge
 * GET /api/v1/wishlist/count
 */
export const getWishlistCount = async (req, res) => {
  try {
    const customerId = req.user.id;
    const wishlist = await Wishlist.findOne({
      $or: [
        { customerId: customerId },
        { customerId: new mongoose.Types.ObjectId(customerId) },
      ],
    });

    const count = wishlist ? wishlist.items.length : 0;

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist count',
      error: error.message,
    });
  }
};

/**
 * Add a service to customer wishlist
 * POST /api/v1/wishlist/:serviceId
 */
export const addToWishlist = async (req, res) => {
  try {
    const { error, value } = serviceParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { serviceId } = value;
    const customerId = req.user.id;

    // 1. Verify Service exists and is active
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    if (service.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Cannot wishlist an inactive service listing',
      });
    }

    // 2. Fetch Service Vendor
    const vendorId = service.vendorId || service.vendor;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Associated service vendor profile not found',
      });
    }

    // 3. Prevent Own-Service Wishlisting (If current user is the owner of this Vendor profile)
    const userVendorProfile = await Vendor.findOne({
      $or: [
        { userId: customerId },
        { userId: new mongoose.Types.ObjectId(customerId) },
        { user: customerId },
        { user: new mongoose.Types.ObjectId(customerId) },
      ],
    });

    if (userVendorProfile && userVendorProfile._id.toString() === vendor._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add your own service to wishlist.',
      });
    }

    // 4. Find or Create User Wishlist Document
    let wishlist = await Wishlist.findOne({
      $or: [
        { customerId: customerId },
        { customerId: new mongoose.Types.ObjectId(customerId) },
      ],
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        customerId,
        items: [],
      });
    }

    // 5. Check if service already exists in wishlist
    const exists = wishlist.items.some(
      (item) => item.serviceId.toString() === serviceId.toString()
    );

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Service already exists in wishlist.',
      });
    }

    // 6. Push item to wishlist
    wishlist.items.push({
      serviceId,
      vendorId: vendor._id,
      note: req.body.note || '',
      addedAt: new Date(),
    });

    await wishlist.save();

    return res.status(201).json({
      success: true,
      message: 'Service added to wishlist successfully',
      data: {
        wishlistId: wishlist._id,
        count: wishlist.items.length,
      },
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add service to wishlist',
      error: error.message,
    });
  }
};

/**
 * Remove a service from customer wishlist
 * DELETE /api/v1/wishlist/:serviceId
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { error, value } = serviceParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { serviceId } = value;
    const customerId = req.user.id;

    const wishlist = await Wishlist.findOne({
      $or: [
        { customerId: customerId },
        { customerId: new mongoose.Types.ObjectId(customerId) },
      ],
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.serviceId.toString() !== serviceId.toString()
    );

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: 'Service removed from wishlist successfully',
      data: {
        count: wishlist.items.length,
      },
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove service from wishlist',
      error: error.message,
    });
  }
};

/**
 * Clear all items from customer wishlist
 * DELETE /api/v1/wishlist/clear
 */
export const clearWishlist = async (req, res) => {
  try {
    const customerId = req.user.id;

    const wishlist = await Wishlist.findOne({
      $or: [
        { customerId: customerId },
        { customerId: new mongoose.Types.ObjectId(customerId) },
      ],
    });

    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: { count: 0 },
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message,
    });
  }
};

/**
 * Update personal note for a wishlisted service
 * PUT /api/v1/wishlist/:serviceId/note
 */
export const updateWishlistNote = async (req, res) => {
  try {
    const { error: paramErr, value: paramVal } = serviceParamSchema.validate(req.params);
    if (paramErr) {
      return res.status(400).json({
        success: false,
        message: paramErr.details[0].message,
      });
    }

    const { error: bodyErr, value: bodyVal } = updateNoteSchema.validate(req.body);
    if (bodyErr) {
      return res.status(400).json({
        success: false,
        message: bodyErr.details[0].message,
      });
    }

    const { serviceId } = paramVal;
    const { note } = bodyVal;
    const customerId = req.user.id;

    const wishlist = await Wishlist.findOne({
      $or: [
        { customerId: customerId },
        { customerId: new mongoose.Types.ObjectId(customerId) },
      ],
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    const targetItem = wishlist.items.find(
      (item) => item.serviceId.toString() === serviceId.toString()
    );

    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: 'Service item not found in wishlist',
      });
    }

    targetItem.note = note;
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: 'Wishlist note updated successfully',
      data: {
        serviceId,
        note: targetItem.note,
      },
    });
  } catch (error) {
    console.error('Error updating wishlist note:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update wishlist note',
      error: error.message,
    });
  }
};

/**
 * Get redirection and service metadata to move wishlist item to booking
 * POST /api/v1/wishlist/move-to-booking/:serviceId
 */
export const moveToBooking = async (req, res) => {
  try {
    const { error, value } = serviceParamSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { serviceId } = value;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service listing not found',
      });
    }

    if (service.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Service is currently unavailable for booking',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Service ready for booking configuration',
      data: {
        serviceId: service._id,
        title: service.title,
        price: service.price,
        category: service.category,
        redirectUrl: `/booking?serviceId=${service._id}`,
      },
    });
  } catch (error) {
    console.error('Error moving wishlist item to booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process move to booking',
      error: error.message,
    });
  }
};

export default {
  getWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  updateWishlistNote,
  moveToBooking,
};
