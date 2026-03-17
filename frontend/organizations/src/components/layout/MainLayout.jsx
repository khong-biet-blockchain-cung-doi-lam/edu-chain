import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import OrgSidebar from '../OrgSidebar/OrgSidebar';
import NEUHeader from '@shared/components/layout/NEUHeader';
import NEUFooter from '@shared/components/layout/NEUFooter';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="portal-layout organization-portal">
      <OrgSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`portal-main-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <NEUHeader roleLabel="ĐỐI TÁC" />

        <main className="portal-main">
          <div className="portal-content">
            <Outlet />
          </div>
        </main>

        <NEUFooter />
      </div>
    </div>
  );
}