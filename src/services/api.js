import axios from 'axios';

// Create API instance with environment-aware baseURL
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? '/api' // Relative path in production
    : 'https://b3cf-2603-6013-b3f0-6a0-1d2f-1fbe-471f-240b.ngrok-free.app/api',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

// Enhanced request interceptor
API.interceptors.request.use((config) => {
  // Token handling with fallback
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Device detection
  config.headers['X-Device-Type'] = /Mobi|Android/i.test(navigator.userAgent)
    ? 'mobile'
    : 'desktop';

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Enhanced response interceptor
API.interceptors.response.use(
  (response) => {
    // Validate response format
    if (typeof response.data === 'string' && response.data.startsWith('<!DOCTYPE html>')) {
      throw new Error('Invalid API response - received HTML');
    }
    return response;
  },
  async (error) => {
    // Original request config
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken') ||
        sessionStorage.getItem('refreshToken');

      if (!refreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API.defaults.baseURL}/refresh-token`, { refreshToken });
        storeToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    // Network error handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please check your connection';
    } else if (!error.response) {
      error.message = 'Network error - unable to reach server';
    }

    return Promise.reject(error);
  }
);

// Helper functions
function storeToken(token) {
  try {
    localStorage.setItem('token', token);
  } catch (e) {
    sessionStorage.setItem('token', token);
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.location.href = '/login';
}

export default API;
