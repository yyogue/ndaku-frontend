import { createSlice } from '@reduxjs/toolkit';

// Use a function to safely retrieve values from storage
const getStorageItem = (key) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
  } catch (e) {
    console.warn('Storage access error:', e);
    return null;
  }
};

// Get initial user from storage if available
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.warn('Error parsing user from storage:', e);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: getStorageItem('token'),
  refreshToken: getStorageItem('refreshToken'),
  isAuthenticated: !!getStorageItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Handle refresh token if provided
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      
      // Mobile-friendly storage with fallbacks
      try {
        localStorage.setItem('token', action.payload.token);
        
        // Store user data
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
        
        // Store refresh token if available
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      } catch (e) {
        console.warn('LocalStorage not available, using sessionStorage');
        sessionStorage.setItem('token', action.payload.token);
        
        if (action.payload.user) {
          sessionStorage.setItem('user', JSON.stringify(action.payload.user));
        }
        
        if (action.payload.refreshToken) {
          sessionStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // Clear all storage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } catch (e) {
        console.warn('Error clearing localStorage:', e);
      }
      
      try {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
      } catch (e) {
        console.warn('Error clearing sessionStorage:', e);
      }
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
