import apiClient from './client.js';
import { QUESTION_ENDPOINTS, replaceUrlParams } from './endpoints.js';

// Question API Service
export const questionAPI = {
  // Get all questions with pagination and filters
  getAllQuestions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add parameters if they exist
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.tags) queryParams.append('tags', params.tags);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${QUESTION_ENDPOINTS.GET_ALL}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single question by ID
  getQuestionById: async (questionId) => {
    try {
      const url = replaceUrlParams(QUESTION_ENDPOINTS.GET_BY_ID, { questionId });
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit new question
  submitQuestion: async (questionData) => {
    try {
      const response = await apiClient.post(QUESTION_ENDPOINTS.SUBMIT, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    try {
      const url = replaceUrlParams(QUESTION_ENDPOINTS.UPDATE, { questionId });
      const response = await apiClient.patch(url, questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    try {
      const url = replaceUrlParams(QUESTION_ENDPOINTS.DELETE, { questionId });
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's questions
  getUserQuestions: async (userId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = replaceUrlParams(QUESTION_ENDPOINTS.GET_USER_QUESTIONS, { userId });
      const finalUrl = `${url}?${queryParams.toString()}`;
      const response = await apiClient.get(finalUrl);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get trending questions
  getTrendingQuestions: async (limit = 5) => {
    try {
      const url = `${QUESTION_ENDPOINTS.GET_TRENDING}?limit=${limit}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get available tags
  getTags: async () => {
    try {
      const response = await apiClient.get(QUESTION_ENDPOINTS.GET_TAGS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default questionAPI;
