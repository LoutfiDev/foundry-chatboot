import axios from 'axios';
import { authService } from '@/services/authService';

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization headers
axiosClient.interceptors.request.use( config => {
    const token = authService.getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosClient.interceptors.response.use( response => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Unauthorized access - redirecting to login');
          authService.logout();
          window.location.href = '/';
          break;
          
        case 403:
          console.error('Forbidden access');
          throw new Error('You do not have permission to perform this action');
          
        case 404:
          console.error('Resource not found');
          throw new Error('The requested resource was not found');
          
        case 500:
          console.error('Internal server error');
          throw new Error('Internal server error. Please try again later.');
          
        default:
          console.error(`API Error ${status}:`, data);
          throw new Error(data?.message || `Server error: ${status}`);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
      throw new Error('Request configuration error');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
