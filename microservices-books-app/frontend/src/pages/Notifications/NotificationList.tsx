import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  DoneAll as DoneAllIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from '../../components/Notifications/NotificationItem';

const NotificationList: React.FC = () => {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (_event: React.SyntheticEvent, newValue: 'all' | 'unread' | 'read') => {
    setFilter(newValue);
    setPage(1);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAllRead = async () => {
    if (window.confirm('Are you sure you want to delete all read notifications?')) {
      await deleteAllRead();
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Notifications</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllAsRead}
                size="small"
              >
                Mark all as read
              </Button>
            )}
            {readCount > 0 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={handleDeleteAllRead}
                size="small"
              >
                Delete read
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={filter} onChange={handleFilterChange}>
            <Tab
              label={`All (${notifications.length})`}
              value="all"
            />
            <Tab
              label={`Unread (${unreadCount})`}
              value="unread"
            />
            <Tab
              label={`Read (${readCount})`}
              value="read"
            />
          </Tabs>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : paginatedNotifications.length > 0 ? (
          <>
            <List sx={{ p: 0 }}>
              {paginatedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </List>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="info">
              {filter === 'all' && 'No notifications yet'}
              {filter === 'unread' && 'No unread notifications'}
              {filter === 'read' && 'No read notifications'}
            </Alert>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationList;
