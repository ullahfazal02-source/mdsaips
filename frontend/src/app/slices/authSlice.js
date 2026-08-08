import { createSlice } from '@reduxjs/toolkit';

/**
 * Authentication State Slice Placeholder
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  role: null, // 'customer', 'vendor', 'admin'
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.role = action.payload.user?.role || 'customer';
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
