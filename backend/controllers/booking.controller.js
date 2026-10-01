import { Booking, Service, Vendor, User, Offer, Notification, Cancellation } from '../models/index.js';
import { createBookingSchema, getBookingsQuerySchema } from '../validations/booking.validation.js';
import logger from '../utils/logger.js';
import sendEmail from '../utils/sendEmail.js';
import { calculateDiscountAmount } from './offer.controller.js';
import { checkLocationCoverage } from '../utils/geoUtils.js';
import { calculatePointsEarned } from '../config/loyaltyConfig.js';


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

    // 4b. VACATION MODE GUARD: Block new booking creation if vendor is on vacation
    if (vendor.vacationMode === true) {
      return res.status(400).json({
        success: false,
        message: 'Currently unavailable — Vendor is on vacation and temporarily not accepting new bookings.',
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
    if (packageSelected && Array.isArray(service.packages) && service.packages.length > 0) {
      const pkgNameClean = packageSelected.trim().toLowerCase();
      const pkg = service.packages.find((p) => p.name && p.name.trim().toLowerCase() === pkgNameClean);
      if (pkg) {
        baseAmount = Number(pkg.price);
      } else {
        baseAmount = Number(service.price || 0);
      }
    } else {
      baseAmount = Number(service.price || 0);
    }

    if (isNaN(baseAmount) || baseAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pricing for selected package.',
      });
    }

    // 6b. Service Area Geographic Validation (Home Services & Construction)
    const activeServiceArea = (service.serviceArea?.cities?.length || service.serviceArea?.type === 'Polygon' || (service.serviceArea?.type === 'Radius' && service.serviceArea?.radiusZone?.center?.lat !== 0))
      ? service.serviceArea
      : vendor.serviceArea;
    if (category === 'home' || category === 'construction' || activeServiceArea?.type === 'Polygon' || activeServiceArea?.type === 'Radius') {
      const customerLoc = {
        lat: req.body.customerLat || req.body.lat || eventDetails.lat,
        lng: req.body.customerLng || req.body.lng || eventDetails.lng,
        city: eventDetails.serviceAddress || eventDetails.projectLocation || eventDetails.address || req.body.city || service.city,
      };
      const coverage = checkLocationCoverage(customerLoc, activeServiceArea);
      if (!coverage.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Booking rejected: ${coverage.message || 'Not available in your area.'}`,
        });
      }
    }

    // 7. Authoritative Promotional Offer & Discount Validation
    let discount = 0;
    const { offerId, offerCode } = req.body;
    if (offerId || offerCode) {
      const offer = offerId ? await Offer.findById(offerId) : await Offer.findOne({ code: offerCode?.toUpperCase() });
      if (offer && offer.isActive) {
        discount = calculateDiscountAmount(offer, baseAmount);
        if (discount > 0 && offer.usageLimit) {
          offer.usageCount = (offer.usageCount || 0) + 1;
          await offer.save();
        }
      }
    }

    // Calculate 18% GST and Final Total Amount safely
    const taxes = Math.round(baseAmount * 0.18);
    const totalAmount = Math.max(0, baseAmount + taxes - discount);

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
      responseDeadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour vendor response window
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

    // Status transition validation: pending -> confirmed & 1-hour response timer check
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be confirmed from current status: '${booking.status}'.`,
      });
    }

    if (booking.responseDeadline && new Date() > new Date(booking.responseDeadline)) {
      booking.status = 'expired';
      await booking.save();
      return res.status(400).json({
        success: false,
        message: 'Booking request has expired (1-hour response window elapsed) and cannot be confirmed.',
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

    // Award loyalty points ONLY when booking is completed AND payment is paid
    if (booking.paymentStatus === 'paid' && (!booking.pointsAwarded || booking.pointsAwarded === 0)) {
      const points = calculatePointsEarned(booking.pricing?.totalAmount || 0);
      if (points > 0) {
        booking.pointsAwarded = points;
        await User.findByIdAndUpdate(booking.customerId, {
          $inc: {
            'loyaltyPoints.current': points,
            'loyaltyPoints.earned': points,
          },
          $push: {
            loyaltyHistory: {
              points,
              type: 'earned',
              description: `Earned ${points} loyalty points for completed Booking #${booking.bookingNumber}`,
              bookingId: booking._id,
              timestamp: new Date(),
            },
          },
        }).catch((err) => logger.error(`Failed to update user loyalty points: ${err.message}`));

        await Notification.create({
          userId: booking.customerId,
          title: 'Loyalty Points Earned!',
          message: `You earned ${points} loyalty points for completed Booking #${booking.bookingNumber}!`,
          type: 'loyalty_points',
          link: '/customer-dashboard?tab=loyalty',
        }).catch(() => {});
      }
    }

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

/**
 * @desc    Vendor rejects a booking request
 * @route   PUT /api/v1/bookings/:id/reject
 * @access  Private (Vendor)
 */
export const rejectBooking = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { reason = 'Vendor unable to fulfill request at this time' } = req.body;

    if (!reason || !reason.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.',
      });
    }

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
        message: 'Forbidden: You can only reject your own booking requests.',
      });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be rejected from current status: '${booking.status}'.`,
      });
    }

    if (booking.responseDeadline && new Date() > new Date(booking.responseDeadline)) {
      booking.status = 'expired';
      await booking.save();
      return res.status(400).json({
        success: false,
        message: 'Booking request has expired (1-hour response window elapsed) and cannot be rejected.',
      });
    }

    booking.status = 'rejected';
    booking.cancellationReason = reason.toString().trim();

    if (booking.paymentStatus === 'paid') {
      booking.refundStatus = 'refund_pending';
      await Cancellation.create({
        booking: booking._id,
        cancelledBy: userId,
        userRole: 'vendor',
        reason: `Vendor Rejected: ${reason.toString().trim()}`,
        refundAmount: booking.pricing?.totalAmount || 0,
        refundStatus: 'pending',
      }).catch(() => {});
    }

    booking.timeline.push({
      status: 'rejected',
      message: `Booking request rejected by vendor: ${reason.toString().trim()}`,
      timestamp: new Date(),
    });

    await booking.save();

    // Customer Notification
    await Notification.create({
      userId: booking.customerId,
      title: 'Booking Request Rejected',
      message: `Your booking request #${booking.bookingNumber} was rejected by the vendor. Reason: ${reason.toString().trim()}`,
      type: 'booking_rejected',
      link: `/booking/${booking._id}`,
    }).catch(() => {});

    logger.info(`Booking [${booking.bookingNumber}] rejected by vendor [${vendor._id}]`);

    return res.status(200).json({
      success: true,
      message: 'Booking request rejected successfully.',
      data: booking,
    });
  } catch (error) {
    logger.error(`Error rejecting booking [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Customer cancels a booking
 * @route   PUT /api/v1/bookings/:id/cancel
 * @access  Private (Customer, Admin)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const customerId = req.user.id || req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required.',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const isCustomerOwner = booking.customerId.toString() === customerId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomerOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own bookings.',
      });
    }

    // Business rules: cannot cancel completed, cancelled, rejected, or expired bookings
    if (['completed', 'cancelled', 'rejected', 'expired'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled from current status: '${booking.status}'.`,
      });
    }

    const cleanReason = reason.toString().trim();
    booking.status = 'cancelled';
    booking.cancellationReason = cleanReason;
    booking.cancelledAt = new Date();
    booking.reorderAvailableUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Exactly 24 hours

    let refundStatus = 'not_applicable';
    if (booking.paymentStatus === 'paid') {
      refundStatus = 'refund_pending';
      booking.refundStatus = 'refund_pending';
    } else {
      booking.paymentStatus = 'unpaid';
      booking.refundStatus = 'not_applicable';
    }

    booking.timeline.push({
      status: 'cancelled',
      message: `Booking cancelled by customer: ${cleanReason}`,
      timestamp: new Date(),
    });

    await booking.save();

    // Create Cancellation record
    await Cancellation.create({
      booking: booking._id,
      cancelledBy: customerId,
      userRole: req.user.role || 'customer',
      reason: cleanReason,
      refundAmount: booking.paymentStatus === 'paid' ? (booking.pricing?.totalAmount || 0) : 0,
      refundStatus: booking.paymentStatus === 'paid' ? 'pending' : 'rejected',
    }).catch(() => {});

    // Notify Vendor
    const vendor = await Vendor.findById(booking.vendorId);
    if (vendor && (vendor.userId || vendor.user)) {
      await Notification.create({
        userId: vendor.userId || vendor.user,
        title: 'Booking Cancelled',
        message: `Booking #${booking.bookingNumber} was cancelled by customer. Reason: ${cleanReason}`,
        type: 'booking_cancelled',
        link: `/booking/${booking._id}`,
      }).catch(() => {});
    }

    logger.info(`Booking [${booking.bookingNumber}] cancelled by customer [${customerId}]`);

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking,
    });
  } catch (error) {
    logger.error(`Error cancelling booking [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get customer's cancelled bookings with reorder window status
 * @route   GET /api/v1/bookings/customer/cancelled
 * @access  Private (Customer)
 */
export const getCancelledBookings = async (req, res, next) => {
  try {
    const customerId = req.user.id || req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const query = { customerId, status: 'cancelled' };

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('serviceId', 'title category price images city priceUnit subCategory')
      .populate('vendorId', 'businessName category location phone ratings isVerified')
      .sort({ cancelledAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const formattedBookings = bookings.map((b) => {
      const bObj = b.toObject({ virtuals: true });
      const now = new Date();
      const isReorderAvailable = b.reorderAvailableUntil && now <= new Date(b.reorderAvailableUntil);
      bObj.reorderStatus = isReorderAvailable ? 'reorder_available' : 'reorder_expired';
      return bObj;
    });

    return res.status(200).json({
      success: true,
      count: formattedBookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: formattedBookings,
    });
  } catch (error) {
    logger.error(`Error fetching customer cancelled bookings: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Fetch fresh reorder data (verifying 24-hour expiry & live prices)
 * @route   GET /api/v1/bookings/:id/reorder-data
 * @access  Private (Customer)
 */
export const getReorderData = async (req, res, next) => {
  try {
    const customerId = req.user.id || req.user._id;
    const { id } = req.params;

    const oldBooking = await Booking.findById(id)
      .populate('serviceId')
      .populate('vendorId');

    if (!oldBooking) {
      return res.status(404).json({
        success: false,
        message: 'Original booking not found.',
      });
    }

    if (oldBooking.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only reorder your own cancelled bookings.',
      });
    }

    if (oldBooking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reorder is only available for cancelled bookings.',
      });
    }

    // Server-enforced 24-hour expiry check
    const now = new Date();
    const expiryTime = oldBooking.reorderAvailableUntil
      ? new Date(oldBooking.reorderAvailableUntil)
      : new Date(new Date(oldBooking.cancelledAt || oldBooking.updatedAt).getTime() + 24 * 60 * 60 * 1000);

    if (now > expiryTime) {
      return res.status(400).json({
        success: false,
        message: 'Reorder window has expired (24 hours elapsed from cancellation).',
        isExpired: true,
        reorderStatus: 'reorder_expired',
      });
    }

    // Re-fetch service from database to check current active status & pricing
    const service = await Service.findById(oldBooking.serviceId?._id || oldBooking.serviceId);
    if (!service || service.isActive === false) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: 'This service is currently unavailable.',
        findSimilarQuery: {
          category: oldBooking.serviceId?.category || 'home',
          subCategory: oldBooking.serviceId?.subCategory || '',
          city: oldBooking.serviceId?.city || '',
        },
      });
    }

    // Re-fetch vendor from database to check active status & vacation mode
    const vendor = await Vendor.findById(service.vendorId || service.vendor);
    if (!vendor || vendor.isActive === false || vendor.vacationMode === true) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        message: 'The original vendor is currently unavailable.',
        findSimilarQuery: {
          category: service.category,
          subCategory: service.subCategory,
          city: service.city,
        },
      });
    }

    // Re-calculate fresh package price
    let currentBaseAmount = Number(service.price || 0);
    if (oldBooking.packageSelected && Array.isArray(service.packages) && service.packages.length > 0) {
      const pkg = service.packages.find((p) => p.name?.toLowerCase() === oldBooking.packageSelected.toLowerCase());
      if (pkg) currentBaseAmount = Number(pkg.price);
    }

    const currentTaxes = Math.round(currentBaseAmount * 0.18);
    const currentTotalAmount = currentBaseAmount + currentTaxes;

    return res.status(200).json({
      success: true,
      isAvailable: true,
      reorderStatus: 'reorder_available',
      data: {
        oldBookingId: oldBooking._id,
        serviceId: service._id,
        serviceTitle: service.title,
        category: service.category,
        subCategory: service.subCategory,
        vendorId: vendor._id,
        vendorName: vendor.businessName,
        packageSelected: oldBooking.packageSelected,
        eventDetails: oldBooking.eventDetails,
        currentPricing: {
          baseAmount: currentBaseAmount,
          taxes: currentTaxes,
          discount: 0,
          totalAmount: currentTotalAmount,
        },
        reorderAvailableUntil: expiryTime,
      },
    });
  } catch (error) {
    logger.error(`Error fetching reorder data [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Admin / System processes and confirms refund
 * @route   PUT /api/v1/bookings/:id/process-refund
 * @access  Private (Admin)
 */
export const processRefund = async (req, res, next) => {
  try {
    const { id } = req.params;

    let booking = await Booking.findById(id);
    let cancellation = null;

    if (!booking) {
      cancellation = await Cancellation.findById(id).populate('booking');
      if (cancellation && cancellation.booking) {
        booking = cancellation.booking;
      }
    } else {
      cancellation = await Cancellation.findOne({ booking: booking._id });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking or Cancellation record not found.',
      });
    }

    booking.refundStatus = 'refunded';
    booking.paymentStatus = 'refunded';
    booking.timeline.push({
      status: 'refunded',
      message: 'Refund successfully processed and confirmed by system.',
      timestamp: new Date(),
    });

    await booking.save();

    if (cancellation) {
      cancellation.refundStatus = 'processed';
      cancellation.processedAt = new Date();
      await cancellation.save();
    }

    // Update Payment model if exists
    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, { status: 'refunded' }).catch(() => {});
    }

    // Customer Notification
    await Notification.create({
      userId: booking.customerId,
      title: 'Refund Completed',
      message: `Refund of ₹${booking.pricing?.totalAmount || 0} for Booking #${booking.bookingNumber} has been successfully processed.`,
      type: 'refund_completed',
      link: `/booking/${booking._id}`,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Refund confirmed and processed successfully.',
      data: booking,
    });
  } catch (error) {
    logger.error(`Error processing refund [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Generate authoritative invoice data for paid booking
 * @route   GET /api/v1/bookings/:id/invoice
 * @access  Private (Customer, Vendor, Admin)
 */
export const downloadInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('customerId', 'name email phone')
      .populate('vendorId', 'businessName category location phone')
      .populate('serviceId', 'title category subCategory price priceUnit images');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const userId = (req.user.id || req.user._id).toString();
    const isCustomer = booking.customerId?._id?.toString() === userId || booking.customerId?.toString() === userId;
    const isVendor = booking.vendorId && (booking.vendorId.userId?.toString() === userId || booking.vendorId.user?.toString() === userId);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to download this invoice.',
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is only available for paid bookings.',
      });
    }

    if (!booking.invoiceNumber) {
      booking.invoiceNumber = `INV-2026-${booking._id.toString().slice(-6).toUpperCase()}`;
      await booking.save();
    }

    const invoiceData = {
      brand: 'MDSAIPS',
      systemName: 'Multi-Domain Service Aggregation & Intelligent Planning System',
      invoiceNumber: booking.invoiceNumber,
      bookingNumber: booking.bookingNumber,
      bookingId: booking._id,
      invoiceDate: booking.updatedAt || booking.createdAt,
      serviceDate: booking.eventDate,
      customer: {
        name: booking.customerId?.name || 'Customer',
        email: booking.customerId?.email || 'N/A',
        phone: booking.customerId?.phone || 'N/A',
      },
      vendor: {
        businessName: booking.vendorId?.businessName || 'Service Provider',
        category: booking.vendorId?.category || 'N/A',
        city: booking.vendorId?.location?.city || 'N/A',
        phone: booking.vendorId?.phone || 'N/A',
      },
      service: {
        title: booking.serviceId?.title || 'Service Listing',
        category: booking.serviceId?.category || 'N/A',
        subCategory: booking.serviceId?.subCategory || 'N/A',
        packageSelected: booking.packageSelected || 'Standard',
      },
      pricing: {
        baseAmount: booking.pricing?.baseAmount || 0,
        gstRate: '18%',
        taxes: booking.pricing?.taxes || 0,
        discount: booking.pricing?.discount || 0,
        totalAmount: booking.pricing?.totalAmount || 0,
      },
      payment: {
        paymentId: booking.paymentId || 'PAY-VERIFIED',
        status: booking.paymentStatus,
        currency: 'INR',
      },
    };

    return res.status(200).json({
      success: true,
      data: invoiceData,
    });
  } catch (error) {
    logger.error(`Error generating invoice [${req.params.id}]: ${error.message}`);
    next(error);
  }
};

