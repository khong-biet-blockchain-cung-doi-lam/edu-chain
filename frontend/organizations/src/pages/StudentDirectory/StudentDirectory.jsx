import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw, Eye, EyeOff } from 'lucide-react';
import applicationService from '../../services/applicationService';
import { useDLP } from '../../../../shared/hooks/useDLP';
import './StudentDirectory.css';

export default function StudentDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unmaskedRows, setUnmaskedRows] = useState(new Set());

  // Kích hoạt các tính năng bảo mật vô hình
  useDLP(true, 'EDU-CHAIN | Hồ sơ Ứng viên');

  const toggleMask = (id) => {
    setUnmaskedRows(prev => {
      const newSet = new Set(prev);
      const isUnmasking = !newSet.has(id);
      
      if (isUnmasking) {
        newSet.add(id);
        // Đẩy log lên Backend
        applicationService.logAudit('UNMASK_APPLICANT_INFO', id, 'Viewed protected applicant name');
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const maskName = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length <= 1) return name;
    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first} *** ${last}`;
  };

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getAllApplications();
      // Map applicants to the directory structure
      const mapped = data.map((app, index) => ({
        id: app.id,
        name: app.student_name || 'N/A',
        initials: (app.student_name || '??').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        program: app.program || 'N/A',
        year: app.year || 'N/A',
        gpa: app.gpa || 'N/A',
        status: app.status === 'APPLIED' ? 'Chờ duyệt' : app.status,
        gradient: ['gradient-blue', 'gradient-purple', 'gradient-green', 'gradient-orange', 'gradient-pink', 'gradient-cyan'][index % 6]
      }));
      setStudents(mapped);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách ứng viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const getStatusClass = (status) => {
    if (status === 'Chờ duyệt') return 'status-applied';
    if (status === 'APPROVED') return 'status-active';
    if (status === 'REJECTED') return 'status-shortlisted';
    return 'status-default';
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="candidate-directory-page dlp-protect">

      <div className="directory-header">
        <div>
          <h1 className="directory-title">Hồ sơ Ứng viên</h1>
          <p className="directory-subtitle">Duyệt và quản lý hồ sơ sinh viên ứng tuyển học bổng</p>
        </div>
        <div className="directory-actions">
          <button className="btn btn-secondary" onClick={fetchApplicants}>
            <RefreshCw size={15} style={{ marginRight: '8px' }} />
            Làm mới
          </button>
          <button className="btn btn-secondary">
            <Download size={18} />
            Xuất Dữ liệu
          </button>
        </div>
      </div>

      <div className="directory-card">
        <div className="directory-toolbar">
          <div className="search-box-large">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm ứng viên theo tên hoặc chương trình..."
              className="search-input-large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={18} />
            Lọc
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Sinh viên</th>
                  <th>Chương trình</th>
                  <th>Năm học</th>
                  <th>GPA</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Chưa có ứng viên nào ứng tuyển.</td></tr>
                ) : filtered.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="candidate-info">
                        <div className={`candidate-avatar ${student.gradient}`}>
                          {student.initials}
                        </div>
                        <span className="candidate-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {unmaskedRows.has(student.id) ? student.name : maskName(student.name)}
                          <button 
                            onClick={() => toggleMask(student.id)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            title={unmaskedRows.has(student.id) ? "Ẩn đi" : "Hiển thị đầy đủ (Sẽ ghi log hệ thống)"}
                          >
                            {unmaskedRows.has(student.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </span>
                      </div>
                    </td>
                    <td className="text-secondary">{student.program}</td>
                    <td className="text-secondary">{student.year}</td>
                    <td className="gpa-cell">{student.gpa}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-link">Xem Hồ sơ →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-pagination">
          <div className="pagination-info">
            Đang hiển thị 1-6 trong 1,247 ứng viên
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn">
              <ChevronLeft size={18} />
              Trước
            </button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">
              Tiếp theo
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}