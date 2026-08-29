import api from './api';

export const profileService = {
  getMyProfile: async () => {
    try {
      const response = await api.get('/api/v1/profile/me');
      return response.data?.data?.user || null;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Unable to fetch profile',
        status: error.response?.status,
      };
    }
  },

  updateProfilePicture: async (asset) => {
    try {
      const formData = new FormData();
      const extension = asset?.uri?.split('.').pop()?.split('?')[0] || 'jpg';
      formData.append('profilePicture', {
        uri: asset.uri,
        name: asset.fileName || `profile-picture.${extension}`,
        type: asset.mimeType || 'image/jpeg',
      });

      const response = await api.patch('/api/v1/profile/me/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || null;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Unable to update profile picture',
        status: error.response?.status,
      };
    }
  },
};
