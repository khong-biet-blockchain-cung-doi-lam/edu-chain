import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Settings, LogOut, Shield, ClipboardList,
  Lock, ClipboardCheck, UserCheck, Menu, X
} from 'lucide-react';
import { useAdmin, MENU_BY_ROLE } from '../../context/AdminContext';
import './AdminSidebar.css';

// MENU_BY_ROLE moved to AdminContext.jsx

const DEFAULT_MENU = [
  { section: 'QUẢN LÝ', items: [{ path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' }] }
];

const ROLE_LABEL = {
  ADMIN: 'Quản trị hệ thống',
  QL_DAO_TAO: 'Phòng QLĐT',
  KHAO_THI: 'Phòng Khảo thí',
  KHOA: 'Văn phòng Khoa',
};

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const { logout, currentRole } = useAdmin();
  const menuItems = MENU_BY_ROLE[currentRole] || DEFAULT_MENU;

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">

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