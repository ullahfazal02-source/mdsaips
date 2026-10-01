import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBooking as createBookingThunk,
  fetchBookings as fetchBookingsThunk,
  fetchBookingById as fetchBookingByIdThunk,
  fetchCustomerBookings as fetchCustomerBookingsThunk,
  fetchVendorBookings as fetchVendorBookingsThunk,
  fetchVendorRequests as fetchVendorRequestsThunk,
  confirmBooking as confirmBookingThunk,
  startBooking as startBookingThunk,
  completeBooking as completeBookingThunk,
  rejectBooking as rejectBookingThunk,
  cancelBooking as cancelBookingThunk,
  fetchCancelledBookings as fetchCancelledBookingsThunk,
  fetchReorderData as fetchReorderDataThunk,
  fetchInvoice as fetchInvoiceThunk,
  processRefund as processRefundThunk,
  clearBookingError,
  resetCurrentBooking,
} from '../app/slices/bookingSlice';

/**
 * Custom React Hook for Booking Actions & State Management
 */
export const useBooking = () => {
  const dispatch = useDispatch();

  const {
    bookings,
    currentBooking,
    customerBookings,
    cancelledBookings,
    vendorBookings,
    vendorRequests,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.booking);

  const createBooking = useCallback(
    async (bookingData) => {
      const result = await dispatch(createBookingThunk(bookingData));
      if (createBookingThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const fetchBookings = useCallback(
    async (params = {}) => {
      const result = await dispatch(fetchBookingsThunk(params));
      return result;
    },
    [dispatch]
  );

  const fetchBooking = useCallback(
    async (id) => {
      const result = await dispatch(fetchBookingByIdThunk(id));
      if (fetchBookingByIdThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const fetchCustomerBookings = useCallback(
    async (params = {}) => {
      const result = await dispatch(fetchCustomerBookingsThunk(params));
      return result;
    },
    [dispatch]
  );

  const fetchVendorBookings = useCallback(
    async (params = {}) => {
      const result = await dispatch(fetchVendorBookingsThunk(params));
      return result;
    },
    [dispatch]
  );

  const fetchVendorRequests = useCallback(
    async (params = {}) => {
      const result = await dispatch(fetchVendorRequestsThunk(params));
      return result;
    },
    [dispatch]
  );

  const confirmBooking = useCallback(
    async (id) => {
      const result = await dispatch(confirmBookingThunk(id));
      if (confirmBookingThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const startBooking = useCallback(
    async (id) => {
      const result = await dispatch(startBookingThunk(id));
      if (startBookingThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const completeBooking = useCallback(
    async (id) => {
      const result = await dispatch(completeBookingThunk(id));
      if (completeBookingThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const rejectBooking = useCallback(
    async (id, reason) => {
      const result = await dispatch(rejectBookingThunk({ id, reason }));
      if (rejectBookingThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const cancelBooking = useCallback(
    async (id, reason) => {
      const result = await dispatch(cancelBookingThunk({ id, reason }));
      if (cancelBookingThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const fetchCancelledBookings = useCallback(
    async (params = {}) => {
      const result = await dispatch(fetchCancelledBookingsThunk(params));
      if (fetchCancelledBookingsThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const getReorderData = useCallback(
    async (id) => {
      const result = await dispatch(fetchReorderDataThunk(id));
      if (fetchReorderDataThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const downloadInvoice = useCallback(
    async (id) => {
      const result = await dispatch(fetchInvoiceThunk(id));
      if (fetchInvoiceThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const processRefund = useCallback(
    async (id) => {
      const result = await dispatch(processRefundThunk(id));
      if (processRefundThunk.fulfilled.match(result)) {
        return { success: true, data: result.payload?.data };
      }
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearBookingError());
  }, [dispatch]);

  const resetBooking = useCallback(() => {
    dispatch(resetCurrentBooking());
  }, [dispatch]);

  return {
    bookings,
    currentBooking,
    customerBookings,
    cancelledBookings,
    vendorBookings,
    vendorRequests,
    loading,
    error,
    pagination,
    createBooking,
    fetchBookings,
    fetchBooking,
    fetchCustomerBookings,
    fetchVendorBookings,
    fetchVendorRequests,
    confirmBooking,
    rejectBooking,
    startBooking,
    completeBooking,
    cancelBooking,
    fetchCancelledBookings,
    getReorderData,
    downloadInvoice,
    processRefund,
    clearError,
    resetBooking,
  };
};

export default useBooking;
