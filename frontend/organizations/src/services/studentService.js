// frontend/organizations/src/services/studentService.js
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

const studentService = {
  // Get all students
  getAllStudents: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/students?${queryParams}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  // Search students
  searchStudents: async (searchTerm) => {
    try {
      const response = await axios.get(
        `${API_URL}/students/search?q=${searchTerm}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  },

  // Get student statistics
  getStudentStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/students/stats`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  },

  // Export students data
  exportStudents: async (format = 'csv') => {
    try {
      const response = await axios.get(
        `${API_URL}/students/export?format=${format}`,
        {
          ...getAuthHeader(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting students:', error);
      throw error;
    }
  }
};

export default studentService;