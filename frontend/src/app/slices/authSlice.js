import { createSlice } from '@reduxjs/toolkit';

/**
 * Authentication State Redux Slice
 * Manages authenticated user state, JWT tokens, and role permissions.
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
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(token && user);
      state.role = user?.role || null;
      state.loading = false;
      state.error = null;
      if (token) {
        localStorage.setItem('token', token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateUserRole: (state, action) => {
      const newRole = action.payload;
      if (state.user) {
        state.user.role = newRole;
      }
      state.role = newRole;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, logout, updateUserRole, setAuthLoading, setAuthError, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
