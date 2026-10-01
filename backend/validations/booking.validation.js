import Joi from 'joi';

const objectIdValidator = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid MongoDB ObjectId');
  }
  return value;
};

/**
 * Joi Schema for Create Booking Request
 * Supports Event, Construction, Home, and Accommodation domains dynamically.
 */
export const createBookingSchema = Joi.object({
  serviceId: Joi.string().custom(objectIdValidator).required().messages({
    'any.required': 'Service ID is required',
    'string.empty': 'Service ID cannot be empty',
  }),
  packageSelected: Joi.string().optional().allow('', null).trim(),
  eventDate: Joi.alternatives().try(Joi.date(), Joi.string().allow('', null)).optional(),
  notes: Joi.string().optional().allow('', null).max(1000).trim(),

  offerId: Joi.string().custom(objectIdValidator).optional().allow('', null),
  offerCode: Joi.string().optional().allow('', null).trim(),
  customerLat: Joi.number().optional().allow(null, ''),
  customerLng: Joi.number().optional().allow(null, ''),
  city: Joi.string().optional().allow('', null).trim(),

  // Flexible / Domain-Specific Booking Details Object
  eventDetails: Joi.object({
    // --- EVENT DOMAIN ---
    eventType: Joi.string().optional().allow('', null).trim(),
    guestCount: Joi.number().integer().min(1).optional().allow(null, ''),
    venue: Joi.string().optional().allow('', null).trim(),
    address: Joi.string().optional().allow('', null).trim(),

    // --- CONSTRUCTION DOMAIN ---
    projectType: Joi.string().optional().allow('', null).trim(),
    propertyType: Joi.string().optional().allow('', null).trim(),
    area: Joi.number().min(0).optional().allow(null, ''),
    unit: Joi.string().optional().allow('', null).trim(),
    projectLocation: Joi.string().optional().allow('', null).trim(),
    estimatedBudget: Joi.number().min(0).optional().allow(null, ''),
    preferredStartDate: Joi.alternatives().try(Joi.date(), Joi.string().allow('', null)).optional(),
    projectDescription: Joi.string().optional().allow('', null).trim(),

    // --- HOME SERVICES DOMAIN ---
    serviceType: Joi.string().optional().allow('', null).trim(),
    problemDescription: Joi.string().optional().allow('', null).trim(),
    preferredDate: Joi.alternatives().try(Joi.date(), Joi.string().allow('', null)).optional(),
    preferredTime: Joi.string().optional().allow('', null).trim(),
    serviceAddress: Joi.string().optional().allow('', null).trim(),
    urgency: Joi.string().optional().allow('', null).trim(),

    // --- ACCOMMODATION DOMAIN ---
    checkInDate: Joi.alternatives().try(Joi.date(), Joi.string().allow('', null)).optional(),
    checkOutDate: Joi.alternatives().try(Joi.date(), Joi.string().allow('', null)).optional(),
    guests: Joi.number().integer().min(1).optional().allow(null, ''),
    rooms: Joi.number().integer().min(1).optional().allow(null, ''),
    guestDetails: Joi.string().optional().allow('', null).trim(),
    specialRequests: Joi.string().optional().allow('', null).trim(),

    // --- COMMON OPTIONAL ---
    notes: Joi.string().optional().allow('', null).max(1000).trim(),
    specialRequirements: Joi.string().optional().allow('', null).trim(),
  }).unknown(true).optional().default({}),
}).unknown(true);

/**
 * Joi Schema for Querying / Filtering Bookings
 */
export const getBookingsQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
