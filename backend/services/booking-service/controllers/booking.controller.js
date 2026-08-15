import * as bookingController from '../../../controllers/booking.controller.js';

export const {
  createBooking,
  getMyBookings,
  getBookingById,
  confirmBooking,
  startBooking,
  completeBooking,
  getCustomerBookings,
  getVendorBookings,
  getVendorRequests,
} = bookingController;

export default bookingController;
