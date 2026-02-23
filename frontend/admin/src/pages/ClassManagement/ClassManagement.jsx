import React, { useState, useEffect } from 'react';
import { Search, Plus, UserPlus, BookOpen, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';
import classService from '../../services/classService';
import userService from '../../services/userService';
import './ClassManagement.css';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch classes
      const classData = await classService.getAllClasses();
      setClasses(classData);
      
      // Fetch lecturers (GIANG_VIEN) for the dropdown
      const usersData = await userService.getAllUsers();
      const giangVien = usersData.filter(u => u.role === 'GIANG_VIEN');
      setLecturers(giangVien);
      
    } catch (error) {
      console.error(error);
      setMsg({ text: 'Lỗi tải dữ liệu lớp học', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (cls) => {
    setSelectedClass(cls);
    setSelectedLecturerId(cls.lecturer?.id || '');
    setShowAssignModal(true);
  };

  const handleCloseModal = () => {
    setShowAssignModal(false);
    setSelectedClass(null);
    setSelectedLecturerId('');
  };

  const handleAssignLecturer = async () => {
    if (!selectedLecturerId) {
      alert("Vui lòng chọn giảng viên");
      return;
    }
    
    setAssigning(true);
    try {
      // Note: we might need account.id to lecturer.id mapping
      // If userService returns account id, and academic API expects lecturer id (which is 1-1 mapped)
      await classService.assignLecturer(selectedClass.id, selectedLecturerId);
      setMsg({ text: 'Phân công giảng viên thành công!', type: 'success' });
      fetchData(); // Refresh list to see the update
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert('Lỗi: ' + (error.response?.data?.msg || 'Không thể phân công giảng viên'));
    } finally {
      setAssigning(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.class_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="class-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Lớp học phần</h1>
          <p className="page-subtitle">Quản lý lớp học và phân công giảng viên</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Tạo Lớp Mới
        </button>
      </div>

      {msg.text && (
        <div className={`alert-message ${msg.type}`}>
          {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {msg.text}
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <BookOpen className="stat-icon text-blue-500" />
          <div className="stat-info">
            <span className="stat-value">{classes.length}</span>
            <span className="stat-label">Tổng số lớp</span>
          </div>
        </div>
        <div className="stat-card">
          <UserPlus className="stat-icon text-green-500" />
          <div className="stat-info">
            <span className="stat-value">{classes.filter(c => c.lecturer).length}</span>
            <span className="stat-label">Đã phân công</span>
          </div>
        </div>
        <div className="stat-card">
          <AlertCircle className="stat-icon text-red-500" />
          <div className="stat-info">
            <span className="stat-value">{classes.filter(c => !c.lecturer).length}</span>
            <span className="stat-label">Chưa phân công</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã lớp hoặc tên lớp..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Classes Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã Lớp</th>
                <th>Tên Lớp (Môn học)</th>
                <th>Học kỳ</th>
                <th>Giảng viên phụ trách</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) => (
                <tr key={cls.id}>
                  <td>
                    <span className="code-badge">{cls.class_code}</span>
                  </td>
                  <td>
                    <div className="subject-info">
                      <div className="class-name">{cls.name}</div>
                      <div className="subject-name">{cls.subject?.name || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{cls.semester?.code || 'N/A'}</td>
                  <td>
                    {cls.lecturer ? (
                      <div className="lecturer-assigned">
                        <GraduationCap size={16} />
                        <span>{cls.lecturer.name}</span>
                      </div>
                    ) : (
                      <span className="unassigned-badge">Chưa phân công</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleOpenAssignModal(cls)}
                      className="btn-action primary"
                    >
                      <UserPlus size={16} />
                      Phân công
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && filteredClasses.length === 0 && (
          <div className="empty-state">
            <h3 className="empty-title">Không tìm thấy lớp học nào</h3>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Phân công Giảng viên</h3>
              <p>Lớp: <strong>{selectedClass?.name} ({selectedClass?.class_code})</strong></p>
            </div>
            <div className="modal-body">
              <label className="form-label">Chọn giảng viên:</label>
              <select 
                className="form-select"
                value={selectedLecturerId}
                onChange={(e) => setSelectedLecturerId(e.target.value)}
              >
                <option value="">-- Chọn một giảng viên --</option>
                {lecturers.map(letc => (
                  <option key={letc.id} value={letc.id}>
                    {letc.username} ({letc.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseModal}
                disabled={assigning}
              >
                Hủy
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAssignLecturer}
                disabled={assigning || !selectedLecturerId}
              >
                {assigning ? 'Đang lưu...' : 'Lưu Thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
