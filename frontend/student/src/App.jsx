import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import Layout from './components/Layout';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentCertificates from './pages/StudentCertificates';
import StudentScholarships from './pages/StudentScholarships';
import CourseRegistration from './pages/CourseRegistration';
import StudentGrades from './pages/StudentGrades';

export default function App() {
  return (
    <Router>
      <StudentProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="certificates" element={<StudentCertificates />} />
            <Route path="scholarships" element={<StudentScholarships />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="course-registration" element={<CourseRegistration />} />
          </Route>
        </Routes>
      </StudentProvider>
    </Router>
  );
}