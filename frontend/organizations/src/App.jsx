// frontend/organizations/src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { OrganizationProvider } from './context/OrganizationContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <OrganizationProvider>
        <AppRoutes />
      </OrganizationProvider>
    </BrowserRouter>
  );
}