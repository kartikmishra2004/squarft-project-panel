import api from './api';

export const projectService = {
  // Get all projects for the logged-in user
  listProjects: async () => {
    try {
      console.log('🔵 [PROJECT SERVICE] Fetching projects list');
      const response = await api.get('/api/v1/projects/list');
      console.log('✅ [PROJECT SERVICE] Projects received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [PROJECT SERVICE] List projects error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch projects',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  // Get project details by ID
  getProjectDetails: async (projectId) => {
    try {
      console.log('🔵 [PROJECT SERVICE] Fetching project details for:', projectId);
      const response = await api.get(`/api/v1/projects/${projectId}`);
      console.log('✅ [PROJECT SERVICE] Project details received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [PROJECT SERVICE] Get project details error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch project details',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },
};
