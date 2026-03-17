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

const dashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard/stats`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getUserGrowth: async (period = '6months') => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard/user-growth?period=${period}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user growth:', error);
      throw error;
    }
  },

  getActivityData: async (period = 'week') => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard/activity?period=${period}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      throw error;
    }
  },

  getRecentActivities: async (limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard/recent-activities?limit=${limit}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  getSystemAlerts: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard/alerts`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  },

  dismissAlert: async (alertId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/admin/dashboard/alerts/${alertId}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      throw error;
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard/system-health`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }
};

export default dashboardService;