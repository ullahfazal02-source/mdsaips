import axios from 'axios';

/**
 * MDSAIPS Axios Gateway Instance Configuration
 * 
 * Sets up base URL, request headers, credentials, and interceptor hooks.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach bearer tokens or headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Note: Token injection will be connected when auth slice is wired
    const token = localStorage.getItem('token');
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
    const formattedError = {
      message: error.response?.data?.message || 'An unexpected network error occurred',
      status: error.response?.status,
    };
    return Promise.reject(formattedError);
  }
);

export default axiosInstance;
