import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, Users, GraduationCap } from 'lucide-react';
import programService from '../../services/programService';
import './ProgramManagement.css';

export default function ProgramManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
      code: '',
      name: ''
  });

  const fetchPrograms = async () => {
      try {
          setLoading(true);
          const data = await programService.getAllPrograms();
          setPrograms(data || []);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchPrograms();
  }, []);

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProgram = async (e) => {
      e.preventDefault();
      try {
          await programService.createProgram({
              code: formData.code,
              name: formData.name
          });
          alert("Thêm chương trình thành công!");
          setIsModalOpen(false);
          setFormData({ code: '', name: '' });
          fetchPrograms();
      } catch (err) {
          alert("Lỗi khi thêm chương trình: " + (err.response?.data?.msg || err.message));
      }
  };

  const handleDeleteProgram = async (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa chương trình đào tạo này?")) {
          try {
              await programService.deleteProgram(id);
              fetchPrograms();
          } catch (err) {
              alert("Lỗi khi xóa chương trình");
          }
      }
  };

  const stats = [
    { label: 'Tổng số chương trình', value: programs.length, icon: BookOpen, color: 'purple' },
    { label: 'Tổng SV (Mock)', value: programs.reduce((sum, p) => sum + (p.students || 0), 0), icon: Users, color: 'blue' },
    { label: 'Học phần (Mock)', value: programs.reduce((sum, p) => sum + (p.courses || 0), 0), icon: GraduationCap, color: 'green' }
  ];

  const filteredPrograms = programs.filter(program =>
    (program.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (program.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconColor = (color) => {
    const colors = {
      purple: { bg: '#faf5ff', color: '#8b5cf6' },
      blue: { bg: '#eff6ff', color: '#2563eb' },
      green: { bg: '#f0fdf4', color: '#10b981' }
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="program-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Chương trình đào tạo (Ngành)</h1>
          <p className="page-subtitle">Quản lý các ngành học trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Tạo Ngành Mới
        </button>
      </div>

      {/* Stats */}
      <div className="program-stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getIconColor(stat.color);
          return (
            <div key={index} className="program-stat-card">
              <div className="stat-icon" style={{ background: colors.bg, color: colors.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="program-search">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm ngành học theo tên, mã hoặc khoa/viện..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Programs Grid */}
      <div className="programs-grid">
        {loading ? (
            <div className="loading-state" style={{gridColumn: '1 / -1', padding: '40px', textAlign: 'center'}}>Đang tải dữ liệu...</div>
        ) : filteredPrograms.map((program) => (
          <div key={program.id} className="program-card">
            <div className="program-card-header">
              <div className="program-icon">
                <GraduationCap size={24} />
              </div>
              <div className="program-code">{program.code}</div>
            </div>

            <div className="program-card-body">
              <h3 className="program-name">{program.name}</h3>
              <div className="program-department">ĐH Kinh tế Quốc dân</div>

              <div className="program-details">
                <div className="detail-row">
                  <span className="detail-label">Thời gian:</span>
                  <span className="detail-value">4.0 năm</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tín chỉ:</span>
                  <span className="detail-value">130</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Sinh viên:</span>
                  <span className="detail-value">
                    <Users size={14} />
                    0
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Học phần:</span>
                  <span className="detail-value">
                    <BookOpen size={14} />
                    0
                  </span>
                </div>
              </div>
            </div>

            <div className="program-card-footer">
              <button className="card-btn edit-btn">
                <Edit size={16} />
                Sửa
              </button>
              <button className="card-btn delete-btn" onClick={() => handleDeleteProgram(program.id)}>
                <Trash2 size={16} />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredPrograms.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3 className="empty-title">Không tìm thấy chương trình nào</h3>
          <p className="empty-text">Hãy tải lại trang hoặc tạo CT mới</p>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Thêm Ngành / Chương trình Mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >×</button>
            </div>
            <form onSubmit={handleCreateProgram} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Mã Ngành</label>
                <input 
                  type="text" 
                  name="code" 
                  value={formData.code} 
                  onChange={handleInputChange} 
                  style={inputStyle}
                  required 
                  placeholder="VD: KHMT, QTKD..."
                />
              </div>
              <div>
                <label style={labelStyle}>Tên Ngành / Chương trình</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  style={inputStyle}
                  required 
                  placeholder="VD: Khoa học máy tính..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>Hủy</button>
                <button type="submit" style={submitBtnStyle}>Tạo mới</button>
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