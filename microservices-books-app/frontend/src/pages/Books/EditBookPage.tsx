import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksService } from '../../services/booksService';
import ErrorDisplay from '../../components/ErrorDisplay';
import { Book, UpdateBookRequest } from '../../types';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface EditBookForm {
  title: string;
  content: string;
  description: string;
  author: string;
  genre: string;
  language: string;
  isPublic: boolean;
  status: string;
  tags: string;
}

const COMMON_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Historical Fiction',
  'Biography',
  'Self-Help',
  'Business',
  'Technology',
  'Science',
  'History',
  'Philosophy',
  'Poetry',
  'Drama',
  'Horror',
  'Adventure',
  'Classic Fiction',
  'Other'
];

const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' }
];

const STATUS_OPTIONS = [
  { value: 0, label: 'Draft' },
  { value: 1, label: 'In Review' },
  { value: 2, label: 'Published' },
  { value: 3, label: 'Archived' }
];

export const EditBookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [book, setBook] = useState<Book | null>(null);
  
  const [formData, setFormData] = useState<EditBookForm>({
    title: '',
    content: '',
    description: '',
    author: '',
    genre: '',
    language: 'en',
    isPublic: true,
    status: '2',
    tags: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EditBookForm, string>>>({});

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    if (!id) {
      setError('Book ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const bookData = await booksService.getBookById(id);
      setBook(bookData);
      
      // Populate form with existing data
      setFormData({
        title: bookData.title,
        content: bookData.content,
        description: bookData.description || '',
        author: bookData.author || '',
        genre: bookData.genre || '',
        language: bookData.language || 'en',
        isPublic: bookData.isPublic,
        status: getStatusValue(bookData.status).toString(),
        tags: bookData.tags?.join(', ') || ''
      });

      setWordCount(calculateWordCount(bookData.content));
    } catch (err: any) {
      console.error('Failed to load book:', err);
      setError(err.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const getStatusValue = (status: string | number): number => {
    // If already a number, return it
    if (typeof status === 'number') {
      return status;
    }
    
    // Convert string to number
    switch (status?.toLowerCase()) {
      case 'draft': return 0;
      case 'inreview': return 1;
      case 'published': return 2;
      case 'archived': return 3;
      default: return 0;
    }
  };

  const calculateWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = (e.target as HTMLInputElement).type;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setErrors(prev => ({ ...prev, [name]: undefined }));

    if (name === 'content') {
      setWordCount(calculateWordCount(value));
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditBookForm, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 1 || formData.title.length > 500) {
      newErrors.title = 'Title must be between 1 and 500 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (formData.content.length > 1000000) {
      newErrors.content = 'Content must not exceed 1,000,000 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1,000 characters';
    }

    if (formData.author && formData.author.length > 100) {
      newErrors.author = 'Author must not exceed 100 characters';
    }

    if (formData.genre && formData.genre.length > 50) {
      newErrors.genre = 'Genre must not exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!id) {
      setError('Book ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const updateData: UpdateBookRequest = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        description: formData.description.trim() || undefined,
        author: formData.author.trim() || undefined,
        genre: formData.genre.trim() || undefined,
        language: formData.language,
        isPublic: formData.isPublic,
        status: parseInt(formData.status),
        tags: tagsArray.length > 0 ? tagsArray : undefined
      };

      await booksService.updateBook(id, updateData);
      
      navigate(`/books/${id}`);
    } catch (err: any) {
      console.error('Update book error:', err);
      setError(err.message || 'Failed to update book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (book) {
      const hasChanges = 
        formData.title !== book.title ||
        formData.content !== book.content ||
        formData.description !== (book.description || '');

      if (hasChanges && !window.confirm('Discard changes?')) {
        return;
      }
    }
    navigate(`/books/${id}`);
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

  if (error && !book) {
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
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/books/${id}`)}
            sx={{ mb: 2 }}
          >
            Back to Book
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Book
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update your book details and content
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={!!errors.title}
              helperText={errors.title || `${formData.title.length}/500 characters`}
              required
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 500 }}
            />

            {/* Author */}
            <TextField
              fullWidth
              label="Author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              error={!!errors.author}
              helperText={errors.author}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 100 }}
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description || `${formData.description.length}/1,000 characters`}
              multiline
              rows={3}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 1000 }}
            />

            {/* Content */}
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              error={!!errors.content}
              helperText={errors.content || `${wordCount.toLocaleString()} words, ${formData.content.length.toLocaleString()}/1,000,000 characters`}
              multiline
              rows={15}
              required
              disabled={isSubmitting}
              sx={{ mb: 3, fontFamily: 'monospace' }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Genre and Language Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Genre</InputLabel>
                <Select
                  name="genre"
                  value={formData.genre}
                  onChange={handleSelectChange}
                  label="Genre"
                >
                  <MenuItem value="">None</MenuItem>
                  {COMMON_GENRES.map(genre => (
                    <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Language</InputLabel>
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleSelectChange}
                  label="Language"
                >
                  {COMMON_LANGUAGES.map(lang => (
                    <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Status and Public Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Visibility</InputLabel>
                <Select
                  name="isPublic"
                  value={formData.isPublic ? 'public' : 'private'}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      isPublic: e.target.value === 'public'
                    }));
                  }}
                  label="Visibility"
                >
                  <MenuItem value="public">Public (visible to all users)</MenuItem>
                  <MenuItem value="private">Private (only you can see)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Tags */}
            <TextField
              fullWidth
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              helperText="Separate multiple tags with commas (e.g., fiction, adventure, mystery)"
              disabled={isSubmitting}
              sx={{ mb: 3 }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                size="large"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Help Text */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Tip:</strong> Set the status to "Published" and visibility to "Public" to make your book visible to all users.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default EditBookPage;
