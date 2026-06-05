import api from './api';

const requestWithFallback = async (primaryRequest, fallbackRequest) => {
  try {
    return await primaryRequest();
  } catch (error) {
    if (!fallbackRequest || (error.response?.status !== 404 && error.response?.status !== 405)) {
      throw error;
    }

    return fallbackRequest();
  }
};

const normalizeServiceError = (error, fallbackMessage) => ({
  message: error.response?.data?.message || error.message || fallbackMessage,
  status: error.response?.status,
  details: error.response?.data,
});

export const dealService = {
  // Get all deals for a project
  getDealsByProjectId: async (projectId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching deals for project:', projectId);
      const response = await requestWithFallback(
        () => api.get(`/api/project-developer/projects/${projectId}/deals`),
        () => requestWithFallback(
          () => api.get(`/api/v1/project-panel/projects/${projectId}/deals`),
          () => api.get(`/api/project-panel/projects/${projectId}/deals`)
        )
      );
      console.log('✅ [DEAL SERVICE] Deals received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get deals error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw normalizeServiceError(error, 'Failed to fetch deals');
    }
  },

  // Get deal by ID
  getDealById: async (dealId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching deal:', dealId);
      const response = await requestWithFallback(
        () => api.get(`/api/v1/project-panel/deals/${dealId}`),
        () => api.get(`/api/project-panel/deals/${dealId}`)
      );
      console.log('✅ [DEAL SERVICE] Deal received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get deal error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw normalizeServiceError(error, 'Failed to fetch deal');
    }
  },

  // Get payment schedule for a deal
  getPaymentSchedule: async (dealId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching payment schedule for deal:', dealId);
      const response = await requestWithFallback(
        () => api.get(`/api/project-panel/inventory-deals/${dealId}/payment-schedule`),
        () => requestWithFallback(
          () => api.get(`/api/v1/project-panel/deals/${dealId}/payment-schedule`),
          () => api.get(`/api/project-panel/deals/${dealId}/payment-schedule`)
        )
      );
      console.log('✅ [DEAL SERVICE] Payment schedule received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get payment schedule error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw normalizeServiceError(error, 'Failed to fetch payment schedule');
    }
  },

  // Get payment transactions for a deal
  getPaymentTransactions: async (dealId) => {
    try {
      console.log('🔵 [DEAL SERVICE] Fetching payment transactions for deal:', dealId);
      const response = await requestWithFallback(
        () => api.get(`/api/v1/project-panel/deals/${dealId}/payment-transactions`),
        () => api.get(`/api/project-panel/deals/${dealId}/payment-transactions`)
      );
      console.log('✅ [DEAL SERVICE] Payment transactions received:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Get payment transactions error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw normalizeServiceError(error, 'Failed to fetch payment transactions');
    }
  },
  
  // Collect payment for a deal
  collectPayment: async (dealId, paymentData) => {
    try {
      console.log('🔵 [DEAL SERVICE] Collecting payment for deal:', dealId);
      const response = await requestWithFallback(
        paymentData.milestone_id
          ? () => api.post(`/api/project-panel/inventory-deal-milestones/${paymentData.milestone_id}/collect`, paymentData)
          : () => Promise.reject({ response: { status: 404 } }),
        () => requestWithFallback(
          () => api.post(`/api/v1/project-panel/deals/${dealId}/payments/collect`, paymentData),
          () => api.post(`/api/project-panel/deals/${dealId}/payments/collect`, paymentData)
        )
      );
      console.log('✅ [DEAL SERVICE] Payment collected:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ [DEAL SERVICE] Collect payment error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw normalizeServiceError(error, 'Failed to collect payment');
    }
  },

  // Get clicked inventory unit details for the deal/property modal
  getInventoryUnitDetails: async (unitId) => {
    try {
      console.log('[DEAL SERVICE] Fetching inventory unit details:', unitId);
      const response = await requestWithFallback(
        () => api.get(`/api/project-developer/inventory-units/${unitId}/details`),
        () => api.get(`/api/v1/project-developer/inventory-units/${unitId}/details`)
      );
      console.log('[DEAL SERVICE] Inventory unit details received:', response.data);
      return response.data;
    } catch (error) {
      console.log('[DEAL SERVICE] Get inventory unit details error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw normalizeServiceError(error, 'Failed to fetch inventory unit details');
    }
  },
};
