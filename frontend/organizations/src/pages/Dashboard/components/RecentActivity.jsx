// C:\Users\Dunx\edu-chain\frontend\organizations\src\pages\Dashboard\components\RecentActivity.jsx
import React from 'react';
import { Clock } from 'lucide-react';
import './RecentActivity.css';

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: 'John Smith',
      action: 'applied for Tech Scholarship',
      time: '5 minutes ago',
      avatar: 'JS',
      type: 'application'
    },
    {
      id: 2,
      user: 'Emily Chen',
      action: 'was approved for STEM Award',
      time: '15 minutes ago',
      avatar: 'EC',
      type: 'approval'
    },
    {
      id: 3,
      user: 'Michael Brown',
      action: 'submitted application documents',
      time: '1 hour ago',
      avatar: 'MB',
      type: 'update'
    },
    {
      id: 4,
      user: 'Sarah Johnson',
      action: 'applied for Leadership Grant',
      time: '2 hours ago',
      avatar: 'SJ',
      type: 'application'
    },
    {
      id: 5,
      user: 'David Lee',
      action: 'was approved for Innovation Scholarship',
      time: '3 hours ago',
      avatar: 'DL',
      type: 'approval'
    }
  ];

  const getAvatarColor = (type) => {
    const colors = {
      application: 'gradient-blue',
      approval: 'gradient-green',
      update: 'gradient-purple'
    };
    return colors[type] || 'gradient-blue';
  };

  return (
    <div className="recent-activity">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <button className="view-all-btn">View all activity →</button>
      </div>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className={`activity-avatar ${getAvatarColor(activity.type)}`}>
              {activity.avatar}
            </div>
            <div className="activity-content">
              <div className="activity-text">
                <span className="activity-user">{activity.user}</span>
                {' '}
                <span className="activity-action">{activity.action}</span>
              </div>
              <div className="activity-time">
                <Clock size={12} />
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}