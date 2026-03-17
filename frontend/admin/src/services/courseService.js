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

const courseService = {
  getAllCourses: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/academic/subjects?${queryParams}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getCourseById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/academic/subjects/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  createCourse: async (courseData) => {
    try {
      const response = await axios.post(
        `${API_URL}/academic/subjects`,
        courseData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  updateCourse: async (id, courseData) => {
    try {
      const response = await axios.put(
        `${API_URL}/academic/subjects/${id}`,
        courseData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/academic/subjects/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  getCourseStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/academic/subjects/statistics`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      throw error;
    }
  },

  getCoursesByDepartment: async (department) => {
    try {
      const response = await axios.get(
        `${API_URL}/academic/subjects/department/${department}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by department:', error);
      throw error;
    }
  }
};

export default courseService;