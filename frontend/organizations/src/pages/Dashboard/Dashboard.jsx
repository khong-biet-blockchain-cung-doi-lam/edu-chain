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
      title: 'Total Applications',
      value: '2,350',
      change: '+12% from last month',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Active Scholarships',
      value: '12',
      change: '+2 new this week',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Student Views',
      value: '45.2k',
      change: '+18% from last month',
      trend: 'up',
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Awarded Amount',
      value: '$125k',
      change: '85% of annual budget',
      trend: 'neutral',
      icon: DollarSign,
      color: 'orange'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, Sarah. Here's what's happening with your programs.
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary">
            <Download size={18} />
            Download Report
          </button>
          <Link to="/scholarships/create" className="btn btn-primary">
            <Plus size={18} />
            New Scholarship
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