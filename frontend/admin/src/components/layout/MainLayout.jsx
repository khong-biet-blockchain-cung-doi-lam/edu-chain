import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import NEUHeader from '@shared/components/layout/NEUHeader';
import NEUFooter from '@shared/components/layout/NEUFooter';
import { useAdmin, ROLE_DISPLAY } from '../../context/AdminContext';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentRole } = useAdmin();
  const roleLabel = ROLE_DISPLAY[currentRole] || "QUẢN TRỊ";

  return (
    <div className="portal-wrapper">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <NEUHeader roleLabel={roleLabel.toUpperCase()} />
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        <main className="content-area">
          <div className="portal-content">
            <Outlet />
          </div>
        </main>

        <NEUFooter />
      </div>
    </div>
  );
}