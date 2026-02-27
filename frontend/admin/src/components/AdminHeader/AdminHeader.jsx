import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAdmin, ROLE_DISPLAY } from '../../context/AdminContext';
import './AdminHeader.css';

const ROLE_COLOR = {
  ADMIN:      '#6366f1',
  QL_DAO_TAO: '#0ea5e9',
  KHAO_THI:   '#10b981',
  KHOA:       '#f59e0b',
};

export default function AdminHeader({ toggleSidebar }) {
  const { admin, currentRole } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = admin?.username || admin?.name || 'Admin';
  const roleLabel   = ROLE_DISPLAY[currentRole] || currentRole || 'Quản trị Hệ thống';
  const roleColor   = ROLE_COLOR[currentRole] || '#6366f1';
  const initials    = displayName.substring(0, 2).toUpperCase();

  return (
    <header className="admin-header">
      <div className="header-left">
        <button onClick={toggleSidebar} className="menu-btn">
          <Menu size={24} />
        </button>
        <div className="header-breadcrumb">
          <span className="breadcrumb-text">Cổng Quản trị</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Tổng quan</span>
        </div>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="search-input"
          />
        </div>

        <button
          className="notification-btn"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          <span className="notification-badge">5</span>
        </button>

        <div className="user-menu">
          <div 
            className="user-avatar admin-avatar" 
            style={{ background: `${roleColor}22`, color: roleColor, border: `2px solid ${roleColor}` }}
          >
            {initials}
          </div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role" style={{ color: roleColor }}>
              {roleLabel}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}