import axios from 'axios';
import { API_URL } from '../config/api';

// Create a centralized axios instance with the backend base URL
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Contact form submission
  submitContact: async (data: { name: string; email: string; subject: string; message: string }) => {
    const response = await apiClient.post('/api/contact', data);
    return response.data;
  },

  // Volunteer form submission
  submitVolunteer: async (data: { name: string; email: string; phone: string; message: string }) => {
    const response = await apiClient.post('/api/volunteer', data);
    return response.data;
  },

  // Bhog booking endpoints (for reference - already using API_URL correctly)
  submitFreeBhogBooking: async (data: any) => {
    const response = await apiClient.post('/api/bhog/free-booking', data);
    return response.data;
  },

  submitPaidBhogBooking: async (data: any) => {
    const response = await apiClient.post('/api/bhog/paid-booking', data);
    return response.data;
  },

  // Anudan endpoints (for reference - already using API_URL correctly)
  getAnudanRemaining: async () => {
    const response = await apiClient.get('/api/anudan/remaining');
    return response.data;
  },
};

// Export the axios instance for direct use if needed
export { apiClient };

// For backwards compatibility, also export a fetch-like function
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  console.log(`[API Fetch] ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

export default apiService;