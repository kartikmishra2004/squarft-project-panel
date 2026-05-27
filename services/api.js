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
    console.log(' [API REQUEST ERROR]', error);
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
    console.log(' [API RESPONSE ERROR]', {
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

// Project Form APIs
export const projectFormApi = {
    createDraft: (data) => api.post('/api/v1/project-panel/form/draft', data),
    configurePropertyTypes: (projectId, data) => api.put(`/api/v1/project-panel/form/${projectId}/property-types`, data),
    createVariant: (projectId, data) => api.post(`/api/v1/project-panel/form/${projectId}/variants`, data),
    syncGridUnits: (projectId, data) => api.post(`/api/v1/project-panel/form/${projectId}/units/sync`, data),
    uploadCsvUnits: (projectId, formData) => api.post(
        `/api/v1/project-panel/form/${projectId}/units/upload-csv`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 }
    ),
    finalizeStep4: (projectId, data) => api.put(`/api/v1/project-panel/form/${projectId}/step4-finalize`, data),
    finalizeStep5: (projectId, data) => api.put(`/api/v1/project-panel/form/${projectId}/step5-finalize`, data),
    finalizeStep6: (projectId, data) => api.put(`/api/v1/project-panel/form/${projectId}/step6-finalize`, data),
    uploadMedia: (projectId, formData) => api.post(
        `/api/v1/project-panel/form/${projectId}/media`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
    ),
};

// Project Overview APIs
export const projectOverviewApi = {
    getProjectsList: () => api.get('/api/v1/project-panel/overview/list'),
    getProjectOverview: (projectId) => api.get(`/api/v1/project-panel/overview/${projectId}`),
};

export default api;
