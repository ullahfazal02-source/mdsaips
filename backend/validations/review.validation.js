import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createReviewSchema = Joi.object({
  bookingId: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid bookingId ObjectId format',
    'any.required': 'bookingId is required',
  }),
  serviceId: Joi.string().regex(objectIdPattern).optional().allow('', null).messages({
    'string.pattern.base': 'Invalid serviceId ObjectId format',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
  title: Joi.string().trim().max(150).allow('', null).optional(),
  comment: Joi.string().trim().max(2000).allow('', null).optional(),
  images: Joi.array().items(Joi.string().trim().uri()).optional(),
  tags: Joi.array()
    .items(Joi.string().valid('on_time', 'professional', 'good_value', 'great_quality', 'would_recommend'))
    .optional(),
});

export const vendorReplySchema = Joi.object({
  message: Joi.string().trim().min(2).max(1000).optional(),
  comment: Joi.string().trim().min(2).max(1000).optional(),
}).or('message', 'comment');

export const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid('recent', 'highest', 'lowest', 'helpful').default('recent'),
});
