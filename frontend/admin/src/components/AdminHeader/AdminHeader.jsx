import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import './AdminHeader.css';

export default function AdminHeader({ toggleSidebar }) {
  const { admin } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);

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
          <div className="user-avatar admin-avatar">
            {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="user-info">
            <div className="user-name">{admin?.name || 'Quản trị viên'}</div>
            <div className="user-role">Quản trị Hệ thống</div>
          </div>
        </div>
      </div>
    </header>
  );
}