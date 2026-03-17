// frontend/organizations/src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Download,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatsCard from './components/StatsCard';
import ApplicationTrend from './components/ApplicationTrend';
import RecentActivity from './components/RecentActivity';
import './Dashboard.css';

export default function Dashboard() {
  const stats = [
    {
      title: 'Tổng đơn đăng ký',
      value: '2,350',
      change: '+12% so với tháng trước',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Học bổng đang cấp',
      value: '12',
      change: '+2 mới tuần này',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Lượt ứng viên xem',
      value: '45.2k',
      change: '+18% so với tháng trước',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Số tiền tài trợ',
      value: '$125k',
      change: '85% ngân sách năm',
      trend: 'neutral',
      icon: DollarSign,
      color: 'orange'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tổng quan</h1>
          <p className="dashboard-subtitle">
            Chào mừng trở lại. Dưới đây là tình hình các chương trình của bạn.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary">
            <Download size={18} />
            Tải Báo cáo
          </button>
          <Link to="/scholarships/create" className="btn btn-primary">
            <Plus size={18} />
            Tạo Học bổng
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="dashboard-grid">
        <div className="dashboard-col-large">
          <ApplicationTrend />
        </div>
        <div className="dashboard-col-small">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}