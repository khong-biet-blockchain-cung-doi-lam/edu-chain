import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock, Users } from 'lucide-react';
import courseService from '../../services/courseService';
import './CourseManagement.css';

export default function CourseManagement() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
      subject_code: '',
      name: '',
      credits: 3
  });

  const fetchCourses = async () => {
      try {
          setLoading(true);
          const data = await courseService.getAllCourses();
          setCourses(data || []);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchCourses();
  }, []);

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCourse = async (e) => {
      e.preventDefault();
      try {
          await courseService.createCourse({
              subject_code: formData.subject_code,
              name: formData.name,
              credits: parseInt(formData.credits)
          });
          alert("Thêm học phần thành công!");
          setIsModalOpen(false);
          setFormData({ subject_code: '', name: '', credits: 3 });
          fetchCourses();
      } catch (err) {
          alert("Lỗi khi thêm học phần: " + (err.response?.data?.msg || err.message));
      }
  };

  const handleDeleteCourse = async (id) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa học phần này?")) {
          try {
              await courseService.deleteCourse(id);
              fetchCourses();
          } catch (err) {
              alert("Lỗi khi xóa học phần");
          }
      }
  };

  const departments = [
    'Tất cả Khoa/Viện',
    'Công nghệ Thông tin',
    'Toán Kinh tế',
    'Khoa học Dữ liệu',
    'Quản trị Kinh doanh',
    'Cơ điện tử'
  ];

  const stats = [
    { label: 'Tổng số môn học', value: courses.length },
    { label: 'Số tín chỉ trung bình', value: courses.length > 0 ? (courses.reduce((sum, c) => sum + (c.credits || 0), 0) / courses.length).toFixed(1) : 0 },
    { label: 'Môn học mới', value: 0 }
  ];

  const filteredCourses = courses.filter(course => {
    // Subject model doesn't have department. Filtering by search term instead
    const matchesSearch = 
      (course.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.subject_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="course-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Học phần / Môn học</h1>
          <p className="page-subtitle">Quản lý danh sách các môn học trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Thêm Học phần
        </button>
      </div>

      {/* Stats */}
      <div className="course-stats">
        {stats.map((stat, index) => (
          <div key={index} className="course-stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="course-filters">
        <select 
          className="department-filter"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          {departments.map((dept, index) => (
            <option key={index} value={index === 0 ? 'all' : dept}>
              {dept}
            </option>
          ))}
        </select>

        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên môn học, mã môn..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Mã Học phần</th>
              <th>Tên Học phần</th>
              <th>Số tín chỉ</th>
              <th>Khoa/Viện (Mock)</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Đang tải dữ liệu...</td></tr>
            ) : filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>
                  <span className="course-code">{course.subject_code}</span>
                </td>
                <td>
                  <div className="course-info">
                    <div className="course-name">{course.name}</div>
                  </div>
                </td>
                <td>
                  <span className="credits-badge">{course.credits}</span>
                </td>
                <td>
                  <span className="course-department">Viện CNTT & KTS</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn" title="Chỉnh sửa">
                      <Edit size={16} />
                    </button>
                    <button className="action-btn danger" title="Xóa" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filteredCourses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="empty-title">Không tìm thấy học phần nào</h3>
            <p className="empty-text">Hãy thử điều chỉnh từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Thêm Học Phần Mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >×</button>
            </div>
            <form onSubmit={handleCreateCourse} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Mã Học phần</label>
                <input 
                  type="text" 
                  name="subject_code" 
                  value={formData.subject_code} 
                  onChange={handleInputChange} 
                  style={inputStyle}
                  required 
                  placeholder="VD: IT4501, BA100..."
                />
              </div>
              <div>
                <label style={labelStyle}>Tên Học phần</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  style={inputStyle}
                  required 
                  placeholder="Nhập tên môn học..."
                />
              </div>
              <div>
                <label style={labelStyle}>Số Tín chỉ</label>
                <input 
                  type="number" 
                  name="credits" 
                  value={formData.credits} 
                  onChange={handleInputChange} 
                  style={inputStyle}
                  required 
                  min="1"
                  max="10"
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