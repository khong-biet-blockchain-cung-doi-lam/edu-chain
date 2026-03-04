import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileText,
  BarChart3,
  Building2,
  Settings,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import './OrgSidebar.css';

export default function OrgSidebar({ isOpen }) {
  const { organization, logout } = useOrganization();
  // Since toggle logic is usually in Layout, we keep this simple or pass it down

  const menuItems = [
    {
      section: 'NỀN TẢNG',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/scholarships', icon: GraduationCap, label: 'Học bổng' },
        { path: '/students', icon: Users, label: 'Hồ sơ Ứng viên' },
        { path: '/applications', icon: FileText, label: 'Đơn đăng ký' }
      ]
    },
    {
      section: 'PHÂN TÍCH',
      items: [
        { path: '/analytics', icon: BarChart3, label: 'Thống kê' },
        { path: '/profile', icon: Building2, label: 'Hồ sơ Tổ chức' }
      ]
    },
    {
      section: 'TÀI KHOẢN',
      items: [
        { path: '/settings', icon: Settings, label: 'Cài đặt' }
      ]
    }
  ];

  return (
    <aside className={`portal-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <div className="sidebar-org-badge">
          <Building2 size={16} />
          {isOpen && <span>{organization?.name || 'Đối tác'}</span>}
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