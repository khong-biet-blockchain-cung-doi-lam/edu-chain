// frontend/admin/src/services/reportService.js
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

const reportService = {
  // Get system overview
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

  // Get enrollment report
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

  // Get academic performance report
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

  // Get financial report
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

  // Generate report
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

  // Export report
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

  // Get recent reports
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
  }
};

export default reportService;