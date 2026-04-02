// frontend/organizations/src/services/applicationService.js
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

const applicationService = {
  // Get all applications
  getAllApplications: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/partners/applications?${queryParams}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get application by ID
  getApplicationById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/partners/applications/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (id, status, notes = '') => {
    try {
      const response = await axios.patch(
        `${API_URL}/partners/applications/${id}/status`,
        { status, notes },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Approve application
  approveApplication: async (id, notes = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/partners/applications/${id}/approve`,
        { notes },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  },

  // Reject application
  rejectApplication: async (id, reason = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/partners/applications/${id}/reject`,
        { reason },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  },

  // Get application statistics
  getApplicationStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/partners/applications/stats`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  },

  // Download application document
  downloadDocument: async (applicationId, documentType) => {
    try {
      const response = await axios.get(
        `${API_URL}/partners/applications/${applicationId}/documents/${documentType}`,
        {
          ...getAuthHeader(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },

  // Log audit event for Data Leak Prevention (DLP)
  logAudit: async (action, targetId, details = '') => {
    try {
      const response = await axios.post(
        `${API_URL}/audit/log`,
        { action, target_id: targetId, details },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error logging audit:', error);
      // Non-blocking error
    }
  }
};

export default applicationService;