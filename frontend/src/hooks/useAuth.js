import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, logout, setAuthLoading, setAuthError, clearAuthError } from '@/app/slices/authSlice';
import { resetWishlistState } from '@/app/slices/wishlistSlice';
import { clearCart } from '@/app/slices/cartSlice';
import axiosInstance from '@/api/axiosInstance';
import toast from 'react-hot-toast';

/**
 * Custom React Hook for MDSAIPS Authentication Operations
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  /**
   * Register User
   */
  const register = async (userData) => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      dispatch(setAuthLoading(false));
      if (response.success) {
        toast.success(response.message || 'Registration successful! Verification code sent to email.');
      }
      return response;
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Registration failed';
      const validationErrors = err.errors || err.response?.data?.errors;
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
      throw { message: errorMessage, errors: validationErrors };
    }
  };

  /**
   * Verify User OTP Code
   */
  const verifyOtp = async ({ userId, otp, type = 'email_verify' }) => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { userId, otp, type });
      dispatch(setAuthLoading(false));

      if (response.success && response.token && response.user) {
        dispatch(setCredentials({ user: response.user, token: response.token }));
        toast.success(response.message || 'Email verified successfully!');
      }
      return response;
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Verification failed';
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
      throw { message: errorMessage };
    }
  };

  /**
   * Resend Verification OTP Code
   */
  const resendOtp = async ({ userId, type = 'email_verify' }) => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const response = await axiosInstance.post('/auth/resend-otp', { userId, type });
      dispatch(setAuthLoading(false));
      if (response.success) {
        toast.success(response.message || 'A new verification code has been sent.');
      }
      return response;
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Failed to resend code';
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
      throw { message: errorMessage };
    }
  };

  /**
   * Login User
   */
  const login = async (credentials) => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      dispatch(setAuthLoading(false));

      if (response.requiresVerification) {
        toast.error(response.message || 'Please verify your email before logging in.');
        return response;
      }

      if (response.success && response.token) {
        dispatch(setCredentials({ user: response.user, token: response.token }));
        toast.success(`Welcome back, ${response.user.name}!`);
      }
      return response;
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Invalid login credentials';
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
      throw { message: errorMessage };
    }
  };

  /**
   * Logout User
   */
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (e) {
      // Proceed with client side cleanup regardless of server response
    } finally {
      dispatch(logout());
      dispatch(resetWishlistState());
      dispatch(clearCart());
      toast.success('Logged out successfully.');
    }
  };

  /**
   * Fetch current authenticated profile
   */
  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      if (response.success && response.user) {
        dispatch(setCredentials({ user: response.user, token: authState.token }));
      }
      return response.user;
    } catch (err) {
      dispatch(logout());
      throw err;
    }
  };

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    role: authState.role,
    loading: authState.loading,
    error: authState.error,
    register,
    verifyOtp,
    resendOtp,
    login,
    logout: handleLogout,
    fetchProfile,
  };
};

export default useAuth;
