import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Settings, LogOut, Shield, ClipboardList,
  Lock, ClipboardCheck, UserCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import './AdminSidebar.css';

const MENU_BY_ROLE = {
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
        { path: '/settings', icon: Settings, label: 'Cài đặt' }
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
    },
    {
      section: 'HỆ THỐNG',
      items: [
        { path: '/settings', icon: Settings, label: 'Cài đặt' }
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
        { path: '/classes', icon: ClipboardList, label: 'Lớp học phần' },
      ]
    },
    {
      section: 'HỆ THỐNG',
      items: [
        { path: '/settings', icon: Settings, label: 'Cài đặt' }
      ]
    }
  ],
};

const DEFAULT_MENU = [
  { section: 'QUẢN LÝ', items: [{ path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' }] }
];

const ROLE_LABEL = {
  ADMIN: 'Quản trị hệ thống',
  QL_DAO_TAO: 'Phòng QLĐT',
  KHAO_THI: 'Phòng Khảo thí',
  KHOA: 'Văn phòng Khoa',
};

export default function AdminSidebar({ isOpen }) {
  const { logout, currentRole } = useAdmin();
  const menuItems = MENU_BY_ROLE[currentRole] || DEFAULT_MENU;

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <div className="sidebar-role-badge">
          <Shield size={16} />
          {isOpen && <span>{ROLE_LABEL[currentRole] || 'Admin'}</span>}
        </div>

        {menuItems.map((section, idx) => (
          <div key={idx} className="nav-section">
            {isOpen && <div className="nav-section-title">{section.section}</div>}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} className="nav-icon" />
                {isOpen && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          {isOpen && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}