import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Book as BookIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { booksService } from '../../services/booksService';
import { Book } from '../../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for real data
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  
  const [stats, setStats] = useState({
    totalBooks: 0,
    publishedBooks: 0,
    draftBooks: 0,
    totalViews: 0,
    totalRatings: 0,
    avgRating: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's books
      const myBooksResponse = await booksService.getBooks({
        page: 1,
        pageSize: 100,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      const userBooks = myBooksResponse.items.filter(book => book.userId === user?.id);
      setMyBooks(userBooks);

      // Calculate stats from user's books
      const published = userBooks.filter(b => b.status === 2 || b.status === 'Published').length;
      const drafts = userBooks.filter(b => b.status === 0 || b.status === 'Draft').length;
      const totalViews = userBooks.reduce((sum, b) => sum + (b.viewCount || 0), 0);
      const totalRatings = userBooks.reduce((sum, b) => sum + (b.ratingCount || 0), 0);
      const avgRating = userBooks.length > 0 
        ? userBooks.reduce((sum, b) => sum + (b.averageRating || 0), 0) / userBooks.length 
        : 0;

      setStats({
        totalBooks: userBooks.length,
        publishedBooks: published,
        draftBooks: drafts,
        totalViews,
        totalRatings,
        avgRating: Number(avgRating.toFixed(1)),
      });

      // Load popular books
      try {
        const popular = await booksService.getPopularBooks(6);
        setPopularBooks(popular);
      } catch (err) {
        console.log('Could not load popular books');
      }

      // Load recent books (public)
      try {
        const recent = await booksService.getRecentBooks(3);
        setRecentBooks(recent);
      } catch (err) {
        console.log('Could not load recent books');
      }

    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number | string): string => {
    if (typeof status === 'string') return status;
    const statusMap: Record<number, string> = {
      0: 'Draft',
      1: 'In Review',
      2: 'Published',
      3: 'Archived'
    };
    return statusMap[status] || 'Unknown';
  };

  const getStatusColor = (status: number | string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (typeof status === 'string') {
      const statusMap: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
        'Draft': 'default',
        'InReview': 'info',
        'Published': 'success',
        'Archived': 'error'
      };
      return statusMap[status] || 'default';
    }
    const statusMap: Record<number, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      0: 'default',
      1: 'info',
      2: 'success',
      3: 'error'
    };
    return statusMap[status] || 'default';
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

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

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
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/my-books')}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div" color="primary">
                    {stats.totalBooks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    My Books
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
                    {stats.publishedBooks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Published
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
                    {stats.totalViews}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Views
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ViewIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Recent Books */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h2">
                My Recent Books
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/books/create')}
              >
                Create New
              </Button>
            </Box>
            {myBooks.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven't created any books yet
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/books/create')}
                  sx={{ mt: 2 }}
                >
                  Create Your First Book
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {myBooks.slice(0, 5).map((book) => (
                  <Grid item xs={12} key={book.id}>
                    <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="h6" component="h3">
                                {book.title}
                              </Typography>
                              <Chip 
                                label={getStatusText(book.status)} 
                                color={getStatusColor(book.status)}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              by {book.author}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {book.genre}
                            </Typography>
                          </Box>
                          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <StarIcon sx={{ color: 'gold', fontSize: 18 }} />
                              <Typography variant="body2">
                                {book.averageRating?.toFixed(1) || '0.0'} ({book.ratingCount || 0})
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <ViewIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {book.viewCount || 0} views
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => navigate(`/books/${book.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/books/${book.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {myBooks.length > 5 && (
                  <Grid item xs={12}>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      onClick={() => navigate('/my-books')}
                    >
                      View All My Books ({myBooks.length})
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Popular Books */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <TrendingIcon color="primary" />
              <Typography variant="h6" component="h2">
                Popular Books
              </Typography>
            </Box>
            {popularBooks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                No popular books available
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {popularBooks.slice(0, 4).map((book) => (
                  <Grid item xs={12} key={book.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" component="h3" gutterBottom noWrap>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          by {book.author}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={1}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
                            <Typography variant="body2">
                              {book.averageRating?.toFixed(1) || '0.0'}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {book.viewCount || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {popularBooks.length > 4 && (
                  <Grid item xs={12}>
                    <Button 
                      fullWidth 
                      variant="text"
                      onClick={() => navigate('/books')}
                    >
                      View More
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Recently Published Books */}
        {recentBooks.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Recently Published Books
              </Typography>
              <Grid container spacing={2}>
                {recentBooks.map((book) => (
                  <Grid item xs={12} sm={6} md={4} key={book.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        height: '100%',
                        '&:hover': { boxShadow: 2 }
                      }}
                      onClick={() => navigate(`/books/${book.id}`)}
                    >
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom noWrap>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          by {book.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {book.genre}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={2}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <StarIcon sx={{ color: 'gold', fontSize: 18 }} />
                            <Typography variant="body2">
                              {book.averageRating?.toFixed(1) || '0.0'}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {book.commentCount || 0}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {book.viewCount || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small">View Details</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/books/create')}
              >
                Create New Book
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<BookIcon />}
                onClick={() => navigate('/books')}
              >
                Browse All Books
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => navigate('/my-books')}
              >
                Manage My Books
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<StarIcon />}
                onClick={() => navigate('/books')}
              >
                Explore Top Rated
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;