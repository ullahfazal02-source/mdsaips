import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async Thunks
export const submitReview = createAsyncThunk(
  'review/submit',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/reviews', reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit review');
    }
  }
);

export const fetchServiceReviews = createAsyncThunk(
  'review/fetchServiceReviews',
  async ({ serviceId, page = 1, limit = 10, sort = 'recent' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/reviews/service/${serviceId}`, {
        params: { page, limit, sort },
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch service reviews');
    }
  }
);

export const fetchVendorReviews = createAsyncThunk(
  'review/fetchVendorReviews',
  async ({ vendorId, page = 1, limit = 10, sort = 'recent' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/reviews/vendor/${vendorId}`, {
        params: { page, limit, sort },
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor reviews');
    }
  }
);

export const replyToReview = createAsyncThunk(
  'review/reply',
  async ({ reviewId, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/reviews/${reviewId}/reply`, { message });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to post vendor reply');
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  'review/markHelpful',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/reviews/${reviewId}/helpful`);
      return { reviewId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark review helpful');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/reviews/${reviewId}`);
      return { reviewId, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete review');
    }
  }
);

const initialState = {
  reviews: [],
  ratingSummary: null,
  loading: false,
  submitting: false,
  error: null,
  pagination: {},
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
    resetReviewsState: (state) => {
      state.reviews = [];
      state.ratingSummary = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Review
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload?.data) {
          state.reviews.unshift(action.payload.data);
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // Fetch Service Reviews
      .addCase(fetchServiceReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data?.reviews || [];
        state.ratingSummary = action.payload.data?.summary || null;
        state.pagination = action.payload.data?.pagination || {};
      })
      .addCase(fetchServiceReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Vendor Reviews
      .addCase(fetchVendorReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data?.reviews || [];
        state.ratingSummary = action.payload.data?.summary || null;
        state.pagination = action.payload.data?.pagination || {};
      })
      .addCase(fetchVendorReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reply to Review
      .addCase(replyToReview.fulfilled, (state, action) => {
        const updatedReview = action.payload.data;
        if (updatedReview) {
          const index = state.reviews.findIndex((r) => r._id === updatedReview._id);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
        }
      })
      // Mark Review Helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, data } = action.payload;
        const review = state.reviews.find((r) => r._id === reviewId);
        if (review && data?.helpfulCount !== undefined) {
          review.helpfulCount = data.helpfulCount;
        }
      })
      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action) => {
        const { reviewId } = action.payload;
        state.reviews = state.reviews.filter((r) => r._id !== reviewId);
      });
  },
});

export const { clearReviewError, resetReviewsState } = reviewSlice.actions;
export default reviewSlice.reducer;
