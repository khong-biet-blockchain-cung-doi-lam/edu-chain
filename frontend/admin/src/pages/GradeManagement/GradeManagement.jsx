import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck, Search, RefreshCw, ChevronDown, ChevronRight,
    CheckCircle, XCircle, Info, Edit3, Save, X, Lock, Send, Bell
} from 'lucide-react';
import axios from 'axios';
import { useDLP } from '../../../../shared/hooks/useDLP';
import './GradeManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
    }
});

const STATUS_COLOR = {
    'Đạt': '#10b981',
    'Không đạt': '#ef4444',
    'Đã chốt': '#6366f1',
    'Chưa chốt': '#f59e0b',
    'Chờ xét duyệt': '#f97316',
};

export default function GradeManagement() {
    useDLP(true, 'EDU-CHAIN | Quản lý Điểm - Khảo Thí');
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending'
    const [expandedClass, setExpandedClass] = useState(null);
    const [classGrades, setClassGrades] = useState({});
    const [editingGrade, setEditingGrade] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);
    const [blockchainModal, setBlockchainModal] = useState(null);
    const [bcResult, setBcResult] = useState(null);
    const [bcLoading, setBcLoading] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/khao-thi/classes`, getHeaders());
            setClasses(res.data || []);
        } catch (e) {
            console.error("fetchClasses error:", e);
            if (e.response) {
                console.error("Response data:", e.response.data);
                console.error("Status:", e.response.status);
            }
            showToast('Không thể tải danh sách lớp', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClasses(); }, []);

    const loadClassGrades = async (classId) => {
        const res = await axios.get(`${API_URL}/khao-thi/classes/${classId}/grades`, getHeaders());
        setClassGrades(prev => ({ ...prev, [classId]: res.data.grades || [] }));
    };

    const toggleClass = async (cls) => {
        if (expandedClass === cls.id) {
            setExpandedClass(null);
            return;
        }
        setExpandedClass(cls.id);
        try {
            await loadClassGrades(cls.id);
        } catch {
            showToast('Không thể tải điểm lớp', 'error');
        }
    };

    const startEdit = (grade) => {
        setEditingGrade(grade.grade_id);
        setEditForm({
            regular_score: grade.regular_score ?? '',
            midterm_score: grade.midterm_score ?? '',
            final_score: grade.final_score ?? '',
            total_score: grade.total_score ?? '',
            status: grade.status || '',
        });
    };

    const saveEdit = async (classId) => {
        setSaving(true);
        try {
            await axios.put(`${API_URL}/khao-thi/grades/${editingGrade}`, editForm, getHeaders());
            showToast('Đã cập nhật điểm thành công');
            setEditingGrade(null);
            await loadClassGrades(classId);
        } catch (e) {
            showToast(e.response?.data?.msg || 'Cập nhật thất bại', 'error');
        } finally {
            setSaving(false);
        }
    };

    const finalizeGrade = async (gradeId, classId) => {
        if (!window.confirm('Phê duyệt và chốt điểm sinh viên này?')) return;
        try {
            await axios.patch(`${API_URL}/khao-thi/grades/${gradeId}/finalize`, {}, getHeaders());
            showToast('✅ Đã phê duyệt và chốt điểm!');
            await loadClassGrades(classId);
            fetchClasses();
        } catch (e) {
            showToast(e.response?.data?.msg || 'Chốt điểm thất bại', 'error');
        }
    };

    const finalizeClass = async (classId) => {
        if (!window.confirm('Phê duyệt và chốt điểm toàn bộ lớp? Thao tác này không thể hoàn tác.')) return;
        try {
            await axios.patch(`${API_URL}/khao-thi/classes/${classId}/finalize`, {}, getHeaders());
            showToast('✅ Đã phê duyệt và chốt điểm toàn bộ lớp!');
            await loadClassGrades(classId);
            fetchClasses();
        } catch (e) {
            showToast(e.response?.data?.msg || 'Chốt điểm thất bại', 'error');
        }
    };

    const openBlockchainModal = (cls) => {
        setBlockchainModal(cls);
        setBcResult(null);
    };

    const handleSendToBlockchain = async () => {
        if (!blockchainModal) return;
        setBcLoading(true);
        try {
            const encRes = await axios.post(`${API_URL}/encrypt/class-grades/${blockchainModal.id}`, {}, getHeaders());
            const clusterId = encRes.data.cluster_id;
            const decRes = await axios.post(`${API_URL}/decrypt/cluster/${clusterId}`, {}, getHeaders());
            const bcRes = await axios.post(`${API_URL}/encrypt/send-to-blockchain/${clusterId}`, { data: decRes.data.data }, getHeaders());
            setBcResult(bcRes.data);
            showToast('✅ Điểm lớp đã lên Blockchain!');
            fetchClasses();
        } catch (e) {
            showToast(e.response?.data?.msg || 'Gửi Blockchain thất bại', 'error');
        } finally {
            setBcLoading(false);
        }
    };

    const pendingCount = classes.filter(c => c.stats?.pending > 0).length;

    const filtered = classes.filter(c => {
        const matchSearch =
            (c.class_code || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.subject || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.lecturer || '').toLowerCase().includes(search.toLowerCase());
        const matchTab = activeTab === 'all' || (activeTab === 'pending' && c.stats?.pending > 0);
        return matchSearch && matchTab;
    });

    const getClassBadge = (cls) => {
        if (cls.status === 'Đã chốt') return { label: 'Đã chốt', color: '#6366f1', bg: '#eef2ff' };
        if (cls.stats?.pending > 0) return { label: `${cls.stats.pending} chờ duyệt`, color: '#f97316', bg: '#fff7ed' };
        if (cls.stats?.total === 0) return { label: 'Chưa có SV', color: '#94a3b8', bg: '#f8fafc' };
        return { label: 'Chưa chốt', color: '#f59e0b', bg: '#fffbeb' };
    };

    return (
        <div className="grade-mgmt-page dlp-protect">
            {toast && (
                <div className={`grade-toast ${toast.type}`}>
                    {toast.type === 'success' && <CheckCircle size={16} />}
                    {toast.type === 'error' && <XCircle size={16} />}
                    {toast.type === 'info' && <Info size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="grade-mgmt-header">
                <div>
                    <h1 className="grade-mgmt-title">📊 Quản lý Điểm thi</h1>
                    <p className="grade-mgmt-subtitle">Phòng Khảo thí — Xét duyệt và chốt điểm theo lớp học phần</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('all')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem',
                        border: 'none', cursor: 'pointer',
                        background: activeTab === 'all' ? '#1e293b' : '#f1f5f9',
                        color: activeTab === 'all' ? 'white' : '#64748b',
                    }}
                >
                    <ClipboardCheck size={15} /> Tất cả lớp ({classes.length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem',
                        border: 'none', cursor: 'pointer',
                        background: activeTab === 'pending' ? '#f97316' : '#fff7ed',
                        color: activeTab === 'pending' ? 'white' : '#f97316',
                    }}
                >
                    <Bell size={15} />
                    Chờ xét duyệt
                    {pendingCount > 0 && (
                        <span style={{
                            background: activeTab === 'pending' ? 'rgba(255,255,255,0.3)' : '#f97316',
                            color: activeTab === 'pending' ? 'white' : 'white',
                            borderRadius: '999px', padding: '1px 7px', fontSize: '0.75rem', fontWeight: 700
                        }}>{pendingCount}</span>
                    )}
                </button>
            </div>

            {/* Toolbar */}
            <div className="grade-mgmt-toolbar">
                <div className="grade-search">
                    <Search size={15} className="grade-search-icon" />
                    <input
                        className="grade-search-input"
                        placeholder="Tìm theo mã lớp, môn học, giảng viên..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="grade-btn-refresh" onClick={fetchClasses}>
                    <RefreshCw size={15} /> Làm mới
                </button>
            </div>

            {loading ? (
                <div className="grade-loading"><RefreshCw size={18} /> Đang tải...</div>
            ) : (
                <div className="grade-student-list">
                    {filtered.length === 0 ? (
                        <div className="grade-empty">
                            <ClipboardCheck size={48} />
                            <p>{activeTab === 'pending' ? 'Không có yêu cầu xét duyệt nào.' : 'Không tìm thấy lớp học phần.'}</p>
                        </div>
                    ) : (
                        filtered.map(cls => {
                            const badge = getClassBadge(cls);
                            const grades = classGrades[cls.id] || [];
                            const isExpanded = expandedClass === cls.id;
                            const allFinalized = cls.stats?.total > 0 && cls.stats?.finalized === cls.stats?.total;
                            const pendingGrades = grades.filter(g => g.is_pending_review && !g.is_finalized);
                            const hasPending = cls.stats?.pending > 0;

                            return (
                                <div key={cls.id} className="grade-student-card" style={{
                                    borderLeft: hasPending ? '4px solid #f97316' : undefined
                                }}>
                                    {/* Class Header */}
                                    <div className="grade-student-header" onClick={() => toggleClass(cls)}>
                                        <div className="grade-student-info" style={{ flex: 1 }}>
                                            <span className="grade-student-code" style={{ fontSize: '0.95rem' }}>{cls.class_code}</span>
                                            <span className="grade-student-name">{cls.name}</span>
                                            <span className="grade-subject-count" style={{ color: '#64748b' }}>
                                                {cls.subject} · GV: <strong>{cls.lecturer}</strong>
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                {cls.stats?.finalized}/{cls.stats?.total} đã chốt
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: 700,
                                                color: badge.color, background: badge.bg,
                                                padding: '2px 10px', borderRadius: '999px'
                                            }}>{badge.label}</span>
                                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </div>
                                    </div>

                                    {/* Grade Table */}
                                    {isExpanded && (
                                        <div className="grade-detail">
                                            {/* Action Bar */}
                                            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {hasPending && (
                                                    <button
                                                        onClick={() => finalizeClass(cls.id)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '6px',
                                                            padding: '6px 14px', borderRadius: '7px', fontWeight: 700, fontSize: '0.82rem',
                                                            border: 'none', cursor: 'pointer',
                                                            background: '#f97316', color: 'white',
                                                        }}
                                                    >
                                                        <CheckCircle size={13} /> Phê duyệt & Chốt cả lớp ({pendingGrades.length} SV chờ)
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => finalizeClass(cls.id)}
                                                    disabled={allFinalized}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '6px 14px', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem',
                                                        border: 'none', cursor: allFinalized ? 'not-allowed' : 'pointer',
                                                        background: allFinalized ? '#e2e8f0' : '#6366f1',
                                                        color: allFinalized ? '#94a3b8' : 'white',
                                                    }}
                                                >
                                                    <Lock size={13} /> Chốt cả lớp
                                                </button>
                                                <button
                                                    onClick={() => openBlockchainModal(cls)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '6px 14px', borderRadius: '7px', fontWeight: 600, fontSize: '0.82rem',
                                                        border: 'none', cursor: 'pointer',
                                                        background: '#10b981', color: 'white',
                                                    }}
                                                >
                                                    <Send size={13} /> Gửi Blockchain
                                                </button>
                                            </div>

                                            {/* Pending notice */}
                                            {pendingGrades.length > 0 && (
                                                <div style={{ padding: '0.6rem 1rem', background: '#fff7ed', borderBottom: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#9a3412' }}>
                                                    <Bell size={14} />
                                                    <strong>{pendingGrades.length} sinh viên</strong> đang chờ Khảo Thí xét duyệt điểm — được đánh dấu màu cam bên dưới.
                                                </div>
                                            )}

                                            {grades.length === 0 ? (
                                                <p style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center' }}>Lớp chưa có dữ liệu điểm.</p>
                                            ) : (
                                                <table className="grade-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Sinh viên</th>
                                                            <th>Mã SV</th>
                                                            <th>CC (10%)</th>
                                                            <th>GK (40%)</th>
                                                            <th>CK (50%)</th>
                                                            <th>Tổng kết</th>
                                                            <th>Trạng thái</th>
                                                            <th>Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {grades.map(g => {
                                                            const isPending = g.is_pending_review && !g.is_finalized;
                                                            return (
                                                                <tr key={g.grade_id} style={{ background: isPending ? '#fff7ed' : undefined }}>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            {isPending && (
                                                                                <span title="Đang chờ xét duyệt" style={{ color: '#f97316', flexShrink: 0 }}>
                                                                                    <Bell size={13} />
                                                                                </span>
                                                                            )}
                                                                            <strong>{g.full_name || '—'}</strong>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748b' }}>{g.student_code}</td>

                                                                    {editingGrade === g.grade_id ? (
                                                                        <>
                                                                            <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.regular_score} onChange={e => setEditForm(p => ({ ...p, regular_score: e.target.value }))} /></td>
                                                                            <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.midterm_score} onChange={e => setEditForm(p => ({ ...p, midterm_score: e.target.value }))} /></td>
                                                                            <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.final_score} onChange={e => setEditForm(p => ({ ...p, final_score: e.target.value }))} /></td>
                                                                            <td><input className="grade-input" type="number" step="0.1" min="0" max="10" value={editForm.total_score} onChange={e => setEditForm(p => ({ ...p, total_score: e.target.value }))} /></td>
                                                                            <td>
                                                                                <select className="grade-input" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                                                                                    <option>Đạt</option>
                                                                                    <option>Không đạt</option>
                                                                                    <option>Chưa chốt</option>
                                                                                    <option>Đã chốt</option>
                                                                                </select>
                                                                            </td>
                                                                            <td>
                                                                                <button className="grade-action save" onClick={() => saveEdit(cls.id)} disabled={saving}>
                                                                                    <Save size={13} /> {saving ? '...' : 'Lưu'}
                                                                                </button>
                                                                                <button className="grade-action cancel" onClick={() => setEditingGrade(null)}>
                                                                                    <X size={13} />
                                                                                </button>
                                                                            </td>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <td>{g.regular_score ?? '—'}</td>
                                                                            <td>{g.midterm_score ?? '—'}</td>
                                                                            <td>{g.final_score ?? '—'}</td>
                                                                            <td><strong style={{ color: g.total_score >= 4 ? '#10b981' : '#ef4444' }}>{g.total_score ?? '—'}</strong></td>
                                                                            <td>
                                                                                <span className="grade-status-badge" style={{
                                                                                    background: `${STATUS_COLOR[g.status] || '#94a3b8'}22`,
                                                                                    color: STATUS_COLOR[g.status] || '#64748b'
                                                                                }}>
                                                                                    {isPending ? '🔔 Chờ duyệt' : (g.status || '—')}
                                                                                </span>
                                                                            </td>
                                                                            <td className="grade-actions-col">
                                                                                {!g.is_finalized && (
                                                                                    <button className="grade-action edit" onClick={() => startEdit(g)} title="Sửa điểm">
                                                                                        <Edit3 size={13} />
                                                                                    </button>
                                                                                )}
                                                                                {isPending ? (
                                                                                    <button
                                                                                        onClick={() => finalizeGrade(g.grade_id, cls.id)}
                                                                                        title="Phê duyệt và chốt điểm"
                                                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#f97316', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                                                                    >
                                                                                        <CheckCircle size={12} /> Phê duyệt
                                                                                    </button>
                                                                                ) : !g.is_finalized ? (
                                                                                    <button className="grade-action finalize" onClick={() => finalizeGrade(g.grade_id, cls.id)} title="Chốt điểm">
                                                                                        <CheckCircle size={13} />
                                                                                    </button>
                                                                                ) : (
                                                                                    <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>✓ Đã chốt</span>
                                                                                )}
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Blockchain Modal */}
            {blockchainModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>🔗 Gửi điểm lên Blockchain</h3>
                            <button onClick={() => setBlockchainModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                            {!bcResult ? (
                                <>
                                    <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#10b981' }}>
                                        <Send size={28} />
                                    </div>
                                    <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>{blockchainModal.name}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                                        Hệ thống sẽ: <strong>mã hoá</strong> → <strong>giải mã</strong> → <strong>ghi lên Blockchain</strong> → <strong>gửi email</strong> tới sinh viên.
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => setBlockchainModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontWeight: 600, cursor: 'pointer', background: 'white' }}>
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSendToBlockchain}
                                            disabled={bcLoading}
                                            style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: '#10b981', color: 'white', fontWeight: 700, cursor: bcLoading ? 'not-allowed' : 'pointer' }}
                                        >
                                            {bcLoading ? '⏳ Đang xử lý...' : '🚀 Xác nhận gửi'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '1rem', textAlign: 'left', marginBottom: '1rem' }}>
                                        <p style={{ fontWeight: 700, color: '#15803d', marginBottom: '0.5rem' }}>✅ Đã ghi lên Blockchain thành công!</p>
                                        <p style={{ fontSize: '0.8rem', color: '#166534', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                            <strong>Tx Hash:</strong> {bcResult.tx_hash}<br />
                                            {bcResult.ipfs_hash && <><strong>IPFS:</strong> {bcResult.ipfs_hash}</>}
                                        </p>
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>Email xác nhận đã được gửi đến tất cả sinh viên trong lớp.</p>
                                    <button onClick={() => setBlockchainModal(null)} style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '8px', background: '#1e293b', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                                        Đóng
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
