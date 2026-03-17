// C:\Users\Dunx\edu-chain\frontend\organizations\src\routes\AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import PostScholarship from '../pages/PostScholarship/PostScholarship';
import ScholarshipList from '../pages/ScholarshipList/ScholarshipList';
import StudentDirectory from '../pages/StudentDirectory/StudentDirectory';
import Applications from '../pages/Applications/Applications';
import Analytics from '../pages/Analytics/Analytics';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="scholarships">
          <Route index element={<ScholarshipList />} />
          <Route path="create" element={<PostScholarship />} />
          <Route path="edit/:id" element={<PostScholarship />} />
        </Route>
        <Route path="candidates" element={<StudentDirectory />} />
        <Route path="applications" element={<Applications />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}