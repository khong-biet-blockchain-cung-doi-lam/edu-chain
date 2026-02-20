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
  Shield
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import './AdminSidebar.css';

export default function AdminSidebar({ isOpen }) {
  const { logout } = useAdmin();

  const menuItems = [
    { 
      section: 'MANAGEMENT',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/users', icon: Users, label: 'User Management' },
        { path: '/programs', icon: GraduationCap, label: 'Programs' },
        { path: '/courses', icon: BookOpen, label: 'Courses' }
      ]
    },
    {
      section: 'ANALYTICS',
      items: [
        { path: '/reports', icon: BarChart3, label: 'Reports' }
      ]
    },
    {
      section: 'SYSTEM',
      items: [
        { path: '/settings', icon: Settings, label: 'Settings' }
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
          {isOpen && <span className="logo-text">Admin Portal</span>}
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
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}