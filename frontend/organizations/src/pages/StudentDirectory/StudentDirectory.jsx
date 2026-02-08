// frontend/organizations/src/pages/StudentDirectory/StudentDirectory.jsx
import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import './StudentDirectory.css';

export default function StudentDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const students = [
    {
      id: 1,
      name: 'Emily Martinez',
      initials: 'EM',
      program: 'Computer Science',
      year: 'Junior',
      gpa: '3.92',
      status: 'Active',
      gradient: 'gradient-blue'
    },
    {
      id: 2,
      name: 'James Chen',
      initials: 'JC',
      program: 'Electrical Engineering',
      year: 'Senior',
      gpa: '3.85',
      status: 'Applied',
      gradient: 'gradient-purple'
    },
    {
      id: 3,
      name: 'Sophia Patel',
      initials: 'SP',
      program: 'Mathematics',
      year: 'Sophomore',
      gpa: '4.00',
      status: 'Active',
      gradient: 'gradient-green'
    },
    {
      id: 4,
      name: 'Michael Johnson',
      initials: 'MJ',
      program: 'Mechanical Engineering',
      year: 'Junior',
      gpa: '3.78',
      status: 'Shortlisted',
      gradient: 'gradient-orange'
    },
    {
      id: 5,
      name: 'Aisha Lopez',
      initials: 'AL',
      program: 'Data Science',
      year: 'Senior',
      gpa: '3.95',
      status: 'Active',
      gradient: 'gradient-pink'
    },
    {
      id: 6,
      name: 'David Kim',
      initials: 'DK',
      program: 'Computer Science',
      year: 'Sophomore',
      gpa: '3.88',
      status: 'Applied',
      gradient: 'gradient-cyan'
    }
  ];

  const getStatusClass = (status) => {
    const statusMap = {
      'Active': 'status-active',
      'Applied': 'status-applied',
      'Shortlisted': 'status-shortlisted'
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <div className="student-directory-page">
      <div className="directory-header">
        <div>
          <h1 className="directory-title">Student Directory</h1>
          <p className="directory-subtitle">Browse and manage student profiles</p>
        </div>
        <div className="directory-actions">
          <button className="btn btn-secondary">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="directory-card">
        <div className="directory-toolbar">
          <div className="search-box-large">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search students by name, program, or ID..."
              className="search-input-large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Program</th>
                <th>Year</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-info">
                      <div className={`student-avatar ${student.gradient}`}>
                        {student.initials}
                      </div>
                      <span className="student-name">{student.name}</span>
                    </div>
                  </td>
                  <td className="text-secondary">{student.program}</td>
                  <td className="text-secondary">{student.year}</td>
                  <td className="gpa-cell">{student.gpa}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-link">View Profile →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <div className="pagination-info">
            Showing 1-6 of 1,247 students
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn">
              <ChevronLeft size={18} />
              Previous
            </button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}