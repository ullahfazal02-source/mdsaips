import Joi from 'joi';

/**
 * Indian 10-digit mobile number regex: starts with 6, 7, 8, or 9 followed by 9 digits.
 * Accepts optional +91 prefix.
 */
const indianPhoneRegex = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

/**
 * Joi Schema for User Registration
 */
export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().trim().pattern(indianPhoneRegex).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please provide a valid 10-digit Indian phone number',
    'any.required': 'Phone number is required',
  }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('customer', 'vendor').default('customer').messages({
    'any.only': 'Public registration is only allowed for customer or vendor roles',
  }),
});

/**
 * Joi Schema for User Login
 */
export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

/**
 * Joi Schema for OTP Verification
 */
export const verifyOtpSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'User ID is required',
    'string.length': 'Invalid User ID format',
    'any.required': 'User ID is required',
  }),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.empty': 'Verification code is required',
    'string.pattern.base': 'Verification code must be exactly 6 digits',
    'any.required': 'Verification code is required',
  }),
  type: Joi.string()
    .valid('email_verify', 'phone_verify', 'password_reset', 'login')
    .default('email_verify')
    .messages({
      'any.only': 'Invalid OTP type',
    }),
});

/**
 * Joi Schema for Resending OTP
 */
export const resendOtpSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'User ID is required',
    'string.length': 'Invalid User ID format',
    'any.required': 'User ID is required',
  }),
  type: Joi.string()
    .valid('email_verify', 'phone_verify', 'password_reset', 'login')
    .default('email_verify')
    .messages({
      'any.only': 'Invalid OTP type',
    }),
});
