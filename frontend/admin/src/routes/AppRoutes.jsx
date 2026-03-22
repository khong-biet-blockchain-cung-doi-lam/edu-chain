import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import UserManagement from '../pages/UserManagement/UserManagement';
import ProgramManagement from '../pages/ProgramManagement/ProgramManagement';
import CourseManagement from '../pages/CourseManagement/CourseManagement';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';
import ClassManagement from '../pages/ClassManagement/ClassManagement';
import ProfileClusters from '../pages/EncryptionManagement/ProfileClusters';
import GradeClusters from '../pages/EncryptionManagement/GradeClusters';
import GradeManagement from '../pages/GradeManagement/GradeManagement';
import AuditLogs from '../pages/AuditLogs/AuditLogs';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"        element={<Dashboard />} />
        <Route path="users"            element={<UserManagement />} />
        <Route path="programs"         element={<ProgramManagement />} />
        <Route path="courses"          element={<CourseManagement />} />
        <Route path="classes"          element={<ClassManagement />} />
        <Route path="reports"          element={<Reports />} />
        <Route path="settings"         element={<Settings />} />
        {/* Phòng Quản lý Đào tạo */}
        <Route path="profile-clusters" element={<ProfileClusters />} />
        {/* Phòng Khảo thí */}
        <Route path="grade-clusters"   element={<GradeClusters />} />
        <Route path="grade-mgmt"       element={<GradeManagement />} />
        {/* Hệ thống / Audit */}
        <Route path="audit-logs"       element={<AuditLogs />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}