import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Paper, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { Refresh, Home, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your error reporting service
    console.group('🐛 Error Report');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Stack Trace:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>
                <Box display="flex" alignItems="center" gap={1}>
                  <BugReport />
                  Something went wrong
                </Box>
              </AlertTitle>
              We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
            </Alert>

            <Typography variant="h5" component="h1" gutterBottom>
              Oops! An error occurred
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Don't worry, this happens sometimes. You can try refreshing the page or going back to the home page.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box mt={3} mb={3}>
                <Alert severity="warning">
                  <AlertTitle>Development Error Details</AlertTitle>
                  <Typography variant="body2" component="pre" sx={{ 
                    textAlign: 'left', 
                    overflow: 'auto',
                    maxHeight: '200px',
                    fontSize: '0.75rem'
                  }}>
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </Typography>
                </Alert>
              </Box>
            )}

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                size="large"
              >
                Try Again
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleRefresh}
                size="large"
              >
                Refresh Page
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Home />}
                onClick={this.handleGoHome}
                size="large"
              >
                Go Home
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mt={3}>
              If this problem persists, please contact support.
            </Typography>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;