import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async Thunks
export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/create-order', { bookingId });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create payment order');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/verify', paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Payment verification failed');
    }
  }
);

export const reportPaymentFailure = createAsyncThunk(
  'payment/failure',
  async (failureData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payments/failure', failureData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to report payment failure');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payments/history', { params });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch payment history');
    }
  }
);

export const fetchPaymentByBooking = createAsyncThunk(
  'payment/fetchByBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/payments/${bookingId}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch payment details');
    }
  }
);

const initialState = {
  payments: [],
  currentPayment: null,
  activeOrder: null,
  loading: false,
  processingPayment: false,
  error: null,
  pagination: {},
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearActiveOrder: (state) => {
      state.activeOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.processingPayment = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.processingPayment = false;
        state.activeOrder = action.payload.data;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.processingPayment = false;
        state.error = action.payload;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.processingPayment = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.processingPayment = false;
        state.currentPayment = action.payload.data;
        state.activeOrder = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.processingPayment = false;
        state.error = action.payload;
      })
      // Report Payment Failure
      .addCase(reportPaymentFailure.fulfilled, (state) => {
        state.processingPayment = false;
        state.activeOrder = null;
      })
      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data || [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Payment by Booking
      .addCase(fetchPaymentByBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentByBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.data;
      })
      .addCase(fetchPaymentByBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearActiveOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
