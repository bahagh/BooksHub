import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Book as BookIcon,
  Star as StarIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const userStats = {
    booksRead: 23,
    totalRatings: 18,
    totalComments: 47,
    averageRating: 4.2,
    favoriteGenres: ['Classic Literature', 'Science Fiction', 'Mystery'],
  };

  const recentActivity = [
    {
      type: 'rating',
      action: 'Rated "1984" 5 stars',
      timestamp: '2 hours ago',
    },
    {
      type: 'comment',
      action: 'Commented on "The Great Gatsby"',
      timestamp: '1 day ago',
    },
    {
      type: 'book',
      action: 'Finished reading "To Kill a Mockingbird"',
      timestamp: '3 days ago',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
              <Box flexGrow={1}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <BookIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="primary">
              {userStats.booksRead}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Books Read
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="warning.main">
              {userStats.totalRatings}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ratings Given
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CommentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="info.main">
              {userStats.totalComments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comments Posted
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="success.main">
              {userStats.averageRating}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Rating Given
            </Typography>
          </Paper>
        </Grid>

        {/* Favorite Genres */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Favorite Genres
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {userStats.favoriteGenres.map((genre, index) => (
                <Chip
                  key={index}
                  label={genre}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem key={index} divider={index < recentActivity.length - 1}>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.timestamp}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Account Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Account Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Button variant="outlined">Change Password</Button>
              <Button variant="outlined">Privacy Settings</Button>
              <Button variant="outlined">Notification Preferences</Button>
              <Button variant="outlined" color="error">
                Delete Account
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;