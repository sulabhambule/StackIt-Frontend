import apiClient from './client.js';
import { ANSWER_ENDPOINTS, replaceUrlParams } from './endpoints.js';

// Answer API Service
export const answerAPI = {
  // Submit answer to a question
  submitAnswer: async (questionId, answerData) => {
    try {
      const url = replaceUrlParams(ANSWER_ENDPOINTS.SUBMIT, { questionId });
      const response = await apiClient.post(url, answerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Vote on an answer
  voteAnswer: async (answerId, voteValue) => {
    try {
      const url = replaceUrlParams(ANSWER_ENDPOINTS.VOTE, { answerId });
      const response = await apiClient.post(url, { value: voteValue });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Accept an answer
  acceptAnswer: async (answerId) => {
    try {
      const url = replaceUrlParams(ANSWER_ENDPOINTS.ACCEPT, { answerId });
      const response = await apiClient.patch(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update answer
  updateAnswer: async (answerId, answerData) => {
    try {
      const url = replaceUrlParams(ANSWER_ENDPOINTS.UPDATE, { answerId });
      const response = await apiClient.patch(url, answerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete answer
  deleteAnswer: async (answerId) => {
    try {
      const url = replaceUrlParams(ANSWER_ENDPOINTS.DELETE, { answerId });
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's answers
  getUserAnswers: async (userId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = replaceUrlParams(ANSWER_ENDPOINTS.GET_USER_ANSWERS, { userId });
      const finalUrl = `${url}?${queryParams.toString()}`;
      const response = await apiClient.get(finalUrl);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's vote status for an answer
  getUserVoteStatus: async (answerId) => {
    try {
      const url = replaceUrlParams(ANSWER_ENDPOINTS.GET_VOTE_STATUS, { answerId });
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default answerAPI;
