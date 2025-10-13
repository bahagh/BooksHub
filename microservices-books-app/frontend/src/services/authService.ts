import { api, handleApiError } from './api';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  GoogleAuthRequest,
  ApiResponse,
} from '../types';

class AuthService {
  private readonly BASE_URL = '/api/auth';

  // Login with email and password
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        };
      }

      if (!/\S+@\S+\.\S+/.test(credentials.email)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Please enter a valid email address'
        };
      }

      const response = await api.post<ApiResponse<AuthResponse>>(
        `${this.BASE_URL}/login`,
        credentials
      );
      
      // Store tokens in localStorage
      if (response.data) {
        this.setAuthData(response.data);
        console.log('✅ Login successful');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Handle specific error cases
      if (error.status === 401) {
        throw {
          type: 'AUTH_ERROR',
          message: 'Invalid email or password'
        };
      }
      
      if (error.status === 429) {
        throw {
          type: 'RATE_LIMIT_ERROR',
          message: 'Too many login attempts. Please try again later.'
        };
      }
      
      throw {
        type: error.type || 'LOGIN_ERROR',
        message: handleApiError(error, 'Login failed. Please try again.')
      };
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (!userData.email || !userData.password) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        };
      }

      if (!/\S+@\S+\.\S+/.test(userData.email)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Please enter a valid email address'
        };
      }

      if (userData.password.length < 6) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters long'
        };
      }

      const response = await api.post<ApiResponse<AuthResponse>>(
        `${this.BASE_URL}/register`,
        userData
      );
      
      // Store tokens in localStorage
      if (response.data) {
        this.setAuthData(response.data);
        console.log('✅ Registration successful');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Handle specific error cases
      if (error.status === 409) {
        throw {
          type: 'CONFLICT_ERROR',
          message: 'An account with this email already exists'
        };
      }
      
      if (error.status === 400) {
        throw {
          type: 'VALIDATION_ERROR',
          message: handleApiError(error, 'Invalid registration data')
        };
      }
      
      throw {
        type: error.type || 'REGISTRATION_ERROR',
        message: handleApiError(error, 'Registration failed. Please try again.')
      };
    }
  }

  // Google OAuth login
  async googleLogin(googleData: GoogleAuthRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        `${this.BASE_URL}/google`,
        googleData
      );
      
      // Store tokens in localStorage
      if (response.data) {
        this.setAuthData(response.data);
        console.log('✅ Google login successful');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Google login error:', error);
      throw {
        type: error.type || 'GOOGLE_LOGIN_ERROR',
        message: handleApiError(error, 'Google login failed. Please try again.')
      };
    }
  }

  // Refresh access token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw {
          type: 'AUTH_ERROR',
          message: 'No refresh token available'
        };
      }

      const response = await api.post<ApiResponse<AuthResponse>>(
        `${this.BASE_URL}/refresh`,
        { refreshToken }
      );
      
      // Update stored tokens
      if (response.data) {
        this.setAuthData(response.data);
        console.log('✅ Token refreshed successfully');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Token refresh error:', error);
      this.clearAuthData(); // Clear invalid tokens
      throw {
        type: error.type || 'TOKEN_REFRESH_ERROR',
        message: handleApiError(error, 'Session expired. Please log in again.')
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await api.post(`${this.BASE_URL}/logout`, { refreshToken });
      }
      console.log('✅ Logout successful');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('❌ Logout API call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`${this.BASE_URL}/me`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      
      if (error.status === 401) {
        this.clearAuthData();
        throw {
          type: 'AUTH_ERROR',
          message: 'Session expired. Please log in again.'
        };
      }
      
      throw {
        type: error.type || 'USER_ERROR',
        message: handleApiError(error, 'Failed to get user information')
      };
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>(
        `${this.BASE_URL}/profile`,
        userData
      );
      
      // Update stored user data
      const storedUser = this.getCurrentUserFromStorage();
      if (storedUser) {
        const updatedUser = { ...storedUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      console.log('✅ Profile updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      throw {
        type: error.type || 'PROFILE_UPDATE_ERROR',
        message: handleApiError(error, 'Failed to update profile')
      };
    }
  }

  // Token management methods
  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
    localStorage.setItem('tokenExpiresAt', authData.expiresAt);
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiresAt');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getCurrentUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    
    if (!token || !expiresAt) {
      return false;
    }
    
    // Check if token is expired
    return new Date(expiresAt) > new Date();
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) {
      return true;
    }
    
    return new Date(expiresAt) <= new Date();
  }

  // Auto-refresh token if it's about to expire (within 5 minutes)
  shouldRefreshToken(): boolean {
    const expiresAt = localStorage.getItem('tokenExpiresAt');
    if (!expiresAt) {
      return false;
    }
    
    const expirationTime = new Date(expiresAt);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    return expirationTime <= fiveMinutesFromNow;
  }

  // Utility method to check if error is authentication related
  isAuthError(error: any): boolean {
    return error?.status === 401 || 
           error?.type === 'AUTH_ERROR' || 
           error?.type === 'TOKEN_REFRESH_ERROR';
  }

  // Method to handle authentication errors globally
  handleAuthError(error: any): void {
    if (this.isAuthError(error)) {
      this.clearAuthData();
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?message=Session expired. Please log in again.';
      }
    }
  }

  // Validate token format (basic JWT structure check)
  private isValidTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  }

  // Get token payload
  getTokenPayload(): any {
    const token = this.getAccessToken();
    if (!token || !this.isValidTokenFormat(token)) {
      return null;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // Check if current user has specific role
  hasRole(role: string): boolean {
    const payload = this.getTokenPayload();
    return payload?.role === role || payload?.roles?.includes(role);
  }

  // Check if current user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Request password reset email
  async forgotPassword(email: string): Promise<void> {
    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Please enter a valid email address'
        };
      }

      await api.post<ApiResponse<any>>(`${this.BASE_URL}/forgot-password`, { email });
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      throw {
        type: error.type || 'FORGOT_PASSWORD_ERROR',
        message: handleApiError(error, 'Failed to send password reset email')
      };
    }
  }

  // Reset password with token
  async resetPassword(
    token: string,
    email: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    try {
      if (!token || !email || !newPassword || !confirmPassword) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'All fields are required'
        };
      }

      if (newPassword !== confirmPassword) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Passwords do not match'
        };
      }

      if (newPassword.length < 8) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long'
        };
      }

      await api.post<ApiResponse<any>>(`${this.BASE_URL}/reset-password`, {
        token,
        email,
        newPassword,
        confirmPassword,
      });
      console.log('✅ Password reset successful');
    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      
      if (error.status === 400) {
        throw {
          type: 'INVALID_TOKEN_ERROR',
          message: 'Invalid or expired reset token. Please request a new one.'
        };
      }
      
      throw {
        type: error.type || 'RESET_PASSWORD_ERROR',
        message: handleApiError(error, 'Failed to reset password')
      };
    }
  }

  // Change password (authenticated)
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'All fields are required'
        };
      }

      if (newPassword !== confirmPassword) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'New passwords do not match'
        };
      }

      if (newPassword.length < 8) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long'
        };
      }

      if (currentPassword === newPassword) {
        throw {
          type: 'VALIDATION_ERROR',
          message: 'New password must be different from current password'
        };
      }

      await api.post<ApiResponse<any>>(`${this.BASE_URL}/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      console.log('✅ Password changed successfully');
    } catch (error: any) {
      console.error('❌ Change password error:', error);
      
      if (error.status === 400) {
        throw {
          type: 'INVALID_PASSWORD_ERROR',
          message: 'Current password is incorrect'
        };
      }
      
      throw {
        type: error.type || 'CHANGE_PASSWORD_ERROR',
        message: handleApiError(error, 'Failed to change password')
      };
    }
  }
}

export const authService = new AuthService();
export default authService;