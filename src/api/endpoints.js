// API Base URL - Update this based on your environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  CHANGE_PASSWORD: '/auth/change-password',
  CURRENT_USER: '/auth/current-user',
  UPDATE_ACCOUNT: '/auth/update-account',
  UPDATE_AVATAR: '/auth/update-avatar',
};

// Question Endpoints
export const QUESTION_ENDPOINTS = {
  GET_ALL: '/questions',
  GET_BY_ID: '/questions/:questionId',
  SUBMIT: '/questions',
  UPDATE: '/questions/:questionId',
  DELETE: '/questions/:questionId',
  GET_USER_QUESTIONS: '/questions/user/:userId',
  GET_TRENDING: '/questions/trending',
  GET_TAGS: '/questions/tags',
};

// Answer Endpoints
export const ANSWER_ENDPOINTS = {
  SUBMIT: '/answers/question/:questionId',
  VOTE: '/answers/:answerId/vote',
  ACCEPT: '/answers/:answerId/accept',
  UPDATE: '/answers/:answerId',
  DELETE: '/answers/:answerId',
  GET_USER_ANSWERS: '/answers/user/:userId',
  GET_VOTE_STATUS: '/answers/:answerId/vote-status',
};

// Moderation Endpoints
export const MODERATION_ENDPOINTS = {
  DASHBOARD: '/moderation/dashboard',
  REPORTS: '/moderation/reports',
  SUBMIT_REPORT: '/moderation/reports',
  REVIEW_REPORT: '/moderation/reports/:reportId/review',
};

// Helper function to replace URL parameters
export const replaceUrlParams = (url, params) => {
  let replacedUrl = url;
  Object.keys(params).forEach(key => {
    replacedUrl = replacedUrl.replace(`:${key}`, params[key]);
  });
  return replacedUrl;
};