import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

/**
 * Redux Toolkit Slice for Service Listings System
 */

// Async Thunks
export const fetchServices = createAsyncThunk(
  'service/fetchServices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/services', { params });
      return response.data; // { services, pagination }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch service listings');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'service/fetchServiceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/services/${id}`);
      return response.data; // Service object
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch service details');
    }
  }
);

export const fetchMyServices = createAsyncThunk(
  'service/fetchMyServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/services/my-services');
      return response.data; // Array of vendor's services
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor services');
    }
  }
);

export const createService = createAsyncThunk(
  'service/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/services', serviceData);
      return response; // { success: true, message: '...', service: {...} }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create service listing');
    }
  }
);

export const updateService = createAsyncThunk(
  'service/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update service listing');
    }
  }
);

export const toggleServiceStatus = createAsyncThunk(
  'service/toggleServiceStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/services/${id}/status`, { isActive });
      return { id, isActive: response.isActive, service: response.service };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to change service status');
    }
  }
);

export const deleteService = createAsyncThunk(
  'service/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/services/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete service listing');
    }
  }
);

const initialState = {
  services: [],
  currentService: null,
  myServices: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 12, total: 0, pages: 0 },
};

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    clearServiceError: (state) => {
      state.error = null;
    },
    resetCurrentService: (state) => {
      state.currentService = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.services || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Service by ID
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Services
      .addCase(fetchMyServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyServices.fulfilled, (state, action) => {
        state.loading = false;
        state.myServices = action.payload || [];
      })
      .addCase(fetchMyServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Service
      .addCase(createService.fulfilled, (state, action) => {
        if (action.payload.service) {
          state.myServices.unshift(action.payload.service);
        }
      })
      // Update Service
      .addCase(updateService.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          state.myServices = state.myServices.map((s) => (s._id === updated._id ? updated : s));
          if (state.currentService?._id === updated._id) {
            state.currentService = updated;
          }
        }
      })
      // Toggle Status
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        const { id, isActive } = action.payload;
        state.myServices = state.myServices.map((s) => (s._id === id ? { ...s, isActive } : s));
      })
      // Delete Service
      .addCase(deleteService.fulfilled, (state, action) => {
        const id = action.payload;
        state.myServices = state.myServices.filter((s) => s._id !== id);
        state.services = state.services.filter((s) => s._id !== id);
      });
  },
});

export const { clearServiceError, resetCurrentService } = serviceSlice.actions;
export default serviceSlice.reducer;
