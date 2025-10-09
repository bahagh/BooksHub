import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
} from '@mui/material';

const BookDetailsPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book Details Page
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            This page will show detailed information about a specific book,
            including ratings, comments, and reading options.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookDetailsPage;