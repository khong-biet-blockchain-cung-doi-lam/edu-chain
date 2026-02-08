// frontend/admin/src/services/programService.js
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

const programService = {
  // Get all programs
  getAllPrograms: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/programs`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  },

  // Get program by ID
  getProgramById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/programs/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching program:', error);
      throw error;
    }
  },

  // Create program
  createProgram: async (programData) => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/programs`,
        programData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },

  // Update program
  updateProgram: async (id, programData) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/programs/${id}`,
        programData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  },

  // Delete program
  deleteProgram: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/admin/programs/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  },

  // Get program statistics
  getProgramStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/programs/statistics`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching program statistics:', error);
      throw error;
    }
  }
};

export default programService;