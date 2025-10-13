import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Paper,
  LinearProgress
} from '@mui/material';

interface LoadingProps {
  message?: string;
  variant?: 'circular' | 'linear' | 'backdrop';
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  transparent?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  variant = 'circular',
  size = 'medium',
  fullScreen = false,
  transparent = false
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  const renderCircular = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={3}
    >
      <CircularProgress size={getSize()} />
      {message && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderLinear = () => (
    <Box width="100%" position="relative">
      <LinearProgress />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mt={1}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderBackdrop = () => (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: transparent ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)'
      }}
      open={true}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <CircularProgress color="inherit" size={getSize()} />
        {message && (
          <Typography variant="h6" color="inherit" textAlign="center">
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );

  if (variant === 'backdrop') {
    return renderBackdrop();
  }

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor={transparent ? 'rgba(255, 255, 255, 0.8)' : 'background.default'}
        zIndex={(theme) => theme.zIndex.modal}
      >
        <Paper elevation={transparent ? 0 : 3} sx={{ p: 3, backgroundColor: transparent ? 'transparent' : undefined }}>
          {variant === 'linear' ? renderLinear() : renderCircular()}
        </Paper>
      </Box>
    );
  }

  return variant === 'linear' ? renderLinear() : renderCircular();
};

// Specialized loading components for common use cases
export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading page...' }) => (
  <Loading variant="circular" size="large" fullScreen message={message} />
);

export const InlineLoading: React.FC<{ message?: string; size?: 'small' | 'medium' | 'large' }> = ({ 
  message = 'Loading...', 
  size = 'small' 
}) => (
  <Loading variant="circular" size={size} message={message} />
);

export const ProgressLoading: React.FC<{ message?: string }> = ({ message = 'Please wait...' }) => (
  <Loading variant="linear" message={message} />
);

export const OverlayLoading: React.FC<{ message?: string; transparent?: boolean }> = ({ 
  message = 'Loading...', 
  transparent = false 
}) => (
  <Loading variant="backdrop" message={message} transparent={transparent} />
);

export default Loading;