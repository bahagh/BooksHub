import { api } from './api';
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
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${this.BASE_URL}/login`,
      credentials
    );
    
    // Store tokens in localStorage
    if (response.data) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${this.BASE_URL}/register`,
      userData
    );
    
    // Store tokens in localStorage
    if (response.data) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  // Google OAuth login
  async googleLogin(googleData: GoogleAuthRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${this.BASE_URL}/google`,
      googleData
    );
    
    // Store tokens in localStorage
    if (response.data) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  // Refresh access token
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<ApiResponse<AuthResponse>>(
      `${this.BASE_URL}/refresh`,
      { refreshToken }
    );
    
    // Update stored tokens
    if (response.data) {
      this.setAuthData(response.data);
    }
    
    return response.data;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await api.post(`${this.BASE_URL}/logout`, { refreshToken });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`${this.BASE_URL}/me`);
    return response.data;
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
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
    
    return response.data;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post(`${this.BASE_URL}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await api.post(`${this.BASE_URL}/forgot-password`, { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post(`${this.BASE_URL}/reset-password`, {
      token,
      newPassword,
    });
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
}

export const authService = new AuthService();
export default authService;