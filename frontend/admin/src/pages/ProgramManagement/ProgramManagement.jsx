// frontend/admin/src/pages/ProgramManagement/ProgramManagement.jsx
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import './ProgramManagement.css';

export default function ProgramManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const programs = [
    {
      id: 1,
      name: 'Computer Science',
      code: 'CS',
      department: 'Engineering',
      duration: '4 years',
      credits: 120,
      students: 1250,
      courses: 45,
      status: 'active'
    },
    {
      id: 2,
      name: 'Business Administration',
      code: 'BA',
      department: 'Business',
      duration: '4 years',
      credits: 120,
      students: 980,
      courses: 38,
      status: 'active'
    },
    {
      id: 3,
      name: 'Electrical Engineering',
      code: 'EE',
      department: 'Engineering',
      duration: '4 years',
      credits: 126,
      students: 650,
      courses: 42,
      status: 'active'
    },
    {
      id: 4,
      name: 'Data Science',
      code: 'DS',
      department: 'IT',
      duration: '4 years',
      credits: 120,
      students: 520,
      courses: 40,
      status: 'active'
    },
    {
      id: 5,
      name: 'Mathematics',
      code: 'MATH',
      department: 'Science',
      duration: '4 years',
      credits: 120,
      students: 380,
      courses: 35,
      status: 'active'
    }
  ];

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="program-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Program Management</h1>
          <p className="page-subtitle">Manage academic programs and curricula</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add New Program
        </button>
      </div>

      {/* Stats */}
      <div className="program-stats">
        <div className="program-stat-card">
          <div className="stat-icon-wrapper purple">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{programs.length}</div>
            <div className="stat-label">Total Programs</div>
          </div>
        </div>
        <div className="program-stat-card">
          <div className="stat-icon-wrapper blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {programs.reduce((sum, p) => sum + p.students, 0).toLocaleString()}
            </div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="program-stat-card">
          <div className="stat-icon-wrapper green">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {programs.reduce((sum, p) => sum + p.courses, 0)}
            </div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="program-toolbar">
        <div className="search-box-large">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search programs..."
            className="search-input-large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Programs Grid */}
      <div className="programs-grid">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="program-card">
            <div className="program-card-header">
              <div className="program-icon">{program.code}</div>
              <div className="program-actions-dropdown">
                <button className="action-btn-icon">⋮</button>
              </div>
            </div>
            <div className="program-card-body">
              <h3 className="program-name">{program.name}</h3>
              <div className="program-department">{program.department}</div>
              
              <div className="program-details">
                <div className="program-detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{program.duration}</span>
                </div>
                <div className="program-detail-item">
                  <span className="detail-label">Credits:</span>
                  <span className="detail-value">{program.credits}</span>
                </div>
              </div>

              <div className="program-stats-row">
                <div className="program-stat-mini">
                  <Users size={16} />
                  <span>{program.students} students</span>
                </div>
                <div className="program-stat-mini">
                  <BookOpen size={16} />
                  <span>{program.courses} courses</span>
                </div>
              </div>
            </div>
            <div className="program-card-footer">
              <button className="btn-outline">
                <Edit size={16} />
                Edit
              </button>
              <button className="btn-outline danger">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}