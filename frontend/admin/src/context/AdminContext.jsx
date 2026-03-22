import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Settings, Shield, ClipboardList, Lock,
  ClipboardCheck, UserCheck, Activity
} from 'lucide-react';

const AdminContext = createContext();

export const ROLE_DISPLAY = {
  ADMIN: 'Quản trị hệ thống',
  QL_DAO_TAO: 'Phòng Quản lý Đào tạo',
  KHAO_THI: 'Phòng Khảo thí',
  KHOA: 'Văn phòng Khoa',
};

export const ROLE_COLOR = {
  ADMIN: 'var(--neu-navy-deep)',
  QL_DAO_TAO: 'var(--neu-azure)',
  KHAO_THI: '#10b981',
  KHOA: '#f59e0b',
};

export const MENU_BY_ROLE = {
  ADMIN: [
    {
      section: 'QUẢN TRỊ',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/users', icon: Users, label: 'Tạo tài khoản phòng ban' },
      ]
    },
    {
      section: 'HỆ THỐNG',
      items: [
        { path: '/settings', icon: Settings, label: 'Cài đặt' },
        { path: '/audit-logs', icon: Activity, label: 'Lưu vết hệ thống' }
      ]
    }
  ],

  QL_DAO_TAO: [
    {
      section: 'SINH VIÊN',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/users', icon: Users, label: 'Quản lý Sinh viên' },
      ]
    },
    {
      section: 'MÃ HÓA DỮ LIỆU',
      items: [
        { path: '/profile-clusters', icon: Lock, label: 'Cụm Hồ sơ (Blockchain)' },
      ]
    },
    {
      section: 'QUẢN LÝ HỌC TẬP',
      items: [
        { path: '/programs', icon: GraduationCap, label: 'Ngành học' },
        { path: '/courses', icon: BookOpen, label: 'Học phần' },
        { path: '/classes', icon: ClipboardList, label: 'Lớp học phần' },
      ]
    }
  ],

  KHAO_THI: [
    {
      section: 'ĐIỂM SỐ',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/grade-mgmt', icon: ClipboardCheck, label: 'Quản lý Điểm' },
      ]
    },
    {
      section: 'MÃ HÓA DỮ LIỆU',
      items: [
        { path: '/grade-clusters', icon: Lock, label: 'Cụm Điểm (Blockchain)' },
      ]
    },
    {
      section: 'HỆ THỐNG',
      items: [
        { path: '/settings', icon: Settings, label: 'Cài đặt' }
      ]
    }
  ],

  KHOA: [
    {
      section: 'GIẢNG VIÊN',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/users', icon: UserCheck, label: 'Quản lý Giảng viên' },
      ]
    },
    {
      section: 'HỌC VỤ',
      items: [
        { path: '/classes', icon: ClipboardList, label: 'Phân công giảng viên' },
      ]
    }
  ],
};

const LEGACY_ROLE_MAP = {
  'staff': 'QL_DAO_TAO',
  'STAFF': 'QL_DAO_TAO',
  'student': 'SINH_VIEN',
  'lecturer': 'GIANG_VIEN',
  'partner': 'PARTNER',
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
    const urlUser = params.get('userData');

    if (urlToken && urlUser) {
      // Đến từ redirect sau login
      const parsedUser = JSON.parse(urlUser);
      const role = normalizeRole(parsedUser.role);

      // Lưu ngay vào localStorage
      localStorage.setItem('access_token', urlToken);
      localStorage.setItem('userData', urlUser);
      localStorage.setItem('userRole', role || '');

      // Xóa params khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return { admin: parsedUser, role };
    }

    // Từ localStorage (F5 / mở lại trang)
    const savedUser = localStorage.getItem('userData');
    const savedToken = localStorage.getItem('access_token');
    const savedRole = localStorage.getItem('userRole');

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

  const [admin, setAdmin] = useState(initAdmin);
  const [currentRole, setCurrentRole] = useState(initRole);

  const updateAdmin = (data) => {
    setAdmin(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
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