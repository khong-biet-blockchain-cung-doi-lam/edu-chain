// frontend/admin/src/pages/UserManagement/UserManagement.jsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield,
  Mail,
  Phone,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './UserManagement.css';

export default function UserManagement() {
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const users = [
    {
      id: 1,
      name: 'Emily Martinez',
      email: 'emily.martinez@st.neu.edu.vn',
      phone: '+84 123 456 789',
      role: 'student',
      status: 'active',
      joinDate: '2025-09-15',
      avatar: 'EM'
    },
    {
      id: 2,
      name: 'Dr. James Chen',
      email: 'james.chen@tc.neu.edu.vn',
      phone: '+84 987 654 321',
      role: 'teacher',
      status: 'active',
      joinDate: '2024-08-20',
      avatar: 'JC'
    },
    {
      id: 3,
      name: 'TechCorp Foundation',
      email: 'contact@techcorp.org',
      phone: '+1 555 123 4567',
      role: 'organization',
      status: 'active',
      joinDate: '2024-06-10',
      avatar: 'TC'
    },
    {
      id: 4,
      name: 'Sophia Patel',
      email: 'sophia.patel@st.neu.edu.vn',
      phone: '+84 345 678 901',
      role: 'student',
      status: 'active',
      joinDate: '2025-09-18',
      avatar: 'SP'
    },
    {
      id: 5,
      name: 'Dr. Maria Garcia',
      email: 'maria.garcia@tc.neu.edu.vn',
      phone: '+84 234 567 890',
      role: 'teacher',
      status: 'inactive',
      joinDate: '2024-07-05',
      avatar: 'MG'
    },
    {
      id: 6,
      name: 'Global Scholars Inc',
      email: 'info@globalscholars.org',
      phone: '+1 555 987 6543',
      role: 'organization',
      status: 'pending',
      joinDate: '2026-01-15',
      avatar: 'GS'
    }
  ];

  const stats = [
    { label: 'Total Users', value: '12,543', color: 'blue' },
    { label: 'Students', value: '8,721', color: 'green' },
    { label: 'Teachers', value: '580', color: 'purple' },
    { label: 'Organizations', value: '175', color: 'orange' }
  ];

  const roles = [
    { id: 'all', label: 'All Users', count: users.length },
    { id: 'student', label: 'Students', count: users.filter(u => u.role === 'student').length },
    { id: 'teacher', label: 'Teachers', count: users.filter(u => u.role === 'teacher').length },
    { id: 'organization', label: 'Organizations', count: users.filter(u => u.role === 'organization').length }
  ];

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

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log('Deleting user:', userId);
    }
  };

  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    console.log('Toggling user status:', userId, newStatus);
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid-small">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card-small">
            <div className="stat-label-small">{stat.label}</div>
            <div className="stat-value-small">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Role Tabs */}
      <div className="role-tabs">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`role-tab ${selectedRole === role.id ? 'active' : ''}`}
          >
            {role.label}
            <span className="role-count">{role.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="users-toolbar">
        <div className="search-box-large">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="search-input-large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={18} />
          More Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="users-card">
        <div className="table-container">
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
                      <div className="user-avatar-table">{user.avatar}</div>
                      <div className="user-details">
                        <div className="user-name-table">{user.name}</div>
                        <div className="user-email-table">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item-table">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      <div className="contact-item-table">
                        <Phone size={14} />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status === 'active' && <CheckCircle size={14} />}
                      {user.status === 'inactive' && <XCircle size={14} />}
                      {user.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(user.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn-icon"
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Shield size={16} />
                      </button>
                      <button className="action-btn-icon" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn-icon danger"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="table-info">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="pagination">
            <button className="pagination-btn">Previous</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">Next</button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <h3 className="empty-title">No users found</h3>
          <p className="empty-text">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}