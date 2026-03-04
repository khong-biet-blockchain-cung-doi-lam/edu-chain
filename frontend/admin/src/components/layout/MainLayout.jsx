import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import AdminHeader from '../AdminHeader/AdminHeader';
import NEUHeader from '@shared/components/layout/NEUHeader';
import NEUFooter from '@shared/components/layout/NEUFooter';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="portal-wrapper">
      <NEUHeader />
      <div className="main-layout admin-portal">
        <AdminSidebar isOpen={sidebarOpen} />
        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
          <main className="content-area">
            <div className="portal-content">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <NEUFooter />
    </div>
  );
}