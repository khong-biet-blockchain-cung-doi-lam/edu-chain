import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, Users, GraduationCap } from 'lucide-react';
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
      students: 890,
      courses: 42,
      status: 'active'
    },
    {
      id: 3,
      name: 'Electrical Engineering',
      code: 'EE',
      department: 'Engineering',
      duration: '4 years',
      credits: 130,
      students: 720,
      courses: 48,
      status: 'active'
    },
    {
      id: 4,
      name: 'Data Science',
      code: 'DS',
      department: 'Technology',
      duration: '4 years',
      credits: 120,
      students: 580,
      courses: 38,
      status: 'active'
    },
    {
      id: 5,
      name: 'Mathematics',
      code: 'MATH',
      department: 'Science',
      duration: '4 years',
      credits: 120,
      students: 340,
      courses: 27,
      status: 'active'
    }
  ];

  const stats = [
    { label: 'Total Programs', value: programs.length, icon: BookOpen, color: 'purple' },
    { label: 'Total Students', value: programs.reduce((sum, p) => sum + p.students, 0), icon: Users, color: 'blue' },
    { label: 'Total Courses', value: programs.reduce((sum, p) => sum + p.courses, 0), icon: GraduationCap, color: 'green' }
  ];

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconColor = (color) => {
    const colors = {
      purple: { bg: '#faf5ff', color: '#8b5cf6' },
      blue: { bg: '#eff6ff', color: '#2563eb' },
      green: { bg: '#f0fdf4', color: '#10b981' }
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="program-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Program Management</h1>
          <p className="page-subtitle">Manage academic programs and curricula</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Create New Program
        </button>
      </div>

      {/* Stats */}
      <div className="program-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getIconColor(stat.color);
          return (
            <div key={index} className="program-stat-card">
              <div className="stat-icon" style={{ background: colors.bg, color: colors.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="program-search">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search programs by name, code, or department..."
            className="search-input"
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
              <div className="program-icon">
                <GraduationCap size={24} />
              </div>
              <div className="program-code">{program.code}</div>
            </div>

            <div className="program-card-body">
              <h3 className="program-name">{program.name}</h3>
              <div className="program-department">{program.department}</div>

              <div className="program-details">
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{program.duration}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Credits:</span>
                  <span className="detail-value">{program.credits}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Students:</span>
                  <span className="detail-value">
                    <Users size={14} />
                    {program.students}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Courses:</span>
                  <span className="detail-value">
                    <BookOpen size={14} />
                    {program.courses}
                  </span>
                </div>
              </div>
            </div>

            <div className="program-card-footer">
              <button className="card-btn edit-btn">
                <Edit size={16} />
                Edit
              </button>
              <button className="card-btn delete-btn">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3 className="empty-title">No programs found</h3>
          <p className="empty-text">Try adjusting your search or create a new program</p>
        </div>
      )}
    </div>
  );
}