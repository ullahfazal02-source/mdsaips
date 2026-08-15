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
  packageSelected: Joi.string()
    .valid('basic', 'standard', 'premium')
    .optional()
    .allow('', null),
  eventDate: Joi.date().iso().optional().allow('', null),
  notes: Joi.string().optional().allow('', null).max(1000).trim(),

  // Flexible / Domain-Specific Booking Details Object
  eventDetails: Joi.object({
    // --- EVENT DOMAIN ---
    eventType: Joi.string().optional().allow('', null).trim(),
    guestCount: Joi.number().integer().min(1).optional(),
    venue: Joi.string().optional().allow('', null).trim(),
    address: Joi.string().optional().allow('', null).trim(),

    // --- CONSTRUCTION DOMAIN ---
    projectType: Joi.string().optional().allow('', null).trim(),
    propertyType: Joi.string().optional().allow('', null).trim(),
    area: Joi.number().min(0).optional(),
    unit: Joi.string().optional().allow('', null).trim(),
    projectLocation: Joi.string().optional().allow('', null).trim(),
    estimatedBudget: Joi.number().min(0).optional(),
    preferredStartDate: Joi.date().iso().optional().allow('', null),
    projectDescription: Joi.string().optional().allow('', null).trim(),

    // --- HOME SERVICES DOMAIN ---
    serviceType: Joi.string().optional().allow('', null).trim(),
    problemDescription: Joi.string().optional().allow('', null).trim(),
    preferredDate: Joi.date().iso().optional().allow('', null),
    preferredTime: Joi.string().optional().allow('', null).trim(),
    serviceAddress: Joi.string().optional().allow('', null).trim(),
    urgency: Joi.string().optional().allow('', null).trim(),

    // --- ACCOMMODATION DOMAIN ---
    checkInDate: Joi.date().iso().optional().allow('', null),
    checkOutDate: Joi.date().iso().optional().allow('', null),
    guests: Joi.number().integer().min(1).optional(),
    rooms: Joi.number().integer().min(1).optional(),
    guestDetails: Joi.string().optional().allow('', null).trim(),
    specialRequests: Joi.string().optional().allow('', null).trim(),

    // --- COMMON OPTIONAL ---
    specialRequirements: Joi.string().optional().allow('', null).trim(),
  }).required().messages({
    'any.required': 'Booking details are required',
  }),
});

/**
 * Joi Schema for Querying / Filtering Bookings
 */
export const getBookingsQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
