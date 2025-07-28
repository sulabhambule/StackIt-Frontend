import apiClient from './client';

export const moderationAPI = {
  // Get admin dashboard data
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/moderation/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  },

  // Get reports with filtering
  getReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/moderation/reports?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  // Submit a report
  submitReport: async (reportData) => {
    try {
      const response = await apiClient.post('/moderation/reports', reportData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit report');
    }
  },

  // Review a report (admin only)
  reviewReport: async (reportId, actionData) => {
    try {
      const response = await apiClient.patch(`/moderation/reports/${reportId}/review`, actionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to review report');
    }
  }
};

export default moderationAPI;
