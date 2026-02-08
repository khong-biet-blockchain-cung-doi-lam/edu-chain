import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppRoutes />
      </AdminProvider>
    </BrowserRouter>
  );
}