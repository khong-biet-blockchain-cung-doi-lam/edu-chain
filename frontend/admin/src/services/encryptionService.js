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

const encryptionService = {
  // ===== CLUSTERS LIST & STATS =====
  getClusters: async () => {
    const res = await axios.get(`${API_URL}/encrypt/clusters`, getAuthHeader());
    return res.data;
  },

  getStats: async () => {
    const res = await axios.get(`${API_URL}/encrypt/clusters/stats`, getAuthHeader());
    return res.data;
  },

  // ===== ENCRYPT =====
  encryptStudentProfile: async (studentId) => {
    const res = await axios.post(`${API_URL}/encrypt/student-profile/${studentId}`, {}, getAuthHeader());
    return res.data;
  },

  encryptStudentGrades: async (studentId) => {
    const res = await axios.post(`${API_URL}/encrypt/student-grades/${studentId}`, {}, getAuthHeader());
    return res.data;
  },

  // ===== DECRYPT & SEND =====
  decryptCluster: async (clusterId, privateKeyPem = null) => {
    const body = privateKeyPem ? { private_key_pem: privateKeyPem } : {};
    const res = await axios.post(`${API_URL}/decrypt/cluster/${clusterId}`, body, getAuthHeader());
    return res.data;
  },

  sendToBlockchain: async (clusterId, decryptedData) => {
    const res = await axios.post(`${API_URL}/encrypt/send-to-blockchain/${clusterId}`, { data: decryptedData }, getAuthHeader());
    return res.data;
  },

  // ===== STUDENTS LIST (for selection) =====
  getStudents: async () => {
    const res = await axios.get(`${API_URL}/management/accounts?role=SINH_VIEN`, getAuthHeader());
    return res.data;
  },
};

export default encryptionService;
