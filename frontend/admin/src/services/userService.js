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

const userService = {
  getAllUsers: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `${API_URL}/management/accounts?${queryParams}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/management/accounts/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post(
        `${API_URL}/management/accounts`,
        userData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(
        `${API_URL}/management/accounts/${id}`,
        userData,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/management/accounts/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/management/accounts/${id}/toggle-status`,
        {},
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  withdrawStudent: async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/management/students/${id}/withdraw`,
        {},
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error withdrawing student:', error);
      throw error;
    }
  },

  unlockStudentProfile: async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/management/students/${id}/unlock`,
        {},
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error unlocking student profile:', error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/management/accounts/statistics`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },

  uploadStudents: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/staff/upload-students`,
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
      console.error('Error uploading students:', error);
      throw error;
    }
  }
};

export default userService;