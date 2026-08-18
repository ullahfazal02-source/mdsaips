import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/wishlist');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist');
    }
  }
);

export const fetchWishlistCount = createAsyncThunk(
  'wishlist/fetchCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/wishlist/count');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist count');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async ({ serviceId, note = '' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/wishlist/${serviceId}`, { note });
      return { serviceId, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add service to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/${serviceId}`);
      return { serviceId, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove service from wishlist');
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clear',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/wishlist/clear');
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear wishlist');
    }
  }
);

export const updateWishlistNote = createAsyncThunk(
  'wishlist/updateNote',
  async ({ serviceId, note }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/wishlist/${serviceId}/note`, { note });
      return { serviceId, note, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update wishlist note');
    }
  }
);

const initialState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    resetWishlistState: (state) => {
      state.items = [];
      state.count = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.items || [];
        state.count = action.payload.data?.count || state.items.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Count
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload.data?.count ?? state.count;
      })
      // Add to Wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const newCount = action.payload.response.data?.count;
        state.count = newCount !== undefined ? newCount : state.count + 1;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove from Wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const { serviceId } = action.payload;
        state.items = state.items.filter((item) => {
          const sId = item.serviceId?._id || item.serviceId;
          return sId !== serviceId;
        });
        state.count = Math.max(0, state.count - 1);
      })
      // Clear Wishlist
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
        state.count = 0;
      })
      // Update Note
      .addCase(updateWishlistNote.fulfilled, (state, action) => {
        const { serviceId, note } = action.payload;
        const target = state.items.find((item) => {
          const sId = item.serviceId?._id || item.serviceId;
          return sId === serviceId;
        });
        if (target) {
          target.note = note;
        }
      });
  },
});

export const { clearWishlistError, resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
