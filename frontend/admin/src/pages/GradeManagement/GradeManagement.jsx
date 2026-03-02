import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck, Search, RefreshCw, ChevronDown, ChevronRight,
    CheckCircle, XCircle, Info, Edit3, Trash2, Save, X, MessageSquare, BookOpen, User, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import './GradeManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    }
});

const STATUS_COLOR = {
    'Đạt': '#10b981',
    'Không đạt': '#ef4444',
    'Đã chốt': '#6366f1',
    'Chưa chốt': '#94a3b8',
    'Chờ xét duyệt': '#f59e0b',
};

export default function GradeManagement() {
    // Navigation State
    const [viewMode, setViewMode] = useState('classes'); // 'classes' or 'students'
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedClassName, setSelectedClassName] = useState('');

    // Data State
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentGrades, setStudentGrades] = useState({});

    // UI State
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [editingGrade, setEditingGrade] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [noteForm, setNoteForm] = useState({ gradeId: null, notes: '', studentId: null });
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/khao-thi/classes`, getHeaders());
            setClasses(res.data);
        } catch (e) {
            showToast('Không thể tải danh sách lớp học', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (classId = null) => {
        setLoading(true);
        try {
            const url = classId
                ? `${API_URL}/khao-thi/students?class_id=${classId}`
                : `${API_URL}/khao-thi/students`;
            const res = await axios.get(url, getHeaders());
            setStudents(res.data.students);
        } catch (e) {
            showToast('Không thể tải danh sách sinh viên', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'classes') {
            fetchClasses();
        } else {
            fetchStudents(selectedClassId);
        }
    }, [viewMode, selectedClassId]);

    const toggleStudent = async (studentId) => {
        if (expandedStudent === studentId) {
            setExpandedStudent(null);
            return;
        }

        if (!studentGrades[studentId]) {
            try {
                const res = await axios.get(`${API_URL}/khao-thi/grades/${studentId}`, getHeaders());
                setStudentGrades(prev => ({ ...prev, [studentId]: res.data }));
            } catch (e) {
                showToast('Không thể tải chi tiết điểm', 'error');
            }
        }
        setExpandedStudent(studentId);
    };

    const startEdit = (grade) => {
        setEditingGrade(grade.grade_id);
        setEditForm({
            regular: grade.regular_score || 0,
            midterm: grade.midterm_score || 0,
            final: grade.final_score || 0
        });
    };

    const cancelEdit = () => {
        setEditingGrade(null);
        setEditForm({});
    };

    const saveEdit = async (gradeId, studentId) => {
        setSaving(true);
        try {
            await axios.put(`${API_URL}/khao-thi/grades/${gradeId}`, {
                scores: {
                    regular: parseFloat(editForm.regular),
                    midterm: parseFloat(editForm.midterm),
                    final: parseFloat(editForm.final)
                }
            }, getHeaders());

            showToast('Cập nhật điểm thành công');
            setEditingGrade(null);
            const res = await axios.get(`${API_URL}/khao-thi/grades/${studentId}`, getHeaders());
            setStudentGrades(prev => ({ ...prev, [studentId]: res.data }));
        } catch (e) {
            showToast(e.response?.data?.msg || 'Cập nhật thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    const finalizeGrade = async (gradeId, studentId) => {
        if (!window.confirm('Chốt điểm này? Giảng viên sẽ không thể sửa sau khi chốt.')) return;
        try {
            await axios.patch(`${API_URL}/khao-thi/grades/${gradeId}/finalize`, {}, getHeaders());
            showToast('Đã chốt điểm thành công!', 'success');
            const res = await axios.get(`${API_URL}/khao-thi/grades/${studentId}`, getHeaders());
            setStudentGrades(prev => ({ ...prev, [studentId]: res.data }));
        } catch (e) {
            showToast(e.response?.data?.msg || 'Chốt điểm thất bại', 'error');
        }
    };

    const finalizeClass = async (classId, studentId) => {
        if (!window.confirm('Chốt điểm toàn bộ lớp học này?')) return;
        try {
            await axios.patch(`${API_URL}/khao-thi/classes/${classId}/finalize`, {}, getHeaders());
            showToast('Đã chốt điểm toàn bộ lớp học thành công!', 'success');
            if (studentId) {
                const res = await axios.get(`${API_URL}/khao-thi/grades/${studentId}`, getHeaders());
                setStudentGrades(prev => ({ ...prev, [studentId]: res.data }));
            } else if (selectedClass) {
                // Refresh current class view if needed
                fetchClasses();
            }
        } catch (e) {
            showToast(e.response?.data?.msg || 'Chốt điểm thất bại', 'error');
        }
    };

    const deleteGrade = async (gradeId, studentId) => {
        if (!window.confirm('Xóa bản ghi điểm này?')) return;
        try {
            await axios.delete(`${API_URL}/khao-thi/grades/${gradeId}`, getHeaders());
            showToast('Đã xóa thành công');
            const res = await axios.get(`${API_URL}/khao-thi/grades/${studentId}`, getHeaders());
            setStudentGrades(prev => ({ ...prev, [studentId]: res.data }));
        } catch (e) {
            showToast('Xóa thất bại', 'error');
        }
    };

    const updateNotes = async () => {
        try {
            await axios.patch(`${API_URL}/khao-thi/grades/${noteForm.gradeId}/notes`, { notes: noteForm.notes }, getHeaders());
            showToast('Đã lưu chú thích');
            const res = await axios.get(`${API_URL}/khao-thi/grades/${noteForm.studentId}`, getHeaders());
            setStudentGrades(prev => ({ ...prev, [noteForm.studentId]: res.data }));
            setNoteForm({ gradeId: null, notes: '', studentId: null });
        } catch (e) {
            showToast('Lỗi khi lưu chú thích', 'error');
        }
    };

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.class_code.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase())
    );

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.student_code.toLowerCase().includes(search.toLowerCase());

        // If selectedClassId is set, students are already filtered by class by fetchStudents.
        // So we only need to apply the search filter.
        return matchesSearch;
    });

    return (
        <div className="grade-mgmt-container">
            {toast && (
                <div className={`toast-message ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            <div className="grade-mgmt-header">
                <div>
                    <h1>Quản lý Điểm & Xét duyệt</h1>
                    <p>Phòng Khảo thí & Đảm bảo chất lượng</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'classes' ? 'active' : ''}
                            onClick={() => { setViewMode('classes'); setSelectedClassId(null); setSelectedClassName(''); setSearch(''); }}
                        >
                            <BookOpen size={16} /> Lớp học
                        </button>
                        <button
                            className={viewMode === 'students' ? 'active' : ''}
                            onClick={() => { setViewMode('students'); setSelectedClassId(null); setSelectedClassName(''); setSearch(''); }}
                        >
                            <User size={16} /> Sinh viên
                        </button>
                    </div>
                    <button className="refresh-btn" onClick={() => viewMode === 'classes' ? fetchClasses() : fetchStudents(selectedClassId)}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="search-bar-container">
                {selectedClassId && (
                    <button className="back-to-classes-btn" onClick={() => { setViewMode('classes'); setSelectedClassId(null); setSelectedClassName(''); setSearch(''); }}>
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                )}
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder={viewMode === 'classes' ? "Tìm kiếm lớp học..." : (selectedClassId ? `Tìm sinh viên trong ${selectedClassName}...` : "Tìm kiếm sinh viên...")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && <X className="clear-search" size={18} onClick={() => setSearch('')} />}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <RefreshCw className="spinner" size={40} />
                    <p>Đang tải dữ liệu...</p>
                </div>
            ) : viewMode === 'classes' ? (
                <div className="classes-list-wrapper">
                    {filteredClasses.length === 0 ? (
                        <div className="no-results">
                            <BookOpen size={48} />
                            <p>Không tìm thấy lớp học nào</p>
                        </div>
                    ) : (
                        <table className="classes-table">
                            <thead>
                                <tr>
                                    <th>Môn học</th>
                                    <th>Mã lớp</th>
                                    <th>Tên lớp</th>
                                    <th>Giảng viên</th>
                                    <th className="text-center">Thống kê (Chốt/Tổng)</th>
                                    <th className="text-center">Trạng thái</th>
                                    <th style={{ width: '220px' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map(c => (
                                    <tr key={c.id} className="class-row">
                                        <td><span className="subject-tag">{c.subject}</span></td>
                                        <td className="font-mono">{c.class_code}</td>
                                        <td className="font-bold">{c.name}</td>
                                        <td>
                                            <div className="class-lecturer" style={{ marginBottom: 0 }}>
                                                <User size={14} /> {c.lecturer}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="compact-stats">
                                                <span className="text-success font-bold">{c.stats.finalized}</span>
                                                <span className="stat-separator">/</span>
                                                <span>{c.stats.total}</span>
                                                {c.stats.pending > 0 && (
                                                    <span className="text-warning" title="Chờ duyệt" style={{ marginLeft: '8px' }}>
                                                        ({c.stats.pending})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="status-badge" style={{ backgroundColor: STATUS_COLOR[c.status] }}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="class-actions-group">
                                                <button className="view-detail-btn-small" onClick={() => {
                                                    setSelectedClassId(c.id);
                                                    setSelectedClassName(c.name);
                                                    setViewMode('students');
                                                    setSearch('');
                                                }}>
                                                    Duyệt điểm
                                                </button>
                                                {c.status === 'Chờ xét duyệt' && (
                                                    <button className="finalize-btn-small" onClick={() => finalizeClass(c.id)}>
                                                        Chốt cả lớp
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="students-list-wrapper">
                    {filteredStudents.length === 0 ? (
                        <div className="no-results">
                            <Search size={48} />
                            <p>Không tìm thấy sinh viên nào{selectedClassId ? ' trong lớp này' : ''}</p>
                        </div>
                    ) : (
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}></th>
                                    <th>Mã Sinh viên</th>
                                    <th>Họ và Tên</th>
                                    <th className="text-center">Số học phần</th>
                                    <th style={{ width: '150px' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <React.Fragment key={student.id}>
                                        <tr
                                            className={`student-row ${expandedStudent === student.id ? 'expanded' : ''}`}
                                            onClick={() => toggleStudent(student.id)}
                                        >
                                            <td className="text-center">
                                                {expandedStudent === student.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </td>
                                            <td className="font-mono">{student.student_code}</td>
                                            <td className="font-bold">{student.full_name}</td>
                                            <td className="text-center">
                                                <span className="count-badge">{student.total_subjects}</span>
                                            </td>
                                            <td>
                                                <button className="view-grades-btn" onClick={(e) => { e.stopPropagation(); toggleStudent(student.id); }}>Chi tiết điểm</button>
                                            </td>
                                        </tr>

                                        {expandedStudent === student.id && (
                                            <tr className="grades-expansion-row">
                                                <td colSpan="5">
                                                    <div className="grades-detail-container">
                                                        {!studentGrades[student.id] ? (
                                                            <div className="loading-mini"><RefreshCw className="spinner" size={20} /></div>
                                                        ) : (
                                                            <table className="inner-grades-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Học phần / Lớp</th>
                                                                        <th className="text-center">TX (10%)</th>
                                                                        <th className="text-center">GK (40%)</th>
                                                                        <th className="text-center">CK (50%)</th>
                                                                        <th className="text-center">Tổng</th>
                                                                        <th className="text-center">Trạng thái</th>
                                                                        <th style={{ width: '120px' }}>Thao tác</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {studentGrades[student.id].grades.map(g => (
                                                                        <tr key={g.grade_id}>
                                                                            <td>
                                                                                <div className="sub-name">{g.subject_name}</div>
                                                                                <div className="cls-name">{g.class_name}</div>
                                                                            </td>
                                                                            {editingGrade === g.grade_id ? (
                                                                                <>
                                                                                    <td><input type="number" className="edit-score" value={editForm.regular} onChange={e => setEditForm({ ...editForm, regular: e.target.value })} /></td>
                                                                                    <td><input type="number" className="edit-score" value={editForm.midterm} onChange={e => setEditForm({ ...editForm, midterm: e.target.value })} /></td>
                                                                                    <td><input type="number" className="edit-score" value={editForm.final} onChange={e => setEditForm({ ...editForm, final: e.target.value })} /></td>
                                                                                    <td className="text-center">-</td>
                                                                                    <td colSpan="2">
                                                                                        <div className="edit-actions">
                                                                                            <button className="save-btn" onClick={() => saveEdit(g.grade_id, student.id)} disabled={saving}><Save size={14} /> Lưu</button>
                                                                                            <button className="cancel-btn" onClick={cancelEdit}><X size={14} /> Hủy</button>
                                                                                        </div>
                                                                                    </td>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <td className="text-center">{g.regular_score}</td>
                                                                                    <td className="text-center">{g.midterm_score}</td>
                                                                                    <td className="text-center">{g.final_score}</td>
                                                                                    <td className="text-center font-bold">{(g.total_score || 0).toFixed(1)}</td>
                                                                                    <td className="text-center">
                                                                                        <span className="status-pill" style={{ backgroundColor: STATUS_COLOR[g.status] }}>
                                                                                            {g.status}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="grade-actions-group">
                                                                                            <button className="grade-action note" onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setNoteForm({ gradeId: g.grade_id, notes: g.review_notes || '', studentId: student.id });
                                                                                            }} title="Thêm chú thích">
                                                                                                <MessageSquare size={14} className={g.review_notes ? 'has-note' : ''} />
                                                                                            </button>
                                                                                            {g.status !== 'Đã chốt' && (
                                                                                                <>
                                                                                                    <button className="grade-action edit" onClick={() => startEdit(g)} title="Sửa điểm">
                                                                                                        <Edit3 size={14} />
                                                                                                    </button>
                                                                                                    <button className="grade-action finalize" onClick={() => finalizeGrade(g.grade_id, student.id)} title="Chốt điểm">
                                                                                                        <CheckCircle size={14} />
                                                                                                    </button>
                                                                                                </>
                                                                                            )}
                                                                                            <button className="grade-action delete" onClick={() => deleteGrade(g.grade_id, student.id)} title="Xóa">
                                                                                                <Trash2 size={14} />
                                                                                            </button>
                                                                                        </div>
                                                                                        {g.review_notes && <div className="review-notes-preview">{g.review_notes}</div>}
                                                                                    </td>
                                                                                </>
                                                                            )}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {noteForm.gradeId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Chú thích cho giảng viên</h3>
                            <X size={20} onClick={() => setNoteForm({ gradeId: null, notes: '', studentId: null })} />
                        </div>
                        <div className="modal-body">
                            <textarea
                                value={noteForm.notes}
                                onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                                placeholder="Nhập nhận xét hoặc yêu cầu sửa đổi..."
                                rows="5"
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setNoteForm({ gradeId: null, notes: '', studentId: null })}>Hủy</button>
                            <button className="btn-save" onClick={updateNotes}>Lưu chú thích</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
