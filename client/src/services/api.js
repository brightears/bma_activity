import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - no auth needed, use mock token
api.interceptors.request.use(
  (config) => {
    // Always use mock token for internal use
    config.headers.Authorization = 'Bearer mock-token-for-internal-use';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - simplified, no auth redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just pass through errors, no auth handling needed
    return Promise.reject(error);
  }
);

export default api;