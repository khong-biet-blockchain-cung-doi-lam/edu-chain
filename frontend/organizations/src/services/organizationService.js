// frontend/organizations/src/services/organizationService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const organizationService = {
  // Get organization profile
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/organization/profile`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update organization profile
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(
        `${API_URL}/organization/profile`,
        profileData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Upload organization logo
  uploadLogo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post(
        `${API_URL}/organization/logo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  // Get organization statistics
  getStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/organization/statistics`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Update settings
  updateSettings: async (settings) => {
    try {
      const response = await axios.put(
        `${API_URL}/organization/settings`,
        settings,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}/organization/change-password`,
        { currentPassword, newPassword },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

export default organizationService;