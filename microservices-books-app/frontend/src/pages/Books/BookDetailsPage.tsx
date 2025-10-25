import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  Category as CategoryIcon,
  BookmarkAdd as BookmarkAddIcon,
  BookmarkAdded as BookmarkAddedIcon,
} from '@mui/icons-material';
import { booksService } from '../../services/booksService';
import { libraryService } from '../../services/libraryService';
import { Book } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import ErrorDisplay from '../../components/ErrorDisplay';
import BookRating from '../../components/Books/BookRating';
import BookComments from '../../components/Books/BookComments';

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const viewCountedRef = React.useRef(false);  // Track if view has been counted
  
  // Library state
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Reset view tracking when book ID changes
    viewCountedRef.current = false;
    loadBook();
    checkLibraryStatus();
  }, [id]);

  const loadBook = async () => {
    if (!id) {
      setError({ message: 'Book ID is required' });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bookData = await booksService.getBookById(id);
      setBook(bookData);
    } catch (err: any) {
      console.error('Failed to load book:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/books/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await booksService.deleteBook(id);
      navigate('/books');
    } catch (err: any) {
      console.error('Failed to delete book:', err);
      setError(err);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const checkLibraryStatus = async () => {
    if (!id || !user) return;
    
    try {
      const status = await libraryService.isInLibrary(id);
      setIsInLibrary(status);
    } catch (err) {
      console.error('Failed to check library status:', err);
    }
  };

  const handleAddToLibrary = async () => {
    if (!id) return;

    try {
      setLibraryLoading(true);
      await libraryService.addToLibrary(id);
      setIsInLibrary(true);
      setSnackbarMessage('Book added to your library!');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Failed to add to library:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to add book to library');
      setSnackbarOpen(true);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!id) return;

    try {
      setLibraryLoading(true);
      await libraryService.removeFromLibrary(id);
      setIsInLibrary(false);
      setSnackbarMessage('Book removed from your library');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Failed to remove from library:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to remove book from library');
      setSnackbarOpen(true);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string | number) => {
    // Handle both numeric (0,1,2,3) and string values
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

  const getStatusText = (status: string | number): string => {
    // Handle both numeric (0,1,2,3) and string values
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

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/books')}
            sx={{ mb: 2 }}
          >
            Back to Books
          </Button>
          <ErrorDisplay error={error} onRetry={loadBook} />
        </Box>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">Book not found</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/books')}
            sx={{ mt: 2 }}
          >
            Back to Books
          </Button>
        </Box>
      </Container>
    );
  }

  const isOwner = user?.id === book.userId;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/books')}
            variant="outlined"
          >
            Back to Books
          </Button>
          
          {/* Owner Actions */}
          {isOwner && (
            <Box>
              <Button
                startIcon={<EditIcon />}
                onClick={handleEdit}
                variant="contained"
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                variant="outlined"
                color="error"
              >
                Delete
              </Button>
            </Box>
          )}
          
          {/* Non-Owner Actions (Library Button) */}
          {!isOwner && user && book.isPublic && (
            <Box>
              {isInLibrary ? (
                <Button
                  startIcon={<BookmarkAddedIcon />}
                  onClick={handleRemoveFromLibrary}
                  variant="outlined"
                  color="success"
                  disabled={libraryLoading}
                >
                  {libraryLoading ? 'Removing...' : 'In Library'}
                </Button>
              ) : (
                <Button
                  startIcon={<BookmarkAddIcon />}
                  onClick={handleAddToLibrary}
                  variant="contained"
                  color="primary"
                  disabled={libraryLoading}
                >
                  {libraryLoading ? 'Adding...' : 'Add to Library'}
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Book Content */}
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              {/* Title and Status */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h4" component="h1">
                    {book.title}
                  </Typography>
                  <Chip
                    label={getStatusText(book.status)}
                    color={getStatusColor(book.status)}
                    size="small"
                  />
                  {!book.isPublic && (
                    <Chip label="Private" size="small" variant="outlined" />
                  )}
                </Box>

                {book.author && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="subtitle1" color="text.secondary">
                      by {book.author}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Description */}
              {book.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    {book.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Book Content */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Content
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    backgroundColor: '#f9f9f9',
                    maxHeight: '600px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Georgia, serif',
                    lineHeight: 1.8,
                    fontSize: '1.1rem'
                  }}
                >
                  {book.content}
                </Paper>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Book Info Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Book Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Stats */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <StarIcon fontSize="small" color="warning" />
                    <Typography variant="body2">
                      {book.averageRating?.toFixed(1) || '0.0'} ({book.ratingCount || 0} ratings)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CommentIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {book.commentCount || 0} comments
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ViewIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {book.viewCount || 0} views
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {book.readingTimeMinutes || 0} min read
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Details */}
                {book.genre && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CategoryIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Genre:</strong> {book.genre}
                    </Typography>
                  </Box>
                )}

                {book.language && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LanguageIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Language:</strong> {book.language}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Words:</strong> {book.wordCount?.toLocaleString() || 0}
                  </Typography>
                </Box>

                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Created:</strong> {formatDate(book.createdAt)}
                  </Typography>
                </Box>

                {book.updatedAt && book.updatedAt !== book.createdAt && (
                  <Box>
                    <Typography variant="body2">
                      <strong>Updated:</strong> {formatDate(book.updatedAt)}
                    </Typography>
                  </Box>
                )}

                {/* Tags */}
                {book.tags && book.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Tags:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {book.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Ratings Section */}
            <Box sx={{ mb: 3 }}>
              <BookRating
                bookId={id!}
                averageRating={book.averageRating}
                ratingCount={book.ratingCount}
                onRatingUpdate={loadBook}
              />
            </Box>

            {/* Comments Section */}
            <Box>
              <BookComments
                bookId={id!}
                commentCount={book.commentCount}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{book.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Library Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default BookDetailsPage;