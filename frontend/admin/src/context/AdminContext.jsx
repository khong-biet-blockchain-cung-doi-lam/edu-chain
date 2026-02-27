import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminContext = createContext();

// Định nghĩa quyền sidebar theo role
export const ROLE_DISPLAY = {
  ADMIN:      'Quản trị hệ thống',
  QL_DAO_TAO: 'Phòng Quản lý Đào tạo',
  KHAO_THI:   'Phòng Khảo thí',
  KHOA:       'Văn phòng Khoa',
};

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser  = params.get('userData');

    if (urlToken && urlUser) {
      localStorage.setItem('authToken', urlToken);
      localStorage.setItem('userData', urlUser);
      const parsedUser = JSON.parse(decodeURIComponent(urlUser));
      const role = (parsedUser.role || '').toUpperCase();
      localStorage.setItem('userRole', role);
      setAdmin(parsedUser);
      setCurrentRole(role);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const adminData = localStorage.getItem('userData');
      const token     = localStorage.getItem('authToken');
      const savedRole = localStorage.getItem('userRole');
      if (adminData && token) {
        setAdmin(JSON.parse(adminData));
        setCurrentRole((savedRole || '').toUpperCase());
      }
    }
    setLoading(false);
  }, []);

  const updateAdmin = (data) => {
    setAdmin(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:3000';
    window.location.href = loginUrl;
  };

  const value = {
    admin,
    currentRole,    // 'ADMIN' | 'QL_DAO_TAO' | 'KHAO_THI' | 'KHOA'
    loading,
    updateAdmin,
    logout,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}