import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    location: locationReducer,
  },
});
