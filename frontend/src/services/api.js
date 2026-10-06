import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle token expiration (401)
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

export default api;
