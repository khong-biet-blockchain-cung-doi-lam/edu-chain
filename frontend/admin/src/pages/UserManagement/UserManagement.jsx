import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Shield, CheckCircle, XCircle, Building2, Lock, Unlock } from 'lucide-react';
import userService from '../../services/userService';
import { useAdmin } from '../../context/AdminContext';
import './UserManagement.css';

// =============================================
// Config theo role của caller
// =============================================

// Email domain gợi ý tự động
const ROLE_DOMAIN = {
  SINH_VIEN: '@st.neu.edu.vn',
  GIANG_VIEN: '@lt.neu.edu.vn',
  PARTNER: '@tp.neu.edu.vn',
  QL_DAO_TAO: '@qldt.neu.edu.vn',
  KHAO_THI: '@kt.neu.edu.vn',
  KHOA: '@khoa.neu.edu.vn',
};

// Options tạo tài khoản theo caller-role
const CREATABLE_ROLES = {
  ADMIN: [
    { value: 'QL_DAO_TAO', label: 'Phòng Quản lý Đào tạo', domain: '@qldt.neu.edu.vn' },
    { value: 'KHAO_THI', label: 'Phòng Khảo thí', domain: '@kt.neu.edu.vn' },
    { value: 'KHOA', label: 'Văn phòng Khoa', domain: '@khoa.neu.edu.vn' },
    { value: 'PARTNER', label: 'Đối tác / Doanh nghiệp', domain: '@tp.neu.edu.vn' },
  ],
  QL_DAO_TAO: [
    { value: 'SINH_VIEN', label: 'Sinh viên', domain: '@st.neu.edu.vn' },
  ],
  KHOA: [
    { value: 'GIANG_VIEN', label: 'Giảng viên', domain: '@lt.neu.edu.vn' },
  ],
  KHAO_THI: [], // không tạo tài khoản
};

// Tiêu đề trang theo role
const PAGE_CONFIG = {
  ADMIN: { title: 'Tạo Tài khoản Phòng ban', subtitle: 'Cấp tài khoản cho các phòng ban và đối tác' },
  QL_DAO_TAO: { title: 'Quản lý Sinh viên', subtitle: 'Tạo và quản lý tài khoản sinh viên' },
  KHOA: { title: 'Quản lý Giảng viên', subtitle: 'Tạo và quản lý tài khoản giảng viên của khoa' },
  KHAO_THI: { title: 'Danh sách Sinh viên', subtitle: 'Xem danh sách sinh viên (chỉ tên + mã)' },
};

const ROLE_NAME = {
  SINH_VIEN: 'Sinh viên',
  GIANG_VIEN: 'Giảng viên',
  PARTNER: 'Đối tác',
  QL_DAO_TAO: 'Phòng QLĐT',
  KHAO_THI: 'Phòng Khảo thí',
  KHOA: 'Văn phòng Khoa',
  ADMIN: 'Quản trị viên',
};

