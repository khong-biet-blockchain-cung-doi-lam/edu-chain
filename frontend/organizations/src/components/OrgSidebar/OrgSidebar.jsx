// frontend/organizations/src/components/OrgSidebar/OrgSidebar.jsx
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
  LogOut
} from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import './OrgSidebar.css';

export default function OrgSidebar({ isOpen }) {
  const { organization, logout } = useOrganization();

  const menuItems = [
    { 
      section: 'PLATFORM',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/scholarships', icon: GraduationCap, label: 'Scholarships' },
        { path: '/students', icon: Users, label: 'Student Directory' },
        { path: '/applications', icon: FileText, label: 'Applications' }
      ]
    },
    {
      section: 'ANALYTICS',
      items: [
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/profile', icon: Building2, label: 'Organization Profile' }
      ]
    },
    {
      section: 'ACCOUNT',
      items: [
        { path: '/settings', icon: Settings, label: 'Settings' }
      ]
    }
  ];

  return (
    <aside className={`org-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">EC</div>
          {isOpen && <span className="logo-text">Partner Portal</span>}
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