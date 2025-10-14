import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const USER_SERVICE_URL = (window as any)?.process?.env?.REACT_APP_USER_SERVICE_URL || 'http://localhost:5555';
const BOOKS_SERVICE_URL = (window as any)?.process?.env?.REACT_APP_BOOKS_SERVICE_URL || 'http://localhost:5556';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance for UserService (Auth, User management)
const userServiceClient: AxiosInstance = axios.create({
  baseURL: USER_SERVICE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for BooksService (Books, Ratings, Comments, Analytics)
const booksServiceClient: AxiosInstance = axios.create({
  baseURL: BOOKS_SERVICE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Legacy client for backward compatibility (defaults to UserService)
const apiClient: AxiosInstance = userServiceClient;

// Configure interceptors for UserService
const configureAuthInterceptors = (client: AxiosInstance) => {
  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both clients
configureAuthInterceptors(userServiceClient);
configureAuthInterceptors(booksServiceClient);

// Configure response interceptors for both clients
const configureResponseInterceptors = (client: AxiosInstance) => {
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.response?.status || 'Network Error'}`);
        if (error.response?.data) {
          console.error('Error details:', error.response.data);
        }
      }

      // Handle network errors
      if (!error.response) {
        const networkError = {
          message: 'Network connection failed. Please check your internet connection and try again.',
          type: 'NETWORK_ERROR',
          originalError: error.message
        };
        return Promise.reject(networkError);
      }

      // Handle 401 errors (Unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            console.log('🔄 Attempting token refresh...');
            const response = await axios.post(`${USER_SERVICE_URL}/api/auth/refresh`, {
              refreshToken,
            });

          const newToken = response.data?.data?.token || response.data?.token;
          if (newToken) {
            localStorage.setItem('authToken', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            console.log('✅ Token refreshed successfully');
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login if we're not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?message=Session expired. Please log in again.';
        }
      }
    }

    // Handle 403 errors (Forbidden)
    if (error.response?.status === 403) {
      const forbiddenError = {
        message: 'You do not have permission to perform this action.',
        type: 'FORBIDDEN_ERROR',
        status: 403
      };
      return Promise.reject(forbiddenError);
    }

    // Handle 404 errors
    if (error.response?.status === 404) {
      const notFoundError = {
        message: error.response.data?.message || 'The requested resource was not found.',
        type: 'NOT_FOUND_ERROR',
        status: 404
      };
      return Promise.reject(notFoundError);
    }

    // Handle 500 errors
    if (error.response?.status >= 500) {
      const serverError = {
        message: 'A server error occurred. Please try again later.',
        type: 'SERVER_ERROR',
        status: error.response.status,
        originalMessage: error.response.data?.message
      };
      return Promise.reject(serverError);
    }

    // Handle validation errors (400)
    if (error.response?.status === 400) {
      const validationError = {
        message: error.response.data?.message || 'Invalid request. Please check your input and try again.',
        type: 'VALIDATION_ERROR',
        status: 400,
        details: error.response.data?.errors || error.response.data
      };
      return Promise.reject(validationError);
    }

    // Default error handling
    const genericError = {
      message: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
      type: 'UNKNOWN_ERROR',
      status: error.response?.status,
      originalError: error
    };
    
    return Promise.reject(genericError);
  });
};

// Apply response interceptors to both clients
configureResponseInterceptors(userServiceClient);
configureResponseInterceptors(booksServiceClient);

// Generic API request function with enhanced error handling
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error: any) {
    // Re-throw enhanced errors from interceptor
    if (error.type) {
      throw error;
    }

    // Handle legacy errors
    if (error.response) {
      // Server responded with error status
      const apiError = {
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors || {},
        statusCode: error.response.status,
        type: 'API_ERROR'
      };
      throw apiError;
    } else if (error.request) {
      // Request made but no response received
      const networkError = {
        message: 'Network error. Please check your connection.',
        statusCode: 0,
        type: 'NETWORK_ERROR'
      };
      throw networkError;
    } else {
      // Something else happened
      const unexpectedError = {
        message: error.message || 'An unexpected error occurred',
        statusCode: 0,
        type: 'UNKNOWN_ERROR'
      };
      throw unexpectedError;
    }
  }
};

// HTTP Methods with enhanced error handling
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>({ method: 'GET', url, ...config }),

  post: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    apiRequest<T>({ method: 'POST', url, data, ...config }),

  put: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    apiRequest<T>({ method: 'PUT', url, data, ...config }),

  patch: <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    apiRequest<T>({ method: 'PATCH', url, data, ...config }),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiRequest<T>({ method: 'DELETE', url, ...config }),
};

// Utility function to handle API errors in components
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  if (error?.type === 'NETWORK_ERROR') {
    return error.message;
  }
  
  if (error?.type === 'VALIDATION_ERROR') {
    if (error.details && typeof error.details === 'object') {
      // Handle validation errors with details
      const firstError = Object.values(error.details)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

// Utility function to get current user from token
export const getCurrentUser = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub || payload.userId,
      email: payload.email,
      name: payload.name
    };
  } catch {
    return null;
  }
};

// File upload helper with progress tracking
export const uploadFile = async (
  url: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    return await apiRequest({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// Download file helper with error handling
export const downloadFile = async (
  url: string,
  filename?: string
): Promise<void> => {
  try {
    const response = await apiClient({
      method: 'GET',
      url,
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/api/health');
    return response;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};

// Debug function to test authentication
export const testAuth = async () => {
  try {
    const response = await api.get('/api/auth/test');
    return response;
  } catch (error) {
    console.error('Auth test failed:', error);
    throw error;
  }
};

// Books API client using BooksService
export const booksApi = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await booksServiceClient({ method: 'GET', url, ...config });
      return response.data;
    } catch (error: any) {
      if (error.type) throw error;
      throw {
        message: error.response?.data?.message || 'An error occurred',
        type: 'API_ERROR',
        statusCode: error.response?.status
      };
    }
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await booksServiceClient({ method: 'POST', url, data, ...config });
      return response.data;
    } catch (error: any) {
      if (error.type) throw error;
      throw {
        message: error.response?.data?.message || 'An error occurred',
        type: 'API_ERROR',
        statusCode: error.response?.status
      };
    }
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await booksServiceClient({ method: 'PUT', url, data, ...config });
      return response.data;
    } catch (error: any) {
      if (error.type) throw error;
      throw {
        message: error.response?.data?.message || 'An error occurred',
        type: 'API_ERROR',
        statusCode: error.response?.status
      };
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await booksServiceClient({ method: 'DELETE', url, ...config });
      return response.data;
    } catch (error: any) {
      if (error.type) throw error;
      throw {
        message: error.response?.data?.message || 'An error occurred',
        type: 'API_ERROR',
        statusCode: error.response?.status
      };
    }
  },
};

export default apiClient;