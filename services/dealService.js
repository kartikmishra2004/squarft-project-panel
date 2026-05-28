import api from './api';

export const dealService = {
  // Get all deals for a project
  getDealsByProjectId: async (projectId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching deals for project:', projectId);
      const response = await api.get(`/api/project-panel/projects/${projectId}/deals`);
      console.log('✅ [DEAL SERVICE] Deals received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get deals error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch deals',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  // Get deal by ID
  getDealById: async (dealId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching deal:', dealId);
      const response = await api.get(`/api/project-panel/deals/${dealId}`);
      console.log('✅ [DEAL SERVICE] Deal received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get deal error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch deal',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  // Get payment schedule for a deal
  getPaymentSchedule: async (dealId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching payment schedule for deal:', dealId);
      const response = await api.get(`/api/project-panel/deals/${dealId}/payment-schedule`);
      console.log('✅ [DEAL SERVICE] Payment schedule received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get payment schedule error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch payment schedule',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  // Get payment transactions for a deal
  getPaymentTransactions: async (dealId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching payment transactions for deal:', dealId);
      const response = await api.get(`/api/project-panel/deals/${dealId}/payment-transactions`);
      console.log('✅ [DEAL SERVICE] Payment transactions received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get payment transactions error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch payment transactions',
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  },
};
