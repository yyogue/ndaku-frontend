import API from '../../services/api';
import { loginSuccess, logout } from '../slices/authSlice';

export const loginUser = (credentials) => async (dispatch) => {
  try {
    const response = await API.post('/users/login', credentials);
    dispatch(loginSuccess({ user: response.data.user, token: response.data.token }));
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const logoutUser = () => (dispatch) => {
  dispatch(logout());
};
