import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import type {
  Notification as NotificationType,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
  NotificationContextType,
} from '../types';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Use API Gateway for SignalR connections
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:5000';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(1, 20);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Decrement unread count if it was unread
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }, [notifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await notificationService.deleteAllReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
      throw error;
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: UpdateNotificationPreferencesRequest) => {
    try {
      const updated = await notificationService.updatePreferences(prefs);
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }, []);

  // Initialize SignalR connection
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clean up connection if user logs out
      if (connection) {
        connection.stop();
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    // Create SignalR connection
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_GATEWAY_URL}/hubs/notifications`, {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Handle new notifications from SignalR
    newConnection.on('ReceiveNotification', (notification: NotificationType) => {
      console.log('Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permitted
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
        });
      }
    });

    // Handle unread count updates
    newConnection.on('UnreadCountUpdated', (count: number) => {
      console.log('Unread count updated:', count);
      setUnreadCount(count);
    });

    // Handle connection lifecycle
    newConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      setIsConnected(true);
      // Refresh data after reconnection
      fetchNotifications();
      fetchUnreadCount();
    });

    newConnection.onclose(() => {
      console.log('SignalR connection closed');
      setIsConnected(false);
    });

    // Start connection
    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log('SignalR connected successfully');
        setIsConnected(true);
        setConnection(newConnection);
        
        // Fetch initial data
        await Promise.all([
          fetchNotifications(),
          fetchUnreadCount(),
          fetchPreferences(),
        ]);
      } catch (error) {
        console.error('SignalR connection failed:', error);
        setIsConnected(false);
        // Retry connection after 5 seconds
        setTimeout(() => startConnection(), 5000);
      }
    };

    startConnection();

    // Cleanup on unmount
    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // Request browser notification permission
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, [isAuthenticated]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    preferences,
    updatePreferences,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
