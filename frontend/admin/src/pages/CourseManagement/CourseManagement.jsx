import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Clock, Users } from 'lucide-react';
import './CourseManagement.css';

export default function CourseManagement() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const courses = [
    {
      id: 1,
      code: 'CS101',
      name: 'Introduction to Programming',
      department: 'Computer Science',
      instructor: 'Dr. John Smith',
      credits: 3,
      students: 120,
      schedule: 'Mon, Wed 9:00-10:30',
      semester: 'Spring 2026',
      status: 'active'
    },
    {
      id: 2,
      code: 'MATH201',
      name: 'Calculus II',
      department: 'Mathematics',
      instructor: 'Prof. Sarah Lee',
      credits: 4,
      students: 85,
      schedule: 'Tue, Thu 10:00-11:30',
      semester: 'Spring 2026',
      status: 'active'
    },
    {
      id: 3,
      code: 'EE301',
      name: 'Digital Signal Processing',
      department: 'Electrical Engineering',
      instructor: 'Dr. Michael Chen',
      credits: 3,
      students: 65,
      schedule: 'Mon, Wed 14:00-15:30',
      semester: 'Spring 2026',
      status: 'active'
    },
    {
      id: 4,
      code: 'DS201',
      name: 'Machine Learning Fundamentals',
      department: 'Data Science',
      instructor: 'Dr. Emily Wang',
      credits: 4,
      students: 95,
      schedule: 'Tue, Thu 13:00-14:30',
      semester: 'Spring 2026',
      status: 'active'
    },
    {
      id: 5,
      code: 'BA105',
      name: 'Marketing Principles',
      department: 'Business',
      instructor: 'Prof. David Brown',
      credits: 3,
      students: 110,
      schedule: 'Wed, Fri 11:00-12:30',
      semester: 'Spring 2026',
      status: 'active'
    },
    {
      id: 6,
      code: 'CS401',
      name: 'Advanced Algorithms',
      department: 'Computer Science',
      instructor: 'Dr. Jane Miller',
      credits: 4,
      students: 45,
      schedule: 'Tue, Thu 15:00-16:30',
      semester: 'Spring 2026',
      status: 'active'
    }
  ];

  const departments = [
    'All Departments',
    'Computer Science',
    'Mathematics',
    'Data Science',
    'Business',
    'Electrical Engineering'
  ];

  const stats = [
    { label: 'Total Courses', value: courses.length },
    { label: 'Active Students', value: courses.reduce((sum, c) => sum + c.students, 0) },
    { label: 'Instructors', value: new Set(courses.map(c => c.instructor)).size }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesDepartment = selectedDepartment === 'all' || 
      course.department === departments.find(d => d === selectedDepartment);
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  return (
    <div className="course-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Management</h1>
          <p className="page-subtitle">Manage courses and schedules</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Create New Course
        </button>
      </div>

      {/* Stats */}
      <div className="course-stats">
        {stats.map((stat, index) => (
          <div key={index} className="course-stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="course-filters">
        <select 
          className="department-filter"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          {departments.map((dept, index) => (
            <option key={index} value={index === 0 ? 'all' : dept}>
              {dept}
            </option>
          ))}
        </select>

        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by course name, code, or instructor..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Department</th>
              <th>Instructor</th>
              <th>Credits</th>
              <th>Students</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>
                  <span className="course-code">{course.code}</span>
                </td>
                <td>
                  <div className="course-info">
                    <div className="course-name">{course.name}</div>
                    <div className="course-semester">{course.semester}</div>
                  </div>
                </td>
                <td>
                  <span className="course-department">{course.department}</span>
                </td>
                <td>
                  <span className="course-instructor">{course.instructor}</span>
                </td>
                <td>
                  <span className="credits-badge">{course.credits}</span>
                </td>
                <td>
                  <div className="students-count">
                    <Users size={14} />
                    {course.students}
                  </div>
                </td>
                <td>
                  <div className="course-schedule">
                    <Clock size={14} />
                    {course.schedule}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="action-btn danger" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCourses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="empty-title">No courses found</h3>
            <p className="empty-text">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}