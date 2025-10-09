import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterFormData } from '../../types';

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username should be at least 3 characters')
    .max(20, 'Username should be at most 20 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .required('Username is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  firstName: yup
    .string()
    .min(2, 'First name should be at least 2 characters')
    .max(50, 'First name should be at most 50 characters'),
  lastName: yup
    .string()
    .min(2, 'Last name should be at least 2 characters')
    .max(50, 'Last name should be at most 50 characters'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const formik = useFormik<RegisterFormData>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      acceptTerms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError('');

      try {
        await register({
          username: values.username,
          email: values.email,
          password: values.password,
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
        });
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleGoogleSignup = async () => {
    // TODO: Implement Google OAuth
    setError('Google signup not implemented yet');
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3,
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              📚 BookHub
            </Typography>
            <Typography variant="h5" component="h2" color="text.secondary">
              Create your account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our community of book lovers
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ width: '100%' }}
          >
            <Grid container spacing={2}>
              {/* Username */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  autoComplete="username"
                  required
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  autoComplete="email"
                  required
                />
              </Grid>

              {/* First Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  autoComplete="given-name"
                />
              </Grid>

              {/* Last Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  autoComplete="family-name"
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  autoComplete="new-password"
                  required
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
                  helperText={
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                  }
                  autoComplete="new-password"
                  required
                />
              </Grid>

              {/* Terms and Conditions */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="acceptTerms"
                      checked={formik.values.acceptTerms}
                      onChange={formik.handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{' '}
                      <Link href="#" underline="hover">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" underline="hover">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                  <Typography variant="caption" color="error" display="block">
                    {formik.errors.acceptTerms}
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || !formik.isValid}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            {/* Google Signup Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
              sx={{ mb: 2, py: 1.5 }}
            >
              Sign up with Google
            </Button>

            {/* Link to Login */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ fontWeight: 'medium' }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;