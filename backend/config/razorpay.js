import Razorpay from 'razorpay';
import logger from '../utils/logger.js';

/**
 * Razorpay Test Mode Client Configuration
 * 
 * Safe initialization using environment variables.
 * Exposes keyId and secret verification methods.
 */
export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID || '';
export const getRazorpayKeySecret = () => process.env.RAZORPAY_KEY_SECRET || '';

export const isRazorpayConfigured = () => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  return Boolean(keyId && keySecret && keyId !== '' && keySecret !== '');
};

export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing in environment configuration.');
  }

  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  });
};

export default getRazorpayInstance;
