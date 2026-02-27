import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck, Search, RefreshCw, ChevronDown, ChevronRight,
    CheckCircle, XCircle, Info, Edit3, Trash2, Save, X
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
    'Đạt':      '#10b981',
    'Không đạt':'#ef4444',
    'Đã chốt':  '#6366f1',
    'Chưa chốt':'#f59e0b',
};

export default function GradeManagement() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [studentGrades, setStudentGrades] = useState({});
    const [editingGrade, setEditingGrade] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/khao-thi/students`, getHeaders());
            setStudents(res.data.students || []);
        } catch (e) {
            showToast('Không thể tải danh sách sinh viên', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const toggleStudent = async (student) => {
        if (expandedStudent === student.id) {
            setExpandedStudent(null);
            return;
        }
        setExpandedStudent(student.id);
        if (!studentGrades[student.id]) {
            try {
                const res = await axios.get(`${API_URL}/khao-thi/grades/${student.id}`, getHeaders());
                setStudentGrades(prev => ({ ...prev, [student.id]: res.data }));
            } catch {
                showToast('Không thể tải điểm sinh viên', 'error');
            }
        }
    };

    const startEdit = (grade) => {
        setEditingGrade(grade.grade_id);
        setEditForm({
            regular_score: grade.regular_score ?? '',
            midterm_score: grade.midterm_score ?? '',
            final_score:   grade.final_score ?? '',
            total_score:   grade.total_score ?? '',
            status: grade.status || '',
        });
    };

    const saveEdit = async (studentId) => {
        setSaving(true);
        try {
            await axios.put(`${API_URL}/khao-thi/grades/${editingGrade}`, editForm, getHeaders());
            showToast('Đã cập nhật điểm thành công');
            setEditingGrade(null);
            // Re-fetch grades for this student
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

    const deleteGrade = async (gradeId, studentId) => {
        if (!window.confirm('Xóa bản ghi điểm này?')) return;
        try {
            await axios.delete(`${API_URL}/khao-thi/grades/${gradeId}`, getHeaders());
            showToast('Đã xóa bản ghi điểm', 'success');
            const res = await axios.get(`${API_URL}/khao-thi/grades/${studentId}`, getHeaders());
            setStudentGrades(prev => ({ ...prev, [studentId]: res.data }));
        } catch {
            showToast('Xóa thất bại', 'error');
        }
    };

    const filtered = students.filter(s =>
        (s.student_code || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.full_name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="grade-mgmt-page">
            {toast && (
                <div className={`grade-toast ${toast.type}`}>
                    {toast.type === 'success' && <CheckCircle size={16}/>}
                    {toast.type === 'error'   && <XCircle size={16}/>}
                    {toast.type === 'info'    && <Info size={16}/>}
                    {toast.msg}
                </div>
            )}

            <div className="grade-mgmt-header">
                <div>
                    <h1 className="grade-mgmt-title">📊 Quản lý Điểm thi</h1>
                    <p className="grade-mgmt-subtitle">Phòng Khảo thí — xem, sửa và chốt điểm sinh viên sau phúc khảo</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="grade-mgmt-toolbar">
                <div className="grade-search">
                    <Search size={15} className="grade-search-icon"/>
                    <input
                        className="grade-search-input"
                        placeholder="Tìm theo mã SV hoặc tên..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="grade-btn-refresh" onClick={fetchStudents}>
                    <RefreshCw size={15}/> Làm mới
                </button>
            </div>

            {/* Student list */}
            {loading ? (
                <div className="grade-loading"><RefreshCw size={18}/> Đang tải...</div>
            ) : (
                <div className="grade-student-list">
                    {filtered.length === 0 ? (
                        <div className="grade-empty">
                            <ClipboardCheck size={48}/>
                            <p>Không tìm thấy sinh viên nào.</p>
                        </div>
                    ) : (
                        filtered.map(student => (
                            <div key={student.id} className="grade-student-card">
                                {/* Student header */}
                                <div
                                    className="grade-student-header"
                                    onClick={() => toggleStudent(student)}
                                >
                                    <div className="grade-student-info">
                                        <span className="grade-student-code">{student.student_code}</span>
                                        <span className="grade-student-name">{student.full_name || '—'}</span>
                                        <span className="grade-subject-count">
                                            {student.total_subjects} môn
                                        </span>
                                    </div>
                                    <div className="grade-student-toggle">
                                        {expandedStudent === student.id
                                            ? <ChevronDown size={18}/>
                                            : <ChevronRight size={18}/>
                                        }
                                    </div>
                                </div>

                                {/* Grades table */}
                                {expandedStudent === student.id && (
                                    <div className="grade-detail">
                                        {!studentGrades[student.id] ? (
                                            <p style={{padding:'1rem', color:'#94a3b8'}}>Đang tải điểm...</p>
                                        ) : (
                                            <table className="grade-table">
                                                <thead>
                                                    <tr>
                                                        <th>Môn học</th>
                                                        <th>TC</th>
                                                        <th>HK</th>
                                                        <th>CC</th>
                                                        <th>GK</th>
                                                        <th>CK</th>
                                                        <th>Tổng</th>
                                                        <th>Trạng thái</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(studentGrades[student.id].grades || []).map(g => (
                                                        <tr key={g.grade_id}>
                                                            <td><strong>{g.subject_name || '—'}</strong></td>
                                                            <td>{g.credits || '—'}</td>
                                                            <td style={{fontSize:'0.78rem', color:'#64748b'}}>{g.semester || '—'}</td>

                                                            {editingGrade === g.grade_id ? (
                                                                <>
                                                                    <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.regular_score} onChange={e => setEditForm(p=>({...p, regular_score: e.target.value}))}/></td>
                                                                    <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.midterm_score} onChange={e => setEditForm(p=>({...p, midterm_score: e.target.value}))}/></td>
                                                                    <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.final_score} onChange={e => setEditForm(p=>({...p, final_score: e.target.value}))}/></td>
                                                                    <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.total_score} onChange={e => setEditForm(p=>({...p, total_score: e.target.value}))}/></td>
                                                                    <td>
                                                                        <select className="grade-input" value={editForm.status} onChange={e => setEditForm(p=>({...p, status: e.target.value}))}>
                                                                            <option>Đạt</option>
                                                                            <option>Không đạt</option>
                                                                            <option>Chưa chốt</option>
                                                                            <option>Đã chốt</option>
                                                                        </select>
                                                                    </td>
                                                                    <td>
                                                                        <button className="grade-action save" onClick={() => saveEdit(student.id)} disabled={saving}>
                                                                            <Save size={13}/> {saving ? '...' : 'Lưu'}
                                                                        </button>
                                                                        <button className="grade-action cancel" onClick={() => setEditingGrade(null)}>
                                                                            <X size={13}/>
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td>{g.regular_score ?? '—'}</td>
                                                                    <td>{g.midterm_score ?? '—'}</td>
                                                                    <td>{g.final_score ?? '—'}</td>
                                                                    <td><strong>{g.total_score ?? '—'}</strong></td>
                                                                    <td>
                                                                        <span className="grade-status-badge" style={{background: `${STATUS_COLOR[g.status] || '#94a3b8'}22`, color: STATUS_COLOR[g.status] || '#64748b'}}>
                                                                            {g.status || '—'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="grade-actions-col">
                                                                        <button className="grade-action edit" onClick={() => startEdit(g)} title="Sửa điểm">
                                                                            <Edit3 size={13}/>
                                                                        </button>
                                                                        {g.status !== 'Đã chốt' && (
                                                                            <button className="grade-action finalize" onClick={() => finalizeGrade(g.grade_id, student.id)} title="Chốt điểm">
                                                                                <CheckCircle size={13}/>
                                                                            </button>
                                                                        )}
                                                                        <button className="grade-action delete" onClick={() => deleteGrade(g.grade_id, student.id)} title="Xóa">
                                                                            <Trash2 size={13}/>
                                                                        </button>
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
