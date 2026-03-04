import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LecturerProvider } from './context/LecturerContext';
import Layout from './components/Layout';
import LectureDashboard from './pages/LectureDashboard';
import ClassDetails from './pages/ClassDetails';
import LecturerProfile from './pages/LecturerProfile';
import ClassAssignment from './pages/ClassAssignment';

export default function App() {
  return (
    <Router>
      <LecturerProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LectureDashboard />} />
            <Route path="classes/:id" element={<ClassDetails />} />
            <Route path="profile" element={<LecturerProfile />} />
            <Route path="class-assignment" element={<ClassAssignment />} />
          </Route>
        </Routes>
      </LecturerProvider>
    </Router>
  );
}