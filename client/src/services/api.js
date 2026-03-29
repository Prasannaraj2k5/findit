import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Items API
export const itemsAPI = {
  create: (formData) => api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/items', { params }),
  getOne: (id) => api.get(`/items/${id}`),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  getMyItems: () => api.get('/items/user/my-items'),
  getMatches: (id) => api.get(`/items/${id}/matches`),
};

// Claims API
export const claimsAPI = {
  create: (data) => api.post('/claims', data),
  getMyClaims: () => api.get('/claims/my'),
  getItemClaims: (itemId) => api.get(`/claims/item/${itemId}`),
  approve: (id, note) => api.put(`/claims/${id}/approve`, { note }),
  reject: (id, note) => api.put(`/claims/${id}/reject`, { note }),
  addMessage: (id, content) => api.post(`/claims/${id}/messages`, { content }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getReputation: (id) => api.get(`/users/${id}/reputation`),
  deleteAccount: () => api.delete('/users/account'),
  getNotificationPreferences: () => api.get('/users/notification-preferences'),
  updateNotificationPreferences: (data) => api.put('/users/notification-preferences', data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getItems: (params) => api.get('/admin/items', { params }),
  deleteItem: (id) => api.delete(`/admin/items/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  exportData: () => api.get('/admin/export'),
};

// Leaderboard API (public)
export const leaderboardAPI = {
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
};

// Matches API
export const matchesAPI = {
  getMyMatches: () => api.get('/matches/my'),
  updateStatus: (id, status) => api.put(`/matches/${id}/status`, { status }),
};

export default api;
