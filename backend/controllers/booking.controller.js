import { Booking, Service, Vendor, User } from '../models/index.js';
import { createBookingSchema, getBookingsQuerySchema } from '../validations/booking.validation.js';
import logger from '../utils/logger.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * Generate unique booking reference number
 */
const generateBookingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${randomStr}`;
};

/**
 * @desc    Create a new booking request (Customer)
 * @route   POST /api/v1/bookings
 * @access  Private (Customer)
 */
export const createBooking = async (req, res, next) => {
  try {
    // 1. Authentication Guard - derive customerId from req.user (Customer or Vendor user)
    const customerId = req.user.id || req.user._id;
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create bookings.',
      });
    }

    // 2. Validate Body Schema with Joi
    const { error, value } = createBookingSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorMessages,
      });
    }

    const { serviceId, packageSelected, eventDate, eventDetails = {}, notes } = value;

    // 3. Validate Service Existence and Active Status
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    if (service.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Service is currently inactive.',
      });
    }

    // 4. Validate Vendor Existence, Verification, and Status
    const vendorId = service.vendorId || service.vendor;
    if (!vendorId) {
      return res.status(404).json({
        success: false,
        message: 'Vendor associated with this service was not found.',
      });
    }

    const vendor = await Vendor.findById(vendorId).populate('userId', 'email name');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found.',
      });
    }

    const isVendorActive = vendor.isActive !== false && vendor.status !== 'inactive' && vendor.status !== 'suspended';
    if (!isVendorActive) {
      return res.status(400).json({
        success: false,
        message: 'Vendor is not active.',
      });
    }

    if (!vendor.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Vendor is not verified.',
      });
    }

    // 5. VENDOR OWN-SERVICE RESTRICTION: A vendor cannot book their OWN service
    const vendorUserId = (vendor.userId?._id || vendor.userId || vendor.user).toString();
    if (vendorUserId === customerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own service.',
      });
    }

    // 6. Dynamic Date Resolution & Past Date Guard
    const category = (service.category || 'event').toLowerCase();
    const rawDate = eventDate || eventDetails.preferredStartDate || eventDetails.preferredDate || eventDetails.checkInDate;
    
    if (!rawDate) {
      return res.status(400).json({
        success: false,
        message: 'A valid event, preferred start, or check-in date is required.',
      });
    }

    const selectedDate = new Date(rawDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format.',
      });
    }

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Event date cannot be in the past.',
      });
    }

    // 7. Category-Specific Booking Details Sanitization (Do NOT store irrelevant fields)
    let sanitizedDetails = {};

    switch (category) {
      case 'event':
        sanitizedDetails = {
          eventType: eventDetails.eventType || 'General Event',
          guestCount: Number(eventDetails.guestCount) || 1,
          venue: eventDetails.venue || '',
          address: eventDetails.address || '',
          specialRequirements: eventDetails.specialRequirements || '',
        };
        break;
      case 'construction':
        sanitizedDetails = {
          projectType: eventDetails.projectType || 'Renovation',
          propertyType: eventDetails.propertyType || 'Residential',
          area: Number(eventDetails.area) || 0,
          unit: eventDetails.unit || 'sqft',
          projectLocation: eventDetails.projectLocation || eventDetails.address || '',
          estimatedBudget: Number(eventDetails.estimatedBudget) || 0,
          preferredStartDate: eventDetails.preferredStartDate ? new Date(eventDetails.preferredStartDate) : selectedDate,
          projectDescription: eventDetails.projectDescription || '',
        };
        break;
      case 'home':
        sanitizedDetails = {
          serviceType: eventDetails.serviceType || 'Repair & Maintenance',
          problemDescription: eventDetails.problemDescription || '',
          preferredDate: eventDetails.preferredDate ? new Date(eventDetails.preferredDate) : selectedDate,
          preferredTime: eventDetails.preferredTime || 'Morning',
          serviceAddress: eventDetails.serviceAddress || eventDetails.address || '',
          urgency: eventDetails.urgency || 'Normal',
          specialRequirements: eventDetails.specialRequirements || '',
        };
        break;
      case 'accommodation':
        sanitizedDetails = {
          checkInDate: eventDetails.checkInDate ? new Date(eventDetails.checkInDate) : selectedDate,
          checkOutDate: eventDetails.checkOutDate ? new Date(eventDetails.checkOutDate) : new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
          guests: Number(eventDetails.guests || eventDetails.guestCount) || 1,
          rooms: Number(eventDetails.rooms) || 1,
          guestDetails: eventDetails.guestDetails || '',
          specialRequests: eventDetails.specialRequests || eventDetails.specialRequirements || '',
        };
        break;
      default:
        sanitizedDetails = { ...eventDetails };
    }

    // 6. Package Pricing Calculation (Do NOT trust frontend price)
    let baseAmount = 0;
    if (packageSelected) {
      const pkgNameClean = packageSelected.trim().toLowerCase();
      const pkg = (service.packages || []).find((p) => p.name && p.name.trim().toLowerCase() === pkgNameClean);
      if (!pkg) {
        return res.status(400).json({
          success: false,
          message: 'Selected package is not available.',
        });
      }
      baseAmount = Number(pkg.price);
    } else {
      baseAmount = Number(service.price || 0);
    }

    if (isNaN(baseAmount) || baseAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pricing for selected package.',
      });
    }

    // 7. Calculate 18% GST and Total Amount safely
    const taxes = Math.round(baseAmount * 0.18);
    const discount = 0;
    const totalAmount = baseAmount + taxes - discount;

    const pricing = {
      baseAmount,
      taxes,
      discount,
      totalAmount,
    };

    // 8. Availability & Conflict Checking
    // Check custom vendor availability slots if configured
    if (vendor.availability && Array.isArray(vendor.availability.slots)) {
      const slot = vendor.availability.slots.find(
        (s) => new Date(s.date).toDateString() === selectedDate.toDateString()
      );
      if (slot && slot.isAvailable === false) {
        return res.status(409).json({
          success: false,
          message: 'Vendor is not available on the selected date.',
        });
      }
    }

    // Conflict Check: Prevent duplicate bookings for vendor on same date with active status (pending, confirmed, in_progress)
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      vendorId: vendor._id,
      eventDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Vendor already has a booking on this date.',
      });
    }

    // 9. Initial Timeline Entry
    const timeline = [
      {
        status: 'pending',
        message: 'Booking request created.',
        timestamp: new Date(),
      },
    ];

    // 10. Save Booking Document
    const bookingNumber = generateBookingNumber();

    const booking = await Booking.create({
      bookingNumber,
      customerId,
      vendorId: vendor._id,
      serviceId: service._id,
      packageSelected: packageSelected || null,
      eventDate: selectedDate,
      eventDetails: sanitizedDetails,
      pricing,
      status: 'pending',
      paymentStatus: 'unpaid',
      notes: notes || '',
      timeline,
    });

    // 11. Optional Email Alert to Vendor (Async/Safe)
    if (vendor.userId && vendor.userId.email) {
      sendEmail({
        to: vendor.userId.email,
        subject: `New Booking Request: ${bookingNumber}`,
        html: `
          <h3>New Booking Request Received</h3>
          <p>You have received a new booking request for <strong>${service.title}</strong>.</p>
          <p><strong>Event Date:</strong> ${selectedDate.toDateString()}</p>
          <p><strong>Customer Details:</strong> ${eventDetails.eventType} (${eventDetails.guestCount} guests)</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
          <p>Please log into your vendor portal to confirm or manage this request.</p>
        `,
      }).catch((err) => logger.error(`Vendor notification email failed: ${err.message}`));
    }

    logger.info(`Booking created successfully: ${booking.bookingNumber} by customer [${customerId}]`);

    return res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully.',
      data: booking,
    });
  } catch (error) {
    logger.error(`Error creating booking: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get logged-in customer's bookings
 * @route   GET /api/v1/bookings
 * @route   GET /api/v1/bookings/customer/all
 * @access  Private (Customer)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const customerId = req.user.id || req.user._id;

    const { status, page = 1, limit = 10 } = req.query;

    const query = { customerId };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('serviceId', 'title category price images city priceUnit')
      .populate('vendorId', 'businessName category location phone ratings isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: bookings,
    });
  } catch (error) {
    logger.error(`Error fetching customer bookings: ${error.message}`);
    next(error);
  }
};

