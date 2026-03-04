import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import OrgSidebar from '../OrgSidebar/OrgSidebar';
import NEUHeader from '@shared/components/layout/NEUHeader';
import NEUFooter from '@shared/components/layout/NEUFooter';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="portal-wrapper">
      <NEUHeader />
      <div className="portal-layout organization-portal">
        <OrgSidebar isOpen={sidebarOpen} />
        <div className={`portal-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="portal-content">
            <Outlet />
          </div>
        </div>
      </div>
      <NEUFooter />
    </div>
  );
}