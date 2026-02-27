// frontend/organizations/src/pages/Analytics/Analytics.jsx
import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Download, TrendingUp, Users, Award, DollarSign } from 'lucide-react';
import './Analytics.css';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('6months');

  const applicationData = [
    { month: 'Jan', applications: 45, approved: 12 },
    { month: 'Feb', applications: 52, approved: 15 },
    { month: 'Mar', applications: 61, approved: 18 },
    { month: 'Apr', applications: 70, approved: 20 },
    { month: 'May', applications: 85, approved: 25 },
    { month: 'Jun', applications: 95, approved: 28 }
  ];

  const programData = [
    { name: 'Computer Science', value: 35 },
    { name: 'Engineering', value: 28 },
    { name: 'Mathematics', value: 18 },
    { name: 'Data Science', value: 12 },
    { name: 'Others', value: 7 }
  ];

  const yearLevelData = [
    { year: 'Freshman', count: 45 },
    { year: 'Sophomore', count: 68 },
    { year: 'Junior', count: 92 },
    { year: 'Senior', count: 115 }
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const stats = [
    {
      title: 'Tổng mức Đầu tư',
      value: '$125,000',
      change: '+15% so với năm ngoái',
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Số sinh viên được hỗ trợ',
      value: '156',
      change: 'Tăng trưởng +23%',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Số Học bổng đã cấp',
      value: '42',
      change: '12 chương trình đang mở',
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Tỷ lệ Thành công',
      value: '68%',
      change: 'Cải thiện +5%',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Phân tích & Báo cáo</h1>
          <p className="analytics-subtitle">Theo dõi hiệu quả chương trình học bổng của bạn</p>
        </div>
        <div className="analytics-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1month">Tháng trước</option>
            <option value="3months">3 Tháng trước</option>
            <option value="6months">6 Tháng trước</option>
            <option value="1year">Năm ngoái</option>
          </select>
          <button className="btn btn-primary">
            <Download size={18} />
            Xuất Báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="analytics-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="analytics-stat-card">
              <div className="stat-icon-wrapper" style={{ background: `var(--${stat.color}-bg)` }}>
                <Icon size={24} style={{ color: `var(--${stat.color}-color)` }} />
              </div>
              <div className="stat-content">
                <div className="stat-value-large">{stat.value}</div>
                <div className="stat-label">{stat.title}</div>
                <div className="stat-change-text">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Application Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Xu hướng Đăng ký</h3>
            <p className="chart-subtitle">Lượng Đăng ký vs Phê duyệt theo thời gian</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '0.875rem' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '0.875rem' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Đăng ký"
                />
                <Line 
                  type="monotone" 
                  dataKey="approved" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Đã duyệt"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Phân bổ Ngành học</h3>
            <p className="chart-subtitle">Ứng viên theo lĩnh vực học</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={programData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {programData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year Level Distribution */}
        <div className="chart-card chart-card-full">
          <div className="chart-header">
            <h3 className="chart-title">Phân bổ theo Năm học</h3>
            <p className="chart-subtitle">Ứng viên theo bậc năm học</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearLevelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: '0.875rem' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '0.875rem' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-section">
        <h2 className="insights-title">Thông tin Nổi bật</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon success">✓</div>
            <div className="insight-content">
              <h4 className="insight-heading">Tăng trưởng Mạnh</h4>
              <p className="insight-text">
                Đơn đăng ký tăng 23% so với năm ngoái, cho thấy độ nhận diện của chương trình rất cao
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon info">ℹ</div>
            <div className="insight-content">
              <h4 className="insight-heading">Chương trình Phổ biến</h4>
              <p className="insight-text">
                Chương trình Khoa học máy tính và Kỹ thuật thu hút 63% tổng số hồ sơ
              </p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon warning">⚠</div>
            <div className="insight-content">
              <h4 className="insight-heading">Xu hướng Mùa vụ</h4>
              <p className="insight-text">
                Thời gian cao điểm nộp đơn là từ tháng 4 đến tháng 6, xem xét tăng cường nguồn lực hỗ trợ trong thời gian này
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}