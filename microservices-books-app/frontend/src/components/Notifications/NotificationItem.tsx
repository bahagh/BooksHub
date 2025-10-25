import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Star as StarIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Notification as NotificationType } from '../../types';

interface NotificationItemProps {
  notification: NotificationType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CommentReply':
        return <CommentIcon color="primary" />;
      case 'NewRating':
        return <StarIcon color="warning" />;
      case 'BookUpdate':
        return <BookIcon color="success" />;
      case 'NewFollower':
        return <PersonIcon color="info" />;
      default:
        return <CircleIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'CommentReply':
        return 'primary';
      case 'NewRating':
        return 'warning';
      case 'BookUpdate':
        return 'success';
      case 'NewFollower':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleClick = () => {
    // Mark as read if not already
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate to link if provided
    if (notification.link) {
      navigate(notification.link);
      onClose?.();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <ListItem
      disablePadding
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={handleDelete}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      }
      sx={{
        backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
        '&:hover': {
          backgroundColor: notification.isRead ? 'action.hover' : 'action.selected',
        },
      }}
    >
      <ListItemButton onClick={handleClick} sx={{ pr: 6 }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          {getNotificationIcon(notification.type)}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: notification.isRead ? 400 : 600,
                  flex: 1,
                }}
              >
                {notification.title}
              </Typography>
              {!notification.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {notification.message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(notification.createdAt)}
                </Typography>
                <Chip
                  label={notification.type.replace(/([A-Z])/g, ' $1').trim()}
                  size="small"
                  color={getNotificationColor(notification.type) as any}
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

export default NotificationItem;
