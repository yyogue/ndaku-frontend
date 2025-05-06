import API from '../../services/api';
import { loginSuccess, logout } from '../slices/authSlice';

export const loginUser = (credentials) => async (dispatch) => {
  try {
    // Add detection for mobile devices to adjust login behavior
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    const response = await API.post('/users/login', credentials, {
      headers: {
        'X-Device-Type': isMobile ? 'mobile' : 'desktop'
      }
    });
    
    // Handle both regular token and refresh token if provided by API
    const payload = { 
      user: response.data.user, 
      token: response.data.token 
    };
    
    // Add refresh token if available in the response
    if (response.data.refreshToken) {
      payload.refreshToken = response.data.refreshToken;
    }
    
    dispatch(loginSuccess(payload));
    return response.data;
  } catch (error) {
    // Log the specific error for debugging
    console.error('Login failed:', error);
    
    // Don't transform the error, just pass it through
    throw error;
  }
};

export const logoutUser = () => (dispatch) => {
  try {
    // Attempt to call logout API if the server is accessible
    API.post('/users/logout').catch(err => {
      // Silently handle logout API errors - just log them
      console.log('Logout API error:', err);
    });
  } catch (e) {
    console.log('Error during logout:', e);
  }
  
  // Always dispatch logout action even if API call fails
  dispatch(logout());
};
