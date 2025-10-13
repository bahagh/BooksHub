import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import {
  Error,
  Warning,
  Info,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Refresh,
  Close
} from '@mui/icons-material';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  title?: string;
  showDetails?: boolean;
  variant?: 'alert' | 'page' | 'inline';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  title,
  showDetails = false,
  variant = 'alert'
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const getSeverity = () => {
    if (!error?.type) return 'error';
    
    switch (error.type) {
      case 'NETWORK_ERROR':
      case 'AUTH_ERROR':
      case 'SERVER_ERROR':
        return 'error';
      case 'VALIDATION_ERROR':
      case 'FORBIDDEN_ERROR':
        return 'warning';
      case 'NOT_FOUND_ERROR':
        return 'info';
      default:
        return 'error';
    }
  };

  const getIcon = () => {
    const severity = getSeverity();
    switch (severity) {
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return <Error />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (error?.type) {
      case 'NETWORK_ERROR':
        return 'Connection Problem';
      case 'AUTH_ERROR':
        return 'Authentication Error';
      case 'VALIDATION_ERROR':
        return 'Invalid Input';
      case 'FORBIDDEN_ERROR':
        return 'Access Denied';
      case 'NOT_FOUND_ERROR':
        return 'Not Found';
      case 'SERVER_ERROR':
        return 'Server Error';
      default:
        return 'Something went wrong';
    }
  };

  const getMessage = () => {
    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  const renderErrorDetails = () => {
    if (!showDetails && !expanded) return null;

    return (
      <Box mt={2}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" gutterBottom>
          Error Details:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="pre" sx={{ 
          fontSize: '0.75rem',
          overflow: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          p: 1,
          borderRadius: 1,
          maxHeight: '200px'
        }}>
          {JSON.stringify({
            type: error?.type,
            status: error?.status,
            originalError: error?.originalError?.message || error?.originalMessage,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </Typography>
      </Box>
    );
  };

  const renderActions = () => (
    <Box display="flex" gap={1} alignItems="center" mt={2}>
      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
      
      {showDetails && (
        <Button
          variant="text"
          size="small"
          startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </Button>
      )}
    </Box>
  );

  if (variant === 'page') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        p={3}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%', textAlign: 'center' }}>
          <Box display="flex" justifyContent="center" mb={2}>
            {getIcon()}
          </Box>
          
          <Typography variant="h5" component="h1" gutterBottom>
            {getTitle()}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {getMessage()}
          </Typography>

          {renderActions()}
          {renderErrorDetails()}
        </Paper>
      </Box>
    );
  }

  if (variant === 'inline') {
    return (
      <Box my={2}>
        <Alert
          severity={getSeverity()}
          action={
            onDismiss && (
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={onDismiss}
              >
                <Close fontSize="inherit" />
              </IconButton>
            )
          }
        >
          <AlertTitle>{getTitle()}</AlertTitle>
          {getMessage()}
          {renderActions()}
        </Alert>
        
        <Collapse in={expanded}>
          {renderErrorDetails()}
        </Collapse>
      </Box>
    );
  }

  // Default 'alert' variant
  return (
    <Box my={2}>
      <Alert
        severity={getSeverity()}
        action={
          <Box display="flex" alignItems="center">
            {onRetry && (
              <IconButton
                color="inherit"
                size="small"
                onClick={onRetry}
                title="Try Again"
              >
                <Refresh />
              </IconButton>
            )}
            {onDismiss && (
              <IconButton
                color="inherit"
                size="small"
                onClick={onDismiss}
                title="Dismiss"
              >
                <Close />
              </IconButton>
            )}
          </Box>
        }
      >
        <AlertTitle>{getTitle()}</AlertTitle>
        {getMessage()}
        
        {showDetails && (
          <Button
            variant="text"
            size="small"
            startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setExpanded(!expanded)}
            sx={{ mt: 1 }}
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
        )}
      </Alert>
      
      <Collapse in={expanded}>
        {renderErrorDetails()}
      </Collapse>
    </Box>
  );
};

export default ErrorDisplay;