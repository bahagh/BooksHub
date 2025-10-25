import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import {
  BookmarkRemove as RemoveIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { libraryService, LibraryBook } from '../../services/libraryService';
import ErrorDisplay from '../../components/ErrorDisplay';
import { useAuth } from '../../contexts/AuthContext';

const MyLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState<LibraryBook | null>(null);
  const [removing, setRemoving] = useState(false);

  const pageSize = 12;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadLibrary();
  }, [page, user]);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await libraryService.getLibraryBooks(page, pageSize);
      setLibraryBooks(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(Math.ceil((result.totalCount || 0) / pageSize));
    } catch (err: any) {
      console.error('Failed to load library:', err);
      setError(err);
      setLibraryBooks([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (libraryBook: LibraryBook) => {
    setBookToRemove(libraryBook);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!bookToRemove) return;

    try {
      setRemoving(true);
      await libraryService.removeFromLibrary(bookToRemove.bookId);
      setRemoveDialogOpen(false);
      setBookToRemove(null);
      // Reload library
      await loadLibrary();
    } catch (err: any) {
      console.error('Failed to remove from library:', err);
      setError(err);
    } finally {
      setRemoving(false);
    }
  };

  const handleRemoveCancel = () => {
    setRemoveDialogOpen(false);
    setBookToRemove(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && libraryBooks.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <ErrorDisplay error={error} onRetry={loadLibrary} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            📚 My Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {totalCount} {totalCount === 1 ? 'book' : 'books'} in your library
          </Typography>
        </Box>

        {/* Empty State */}
        {libraryBooks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Your library is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start adding books to your library by clicking "Add to Library" on any public book
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/books')}
            >
              Browse Books
            </Button>
          </Box>
        ) : (
          <>
            {/* Books Grid */}
            <Grid container spacing={3}>
              {libraryBooks.map((libraryBook) => (
                <Grid item xs={12} sm={6} md={4} key={libraryBook.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Title */}
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {libraryBook.book.title}
                      </Typography>

                      {/* Author */}
                      {libraryBook.book.author && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          by {libraryBook.book.author}
                        </Typography>
                      )}

                      {/* Description */}
                      {libraryBook.book.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1, 
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {libraryBook.book.description}
                        </Typography>
                      )}

                      {/* Stats */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                        {libraryBook.book.averageRating && libraryBook.book.averageRating > 0 && (
                          <Chip
                            icon={<StarIcon />}
                            label={`${libraryBook.book.averageRating.toFixed(1)} (${libraryBook.book.ratingCount})`}
                            size="small"
                            color="warning"
                          />
                        )}
                        <Chip
                          icon={<ViewIcon />}
                          label={libraryBook.book.viewCount}
                          size="small"
                        />
                        {libraryBook.book.genre && (
                          <Chip
                            label={libraryBook.book.genre}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      {/* Added Date */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Added {formatDate(libraryBook.addedAt)}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/books/${libraryBook.bookId}`)}
                        variant="contained"
                      >
                        Read
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveClick(libraryBook)}
                        title="Remove from library"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* Remove Confirmation Dialog */}
        <Dialog open={removeDialogOpen} onClose={handleRemoveCancel}>
          <DialogTitle>Remove from Library</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove "{bookToRemove?.book.title}" from your library?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRemoveCancel}>Cancel</Button>
            <Button
              onClick={handleRemoveConfirm}
              color="error"
              variant="contained"
              disabled={removing}
            >
              {removing ? <CircularProgress size={24} /> : 'Remove'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyLibraryPage;
