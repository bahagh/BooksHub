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
  Skeleton,
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

      // Helper function to normalize status values
      const getStatusValue = (status: any): number => {
        if (typeof status === 'number') return status;
        if (typeof status === 'string') {
          const statusMap: { [key: string]: number } = {
            'draft': 0,
            'inreview': 1,
            'published': 2,
            'archived': 3
          };
          return statusMap[status.toLowerCase()] ?? 0;
        }
        return 0;
      };

      // Calculate stats from user's books with proper status handling
      const published = userBooks.filter(b => getStatusValue(b.status) === 2).length;
      const drafts = userBooks.filter(b => getStatusValue(b.status) === 0).length;
      const totalViews = userBooks.reduce((sum, b) => sum + (b.viewCount ?? 0), 0);
      const totalRatings = userBooks.reduce((sum, b) => sum + (b.ratingCount ?? 0), 0);
      const avgRating = userBooks.length > 0 
        ? userBooks.reduce((sum, b) => sum + (b.averageRating ?? 0), 0) / userBooks.length 
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
        <Box sx={{ mt: 2, mb: 4 }}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={40} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="circular" width={56} height={56} sx={{ float: 'right' }} />
                  <Skeleton variant="text" width="60%" height={50} />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
              {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 1 }} />
                </Box>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
              {[1, 2, 3, 4].map((item) => (
                <Box key={item} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
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
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Welcome back, {user?.firstName || user?.username}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Here's what's happening with your reading journey
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)',
              }
            }} 
            onClick={() => navigate('/my-books')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalBooks}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    My Books
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <BookIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(17, 153, 142, 0.4)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.publishedBooks}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Published
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ViewIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.avgRating}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Avg Rating
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <StarIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)',
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stats.totalViews}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Views
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ViewIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Recent Books */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ fontWeight: 600 }}
              >
                My Recent Books
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/books/create')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  }
                }}
              >
                Create New
              </Button>
            </Box>
            {myBooks.length === 0 ? (
              <Box 
                textAlign="center" 
                py={6}
                sx={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: 2,
                }}
              >
                <BookIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  You haven't created any books yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start your writing journey by creating your first book
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/books/create')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    px: 4,
                    py: 1.5,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                    }
                  }}
                >
                  Create Your First Book
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {myBooks.slice(0, 5).map((book) => (
                  <Grid item xs={12} key={book.id}>
                    <Card 
                      sx={{ 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': { 
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          transform: 'translateY(-4px)',
                          borderColor: 'primary.main',
                        } 
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography 
                                variant="h6" 
                                component="h3"
                                sx={{ fontWeight: 600 }}
                              >
                                {book.title}
                              </Typography>
                              <Chip 
                                label={getStatusText(book.status)} 
                                color={getStatusColor(book.status)}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                              by {book.author}
                            </Typography>
                            <Chip 
                              label={book.genre}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                            <Box 
                              display="flex" 
                              alignItems="center" 
                              gap={0.5}
                              sx={{
                                bgcolor: 'warning.light',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              <StarIcon sx={{ color: 'warning.dark', fontSize: 18 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {book.averageRating?.toFixed(1) || '0.0'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({book.ratingCount || 0})
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <ViewIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {book.viewCount || 0} views
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => navigate(`/books/${book.id}`)}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                              transform: 'scale(1.05)',
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/books/${book.id}/edit`)}
                          sx={{
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            }
                          }}
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
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingIcon sx={{ color: 'white' }} />
              </Box>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ fontWeight: 600 }}
              >
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
                      sx={{ 
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': { 
                          boxShadow: '0 6px 20px rgba(240, 147, 251, 0.3)',
                          transform: 'translateX(4px)',
                          borderColor: 'secondary.main',
                        }
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