import apiClient from './client.js';

// User API Service
export const userAPI = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      const response = await apiClient.patch('/user/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's questions
  getUserQuestions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `/user/questions?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's answers
  getUserAnswers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `/user/answers?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user stats
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/user/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user badges
  getUserBadges: async () => {
    try {
      const response = await apiClient.get('/user/badges');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user avatar
  updateUserAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await apiClient.patch('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get public user profile
  getPublicUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/user/${userId}/public`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
