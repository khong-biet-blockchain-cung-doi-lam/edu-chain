// C:\Users\Dunx\edu-chain\frontend\organizations\src\pages\Dashboard\components\RecentActivity.jsx
import React from 'react';
import { Clock } from 'lucide-react';
import './RecentActivity.css';

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: 'John Smith',
      action: 'đã nộp đơn Học bổng Công nghệ',
      time: '5 phút trước',
      avatar: 'JS',
      type: 'application'
    },
    {
      id: 2,
      user: 'Emily Chen',
      action: 'đã được duyệt Học bổng STEM',
      time: '15 phút trước',
      avatar: 'EC',
      type: 'approval'
    },
    {
      id: 3,
      user: 'Michael Brown',
      action: 'đã nộp các tài liệu bổ sung',
      time: '1 giờ trước',
      avatar: 'MB',
      type: 'update'
    },
    {
      id: 4,
      user: 'Sarah Johnson',
      action: 'đã nộp đơn Học bổng Lãnh đạo',
      time: '2 giờ trước',
      avatar: 'SJ',
      type: 'application'
    },
    {
      id: 5,
      user: 'David Lee',
      action: 'đã được duyệt Học bổng Đổi mới',
      time: '3 giờ trước',
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
    <div className="recent-activity card-neu">
      <div className="activity-header">
        <h3 className="activity-title">Hoạt động Gần đây</h3>
        <button className="view-all-btn">Xem tất cả hoạt động →</button>
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