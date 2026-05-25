import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

console.log('🔧 [API CONFIG] Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    console.log('📤 [API REQUEST]', config.method?.toUpperCase(), config.url);
    console.log('📤 [API REQUEST] Data:', config.data);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 [API REQUEST] Token added');
      }
    } catch (error) {
      console.warn('⚠️ [API REQUEST] Could not access AsyncStorage:', error.message);
      // Continue without token - this is OK for login/register
    }
    return config;
  },
  (error) => {
    console.error(' [API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('📥 [API RESPONSE]', response.status, response.config.url);
    console.log('📥 [API RESPONSE] Data:', response.data);
    return response;
  },
  async (error) => {
    console.error(' [API RESPONSE ERROR]', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        console.log('🔐 [API] Token cleared due to 401');
      } catch (storageError) {
        console.warn('⚠️ [API] Could not clear storage:', storageError.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
