import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { booksService } from '../../services/booksService';
import { useAuth } from '../../contexts/AuthContext';

interface BookRatingProps {
  bookId: string;
  averageRating?: number;
  ratingCount?: number;
  onRatingUpdate?: () => void;
}

export const BookRating: React.FC<BookRatingProps> = ({
  bookId,
  averageRating = 0,
  ratingCount = 0,
  onRatingUpdate
}) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState('');
  const [existingRatingId, setExistingRatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadUserRating();
  }, [bookId]);

  const loadUserRating = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const rating = await booksService.getUserRating(bookId);
      if (rating) {
        setUserRating(rating.rating);
        setUserReview(rating.review || '');
        setExistingRatingId(rating.id);
        setShowReviewForm(false);
      }
    } catch (err: any) {
      // No rating found is OK
      console.log('No existing rating found');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (newValue: number | null) => {
    if (!user || !newValue) return;

    setUserRating(newValue);
    setShowReviewForm(true);
  };

  const handleSubmit = async () => {
    if (!user || userRating === null) return;

    try {
      setSubmitting(true);
      setError(null);

      if (existingRatingId) {
        // Update existing rating
        await booksService.updateRating(bookId, existingRatingId, {
          rating: userRating,
          review: userReview.trim() || undefined
        });
      } else {
        // Create new rating
        await booksService.createRating(bookId, {
          rating: userRating,
          review: userReview.trim() || undefined
        });
      }

      setSuccess(true);
      setShowReviewForm(false);
      setTimeout(() => setSuccess(false), 3000);

      // Refresh user rating and notify parent
      await loadUserRating();
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !existingRatingId) return;

    if (!window.confirm('Are you sure you want to delete your rating?')) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await booksService.deleteRating(bookId, existingRatingId);

      setUserRating(null);
      setUserReview('');
      setExistingRatingId(null);
      setShowReviewForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Notify parent to refresh
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (err: any) {
      console.error('Failed to delete rating:', err);
      setError(err.message || 'Failed to delete rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Book Rating
      </Typography>

      {/* Average Rating Display */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Rating
            value={averageRating}
            readOnly
            precision={0.1}
            size="large"
            icon={<StarIcon fontSize="inherit" />}
          />
          <Typography variant="h6" component="span">
            {averageRating.toFixed(1)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* User Rating Section */}
      {user ? (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Your Rating
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Rating
              value={userRating}
              onChange={(_, newValue) => handleRatingChange(newValue)}
              precision={1}
              size="large"
              disabled={submitting}
              icon={<StarIcon fontSize="inherit" />}
            />
          </Box>

          {showReviewForm && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Write a review (optional)"
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                disabled={submitting}
                placeholder="Share your thoughts about this book..."
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || userRating === null}
                >
                  {submitting ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Submitting...
                    </>
                  ) : existingRatingId ? (
                    'Update Rating'
                  ) : (
                    'Submit Rating'
                  )}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowReviewForm(false);
                    loadUserRating();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {existingRatingId && !showReviewForm && (
            <Box sx={{ mt: 2 }}>
              {userReview && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Your Review:
                  </Typography>
                  <Typography variant="body1">{userReview}</Typography>
                </Paper>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowReviewForm(true)}
                >
                  Edit Rating
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  Delete Rating
                </Button>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Rating {existingRatingId ? 'updated' : 'submitted'} successfully!
            </Alert>
          )}
        </Box>
      ) : (
        <Alert severity="info">
          Please log in to rate this book
        </Alert>
      )}
    </Paper>
  );
};

export default BookRating;
