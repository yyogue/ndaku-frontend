import axios from 'axios';

// Create API instance with fixed baseURL
const API = axios.create({
  baseURL: 'http://192.168.1.208:5001/api',
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Try to get token from session storage as fallback for mobile
  const sessionToken = !token ? sessionStorage.getItem('token') : null;
  
  if (token || sessionToken) {
    config.headers.Authorization = `Bearer ${token || sessionToken}`;
  }
  
  // Add device detection for mobile-specific handling
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  config.headers['X-Device-Type'] = isMobile ? 'mobile' : 'desktop';
  
  return config;
}, (error) => {
  // Don't transform request errors into connection issues
  return Promise.reject(error);
});

// Improved interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // For debugging purposes
    console.log('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      console.log('Token expired or invalid. Trying to refresh token...');
      
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.log('No refresh token found. Redirecting to login.');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        // Send refresh token to backend to get a new access token
        const response = await axios.post('http://localhost:5001/api/refresh-token', { refreshToken });
        const newAccessToken = response.data.accessToken;
        
        // Store the new access token
        try {
          localStorage.setItem('token', newAccessToken);
        } catch (e) {
          // If localStorage fails (which can happen on some mobile browsers), use sessionStorage
          sessionStorage.setItem('token', newAccessToken);
        }
        
        // Retry the failed request with the new access token
        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return Promise.reject(refreshError);
      }
    }
    
    // Only report connection issues if it's actually a network error
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your internet connection.';
    }
    else if (!error.response && error.request) {
      // The request was made but no response was received
      // Don't overwrite specific error messages with generic ones
      console.log('No response received from server');
    }
    
    return Promise.reject(error);
  }
);

export default API;
