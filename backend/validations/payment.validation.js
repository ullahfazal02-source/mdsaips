import Joi from 'joi';

// Custom ObjectId Validator
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createOrderSchema = Joi.object({
  bookingId: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid bookingId ObjectId format',
    'any.required': 'bookingId is required to create payment order',
  }),
});

export const verifyPaymentSchema = Joi.object({
  bookingId: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid bookingId ObjectId format',
    'any.required': 'bookingId is required',
  }),
  razorpay_order_id: Joi.string().trim().required().messages({
    'any.required': 'razorpay_order_id is required for verification',
  }),
  razorpay_payment_id: Joi.string().trim().required().messages({
    'any.required': 'razorpay_payment_id is required for verification',
  }),
  razorpay_signature: Joi.string().trim().required().messages({
    'any.required': 'razorpay_signature is required for verification',
  }),
});

export const paymentFailureSchema = Joi.object({
  bookingId: Joi.string().regex(objectIdPattern).required(),
  razorpay_order_id: Joi.string().trim().optional(),
  error: Joi.object().optional(),
});
