import api from './api';

export const authService = {
  // Login POST /api/token/ -> { access, refresh }
  login: async (username, password) => {
    try {
      const response = await api.post('/api/token/', { username, password });
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Invalid credentials or server unavailable.' };
    }
  },

  // Register POST /api/register/ -> { username, password, full_name, age, gender, phone_number, preferred_language }
  register: async (username, email, password, fullName, age, gender, phone, language) => {
    try {
      const payload = {
        username,
        password,
        full_name: fullName || username,
        age: age ? parseInt(age) : 30,
        gender: gender || 'Other',
        phone_number: phone || '',
        preferred_language: language || 'english'
      };
      const response = await api.post('/api/register/', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Registration failed. Please check inputs.' };
    }
  },

  // Fetch Patient Profile GET /api/profile/
  getProfile: async () => {
    try {
      const response = await api.get('/api/profile/');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        authService.logout();
      }
      throw error.response?.data || { detail: 'Failed to load profile' };
    }
  },

  // Update Patient Profile PATCH /api/profile/
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/api/profile/', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update profile' };
    }
  },

  // Logout helper
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('medicare_profile');
  },

  // Token checker
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  }
};
