import React from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

const BooksPage: React.FC = () => {
  // Mock data - replace with real API calls
  const books = [
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Classic Literature',
      rating: 4.5,
      views: 1250,
      comments: 23,
      coverImage: '/api/placeholder/200/300',
      description: 'A classic American novel set in the Jazz Age...',
    },
    {
      id: '2',
      title: '1984',
      author: 'George Orwell',
      genre: 'Dystopian Fiction',
      rating: 4.8,
      views: 2100,
      comments: 45,
      coverImage: '/api/placeholder/200/300',
      description: 'A dystopian social science fiction novel...',
    },
    {
      id: '3',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      genre: 'Classic Literature',
      rating: 4.3,
      views: 1800,
      comments: 32,
      coverImage: '/api/placeholder/200/300',
      description: 'A coming-of-age story set in the American South...',
    },
    {
      id: '4',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      genre: 'Romance',
      rating: 4.6,
      views: 1950,
      comments: 67,
      coverImage: '/api/placeholder/200/300',
      description: 'A romantic novel of manners...',
    },
  ];

  const genres = ['All', 'Classic Literature', 'Dystopian Fiction', 'Romance', 'Science Fiction', 'Mystery'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore Books 📚
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover your next favorite read from our extensive collection
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
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
              <Select value="All" label="Genre">
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
              <Select value="rating" label="Sort By">
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="views">Most Viewed</MenuItem>
                <MenuItem value="recent">Recently Added</MenuItem>
                <MenuItem value="title">Title A-Z</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Books Grid */}
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    {book.rating}
                  </Typography>
                </Box>
              </CardMedia>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom noWrap>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  by {book.author}
                </Typography>
                <Chip 
                  label={book.genre} 
                  size="small" 
                  variant="outlined" 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {book.description}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {book.views}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {book.comments}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button size="small" variant="contained" fullWidth>
                  Read Now
                </Button>
                <Button size="small" variant="outlined">
                  Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Load More Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button variant="outlined" size="large">
          Load More Books
        </Button>
      </Box>
    </Container>
  );
};

export default BooksPage;