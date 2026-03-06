import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAdmin, ROLE_DISPLAY, MENU_BY_ROLE, ROLE_COLOR } from '../../context/AdminContext';
import './AdminHeader.css';

export default function AdminHeader({ toggleSidebar }) {
  const { admin, currentRole } = useAdmin();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = admin?.username || admin?.name || 'Admin';
  const roleLabel = ROLE_DISPLAY[currentRole] || currentRole || 'Quản trị Hệ thống';
  const roleColor = ROLE_COLOR[currentRole] || 'var(--neu-navy-deep)';
  const initials = displayName.substring(0, 2).toUpperCase();

  // Dynamic breadcrumb logic
  const currentPath = location.pathname;
  const menuSections = MENU_BY_ROLE[currentRole] || [];
  const allItems = menuSections.flatMap(section => section.items);
  const currentItem = allItems.find(item => item.path === currentPath) ||
    allItems.find(item => currentPath.startsWith(item.path) && item.path !== '/dashboard') ||
    { label: 'Tổng quan' };

  const safeRoleLabel = String(roleLabel || 'Quản trị');
  const departmentShortName = safeRoleLabel.replace('Phòng ', '').replace('Văn phòng ', '');

  return (
    <header className="admin-header card-neu">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="breadcrumb-text">{departmentShortName}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{currentItem.label}</span>
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
            style={{ background: 'var(--neu-azure-light)', color: 'var(--neu-azure)', border: `2px solid var(--neu-azure-light)` }}
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