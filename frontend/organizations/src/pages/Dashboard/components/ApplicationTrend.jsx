// C:\Users\Dunx\edu-chain\frontend\organizations\src\pages\Dashboard\components\ApplicationTrend.jsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ApplicationTrend.css';

export default function ApplicationTrend() {
  const data = [
    { month: 'Jan', applications: 45 },
    { month: 'Feb', applications: 52 },
    { month: 'Mar', applications: 61 },
    { month: 'Apr', applications: 58 },
    { month: 'May', applications: 70 },
    { month: 'Jun', applications: 85 }
  ];

  return (
    <div className="application-trend">
      <div className="trend-header">
        <h3 className="trend-title">Biểu đồ Đơn đăng ký</h3>
        <div className="trend-actions">
          <button className="trend-btn">Lọc</button>
          <button className="trend-btn">Tải về</button>
        </div>
      </div>
      <div className="trend-chart">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Area 
              type="monotone" 
              dataKey="applications" 
              stroke="#2563eb" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorApplications)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}