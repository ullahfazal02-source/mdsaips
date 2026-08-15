import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

/**
 * Redux Toolkit Slice for Vendor System Management
 */

// Async Thunks
export const fetchVendors = createAsyncThunk(
  'vendor/fetchVendors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/vendors', { params });
      return response.data; // { vendors, pagination }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendors');
    }
  }
);

export const fetchVendorById = createAsyncThunk(
  'vendor/fetchVendorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/vendors/${id}`);
      return response.data; // Vendor object
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor details');
    }
  }
);

export const registerVendor = createAsyncThunk(
  'vendor/registerVendor',
  async (vendorData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/vendors/register', vendorData);
      return response; // { success: true, message: '...', vendor: {...} }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to register vendor profile');
    }
  }
);

export const updateVendor = createAsyncThunk(
  'vendor/updateVendor',
  async ({ id, vendorData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/vendors/${id}`, vendorData);
      return response.data; // Updated vendor object
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update vendor profile');
    }
  }
);

export const fetchAvailability = createAsyncThunk(
  'vendor/fetchAvailability',
  async ({ id, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/vendors/${id}/availability`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch availability');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'vendor/updateAvailability',
  async ({ id, availability }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/vendors/${id}/availability`, { availability });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update availability');
    }
  }
);

export const updateCancellationPolicy = createAsyncThunk(
  'vendor/updateCancellationPolicy',
  async ({ id, policyData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/vendors/${id}/cancellation-policy`, policyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cancellation policy');
    }
  }
);

export const uploadVerificationDocuments = createAsyncThunk(
  'vendor/uploadVerificationDocuments',
  async (documents, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/vendors/verify-documents', { documents });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload verification documents');
    }
  }
);

export const fetchVendorDashboardStats = createAsyncThunk(
  'vendor/fetchVendorDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/vendors/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor stats');
    }
  }
);

export const fetchPendingVendors = createAsyncThunk(
  'vendor/fetchPendingVendors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/vendors/pending', { params });
      return response.data; // { vendors, pagination }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending vendors');
    }
  }
);

export const verifyVendor = createAsyncThunk(
  'vendor/verifyVendor',
  async ({ id, approved, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/admin/vendors/${id}/verify`, { approved, reason });
      return { id, approved, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to verify vendor');
    }
  }
);

const initialState = {
  vendors: [],
  currentVendor: null,
  availability: [],
  dashboardStats: null,
  pendingVendors: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 12, total: 0, pages: 0 },
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    clearVendorError: (state) => {
      state.error = null;
    },
    resetCurrentVendor: (state) => {
      state.currentVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.vendors || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Vendor By ID
      .addCase(fetchVendorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendor = action.payload;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register Vendor
      .addCase(registerVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const vendorObj = action.payload.data?.vendor || action.payload.vendor;
        if (vendorObj) {
          state.currentVendor = vendorObj;
        }
      })
      .addCase(registerVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Dashboard Stats
      .addCase(fetchVendorDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.dashboardStats = action.payload.data || action.payload;
      })
      .addCase(fetchVendorDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Availability
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.availability = action.payload;
      })
      // Pending Vendors (Admin)
      .addCase(fetchPendingVendors.fulfilled, (state, action) => {
        state.pendingVendors = action.payload.vendors || [];
      })
      .addCase(verifyVendor.fulfilled, (state, action) => {
        state.pendingVendors = state.pendingVendors.filter((v) => v._id !== action.payload.id);
      });
  },
});

export const { clearVendorError, resetCurrentVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
