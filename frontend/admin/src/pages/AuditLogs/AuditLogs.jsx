import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, Monitor, Copy, Loader, Search } from 'lucide-react';
import './AuditLogs.css';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';
      const res = await axios.get(`${apiUrl}/audit/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải nhật ký hoạt động.');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action === 'SCREENSHOT_ATTEMPT') return <Monitor className="text-red-500" size={18} />;
    if (action === 'COPY_ATTEMPT') return <Copy className="text-orange-500" size={18} />;
    return <Activity size={18} />;
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'SCREENSHOT_ATTEMPT': return <span className="badge badge-danger">Chụp màn hình</span>;
      case 'COPY_ATTEMPT': return <span className="badge badge-warning">Sao chép dữ liệu</span>;
      default: return <span className="badge badge-info">{action}</span>;
    }
  };

  const filteredLogs = logs.filter(log => 
    log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lưu vết Hệ thống (Audit Logs)</h1>
          <p className="page-subtitle">Giám sát các hành vi thao tác dữ liệu nhạy cảm theo thời gian thực</p>
        </div>
        <div className="header-actions">
           <div className="search-bar">
             <Search size={18} className="search-icon"/>
             <input 
               type="text" 
               placeholder="Tìm kiếm tài khoản / sự kiện..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      <div className="logs-container">
        {loading ? (
          <div className="loading-state"><Loader className="spinner" size={32}/> Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state">
             <ShieldAlert size={48} className="empty-icon"/>
             <p>Không có nhật ký nào phù hợp.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="neu-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                  <th>Hành vi (Action)</th>
                  <th>Chi tiết Hệ thống</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="time-col">{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                    <td className="user-col"><strong>{log.email}</strong></td>
                    <td className="role-col">
                      <span className="role-chip">{log.role}</span>
                    </td>
                    <td>
                      <div className="action-cell">
                        {getActionIcon(log.action)}
                        {getActionBadge(log.action)}
                      </div>
                    </td>
                    <td className="details-col">{log.details}</td>
                    <td className="ip-col">{log.ip_address || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
