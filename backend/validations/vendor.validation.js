import Joi from 'joi';

/**
 * Joi Validation Schemas for Vendor System
 */

export const registerVendorSchema = Joi.object({
  businessName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Business name is required.',
    'string.min': 'Business name must be at least 2 characters long.',
  }),
  description: Joi.string().trim().max(2000).allow('').optional(),
  category: Joi.string()
    .valid('event', 'construction', 'home', 'accommodation')
    .required()
    .messages({
      'any.only': 'Category must be one of: event, construction, home, accommodation.',
      'string.empty': 'Category is required.',
    }),
  subCategory: Joi.string().trim().allow('').optional(),
  servicesOffered: Joi.array().items(Joi.string().trim()).optional(),
  pricing: Joi.object({
    basePrice: Joi.number().min(0).required().messages({
      'number.min': 'Base price must be a non-negative number.',
      'any.required': 'Base price is required.',
    }),
    priceUnit: Joi.string().trim().default('per_event'),
    currency: Joi.string().trim().default('INR'),
  }).required(),
  location: Joi.object({
    city: Joi.string().trim().required().messages({
      'string.empty': 'City is required in location.',
    }),
    state: Joi.string().trim().allow('').optional(),
    pincode: Joi.string().trim().allow('').optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).required(),
});

export const updateVendorSchema = Joi.object({
  businessName: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(2000).allow('').optional(),
  subCategory: Joi.string().trim().allow('').optional(),
  servicesOffered: Joi.array().items(Joi.string().trim()).optional(),
  pricing: Joi.object({
    basePrice: Joi.number().min(0).optional(),
    priceUnit: Joi.string().trim().optional(),
    currency: Joi.string().trim().optional(),
  }).optional(),
  location: Joi.object({
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().allow('').optional(),
    pincode: Joi.string().trim().allow('').optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).optional(),
  portfolio: Joi.array().items(Joi.string().uri().trim()).optional(),
}).min(1);

export const updateAvailabilitySchema = Joi.object({
  availability: Joi.array()
    .items(
      Joi.object({
        date: Joi.string()
          .pattern(/^\d{4}-\d{2}-\d{2}$/)
          .required()
          .messages({
            'string.pattern.base': 'Date must be in YYYY-MM-DD format.',
          }),
        isAvailable: Joi.boolean().required(),
        slots: Joi.array().items(Joi.string().trim()).optional(),
      })
    )
    .required()
    .custom((value, helpers) => {
      const dates = value.map((item) => item.date);
      const uniqueDates = new Set(dates);
      if (uniqueDates.size !== dates.length) {
        return helpers.error('array.unique', { message: 'Duplicate dates are not allowed in availability.' });
      }
      return value;
    }),
});

export const updateCancellationPolicySchema = Joi.object({
  type: Joi.string().valid('flexible', 'moderate', 'strict').required(),
  rules: Joi.array()
    .items(
      Joi.object({
        hoursBeforeEvent: Joi.number().min(0).required().messages({
          'number.min': 'hoursBeforeEvent must be greater than or equal to 0.',
        }),
        refundPercentage: Joi.number().min(0).max(100).required().messages({
          'number.min': 'refundPercentage must be between 0 and 100.',
          'number.max': 'refundPercentage must be between 0 and 100.',
        }),
      })
    )
    .required(),
});

export const verifyDocumentsSchema = Joi.object({
  documents: Joi.array()
    .items(Joi.string().uri().trim().required())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one document URL is required.',
      'string.uri': 'Document must be a valid URL.',
    }),
});

export const verifyVendorSchema = Joi.object({
  approved: Joi.boolean().required(),
  reason: Joi.string().trim().allow('').optional(),
});