export default function UserManagement() {
  const { currentRole } = useAdmin();
  const creatableRoles = CREATABLE_ROLES[currentRole] || [];
  const pageConfig = PAGE_CONFIG[currentRole] || { title: 'Quản lý Người dùng', subtitle: '' };
  const defaultNewRole = creatableRoles[0]?.value || '';

  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: defaultNewRole,
    full_name: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      // Ensure backend array mapping
      setUsers(data.accounts || []);
      setErrorMsg('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.msg || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Auto-suggest email domain when role or username changes
    if (name === 'role') {
      const prefix = formData.email.split('@')[0];
      setFormData(prev => ({ ...prev, role: value, email: prefix + (ROLE_DOMAIN[value] || '') }));
    } else if (name === 'username') {
      setFormData(prev => ({
        ...prev,
        username: value,
        email: formData.email === '' ? value + (ROLE_DOMAIN[formData.role] || '') : formData.email
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(formData);
      alert("Tạo người dùng thành công!");
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'SINH_VIEN', full_name: '' });
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi tạo người dùng: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert("Lỗi khi xóa người dùng.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await userService.toggleUserStatus(id);
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi đổi trạng thái.");
    }
  }

  const handleUnlockProfile = async (id) => {
    try {
      await userService.unlockStudentProfile(id);
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi mở khóa hồ sơ.");
    }
  };

  // Dynamic stats + tabs based on what this role can see
  const visibleRoleKeys = [...new Set(users.map(u => u.role))];

  const stats = [
    { label: 'Tổng số', value: users.length },
    ...visibleRoleKeys.map(r => ({
      label: ROLE_NAME[r] || r,
      value: users.filter(u => u.role === r).length
    }))
  ];

  const roleTabs = [
    { id: 'all', label: 'Tất cả', count: users.length },
    ...visibleRoleKeys.map(r => ({
      id: r,
      label: ROLE_NAME[r] || r,
      count: users.filter(u => u.role === r).length
    }))
  ];

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesSearch =
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeClass = (role) => {
    const classes = {
      SINH_VIEN: 'role-student',
      GIANG_VIEN: 'role-teacher',
      PARTNER: 'role-organization',
      QL_DAO_TAO: 'role-admin',
      ADMIN: 'role-admin'
    };
    return classes[role] || 'role-default';
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Hoạt động' : 'Đã khóa';
  }

  const getStatusIcon = (isActive) => {
    return isActive ? <CheckCircle size={14} /> : <XCircle size={14} />;
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{pageConfig.title}</h1>
          <p className="page-subtitle">{pageConfig.subtitle}</p>
        </div>
        {creatableRoles.length > 0 && (
          <button className="btn btn-primary" onClick={() => { setFormData({ username: '', email: '', password: '', role: defaultNewRole, full_name: '' }); setIsModalOpen(true); }}>
            <Plus size={18} />
            Thêm tài khoản
          </button>
        )}
      </div>

      {errorMsg && <div style={{ color: "red", marginBottom: "15px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "5px" }}>{errorMsg}</div>}

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
            placeholder="Tìm theo mã hoặc email..."
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
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hồ sơ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar" style={{ backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 'bold' }}>{user.username.substring(0, 2).toUpperCase()}</div>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {ROLE_NAME[user.role] || user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(user.is_active)}`}>
                    {getStatusIcon(user.is_active)}
                    {getStatusText(user.is_active)}
                  </span>
                </td>
                <td>
                  {user.role === 'SINH_VIEN' && (
                    <span className={`status-badge ${user.is_locked ? 'status-inactive' : 'status-active'}`}>
                      {user.is_locked ? <Lock size={14} /> : <Unlock size={14} />}
                      {user.is_locked ? 'Đã khóa HS' : 'Đang mở HS'}
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {user.role === 'SINH_VIEN' && user.is_locked && (
                      <button className="action-btn" title="Mở khóa hồ sơ" onClick={() => handleUnlockProfile(user.id)} style={{ color: '#6366f1', borderColor: '#6366f1' }}>
                        <Unlock size={16} />
                      </button>
                    )}
                    <button className="action-btn" title="Khóa/Mở Khóa" onClick={() => handleToggleStatus(user.id)}>
                      <Shield size={16} />
                    </button>
                    <button className="action-btn danger" title="Xóa" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">Không tìm thấy người dùng</h3>
            <p className="empty-text">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Thêm Người Dùng Mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >×</button>
            </div>
            <form onSubmit={handleCreateUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Vai trò</label>
                <select name="role" value={formData.role} onChange={handleInputChange} style={inputStyle} required>
                  {creatableRoles.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.domain})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tên đăng nhập (Mã User)</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                  placeholder="VD: SV002, GV002..."
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Họ và Tên</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                  placeholder="Họ và tên hoặc Tên tổ chức"
                />
              </div>
              <div>
                <label style={labelStyle}>Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Hủy</button>
                <button type="submit" style={submitBtnStyle}>Thêm mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '500px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
};

const modalHeaderStyle = {
  padding: '20px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: '500',
  color: '#334155',
  fontSize: '0.875rem'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  fontSize: '0.875rem'
};

const cancelBtnStyle = {
  padding: '8px 16px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '500'
};

const submitBtnStyle = {
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '500'
};