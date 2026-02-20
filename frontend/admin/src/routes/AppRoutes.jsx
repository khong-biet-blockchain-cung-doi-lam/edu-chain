import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import UserManagement from '../pages/UserManagement/UserManagement';
import ProgramManagement from '../pages/ProgramManagement/ProgramManagement';
import CourseManagement from '../pages/CourseManagement/CourseManagement';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';

export default function AppRoutes() {
  // TẠM THỜI TẮT CHECK ĐỂ TEST
  // const isAuthenticated = localStorage.getItem('authToken');
  // const userRole = localStorage.getItem('userRole');

  // if (!isAuthenticated || userRole !== 'admin') {
  //   window.location.href = 'http://localhost:5000';
  //   return null;
  // }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="programs" element={<ProgramManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}