import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('citimaids_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — only redirect to login on protected admin routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Only force-logout on protected routes, NOT on public endpoints like /services
      const isPublicRoute = url === '/services' || url.startsWith('/services?') || url === '/bookings';
      const isAdminRoute = window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login';
      
      if (!isPublicRoute && isAdminRoute) {
        localStorage.removeItem('citimaids_token');
        localStorage.removeItem('citimaids_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
