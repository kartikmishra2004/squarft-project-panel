// BACKUP VERSION - Auth Service without AsyncStorage
// Use this if AsyncStorage continues to cause issues
// To use: rename this file to authService.js

import api from './api';

export const authService = {
  // Register project developer
  register: async (userData) => {
    try {
      console.log('🔵 [AUTH SERVICE] Register attempt with data:', {
        full_name: `${userData.first_name} ${userData.last_name}`.trim(),
        company_name: userData.company_name,
        rera_number: userData.rera_number,
        phone: userData.phone,
        location: userData.location,
        password: '***hidden***',
      });

      const response = await api.post('/api/project-developer/auth/register', {
        full_name: `${userData.first_name} ${userData.last_name}`.trim(),
        company_name: userData.company_name,
        rera_number: userData.rera_number,
        phone: userData.phone,
        location: userData.location,
        password: userData.password,
      });
      
      console.log(' [AUTH SERVICE] Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error(' [AUTH SERVICE] Register error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Registration failed',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  // Login project developer
  login: async (phone, password) => {
    try {
      console.log('🔵 [AUTH SERVICE] Login attempt for phone:', phone);

      const response = await api.post('/api/project-developer/auth/login', {
        phone,
        password,
      });

      console.log(' [AUTH SERVICE] Login response:', {
        success: response.data.success,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
      });

      // No storage - token will be in Redux only
      console.log('ℹ️ [AUTH SERVICE] Token stored in Redux only (no persistent storage)');

      return response.data;
    } catch (error) {
      console.error(' [AUTH SERVICE] Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  // Logout
  logout: async () => {
    console.log('ℹ️ [AUTH SERVICE] Logout (no storage to clear)');
  },

  // Get stored token (always returns null in this version)
  getToken: async () => {
    return null;
  },

  // Get stored user data (always returns null in this version)
  getUserData: async () => {
    return null;
  },

  // Check if user is authenticated (always returns false in this version)
  isAuthenticated: async () => {
    return false;
  },
};
