/**
 * Master Models Barrel Export Module
 * 
 * Aggregates all 12 MDSAIPS Mongoose schemas for unified import across backend services.
 */

export { default as User } from './User.js';
export { default as OTP } from './OTP.js';
export { default as Vendor } from './Vendor.js';
export { default as Service } from './Service.js';
export { default as Booking } from './Booking.js';
export { default as Payment } from './Payment.js';
export { default as Requirement } from './Requirement.js';
export { default as Bid } from './Bid.js';
export { default as Review } from './Review.js';
export { default as Wishlist } from './Wishlist.js';
export { default as Cancellation } from './Cancellation.js';
export { default as Plan } from './Plan.js';
export { default as Chat } from './Chat.js';
export { default as Offer } from './Offer.js';
export { default as AnalyticsEvent } from './AnalyticsEvent.js';
export { default as Notification } from './Notification.js';

