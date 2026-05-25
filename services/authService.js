import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Register project developer
  register: async (userData) => {
    try {
      console.log('🔵 [AUTH SERVICE] Register attempt with data:', {
        full_name: `${userData.first_name} ${userData.last_name}`.trim(),
        company_name: userData.company_name,
        company_type: userData.company_type,
        rera_number: userData.rera_number,
        phone: userData.phone,
        location: userData.location,
        password: '***hidden***',
      });

      const response = await api.post('/api/project-developer/auth/register', {
        full_name: `${userData.first_name} ${userData.last_name}`.trim(),
        company_name: userData.company_name,
        company_type: userData.company_type,
        rera_number: userData.rera_number,
        phone: userData.phone,
        location: userData.location,
        password: userData.password,
      });
      
      console.log(' [AUTH SERVICE] Register response:', response.data);
      return response.data;
    } catch (error) {
      console.log(' [AUTH SERVICE] Register error:', error.response?.status, error.response?.data?.message);
      
      throw {
        message: error.response?.data?.message || error.message || 'Registration failed',
        status: error.response?.status,
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

      const { token, user } = response.data;

      // Store token and user data
      if (token) {
        try {
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          console.log(' [AUTH SERVICE] Token and user data stored');
        } catch (storageError) {
          console.warn('⚠️ [AUTH SERVICE] Could not store token:', storageError.message);
          // Continue anyway - token is in memory
        }
      }

      return response.data;
    } catch (error) {
      console.log(' [AUTH SERVICE] Login error:', error.response?.status, error.response?.data?.message);
      
      throw {
        message: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('⚠️ [AUTH SERVICE] Logout error:', error.message);
    }
  },

  // Get stored token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('⚠️ [AUTH SERVICE] Get token error:', error.message);
      return null;
    }
  },

  // Get stored user data
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('⚠️ [AUTH SERVICE] Get user data error:', error.message);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.warn('⚠️ [AUTH SERVICE] isAuthenticated error:', error.message);
      return false;
    }
  },
};
