import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Book as BookIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const stats = {
    totalBooks: 156,
    booksRead: 23,
    avgRating: 4.2,
    totalComments: 87,
  };

  const recentBooks = [
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      rating: 4.5,
      progress: 75,
    },
    {
      id: '2',
      title: '1984',
      author: 'George Orwell',
      rating: 4.8,
      progress: 100,
    },
    {
      id: '3',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      rating: 4.3,
      progress: 45,
    },
  ];

  const recommendations = [
    {
      id: '4',
      title: 'Brave New World',
      author: 'Aldous Huxley',
      reason: 'Based on your love for dystopian fiction',
    },
    {
      id: '5',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      reason: 'Popular among readers who enjoyed The Great Gatsby',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName || user?.username}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your reading journey
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="primary">
                    {stats.totalBooks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Books
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <BookIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.booksRead}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Books Read
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <ViewIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="warning.main">
                    {stats.avgRating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Rating
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <StarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="info.main">
                    {stats.totalComments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comments
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <CommentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Books */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Continue Reading
            </Typography>
            <Grid container spacing={2}>
              {recentBooks.map((book) => (
                <Grid item xs={12} key={book.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" component="h3">
                            {book.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            by {book.author}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <StarIcon sx={{ color: 'gold', fontSize: 20 }} />
                          <Typography variant="body2">{book.rating}</Typography>
                        </Box>
                      </Box>
                      <Box mb={1}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Progress: {book.progress}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={book.progress} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" variant="contained">
                        {book.progress === 100 ? 'Read Again' : 'Continue Reading'}
                      </Button>
                      <Button size="small">View Details</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <TrendingIcon color="primary" />
              <Typography variant="h6" component="h2">
                Recommended for You
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {recommendations.map((book) => (
                <Grid item xs={12} key={book.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" component="h3" gutterBottom>
                        {book.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        by {book.author}
                      </Typography>
                      <Chip 
                        label={book.reason} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                    <CardActions>
                      <Button size="small" variant="outlined">
                        Add to List
                      </Button>
                      <Button size="small">Preview</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button variant="contained" startIcon={<BookIcon />}>
                Browse Books
              </Button>
              <Button variant="outlined" startIcon={<StarIcon />}>
                Leave a Review
              </Button>
              <Button variant="outlined" startIcon={<CommentIcon />}>
                Join Discussion
              </Button>
              <Button variant="outlined" startIcon={<TrendingIcon />}>
                View Analytics
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;