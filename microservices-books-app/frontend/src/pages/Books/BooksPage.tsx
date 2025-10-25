import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { booksService } from '../../services/booksService';
import { Book } from '../../types';

const BooksPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [genres, setGenres] = useState<string[]>(['All']);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  // Load genres on mount
  useEffect(() => {
    loadGenres();
  }, []);

  // Load books when filters change
  useEffect(() => {
    loadBooks(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGenre, sortBy]);

  const loadGenres = async () => {
    try {
      const genreList = await booksService.getGenres();
      setGenres(['All', ...genreList]);
    } catch (err: any) {
      console.error('Failed to load genres:', err);
      setGenres(['All', 'Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Fantasy', 'Biography']);
    }
  };

  const loadBooks = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      const params: any = {
        page: currentPage,
        pageSize: pageSize,
        sortBy: sortBy === 'rating' ? 'averageRating' : sortBy === 'title' ? 'title' : 'createdAt',
        sortDirection: sortBy === 'recent' ? 'desc' : 'asc',
      };

      if (searchQuery.trim()) {
        params.searchTerm = searchQuery.trim();
      }

      if (selectedGenre && selectedGenre !== 'All') {
        params.genre = selectedGenre;
      }

      const response = await booksService.getBooks(params);
      
      if (reset) {
        setBooks(response.items);
        setPage(1);
      } else {
        setBooks([...books, ...response.items]);
      }
      
      setHasMore(response.hasNextPage);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load books:', err);
      setError(err.message || 'Failed to load books. Please try again.');
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleGenreChange = (event: SelectChangeEvent) => {
    setSelectedGenre(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const handleLoadMore = () => {
    setPage(page + 1);
    loadBooks(false);
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Explore Books 📚
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover your next favorite read from our extensive collection
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/books/create')}
          sx={{ minWidth: 150 }}
        >
          + Create Book
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search books, authors, or genres..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select value={selectedGenre} onChange={handleGenreChange} label="Genre">
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={handleSortChange} label="Sort By">
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="title">Title A-Z</MenuItem>
                <MenuItem value="recent">Recently Added</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && books.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : books.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No books found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      background: 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      📖
                    </Typography>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'background.paper',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    >
                      <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
                      <Typography variant="caption" fontWeight="bold">
                        {book.averageRating?.toFixed(1) || 'N/A'}
                      </Typography>
                    </Box>
                  </CardMedia>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap title={book.title}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      by {book.author}
                    </Typography>
                    {book.genre && (
                      <Chip 
                        label={book.genre} 
                        size="small" 
                        variant="outlined" 
                        sx={{ mb: 1 }}
                      />
                    )}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {book.description || 'No description available'}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {book.viewCount || 0}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {book.commentCount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      fullWidth
                      onClick={() => handleBookClick(book.id)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="outlined" 
                size="large"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Load More Books'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default BooksPage;
