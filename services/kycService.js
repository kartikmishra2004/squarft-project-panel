import api from './api';

const getFileName = (asset, fallbackName) => {
  if (asset?.fileName) return asset.fileName;
  const extension = asset?.uri?.split('.').pop()?.split('?')[0] || 'jpg';
  return `${fallbackName}.${extension}`;
};

const toUploadFile = (asset, fallbackName) => ({
  uri: asset.uri,
  name: getFileName(asset, fallbackName),
  type: asset.mimeType || asset.type || 'image/jpeg',
});

const buildKycFormData = ({
  profilePhoto,
  aadharFront,
  aadharBack,
  panCard,
  aadharNumber,
  panNumber,
}) => {
  const formData = new FormData();

  if (profilePhoto?.uri) formData.append('profile_photo', toUploadFile(profilePhoto, 'profile-photo'));
  if (aadharFront?.uri) formData.append('aadhar_front', toUploadFile(aadharFront, 'aadhar-front'));
  if (aadharBack?.uri) formData.append('aadhar_back', toUploadFile(aadharBack, 'aadhar-back'));
  if (panCard?.uri) formData.append('pan_card', toUploadFile(panCard, 'pan-card'));

  formData.append('aadhar_number', (aadharNumber || '').trim());
  formData.append('pan_number', (panNumber || '').trim().toUpperCase());

  return formData;
};

export const kycService = {
  getMyKyc: async () => {
    try {
      const response = await api.get('/api/project-developer/kyc');
      return response.data?.data || null;
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw {
        message: error.response?.data?.message || error.message || 'Unable to fetch KYC status',
        status: error.response?.status,
      };
    }
  },

  uploadKyc: async (payload, hasExistingKyc = false) => {
    const formData = buildKycFormData(payload);
    const request = hasExistingKyc ? api.patch : api.post;

    try {
      const response = await request('/api/project-developer/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      return response.data?.data || null;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'KYC upload failed',
        status: error.response?.status,
      };
    }
  },

  submitKyc: async () => {
    try {
      const response = await api.post('/api/project-developer/kyc/submit');
      return response.data?.data || null;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'KYC submission failed',
        status: error.response?.status,
      };
    }
  },
};
