
import React from 'react';
import './StatsCard.css';

export default function StatsCard({ title, value, change, icon: Icon, color }) {
  const isPositive = change?.startsWith('+');
  
  return (
    <div className="stats-card">
      <div className="stats-card-content">
        <div className="stats-info">
          <div className="stats-title">{title}</div>
          <div className="stats-value">{value}</div>
          {change && (
            <div className={`stats-change ${isPositive ? 'positive' : 'negative'}`}>
              {change}
            </div>
          )}
        </div>
        <div className={`stats-icon ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}