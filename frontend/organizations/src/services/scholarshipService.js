// frontend/organizations/src/services/scholarshipService.js
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

const scholarshipService = {
  // Get all scholarships for organization
  getAllScholarships: async () => {
    try {
      const response = await axios.get(`${API_URL}/scholarships`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      throw error;
    }
  },

  // Get single scholarship by ID
  getScholarshipById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/scholarships/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching scholarship:', error);
      throw error;
    }
  },

  // Create new scholarship
  createScholarship: async (scholarshipData) => {
    try {
      const response = await axios.post(
        `${API_URL}/scholarships`,
        scholarshipData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating scholarship:', error);
      throw error;
    }
  },

  // Update scholarship
  updateScholarship: async (id, scholarshipData) => {
    try {
      const response = await axios.put(
        `${API_URL}/scholarships/${id}`,
        scholarshipData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating scholarship:', error);
      throw error;
    }
  },

  // Delete scholarship
  deleteScholarship: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/scholarships/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      throw error;
    }
  },

  // Get scholarship statistics
  getScholarshipStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/scholarships/stats`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching scholarship stats:', error);
      throw error;
    }
  }
};

export default scholarshipService;