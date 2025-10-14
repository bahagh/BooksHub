import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Menu,
  MenuItem as MenuItemComponent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { booksService } from '../../services/booksService';
import { useAuth } from '../../contexts/AuthContext';
import { Book } from '../../types';

export const MyBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await booksService.getBooks({
        page: 1,
        pageSize: 100,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      // Filter to show only user's own books
      const myBooks = response.items.filter(book => book.userId === user.id);
      setBooks(myBooks);
    } catch (err: any) {
      console.error('Failed to load books:', err);
      setError(err.message || 'Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, bookId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedBookId(bookId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBookId(null);
  };

  const handleViewBook = (bookId: string) => {
    navigate(`/books/${bookId}`);
    handleMenuClose();
  };

  const handleEditBook = (bookId: string) => {
    navigate(`/books/${bookId}/edit`);
    handleMenuClose();
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await booksService.deleteBook(bookId);
      await loadBooks();
      handleMenuClose();
    } catch (err: any) {
      console.error('Failed to delete book:', err);
      setError(err.message || 'Failed to delete book');
    }
  };

  const getStatusText = (status: string | number): string => {
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Draft';
        case 1: return 'In Review';
        case 2: return 'Published';
        case 3: return 'Archived';
        default: return 'Unknown';
      }
    }
    return status || 'Draft';
  };

  const getStatusColor = (status: string | number): 'default' | 'success' | 'warning' | 'error' => {
    const statusValue = typeof status === 'number' ? status : status?.toLowerCase();
    
    switch (statusValue) {
      case 2:
      case 'published':
        return 'success';
      case 0:
      case 'draft':
        return 'default';
      case 1:
      case 'inreview':
        return 'warning';
      case 3:
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredBooks = books.filter(book => {
    // Status filter
    if (statusFilter !== 'all') {
      const statusNum = parseInt(statusFilter);
      if (typeof book.status === 'number' && book.status !== statusNum) {
        return false;
      } else if (typeof book.status === 'string' && getStatusText(statusNum).toLowerCase() !== book.status.toLowerCase()) {
        return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        book.description?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.genre?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const stats = {
    total: books.length,
    draft: books.filter(b => (typeof b.status === 'number' ? b.status === 0 : b.status?.toLowerCase() === 'draft')).length,
    published: books.filter(b => (typeof b.status === 'number' ? b.status === 2 : b.status?.toLowerCase() === 'published')).length,
    totalViews: books.reduce((sum, b) => sum + (b.viewCount || 0), 0),
    totalRatings: books.reduce((sum, b) => sum + (b.ratingCount || 0), 0),
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please log in to view your books.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Books
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/books/create')}
          >
            Create New Book
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total Books</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{stats.published}</Typography>
              <Typography variant="body2" color="text.secondary">Published</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">{stats.draft}</Typography>
              <Typography variant="body2" color="text.secondary">Drafts</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">{stats.totalViews}</Typography>
              <Typography variant="body2" color="text.secondary">Total Views</Typography>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search your books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="0">Draft</MenuItem>
                  <MenuItem value="1">In Review</MenuItem>
                  <MenuItem value="2">Published</MenuItem>
                  <MenuItem value="3">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery || statusFilter !== 'all' ? 'No books found' : 'No books yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by creating your first book'}
            </Typography>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/books/create')}
              >
                Create Your First Book
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={getStatusText(book.status)}
                        color={getStatusColor(book.status)}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, book.id)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {book.title}
                    </Typography>

                    {book.author && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        by {book.author}
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 2
                      }}
                    >
                      {book.description || 'No description'}
                    </Typography>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: 'gold' }} />
                        <Typography variant="caption">
                          {book.averageRating?.toFixed(1) || '0.0'} ({book.ratingCount || 0})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {book.commentCount || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {book.viewCount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewBook(book.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditBook(book.id)}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItemComponent onClick={() => selectedBookId && handleViewBook(selectedBookId)}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            View
          </MenuItemComponent>
          <MenuItemComponent onClick={() => selectedBookId && handleEditBook(selectedBookId)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItemComponent>
          <MenuItemComponent
            onClick={() => selectedBookId && handleDeleteBook(selectedBookId)}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItemComponent>
        </Menu>
      </Box>
    </Container>
  );
};

export default MyBooksPage;