export const getCustomerBookings = getMyBookings;

/**
 * @desc    Get booking details by ID
 * @route   GET /api/v1/bookings/:id
 * @access  Private (Customer, Vendor, Admin)
 */
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('customerId', 'name email phone avatar')
      .populate('vendorId', 'businessName category location phone userId isVerified')
      .populate('serviceId', 'title description category subCategory price priceUnit images city packages');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const userId = (req.user.id || req.user._id).toString();
    const userRole = req.user.role;

    // Check authorization: Admin, Customer Owner, or Vendor Owner
    let isAuthorized = false;

    if (userRole === 'admin') {
      isAuthorized = true;
    } else {
      // Check customer owner
      const bookingCustId = (booking.customerId._id || booking.customerId).toString();
      if (bookingCustId === userId) {
        isAuthorized = true;
      }

      // Check vendor owner
      if (!isAuthorized) {
        const vendor = await Vendor.findOne({ userId });
        if (vendor) {
          const bookingVendorId = (booking.vendorId._id || booking.vendorId).toString();
          if (bookingVendorId === vendor._id.toString()) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this booking.',
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    logger.error(`Error fetching booking details [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get pending booking requests for authenticated vendor
 * @route   GET /api/v1/bookings/vendor/requests
 * @access  Private (Vendor)
 */
export const getVendorRequests = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = { vendorId: vendor._id, status: 'pending' };

    const total = await Booking.countDocuments(query);
    const requests = await Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'title price images category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: requests,
    });
  } catch (error) {
    logger.error(`Error fetching vendor requests: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all bookings for authenticated vendor
 * @route   GET /api/v1/bookings/vendor/all
 * @access  Private (Vendor)
 */
export const getVendorBookings = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    const query = { vendorId: vendor._id };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('serviceId', 'title category price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: bookings,
    });
  } catch (error) {
    logger.error(`Error fetching vendor bookings: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Vendor confirms a pending booking request
 * @route   PUT /api/v1/bookings/:id/confirm
 * @access  Private (Vendor)
 */
export const confirmBooking = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const booking = await Booking.findById(id).populate('customerId', 'name email');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only confirm your own booking requests.',
      });
    }

    // Status transition validation: pending -> confirmed
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be confirmed from current status: '${booking.status}'.`,
      });
    }

    booking.status = 'confirmed';
    booking.timeline.push({
      status: 'confirmed',
      message: 'Vendor confirmed the booking.',
      timestamp: new Date(),
    });

    await booking.save();

    // Async customer email alert
    if (booking.customerId && booking.customerId.email) {
      sendEmail({
        to: booking.customerId.email,
        subject: `Booking Confirmed: ${booking.bookingNumber}`,
        html: `
          <h3>Your Booking Has Been Confirmed!</h3>
          <p>Dear ${booking.customerId.name || 'Customer'},</p>
          <p>Great news! The vendor has confirmed your booking <strong>${booking.bookingNumber}</strong>.</p>
          <p><strong>Event Date:</strong> ${new Date(booking.eventDate).toDateString()}</p>
          <p>Thank you for choosing MDSAIPS!</p>
        `,
      }).catch((err) => logger.error(`Customer confirmation email failed: ${err.message}`));
    }

    logger.info(`Booking [${booking.bookingNumber}] confirmed by vendor [${vendor._id}]`);

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully.',
      data: booking,
    });
  } catch (error) {
    logger.error(`Error confirming booking [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Vendor marks booking as in_progress
 * @route   PUT /api/v1/bookings/:id/start
 * @access  Private (Vendor)
 */
export const startBooking = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only start your own bookings.',
      });
    }

    // Status transition validation: confirmed -> in_progress
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be started from current status: '${booking.status}'. Must be confirmed first.`,
      });
    }

    booking.status = 'in_progress';
    booking.startDate = new Date();
    booking.timeline.push({
      status: 'in_progress',
      message: 'Service has started.',
      timestamp: new Date(),
    });

    await booking.save();

    logger.info(`Booking [${booking.bookingNumber}] marked as in_progress by vendor [${vendor._id}]`);

    return res.status(200).json({
      success: true,
      message: 'Service has started.',
      data: booking,
    });
  } catch (error) {
    logger.error(`Error starting booking [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Vendor marks booking as completed
 * @route   PUT /api/v1/bookings/:id/complete
 * @access  Private (Vendor)
 */
export const completeBooking = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found.',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only complete your own bookings.',
      });
    }

    // Status transition validation: in_progress -> completed
    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be completed from current status: '${booking.status}'. Must be in_progress first.`,
      });
    }

    booking.status = 'completed';
    booking.endDate = new Date();
    booking.timeline.push({
      status: 'completed',
      message: 'Service has been marked as completed.',
      timestamp: new Date(),
    });

    await booking.save();

    // Increment Service totalBookings counter
    if (booking.serviceId) {
      await Service.findByIdAndUpdate(booking.serviceId, { $inc: { totalBookings: 1 } });
    }

    logger.info(`Booking [${booking.bookingNumber}] completed by vendor [${vendor._id}]. Total bookings incremented.`);

    return res.status(200).json({
      success: true,
      message: 'Service has been marked as completed.',
      data: booking,
    });
  } catch (error) {
    logger.error(`Error completing booking [${req.params.id}]: ${error.message}`);
    next(error);
  }
};
