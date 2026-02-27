import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminContext = createContext();

// Nhãn hiển thị theo role
export const ROLE_DISPLAY = {
  ADMIN:      'Quản trị hệ thống',
  QL_DAO_TAO: 'Phòng Quản lý Đào tạo',
  KHAO_THI:   'Phòng Khảo thí',
  KHOA:       'Văn phòng Khoa',
};

// Normalize legacy roles → new roles
const LEGACY_ROLE_MAP = {
  'staff': 'QL_DAO_TAO',
  'STAFF': 'QL_DAO_TAO',
  'student': 'SINH_VIEN',
  'lecturer': 'GIANG_VIEN',
  'partner': 'PARTNER',
};

function normalizeRole(rawRole) {
  if (!rawRole) return null;
  const upper = rawRole.toUpperCase();
  // Map legacy → new
  return LEGACY_ROLE_MAP[rawRole] || LEGACY_ROLE_MAP[upper] || upper;
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser  = params.get('userData');

    if (urlToken && urlUser) {
      try {
        localStorage.setItem('authToken', urlToken);
        localStorage.setItem('userData', urlUser);
        // URLSearchParams.get() already decodes once — do NOT double-decode
        const parsedUser = JSON.parse(urlUser);
        const role = normalizeRole(parsedUser.role);
        localStorage.setItem('userRole', role || '');
        setAdmin(parsedUser);
        setCurrentRole(role);
        console.log('[AdminContext] Login URL — role:', role, 'raw:', parsedUser.role);
      } catch (e) {
        console.error('[AdminContext] Failed to parse userData from URL:', e);
      }
      // Xóa params khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const adminData = localStorage.getItem('userData');
      const token     = localStorage.getItem('authToken');
      const savedRole = localStorage.getItem('userRole');
      if (adminData && token) {
        try {
          const parsed = JSON.parse(adminData);
          // Re-normalize in case old localStorage has legacy role
          const role = normalizeRole(savedRole) || normalizeRole(parsed.role);
          setAdmin(parsed);
          setCurrentRole(role);
          console.log('[AdminContext] localStorage — role:', role, 'savedRole:', savedRole);
        } catch (e) {
          console.error('[AdminContext] Failed to parse userData from localStorage:', e);
        }
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

  const value = { admin, currentRole, loading, updateAdmin, logout };

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