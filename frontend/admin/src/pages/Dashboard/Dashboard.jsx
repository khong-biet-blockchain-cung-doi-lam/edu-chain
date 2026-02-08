// frontend/admin/src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Students',
      value: '8,721',
      change: '+8.2%',
      trend: 'up',
      icon: GraduationCap,
      color: 'green'
    },
    {
      title: 'Total Courses',
      value: '456',
      change: '+5.4%',
      trend: 'up',
      icon: BookOpen,
      color: 'purple'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: Activity,
      color: 'orange'
    }
  ];

  const userGrowthData = [
    { month: 'Jan', students: 6500, teachers: 450, organizations: 120 },
    { month: 'Feb', students: 7200, teachers: 480, organizations: 135 },
    { month: 'Mar', students: 7800, teachers: 510, organizations: 148 },
    { month: 'Apr', students: 8100, teachers: 530, organizations: 156 },
    { month: 'May', students: 8500, teachers: 560, organizations: 168 },
    { month: 'Jun', students: 8721, teachers: 580, organizations: 175 }
  ];

  const activityData = [
    { day: 'Mon', logins: 2400, registrations: 145 },
    { day: 'Tue', logins: 2800, registrations: 198 },
    { day: 'Wed', logins: 3200, registrations: 234 },
    { day: 'Thu', logins: 2900, registrations: 187 },
    { day: 'Fri', logins: 3500, registrations: 267 },
    { day: 'Sat', logins: 1800, registrations: 98 },
    { day: 'Sun', logins: 1600, registrations: 76 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registered',
      user: 'John Smith',
      role: 'Student',
      action: 'registered to the system',
      time: '5 minutes ago',
      avatar: 'JS'
    },
    {
      id: 2,
      type: 'course_created',
      user: 'Dr. Maria Garcia',
      role: 'Teacher',
      action: 'created a new course "Advanced Mathematics"',
      time: '15 minutes ago',
      avatar: 'MG'
    },
    {
      id: 3,
      type: 'scholarship_posted',
      user: 'TechCorp Foundation',
      role: 'Organization',
      action: 'posted a new scholarship program',
      time: '1 hour ago',
      avatar: 'TC'
    },
    {
      id: 4,
      type: 'program_updated',
      user: 'Admin Team',
      role: 'Admin',
      action: 'updated Computer Science program requirements',
      time: '2 hours ago',
      avatar: 'AT'
    },
    {
      id: 5,
      type: 'user_verified',
      user: 'Sarah Johnson',
      role: 'Teacher',
      action: 'was verified as a faculty member',
      time: '3 hours ago',
      avatar: 'SJ'
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High Server Load',
      message: 'Server CPU usage at 85%. Consider scaling.',
      time: '10 minutes ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for Sunday 2 AM.',
      time: '2 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily database backup completed successfully.',
      time: '5 hours ago'
    }
  ];

  const getStatColor = (color) => {
    const colors = {
      blue: { bg: '#eff6ff', color: '#2563eb' },
      green: { bg: '#f0fdf4', color: '#10b981' },
      purple: { bg: '#faf5ff', color: '#8b5cf6' },
      orange: { bg: '#fff7ed', color: '#f97316' }
    };
    return colors[color] || colors.blue;
  };

  const getAlertClass = (type) => {
    const classes = {
      warning: 'alert-warning',
      info: 'alert-info',
      success: 'alert-success',
      error: 'alert-error'
    };
    return classes[type] || classes.info;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">System Overview</h1>
          <p className="dashboard-subtitle">Monitor and manage your platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getStatColor(stat.color);
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-info">
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className={`stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                    {stat.trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {stat.change}
                  </div>
                </div>
                <div className="stat-icon" style={{ background: colors.bg, color: colors.color }}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card chart-large">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">User Growth</h3>
              <p className="chart-subtitle">Total users by role over the last 6 months</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={userGrowthData}>
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
                <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={2} name="Students" />
                <Line type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} name="Teachers" />
                <Line type="monotone" dataKey="organizations" stroke="#8b5cf6" strokeWidth={2} name="Organizations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card chart-medium">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Weekly Activity</h3>
              <p className="chart-subtitle">Logins and registrations this week</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="logins" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Logins" />
                <Bar dataKey="registrations" fill="#ec4899" radius={[8, 8, 0, 0]} name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity and Alerts */}
      <div className="bottom-section">
        <div className="activity-panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">{activity.avatar}</div>
                <div className="activity-content">
                  <div className="activity-text">
                    <span className="activity-user">{activity.user}</span>
                    {' '}
                    <span className="activity-action">{activity.action}</span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-role">{activity.role}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="alerts-panel">
          <div className="panel-header">
            <h3 className="panel-title">System Alerts</h3>
          </div>
          <div className="alerts-list">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${getAlertClass(alert.type)}`}>
                <div className="alert-icon">
                  {alert.type === 'warning' && '⚠️'}
                  {alert.type === 'info' && 'ℹ️'}
                  {alert.type === 'success' && '✓'}
                  {alert.type === 'error' && '✕'}
                </div>
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}