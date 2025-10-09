import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, AuthContextType } from '../types';
import authService from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const storedUser = authService.getCurrentUserFromStorage();
        const storedToken = authService.getAccessToken();
        
        if (storedUser && storedToken && authService.isAuthenticated()) {
          // Check if token needs refresh
          if (authService.shouldRefreshToken()) {
            try {
              const authData = await authService.refreshToken();
              setUser(authData.user);
              setToken(authData.token);
            } catch (error) {
              // Refresh failed, clear auth data
              authService.logout();
              setUser(null);
              setToken(null);
            }
          } else {
            setUser(storedUser);
            setToken(storedToken);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted auth data
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token periodically
  useEffect(() => {
    if (!user || !token) return;

    const checkTokenExpiry = async () => {
      if (authService.shouldRefreshToken()) {
        try {
          const authData = await authService.refreshToken();
          setUser(authData.user);
          setToken(authData.token);
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, token]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      const authData = await authService.login(credentials);
      setUser(authData.user);
      setToken(authData.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      const authData = await authService.register(userData);
      setUser(authData.user);
      setToken(authData.token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setIsLoading(true);
    
    try {
      authService.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const authData = await authService.refreshToken();
      setUser(authData.user);
      setToken(authData.token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!token && authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;