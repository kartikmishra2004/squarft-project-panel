import api from './api';

export const branchService = {
  // Public, unauthenticated list of active branches — used to populate the
  // branch picker on the project-developer registration screen.
  getBranches: async () => {
    try {
      const response = await api.get('/api/v1/branches');
      return response.data?.data || [];
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Unable to fetch branches',
        status: error.response?.status,
      };
    }
  },
};
