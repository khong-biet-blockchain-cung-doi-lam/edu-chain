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

const reportService = {
  getSystemOverview: async (period = 'month') => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports/overview?period=${period}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching system overview:', error);
      throw error;
    }
  },

  getEnrollmentReport: async (startDate, endDate) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports/enrollment?start=${startDate}&end=${endDate}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment report:', error);
      throw error;
    }
  },

  getAcademicReport: async (semester) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports/academic?semester=${semester}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching academic report:', error);
      throw error;
    }
  },

  getFinancialReport: async (year) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports/financial?year=${year}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  },

  generateReport: async (reportType, params) => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/reports/generate`,
        { type: reportType, params },
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  exportReport: async (reportId, format = 'pdf') => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports/${reportId}/export?format=${format}`,
        {
          ...getAuthHeader(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },

  getRecentReports: async (limit = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports/recent?limit=${limit}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      throw error;
    }
  },

  getDepartmentDistribution: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/reports/department-distribution`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching department distribution:', error);
      throw error;
    }
  }
};

export default reportService;