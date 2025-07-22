import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      // Redirect to login if needed
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Events API
  getEvents: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const response = await api.get(`/events?${params}`);
    return response.data;
  },

  getEventById: async (eventId, userLat = null, userLng = null) => {
    const params = new URLSearchParams();
    if (userLat !== null) params.append('user_lat', userLat.toString());
    if (userLng !== null) params.append('user_lng', userLng.toString());
    
    const response = await api.get(`/events/${eventId}?${params}`);
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  addEventReview: async (eventId, rating, comment) => {
    const params = new URLSearchParams();
    params.append('rating', rating.toString());
    params.append('comment', comment);
    
    const response = await api.post(`/events/${eventId}/reviews?${params}`);
    return response.data;
  },

  rsvpEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/rsvp`);
    return response.data;
  },

  saveEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/save`);
    return response.data;
  },

  getSimilarEvents: async (eventId, userLat = null, userLng = null, limit = 3) => {
    const params = new URLSearchParams();
    if (userLat !== null) params.append('user_lat', userLat.toString());
    if (userLng !== null) params.append('user_lng', userLng.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/events/similar/${eventId}?${params}`);
    return response.data;
  },

  // Organizers API
  getOrganizers: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const response = await api.get(`/organizers?${params}`);
    return response.data;
  },

  getOrganizerById: async (organizerId, userLat = null, userLng = null) => {
    const params = new URLSearchParams();
    if (userLat !== null) params.append('user_lat', userLat.toString());
    if (userLng !== null) params.append('user_lng', userLng.toString());
    
    const response = await api.get(`/organizers/${organizerId}?${params}`);
    return response.data;
  },

  createOrganizer: async (organizerData) => {
    const response = await api.post('/organizers', organizerData);
    return response.data;
  },

  getOrganizerEvents: async (organizerId, userLat = null, userLng = null) => {
    const params = new URLSearchParams();
    if (userLat !== null) params.append('user_lat', userLat.toString());
    if (userLng !== null) params.append('user_lng', userLng.toString());
    
    const response = await api.get(`/organizers/${organizerId}/events?${params}`);
    return response.data;
  },

  getTopNearbyOrganizers: async (userLat, userLng, maxDistance = 25, limit = 5) => {
    const params = new URLSearchParams();
    params.append('user_lat', userLat.toString());
    params.append('user_lng', userLng.toString());
    params.append('max_distance', maxDistance.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/organizers/nearby/top?${params}`);
    return response.data;
  },

  // Authentication API
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // Store token and user data
    if (response.data.success && response.data.data) {
      localStorage.setItem('access_token', response.data.data.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateCurrentUser: async (userData) => {
    const response = await api.put('/auth/me', userData);
    
    // Update local storage
    if (response.data.success && response.data.data) {
      localStorage.setItem('user_data', JSON.stringify(response.data.data));
    }
    
    return response.data;
  },

  getUserSavedEvents: async (userLat = null, userLng = null) => {
    const params = new URLSearchParams();
    if (userLat !== null) params.append('user_lat', userLat.toString());
    if (userLng !== null) params.append('user_lng', userLng.toString());
    
    const response = await api.get(`/auth/me/saved-events?${params}`);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    
    // Update token
    if (response.data.success && response.data.data) {
      localStorage.setItem('access_token', response.data.data.access_token);
    }
    
    return response.data;
  },

  // Utility methods
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default apiService;