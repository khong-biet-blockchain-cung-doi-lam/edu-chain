import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminContext = createContext();

export const ROLE_DISPLAY = {
  ADMIN:      'Quản trị hệ thống',
  QL_DAO_TAO: 'Phòng Quản lý Đào tạo',
  KHAO_THI:   'Phòng Khảo thí',
  KHOA:       'Văn phòng Khoa',
};

const LEGACY_ROLE_MAP = {
  'staff':    'QL_DAO_TAO',
  'STAFF':    'QL_DAO_TAO',
  'student':  'SINH_VIEN',
  'lecturer': 'GIANG_VIEN',
  'partner':  'PARTNER',
};

function normalizeRole(rawRole) {
  if (!rawRole) return null;
  return LEGACY_ROLE_MAP[rawRole] || rawRole.toUpperCase();
}

// =============================================
// Đọc trạng thái ĐỒNG BỘ ngay lúc khởi tạo
// để sidebar không bao giờ thấy currentRole=null
// =============================================
function readInitialState() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser  = params.get('userData');

    if (urlToken && urlUser) {
      // Đến từ redirect sau login
      const parsedUser = JSON.parse(urlUser);
      const role = normalizeRole(parsedUser.role);

      // Lưu ngay vào localStorage
      localStorage.setItem('authToken', urlToken);
      localStorage.setItem('userData', urlUser);
      localStorage.setItem('userRole', role || '');

      // Xóa params khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return { admin: parsedUser, role };
    }
    
    // Từ localStorage (F5 / mở lại trang)
    const savedUser  = localStorage.getItem('userData');
    const savedToken = localStorage.getItem('authToken');
    const savedRole  = localStorage.getItem('userRole');

    if (savedUser && savedToken) {
      const parsed = JSON.parse(savedUser);
      // Re-normalize phòng khi có legacy role cũ trong localStorage
      const role = normalizeRole(savedRole) || normalizeRole(parsed.role);
      // Update localStorage nếu role đã được normalize
      if (role && role !== savedRole) {
        localStorage.setItem('userRole', role);
      }
      return { admin: parsed, role };
    }
  } catch (e) {
    console.error('[AdminContext] readInitialState error:', e);
  }
  return { admin: null, role: null };
}

export function AdminProvider({ children }) {
  // Đọc ngay đồng bộ — không cần useEffect mới có role
  const { admin: initAdmin, role: initRole } = readInitialState();

  const [admin, setAdmin]           = useState(initAdmin);
  const [currentRole, setCurrentRole] = useState(initRole);

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

  const value = { admin, currentRole, updateAdmin, logout };

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