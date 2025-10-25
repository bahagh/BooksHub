import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { booksService } from '../../services/booksService';
import { useAuth } from '../../contexts/AuthContext';
import { BookComment } from '../../types';

interface BookCommentsProps {
  bookId: string;
  commentCount?: number;
}

export const BookComments: React.FC<BookCommentsProps> = ({
  bookId,
  commentCount = 0
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<BookComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  // NEW: Anonymous comment state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousUsername, setAnonymousUsername] = useState('');

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await booksService.getBookComments(bookId, {
        page: 1,
        pageSize: 50,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });
      setComments(response.items);
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    // Validate: either authenticated or anonymous with username
    if (!newComment.trim()) return;
    
    if (isAnonymous && !anonymousUsername.trim()) {
      setError('Please enter an anonymous username');
      return;
    }
    
    if (!isAnonymous && !user) {
      setError('Please log in to post non-anonymous comments');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await booksService.createComment(bookId, {
        content: newComment.trim(),
        isAnonymous: isAnonymous,
        anonymousUsername: isAnonymous ? anonymousUsername.trim() : undefined
      });

      setNewComment('');
      setAnonymousUsername('');
      setIsAnonymous(false);
      await loadComments();
    } catch (err: any) {
      console.error('Failed to submit comment:', err);
      setError(err.message || 'Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      await booksService.updateComment(bookId, commentId, {
        content: editingContent.trim()
      });

      setEditingCommentId(null);
      setEditingContent('');
      await loadComments();
    } catch (err: any) {
      console.error('Failed to update comment:', err);
      setError(err.message || 'Failed to update comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await booksService.deleteComment(bookId, commentId);
      await loadComments();
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      setError(err.message || 'Failed to delete comment. Please try again.');
    } finally {
      setSubmitting(false);
      handleMenuClose();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  const handleStartEdit = (comment: BookComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    handleMenuClose();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        Comments ({comments.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Add Comment Form */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
          sx={{ mb: 1 }}
        />
        
        {/* Anonymous Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isAnonymous}
              onChange={(e) => {
                setIsAnonymous(e.target.checked);
                if (!e.target.checked) {
                  setAnonymousUsername('');
                }
              }}
              disabled={submitting}
            />
          }
          label="Post anonymously"
          sx={{ mb: isAnonymous ? 1 : 0 }}
        />
        
        {/* Anonymous Username Field */}
        {isAnonymous && (
          <TextField
            fullWidth
            label="Anonymous Username"
            placeholder="Choose a display name"
            value={anonymousUsername}
            onChange={(e) => setAnonymousUsername(e.target.value)}
            disabled={submitting}
            required
            inputProps={{ maxLength: 50 }}
            helperText={`${anonymousUsername.length}/50 characters`}
            sx={{ mb: 1 }}
          />
        )}
        
        {!user && !isAnonymous && (
          <Alert severity="info" sx={{ mb: 1 }}>
            Please log in to post non-anonymous comments, or check "Post anonymously"
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim() || (isAnonymous && !anonymousUsername.trim()) || (!isAnonymous && !user)}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Comments List */}
      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
          No comments yet. Be the first to comment!
        </Typography>
      ) : (
        <Box>
          {comments.map((comment) => (
            <Box key={comment.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: comment.isAnonymous ? 'grey.500' : 'primary.main' }}>
                  {comment.isAnonymous 
                    ? comment.anonymousUsername?.charAt(0).toUpperCase() || 'A'
                    : comment.user?.firstName?.charAt(0).toUpperCase() || 'U'
                  }
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {comment.isAnonymous 
                          ? (comment.anonymousUsername || comment.username || 'Anonymous')
                          : (comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : comment.username || 'User')
                        }
                      </Typography>
                      {comment.isAnonymous && (
                        <Chip 
                          label="Anonymous" 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                          color="default"
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        • {formatDate(comment.createdAt)}
                        {comment.isEdited && ' (edited)'}
                      </Typography>
                    </Box>

                    {user?.id === comment.userId && !comment.isAnonymous && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, comment.id)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {editingCommentId === comment.id ? (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        disabled={submitting}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEditComment(comment.id)}
                          disabled={submitting || !editingContent.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent('');
                          }}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Comment Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const comment = comments.find(c => c.id === selectedCommentId);
          if (comment) handleStartEdit(comment);
        }}>
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => selectedCommentId && handleDeleteComment(selectedCommentId)}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BookComments;
