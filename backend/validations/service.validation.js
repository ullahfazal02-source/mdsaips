import Joi from 'joi';

/**
 * Joi Validation Schemas for Service Listings System
 */

const packageItemSchema = Joi.object({
  name: Joi.string().valid('basic', 'standard', 'premium').required().messages({
    'any.only': 'Package name must be basic, standard, or premium.',
    'any.required': 'Package name is required.',
  }),
  description: Joi.string().trim().allow('').optional(),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Package price cannot be negative.',
    'any.required': 'Package price is required.',
  }),
  features: Joi.array().items(Joi.string().trim()).optional(),
});

export const createServiceSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().messages({
    'string.empty': 'Service title is required.',
    'string.min': 'Service title must be at least 3 characters long.',
    'string.max': 'Service title cannot exceed 150 characters.',
  }),
  description: Joi.string().trim().min(10).max(3000).required().messages({
    'string.empty': 'Service description is required.',
    'string.min': 'Service description must be at least 10 characters long.',
  }),
  category: Joi.string()
    .valid('event', 'construction', 'home', 'accommodation')
    .required()
    .messages({
      'any.only': 'Category must be one of: event, construction, home, accommodation.',
      'string.empty': 'Category is required.',
    }),
  subCategory: Joi.string().trim().allow('').optional(),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Base price must be a non-negative number.',
    'any.required': 'Base price is required.',
  }),
  priceUnit: Joi.string()
    .valid('per_hour', 'per_day', 'per_event', 'per_person', 'fixed', 'per_sqft')
    .default('per_event'),
  city: Joi.string().trim().required().messages({
    'string.empty': 'City is required.',
  }),
  location: Joi.string().trim().allow('').optional(),
  images: Joi.array().items(Joi.string().uri().trim()).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  packages: Joi.array().items(packageItemSchema).max(3).optional().custom((value, helpers) => {
    if (value && value.length > 0) {
      const names = value.map((p) => p.name);
      if (names.length !== new Set(names).size) {
        return helpers.error('array.unique', { message: 'Duplicate package names are not allowed.' });
      }
    }
    return value;
  }),
});

export const updateServiceSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).optional(),
  description: Joi.string().trim().min(10).max(3000).optional(),
  category: Joi.string().valid('event', 'construction', 'home', 'accommodation').optional(),
  subCategory: Joi.string().trim().allow('').optional(),
  price: Joi.number().min(0).optional(),
  priceUnit: Joi.string()
    .valid('per_hour', 'per_day', 'per_event', 'per_person', 'fixed', 'per_sqft')
    .optional(),
  city: Joi.string().trim().optional(),
  location: Joi.string().trim().allow('').optional(),
  images: Joi.array().items(Joi.string().uri().trim()).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  packages: Joi.array().items(packageItemSchema).max(3).optional().custom((value, helpers) => {
    if (value && value.length > 0) {
      const names = value.map((p) => p.name);
      if (names.length !== new Set(names).size) {
        return helpers.error('array.unique', { message: 'Duplicate package names are not allowed.' });
      }
    }
    return value;
  }),
}).min(1);

export const toggleServiceStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});
