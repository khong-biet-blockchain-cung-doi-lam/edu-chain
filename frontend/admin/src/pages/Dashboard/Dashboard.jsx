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
      title: 'Người dùng',
      value: '12,543',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Sinh viên đang học',
      value: '8,721',
      change: '+8.2%',
      trend: 'up',
      icon: GraduationCap,
      color: 'green'
    },
    {
      title: 'Học phần',
      value: '456',
      change: '+5.4%',
      trend: 'up',
      icon: BookOpen,
      color: 'purple'
    },
    {
      title: 'Độ ổn định hệ thống',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: Activity,
      color: 'orange'
    }
  ];

 
  const activityData = [
    { day: 'T2', logins: 2400, registrations: 145 },
    { day: 'T3', logins: 2800, registrations: 198 },
    { day: 'T4', logins: 3200, registrations: 234 },
    { day: 'T5', logins: 2900, registrations: 187 },
    { day: 'T6', logins: 3500, registrations: 267 },
    { day: 'T7', logins: 1800, registrations: 98 },
    { day: 'CN', logins: 1600, registrations: 76 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'user_registered',
      user: 'Nguyễn Văn A',
      role: 'Sinh viên',
      action: 'đã đăng ký tài khoản mới',
      time: '5 phút trước',
      avatar: 'NA'
    },
    {
      id: 2,
      type: 'course_created',
      user: 'TS. Trần Thị B',
      role: 'Giảng viên',
      action: 'đã tạo học phần mới "Toán cao cấp"',
      time: '15 phút trước',
      avatar: 'TB'
    },
    {
      id: 3,
      type: 'scholarship_posted',
      user: 'TechCorp Foundation',
      role: 'Đối tác',
      action: 'đã đăng một chương trình học bổng mới',
      time: '1 giờ trước',
      avatar: 'TC'
    },
    {
      id: 4,
      type: 'program_updated',
      user: 'Phòng Đào Tạp',
      role: 'Quản trị',
      action: 'đã cập nhật yêu cầu ngành Khoa học Máy tính',
      time: '2 giờ trước',
      avatar: 'PD'
    },
    {
      id: 5,
      type: 'user_verified',
      user: 'Lê Hoàng C',
      role: 'Giảng viên',
      action: 'đã được xác thực hồ sơ giảng viên',
      time: '3 giờ trước',
      avatar: 'LC'
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Tải Server Cao',
      message: 'CPU đang ở mức 85%. Đề xuất mở rộng.',
      time: '10 phút trước'
    },
    {
      id: 2,
      type: 'info',
      title: 'Lịch Bảo Trì',
      message: 'Hệ thống sẽ bảo trì vào 2h sáng Chủ nhật.',
      time: '2 giờ trước'
    },
    {
      id: 3,
      type: 'success',
      title: 'Sao lưu thành công',
      message: 'Đã hoàn thành sao lưu cơ sở dữ liệu hàng ngày.',
      time: '5 giờ trước'
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
          <h1 className="dashboard-title">Tổng quan Hệ thống</h1>
          <p className="dashboard-subtitle">Theo dõi và quản lý nền tảng của bạn</p>
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
        

        <div className="chart-card chart-medium">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Hoạt động trong Tuần</h3>
              <p className="chart-subtitle">Lượt đăng nhập và đăng ký tuần này</p>
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
                <Bar dataKey="logins" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Đăng nhập" />
                <Bar dataKey="registrations" fill="#ec4899" radius={[8, 8, 0, 0]} name="Đăng ký" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity and Alerts */}
      <div className="bottom-section">
        <div className="activity-panel">
          <div className="panel-header">
            <h3 className="panel-title">Hoạt động Gần đây</h3>
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
            <h3 className="panel-title">Cảnh báo Hệ thống</h3>
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