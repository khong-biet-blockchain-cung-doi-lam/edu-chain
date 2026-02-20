import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import './UserManagement.css';

export default function UserManagement() {
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@st.neu.edu.vn',
      phone: '+84 912 345 678',
      role: 'student',
      status: 'active',
      joinDate: '2024-01-15',
      avatar: 'JS'
    },
    {
      id: 2,
      name: 'Dr. Maria Garcia',
      email: 'maria.garcia@tc.neu.edu.vn',
      phone: '+84 923 456 789',
      role: 'teacher',
      status: 'active',
      joinDate: '2024-01-10',
      avatar: 'MG'
    },
    {
      id: 3,
      name: 'TechCorp Foundation',
      email: 'contact@techcorp.org.neu.edu.vn',
      phone: '+84 934 567 890',
      role: 'organization',
      status: 'active',
      joinDate: '2024-01-05',
      avatar: 'TC'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah.j@st.neu.edu.vn',
      phone: '+84 945 678 901',
      role: 'student',
      status: 'inactive',
      joinDate: '2024-02-01',
      avatar: 'SJ'
    },
    {
      id: 5,
      name: 'Prof. David Lee',
      email: 'david.lee@tc.neu.edu.vn',
      phone: '+84 956 789 012',
      role: 'teacher',
      status: 'active',
      joinDate: '2024-01-20',
      avatar: 'DL'
    },
    {
      id: 6,
      name: 'Global Scholars Fund',
      email: 'info@globalscholars.org.neu.edu.vn',
      phone: '+84 967 890 123',
      role: 'organization',
      status: 'pending',
      joinDate: '2024-02-10',
      avatar: 'GS'
    }
  ];

  const stats = [
    { label: 'Total Users', value: users.length },
    { label: 'Students', value: users.filter(u => u.role === 'student').length },
    { label: 'Teachers', value: users.filter(u => u.role === 'teacher').length },
    { label: 'Organizations', value: users.filter(u => u.role === 'organization').length }
  ];

  const roleTabs = [
    { id: 'all', label: 'All Users', count: users.length },
    { id: 'student', label: 'Students', count: users.filter(u => u.role === 'student').length },
    { id: 'teacher', label: 'Teachers', count: users.filter(u => u.role === 'teacher').length },
    { id: 'organization', label: 'Organizations', count: users.filter(u => u.role === 'organization').length }
  ];

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeClass = (role) => {
    const classes = {
      student: 'role-student',
      teacher: 'role-teacher',
      organization: 'role-organization',
      admin: 'role-admin'
    };
    return classes[role] || 'role-default';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'status-active',
      inactive: 'status-inactive',
      pending: 'status-pending',
      suspended: 'status-suspended'
    };
    return classes[status] || 'status-default';
  };

  const getStatusIcon = (status) => {
    if (status === 'active') return <CheckCircle size={14} />;
    if (status === 'inactive') return <XCircle size={14} />;
    return null;
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all platform users</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add New User
        </button>
      </div>

      {/* Stats */}
      <div className="user-stats">
        {stats.map((stat, index) => (
          <div key={index} className="user-stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Role Tabs */}
      <div className="role-tabs">
        {roleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedRole(tab.id)}
            className={`role-tab ${selectedRole === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="user-search">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.avatar}</div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div>{user.email}</div>
                    <div className="phone-number">{user.phone}</div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                    {getStatusIcon(user.status)}
                    {user.status}
                  </span>
                </td>
                <td>
                  <span className="join-date">{new Date(user.joinDate).toLocaleDateString()}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" title="Toggle Status">
                      <Shield size={16} />
                    </button>
                    <button className="action-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="action-btn danger" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">No users found</h3>
            <p className="empty-text">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn" disabled>Previous</button>
        <div className="pagination-numbers">
          <button className="pagination-number active">1</button>
          <button className="pagination-number">2</button>
          <button className="pagination-number">3</button>
        </div>
        <button className="pagination-btn">Next</button>
      </div>
    </div>
  );
}