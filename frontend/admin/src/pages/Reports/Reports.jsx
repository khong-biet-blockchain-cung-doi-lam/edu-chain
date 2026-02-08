// frontend/admin/src/pages/Reports/Reports.jsx
import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users,
  GraduationCap,
  DollarSign,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
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
  const [selectedReport, setSelectedReport] = useState('overview');

  const enrollmentData = [
    { month: 'Jan', students: 8200, teachers: 520, organizations: 145 },
    { month: 'Feb', students: 8400, teachers: 535, organizations: 152 },
    { month: 'Mar', students: 8550, teachers: 548, organizations: 158 },
    { month: 'Apr', students: 8680, teachers: 560, organizations: 163 },
    { month: 'May', students: 8750, teachers: 572, organizations: 168 },
    { month: 'Jun', students: 8721, teachers: 580, organizations: 175 }
  ];

  const departmentData = [
    { name: 'Engineering', value: 3200, color: '#2563eb' },
    { name: 'Business', value: 2100, color: '#10b981' },
    { name: 'Science', value: 1800, color: '#f59e0b' },
    { name: 'IT', value: 1621, color: '#8b5cf6' }
  ];

  const performanceData = [
    { semester: 'Fall 2024', passRate: 85, avgGPA: 3.2 },
    { semester: 'Spring 2025', passRate: 87, avgGPA: 3.3 },
    { semester: 'Fall 2025', passRate: 89, avgGPA: 3.4 },
    { semester: 'Spring 2026', passRate: 91, avgGPA: 3.5 }
  ];

  const reportTypes = [
    {
      id: 'overview',
      title: 'System Overview',
      description: 'Comprehensive system statistics',
      icon: TrendingUp
    },
    {
      id: 'enrollment',
      title: 'Enrollment Report',
      description: 'Student enrollment trends',
      icon: Users
    },
    {
      id: 'academic',
      title: 'Academic Performance',
      description: 'GPA and pass rates',
      icon: GraduationCap
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Revenue and scholarships',
      icon: DollarSign
    }
  ];

  const quickStats = [
    {
      label: 'Total Revenue',
      value: '$2.4M',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Active Students',
      value: '8,721',
      change: '+12.5%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Course Completion',
      value: '91%',
      change: '+2.1%',
      trend: 'up',
      icon: GraduationCap
    },
    {
      label: 'Avg GPA',
      value: '3.5',
      change: '+0.2',
      trend: 'up',
      icon: TrendingUp
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Monthly Enrollment Report - January 2026',
      type: 'Enrollment',
      date: '2026-02-01',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Academic Performance Q4 2025',
      type: 'Academic',
      date: '2026-01-15',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Financial Summary 2025',
      type: 'Financial',
      date: '2026-01-05',
      size: '3.2 MB'
    },
    {
      id: 4,
      name: 'System Usage Statistics - December',
      type: 'System',
      date: '2026-01-01',
      size: '1.5 MB'
    }
  ];

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Reports & Analytics</h1>
          <p className="reports-subtitle">Generate and view system reports</p>
        </div>
        <div className="reports-actions">
          <select
            className="period-select"
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
      <div className="reports-quick-stats">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="quick-stat-card">
              <div className="quick-stat-icon">
                <Icon size={24} />
              </div>
              <div className="quick-stat-content">
                <div className="quick-stat-label">{stat.label}</div>
                <div className="quick-stat-value">{stat.value}</div>
                <div className={`quick-stat-change ${stat.trend}`}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Types */}
      <div className="report-types-section">
        <h2 className="section-title">Generate Reports</h2>
        <div className="report-types-grid">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className={`report-type-card ${selectedReport === report.id ? 'selected' : ''}`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="report-type-icon">
                  <Icon size={28} />
                </div>
                <h3 className="report-type-title">{report.title}</h3>
                <p className="report-type-description">{report.description}</p>
                <button className="btn btn-secondary btn-sm">
                  <FileText size={16} />
                  Generate
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="reports-charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Enrollment Trends</h3>
            <p className="chart-subtitle">User growth over the last 6 months</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="organizations" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Students by Department</h3>
            <p className="chart-subtitle">Current distribution</p>
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

        <div className="chart-card chart-full">
          <div className="chart-header">
            <h3 className="chart-title">Academic Performance</h3>
            <p className="chart-subtitle">Pass rates and average GPA</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="semester" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="passRate" fill="#8b5cf6" name="Pass Rate (%)" />
                <Bar dataKey="avgGPA" fill="#10b981" name="Avg GPA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="recent-reports-section">
        <h2 className="section-title">Recent Reports</h2>
        <div className="recent-reports-list">
          {recentReports.map((report) => (
            <div key={report.id} className="recent-report-item">
              <div className="report-item-icon">
                <FileText size={24} />
              </div>
              <div className="report-item-content">
                <div className="report-item-name">{report.name}</div>
                <div className="report-item-meta">
                  <span className="report-type-badge">{report.type}</span>
                  <span className="report-date">
                    <Calendar size={14} />
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                  <span className="report-size">{report.size}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm">
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}