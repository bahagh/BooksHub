import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Book as BookIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { booksService } from '../../services/booksService';
import { ChangePasswordSection } from './ChangePasswordSection';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userBooks, setUserBooks] = useState<any[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Load user's books
      const booksResponse = await booksService.getBooks({
        page: 1,
        pageSize: 100,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      const myBooks = booksResponse.items.filter(book => book.userId === user?.id);
      setUserBooks(myBooks);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real stats from user's books
  const userStats = {
    booksCreated: userBooks.length,
    publishedBooks: userBooks.filter(b => b.status === 2 || b.status === 'Published').length,
    totalViews: userBooks.reduce((sum, b) => sum + (b.viewCount || 0), 0),
    totalRatings: userBooks.reduce((sum, b) => sum + (b.ratingCount || 0), 0),
    avgRating: userBooks.length > 0 
      ? (userBooks.reduce((sum, b) => sum + (b.averageRating || 0), 0) / userBooks.length).toFixed(1)
      : '0.0',
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
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
              <Box display="flex" gap={1} flexDirection="column">
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </Button>
                <Button
                  variant="contained"
                  startIcon={<BookIcon />}
                  onClick={() => navigate('/my-books')}
                >
                  My Library
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/my-books')}>
            <BookIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="primary">
              {userStats.booksCreated}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Books Created
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="warning.main">
              {userStats.publishedBooks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Published Books
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CommentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="info.main">
              {userStats.totalViews}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Views
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" component="div" color="success.main">
              {userStats.avgRating}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Book Rating
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Books */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                My Recent Books
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/my-books')}
              >
                View All
              </Button>
            </Box>
            {userBooks.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  You haven't created any books yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<BookIcon />}
                  onClick={() => navigate('/books/create')}
                  sx={{ mt: 2 }}
                >
                  Create Your First Book
                </Button>
              </Box>
            ) : (
              <List>
                {userBooks.slice(0, 5).map((book, index) => (
                  <ListItem 
                    key={book.id} 
                    divider={index < Math.min(userBooks.length, 5) - 1}
                    secondaryAction={
                      <Button
                        size="small"
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        View
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={book.title}
                      secondary={`${book.author} • ${book.genre} • ${book.viewCount || 0} views`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Change Password Section */}
        <Grid item xs={12}>
          <ChangePasswordSection />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Button 
                variant="outlined" 
                startIcon={<BookIcon />}
                onClick={() => navigate('/books/create')}
              >
                Create New Book
              </Button>
              <Button 
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/settings')}
              >
                Account Settings
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;