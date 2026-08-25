import axios from 'axios';

/**
 * MDSAIPS Axios Gateway Instance Configuration
 * 
 * Sets up base URL, request headers, credentials, and interceptor hooks.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach bearer tokens
axiosInstance.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (!token) {
      try {
        const persistedRoot = localStorage.getItem('persist:mdsaips_root');
        if (persistedRoot) {
          const authData = JSON.parse(JSON.parse(persistedRoot).auth || '{}');
          token = authData.token;
        }
      } catch (e) {
        // Fallthrough if parsing fails
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global response formatting or token expiry
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let msg = error.response?.data?.message || 'An unexpected network error occurred';
    if (Array.isArray(error.response?.data?.errors) && error.response.data.errors.length > 0) {
      msg = `${msg}: ${error.response.data.errors.join(', ')}`;
    }
    const formattedError = {
      message: msg,
      errors: error.response?.data?.errors,
      status: error.response?.status,
    };
    return Promise.reject(formattedError);
  }
);

export default axiosInstance;
