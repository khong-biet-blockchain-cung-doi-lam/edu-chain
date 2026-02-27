import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ClipboardList
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import './AdminSidebar.css';

export default function AdminSidebar({ isOpen }) {
  const { logout } = useAdmin();

  const menuItems = [
    { 
      section: 'QUẢN LÝ',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/users', icon: Users, label: 'Người dùng' },
        { path: '/programs', icon: GraduationCap, label: 'Ngành học' },
        { path: '/courses', icon: BookOpen, label: 'Học phần' },
        { path: '/classes', icon: ClipboardList, label: 'Lớp học phần' }
      ]
    },
    {
      section: 'PHÂN TÍCH',
      items: [
        { path: '/reports', icon: BarChart3, label: 'Báo cáo' }
      ]
    },
    {
      section: 'HỆ THỐNG',
      items: [
        { path: '/settings', icon: Settings, label: 'Cài đặt' }
      ]
    }
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield size={24} />
          </div>
          {isOpen && <span className="logo-text">Quản trị viên</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((section, idx) => (
          <div key={idx} className="nav-section">
            {isOpen && <div className="nav-section-title">{section.section}</div>}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
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