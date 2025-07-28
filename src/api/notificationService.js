import apiClient from './client';
import { API_BASE_URL } from './endpoints';

const NOTIFICATION_ENDPOINTS = {
  GET_ALL: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: '/notifications/:notificationId/read',
  MARK_ALL_READ: '/notifications/mark-all-read',
  CREATE_TEST: '/notifications/test',
};

const replaceUrlParams = (url, params) => {
  let newUrl = url;
  Object.keys(params).forEach(key => {
    newUrl = newUrl.replace(`:${key}`, params[key]);
  });
  return newUrl;
};

export const notificationAPI = {
  // Get user notifications
  getUserNotifications: async (params = {}) => {
    try {
      console.log('NotificationAPI: Getting user notifications with params:', params);
      const queryParams = new URLSearchParams(params).toString();
      const url = `${NOTIFICATION_ENDPOINTS.GET_ALL}${queryParams ? `?${queryParams}` : ''}`;
      console.log('NotificationAPI: Request URL:', url);
      const response = await apiClient.get(url);
      console.log('NotificationAPI: Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('NotificationAPI: Error getting notifications:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      console.log('NotificationAPI: Getting unread count');
      const response = await apiClient.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);
      console.log('NotificationAPI: Unread count response:', response.data);
      return response.data;
    } catch (error) {
      console.error('NotificationAPI: Error getting unread count:', error);
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const url = replaceUrlParams(NOTIFICATION_ENDPOINTS.MARK_READ, { notificationId });
      const response = await apiClient.patch(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add test notification function for debugging
  createTestNotification: async () => {
    try {
      console.log('NotificationAPI: Creating test notification...');
      const response = await apiClient.post(NOTIFICATION_ENDPOINTS.CREATE_TEST);
      console.log('NotificationAPI: Test notification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('NotificationAPI: Error creating test notification:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default notificationAPI;
