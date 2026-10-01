import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// --------------- New Thunks ---------------

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel booking');
    }
  }
);

export const fetchCancelledBookings = createAsyncThunk(
  'booking/fetchCancelledBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/bookings/customer/cancelled', { params });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cancelled bookings');
    }
  }
);

export const fetchReorderData = createAsyncThunk(
  'booking/fetchReorderData',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}/reorder-data`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reorder data');
    }
  }
);

export const fetchInvoice = createAsyncThunk(
  'booking/fetchInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}/invoice`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate invoice');
    }
  }
);

export const processRefund = createAsyncThunk(
  'booking/processRefund',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}/process-refund`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process refund');
    }
  }
);

/**
 * Redux Toolkit Slice for Booking System
 */

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/bookings', bookingData);
      return response; // { success: true, message: '...', data: booking }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create booking request');
    }
  }
);

export const fetchBookings = createAsyncThunk(
  'booking/fetchBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/bookings', { params });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      return response; // { success: true, data: booking }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch booking details');
    }
  }
);

export const fetchCustomerBookings = createAsyncThunk(
  'booking/fetchCustomerBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/bookings/customer/all', { params });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customer bookings');
    }
  }
);

export const fetchVendorBookings = createAsyncThunk(
  'booking/fetchVendorBookings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/bookings/vendor/all', { params });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor bookings');
    }
  }
);

export const fetchVendorRequests = createAsyncThunk(
  'booking/fetchVendorRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/bookings/vendor/requests', { params });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor requests');
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'booking/confirmBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}/confirm`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to confirm booking');
    }
  }
);

export const startBooking = createAsyncThunk(
  'booking/startBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}/start`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start booking');
    }
  }
);

export const completeBooking = createAsyncThunk(
  'booking/completeBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}/complete`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to complete booking');
    }
  }
);

export const rejectBooking = createAsyncThunk(
  'booking/rejectBooking',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/bookings/${id}/reject`, { reason });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reject booking request');
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  customerBookings: [],
  cancelledBookings: [],
  vendorBookings: [],
  vendorRequests: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 1 },
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    resetCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.customerBookings.unshift(action.payload.data);
          state.currentBooking = action.payload.data;
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Customer Bookings
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.customerBookings = action.payload?.data || [];
        state.pagination = {
          page: action.payload?.page || 1,
          limit: 10,
          total: action.payload?.total || 0,
          pages: action.payload?.pages || 1,
        };
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Bookings (General customer list)
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload?.data || [];
        state.customerBookings = action.payload?.data || [];
        state.pagination = {
          page: action.payload?.page || 1,
          limit: 10,
          total: action.payload?.total || 0,
          pages: action.payload?.pages || 1,
        };
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Booking By ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload?.data || null;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Vendor Requests
      .addCase(fetchVendorRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorRequests = action.payload?.data || [];
      })
      .addCase(fetchVendorRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Vendor Bookings
      .addCase(fetchVendorBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorBookings = action.payload?.data || [];
      })
      .addCase(fetchVendorBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm Booking
      .addCase(confirmBooking.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          state.vendorRequests = state.vendorRequests.filter((r) => r._id !== updated._id);
          state.vendorBookings = state.vendorBookings.map((b) => (b._id === updated._id ? updated : b));
          if (state.currentBooking?._id === updated._id) {
            state.currentBooking = updated;
          }
        }
      })
      // Start Booking
      .addCase(startBooking.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          state.vendorBookings = state.vendorBookings.map((b) => (b._id === updated._id ? updated : b));
          if (state.currentBooking?._id === updated._id) {
            state.currentBooking = updated;
          }
        }
      })
      // Complete Booking
      .addCase(completeBooking.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          state.vendorBookings = state.vendorBookings.map((b) => (b._id === updated._id ? updated : b));
          if (state.currentBooking?._id === updated._id) {
            state.currentBooking = updated;
          }
        }
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data;
        if (updated) {
          state.customerBookings = state.customerBookings.map((b) =>
            b._id === updated._id ? updated : b
          );
          if (state.currentBooking?._id === updated._id) {
            state.currentBooking = updated;
          }
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Cancelled Bookings
      .addCase(fetchCancelledBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCancelledBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.cancelledBookings = action.payload?.data || [];
      })
      .addCase(fetchCancelledBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingError, resetCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
