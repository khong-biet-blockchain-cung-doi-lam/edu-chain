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

const classService = {
  getAllClasses: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/academic/classes`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  createClass: async (classData) => {
    try {
      const response = await axios.post(
        `${API_URL}/academic/classes`,
        classData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  assignLecturer: async (classId, lecturerId) => {
    try {
      const response = await axios.post(
        `${API_URL}/academic/classes/${classId}/assign`,
        { lecturer_id: lecturerId },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      throw error;
    }
  }
};

export default classService;
