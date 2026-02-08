// frontend/admin/src/services/settingsService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/settings`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update general settings
  updateGeneralSettings: async (settings) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/settings/general`,
        settings,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  },

  // Update security settings
  updateSecuritySettings: async (settings) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/settings/security`,
        settings,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  },

  // Update email settings
  updateEmailSettings: async (settings) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/settings/email`,
        settings,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating email settings:', error);
      throw error;
    }
  },

  // Test email configuration
  testEmailConfig: async (emailData) => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/settings/email/test`,
        emailData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error testing email:', error);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/settings/notifications`,
        settings,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  // Get database info
  getDatabaseInfo: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/settings/database/info`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching database info:', error);
      throw error;
    }
  },

  // Optimize database
  optimizeDatabase: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/settings/database/optimize`,
        {},
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error optimizing database:', error);
      throw error;
    }
  },

  // Update backup settings
  updateBackupSettings: async (settings) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/settings/backup`,
        settings,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating backup settings:', error);
      throw error;
    }
  },

  // Create backup now
  createBackup: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/settings/backup/create`,
        {},
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  },

  // Download backup
  downloadBackup: async (backupId) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/settings/backup/${backupId}/download`,
        {
          ...getAuthHeader(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw error;
    }
  }
};

export default settingsService;