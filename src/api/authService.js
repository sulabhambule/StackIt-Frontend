import apiClient from './client.js';
import { AUTH_ENDPOINTS } from './endpoints.js';

// Auth API Service
export const authAPI = {
  // Register user
  register: async (userData) => {
    try {
      // Check if userData is FormData (for file uploads) or regular object
      const isFormData = userData instanceof FormData;
      
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : undefined,
      });
      
      // Store tokens and user data in localStorage if registration includes auto-login
      if (response.data.success && response.data.data.accessToken) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
      
      // Store tokens and user data in localStorage
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return response.data;
    } catch (error) {
      // Clear localStorage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error.response?.data || error.message;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken
      });

      // Update tokens in localStorage
      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return response.data;
    } catch (error) {
      // Clear tokens if refresh fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error.response?.data || error.message;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get(AUTH_ENDPOINTS.CURRENT_USER);
      
      // Update user data in localStorage
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update account details
  updateAccount: async (accountData) => {
    try {
      const response = await apiClient.patch(AUTH_ENDPOINTS.UPDATE_ACCOUNT, accountData);
      
      // Update user data in localStorage
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user avatar
  updateAvatar: async (avatarData) => {
    try {
      const response = await apiClient.patch(AUTH_ENDPOINTS.UPDATE_AVATAR, avatarData);
      
      // Update user data in localStorage
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authAPI;
