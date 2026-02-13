import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  GraduationCap, 
  DollarSign,
  Download,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Reports.css';

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Active Students',
      value: '8,721',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Course Completion',
      value: '91%',
      change: '+2.1%',
      trend: 'up',
      icon: GraduationCap,
      color: 'purple'
    },
    {
      title: 'Avg GPA',
      value: '3.5',
      change: '+0.2',
      trend: 'up',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const enrollmentData = [
    { month: 'Jan', students: 6500, teachers: 450, organizations: 120 },
    { month: 'Feb', students: 7200, teachers: 480, organizations: 135 },
    { month: 'Mar', students: 7800, teachers: 510, organizations: 148 },
    { month: 'Apr', students: 8100, teachers: 530, organizations: 156 },
    { month: 'May', students: 8500, teachers: 560, organizations: 168 },
    { month: 'Jun', students: 8721, teachers: 580, organizations: 175 }
  ];

  const departmentData = [
    { name: 'Engineering', value: 3200, color: '#8b5cf6' },
    { name: 'Business', value: 2100, color: '#ec4899' },
    { name: 'Science', value: 1800, color: '#06b6d4' },
    { name: 'IT', value: 1621, color: '#f59e0b' }
  ];

  const performanceData = [
    { semester: 'Fall 2024', passRate: 88, gpa: 3.3 },
    { semester: 'Spring 2025', passRate: 90, gpa: 3.4 },
    { semester: 'Fall 2025', passRate: 89, gpa: 3.5 },
    { semester: 'Spring 2026', passRate: 91, gpa: 3.5 }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Q4 2025 Financial Report',
      type: 'Financial',
      date: '2026-01-15',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Student Enrollment Analysis',
      type: 'Academic',
      date: '2026-01-10',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Teacher Performance Review',
      type: 'HR',
      date: '2026-01-05',
      size: '3.1 MB'
    },
    {
      id: 4,
      name: 'System Usage Statistics',
      type: 'Technical',
      date: '2026-01-01',
      size: '1.2 MB'
    }
  ];

  const reportTypes = [
    {
      title: 'System Overview',
      description: 'Complete platform statistics and metrics',
      icon: '📊'
    },
    {
      title: 'Enrollment Report',
      description: 'Student and teacher registration data',
      icon: '📈'
    },
    {
      title: 'Academic Performance',
      description: 'Grades, completion rates, and GPA analysis',
      icon: '🎓'
    },
    {
      title: 'Financial Report',
      description: 'Revenue, expenses, and budget analysis',
      icon: '💰'
    }
  ];

  const getStatColor = (color) => {
    const colors = {
      green: { bg: '#f0fdf4', color: '#10b981' },
      blue: { bg: '#eff6ff', color: '#2563eb' },
      purple: { bg: '#faf5ff', color: '#8b5cf6' },
      orange: { bg: '#fff7ed', color: '#f97316' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">View and generate system reports</p>
        </div>
        <div className="header-actions">
          <select 
            className="period-selector"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="btn btn-primary">
            <Download size={18} />
            Export All
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="report-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getStatColor(stat.color);
          return (
            <div key={index} className="report-stat-card">
              <div className="stat-header">
                <div className="stat-info">
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-change positive">{stat.change}</div>
                </div>
                <div className="stat-icon" style={{ background: colors.bg, color: colors.color }}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Types */}
      <div className="report-types">
        <h2 className="section-title">Generate Reports</h2>
        <div className="report-types-grid">
          {reportTypes.map((type, index) => (
            <div key={index} className="report-type-card">
              <div className="report-type-icon">{type.icon}</div>
              <h3 className="report-type-title">{type.title}</h3>
              <p className="report-type-description">{type.description}</p>
              <button className="btn btn-secondary btn-sm">Generate</button>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Enrollment Trends */}
        <div className="chart-card chart-full">
          <div className="chart-header">
            <h3 className="chart-title">Enrollment Trends</h3>
            <p className="chart-subtitle">User growth over the last 6 months</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={2} name="Students" />
                <Line type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} name="Teachers" />
                <Line type="monotone" dataKey="organizations" stroke="#8b5cf6" strokeWidth={2} name="Organizations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students by Department */}
        <div className="chart-card chart-half">
          <div className="chart-header">
            <h3 className="chart-title">Students by Department</h3>
            <p className="chart-subtitle">Distribution across departments</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="chart-card chart-half">
          <div className="chart-header">
            <h3 className="chart-title">Academic Performance</h3>
            <p className="chart-subtitle">Pass rates and GPA trends</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semester" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="passRate" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Pass Rate %" />
                <Bar dataKey="gpa" fill="#ec4899" radius={[8, 8, 0, 0]} name="GPA (x20)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="recent-reports">
        <div className="section-header">
          <h2 className="section-title">Recent Reports</h2>
          <button className="btn btn-secondary btn-sm">View All</button>
        </div>
        <div className="reports-list">
          {recentReports.map((report) => (
            <div key={report.id} className="report-item">
              <div className="report-icon">
                <FileText size={24} />
              </div>
              <div className="report-info">
                <div className="report-name">{report.name}</div>
                <div className="report-meta">
                  <span className="report-type">{report.type}</span>
                  <span className="report-date">{new Date(report.date).toLocaleDateString()}</span>
                  <span className="report-size">{report.size}</span>
                </div>
              </div>
              <button className="download-btn">
                <Download size={18} />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}