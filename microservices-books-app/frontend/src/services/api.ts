import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = (window as any)?.process?.env?.REACT_APP_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem('authToken', token);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error: any) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const apiError = {
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors || {},
        statusCode: error.response.status,
      };
      throw apiError;
    } else if (error.request) {
      // Request made but no response received
      const networkError = new Error('Network error. Please check your connection.');
      (networkError as any).statusCode = 0;
      throw networkError;
    } else {
      // Something else happened
      const unexpectedError = new Error(error.message || 'An unexpected error occurred');
      (unexpectedError as any).statusCode = 0;
      throw unexpectedError;
    }
  }
};

// HTTP Methods
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

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// Download file helper
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

export default apiClient;