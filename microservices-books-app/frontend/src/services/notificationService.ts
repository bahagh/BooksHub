import { api, handleApiError } from './api';
import {
  Notification,
  NotificationSummary,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
  ApiResponse,
} from '../types';

class NotificationService {
  /**
   * Get user's notifications with pagination
   */
  async getNotifications(page: number = 1, pageSize: number = 20): Promise<Notification[]> {
    try {
      const response = await api.get<ApiResponse<Notification[]>>('/api/notifications', {
        params: { page, pageSize }
      });
      return response.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get notification summary (unread count + recent notifications)
   */
  async getNotificationSummary(): Promise<NotificationSummary> {
    try {
      const response = await api.get<ApiResponse<NotificationSummary>>('/api/notifications/summary');
      return response.data || { totalCount: 0, unreadCount: 0, recentNotifications: [] };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<ApiResponse<number>>('/api/notifications/unread/count');
      return response.data || 0;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get a specific notification by ID
   */
  async getNotificationById(id: string): Promise<Notification> {
    try {
      const response = await api.get<ApiResponse<Notification>>(`/api/notifications/${id}`);
      if (!response.data) {
        throw new Error('Notification not found');
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await api.put<ApiResponse<boolean>>(`/api/notifications/${id}/read`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.put<ApiResponse<boolean>>('/api/notifications/read-all');
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<boolean>>(`/api/notifications/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteAllReadNotifications(): Promise<void> {
    try {
      await api.delete<ApiResponse<boolean>>('/api/notifications/read');
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get<ApiResponse<NotificationPreferences>>('/api/notifications/preferences');
      if (!response.data) {
        throw new Error('Preferences not found');
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(preferences: UpdateNotificationPreferencesRequest): Promise<NotificationPreferences> {
    try {
      const response = await api.put<ApiResponse<NotificationPreferences>>(
        '/api/notifications/preferences',
        preferences
      );
      if (!response.data) {
        throw new Error('Failed to update preferences');
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
