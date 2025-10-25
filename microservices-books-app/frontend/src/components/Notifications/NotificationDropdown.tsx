import React, { useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  Button,
  List,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl,
  onClose,
}) => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open && notifications.length === 0) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: 600,
          mt: 1,
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.some(n => !n.isRead) && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Mark all as read
            </Button>
          )}
        </Box>
      </Box>

      <Divider />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : recentNotifications.length > 0 ? (
        <>
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onClose={onClose}
              />
            ))}
          </List>

          <Divider />

          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            <Button
              fullWidth
              onClick={handleViewAll}
              sx={{ textTransform: 'none' }}
            >
              View All Notifications
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="info" sx={{ justifyContent: 'center' }}>
            No notifications yet
          </Alert>
        </Box>
      )}
    </Popover>
  );
};

export default NotificationDropdown;
