// frontend/organizations/src/components/OrgHeader/OrgHeader.jsx
import React, { useState } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useOrganization } from '../../context/OrganizationContext';
import './OrgHeader.css';

export default function OrgHeader({ toggleSidebar }) {
  const { organization } = useOrganization();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="org-header">
      <div className="header-left">
        <button onClick={toggleSidebar} className="menu-btn">
          <Menu size={24} />
        </button>
        <div className="header-breadcrumb">
          <span className="breadcrumb-text">University Partner Portal</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Dashboard</span>
        </div>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
          />
        </div>

        <button 
          className="notification-btn"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <div className="user-avatar">
            {organization?.name?.substring(0, 2).toUpperCase() || 'SW'}
          </div>
          <div className="user-info">
            <div className="user-name">{organization?.name || 'Sarah Wilson'}</div>
            <div className="user-org">Tech Foundation Inc.</div>
          </div>
        </div>
      </div>
    </header>
  );
}