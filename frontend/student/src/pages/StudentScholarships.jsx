import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { Award, Building2, Calendar, CheckCircle2, ShieldCheck, Clock, Check, XCircle, Info } from 'lucide-react';
import "./Scholarships.css";

export default function StudentScholarships() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const fetchScholarships = async () => {
        setLoading(true);
        try {
            const res = await api.get('/student/scholarships');
            setApplications(res.data);
        } catch (error) {
            console.error("Failed to fetch scholarships", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScholarships();
    }, []);

    const handleApply = async (scholarshipId) => {
        setActionLoading(scholarshipId);
        setMsg({ text: "", type: "" });
        try {
            await api.post(`/student/scholarships/${scholarshipId}/apply`);
            setMsg({ text: "Nộp hồ sơ thành công! Dữ liệu của bạn đã được đối tác truy cập.", type: "success" });
            fetchScholarships();
        } catch (error) {
            console.error(error);
            setMsg({ text: "Lỗi: " + (error.response?.data?.msg || "Không thể apply học bổng"), type: "error" });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMsg({ text: "", type: "" }), 5000);
        }
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'ELIGIBLE_PENDING_CONSENT':
                return <span className="grade-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}><ShieldCheck size={14} style={{ marginRight: '4px' }} /> CẦN CẤP QUYỀN</span>;
            case 'APPLIED':
                return <span className="grade-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}><Clock size={14} style={{ marginRight: '4px' }} /> ĐANG CHỜ DUYỆT</span>;
            case 'AWARDED':
                return <span className="grade-badge pass"><Check size={14} style={{ marginRight: '4px' }} /> ĐÃ TRÚNG TUYỂN</span>;
            case 'REJECTED':
                return <span className="grade-badge fail"><XCircle size={14} style={{ marginRight: '4px' }} /> KHÔNG TRÚNG TUYỂN</span>;
            default:
                return <span className="grade-badge no-grade">{status}</span>;
        }
    };

    return (
        <div className="sc-page">
            <div className="sc-hero">
                <div className="sc-hero-content">
                    <h1 className="sc-hero-title">
                        <Award size={40} />
                        Học bổng Doanh nghiệp
                    </h1>
                    <p className="sc-hero-subtitle">
                        Hệ thống tự động sử dụng công nghệ Zero-Knowledge Proof để tìm kiếm các chương trình học bổng phù hợp.
                        Dữ liệu của bạn hoàn toàn bảo mật cho đến khi bạn nhấn nút <strong>"Cấp quyền chia sẻ"</strong>.
                    </p>
                </div>
            </div>

            {msg.text && (
                <div className={`cr-toast ${msg.type}`} style={{ position: 'static', animation: 'fadeIn 0.3s ease' }}>
                    {msg.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span style={{ fontWeight: 700 }}>{msg.text}</span>
                </div>
            )}

            {loading ? (
                <div className="cr-loading" style={{ background: 'white', padding: '4rem', borderRadius: '24px', textAlign: 'center', color: 'var(--p-text-muted)' }}>
                    Đang tìm kiếm các học bổng phù hợp...
                </div>
            ) : applications.length === 0 ? (
                <div className="cr-empty" style={{ background: 'white', padding: '4rem', borderRadius: '24px', textAlign: 'center', color: 'var(--p-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <ShieldCheck size={48} />
                    <h3 style={{ fontWeight: 800, color: 'var(--p-text-main)', fontSize: '1.25rem' }}>Chưa có Học bổng phù hợp</h3>
                    <p>Hệ thống chưa tìm thấy chương trình học bổng nào phù hợp với thành tích của bạn.</p>
                </div>
            ) : (
                <div className="sc-grid">
                    {applications.map((app) => (
                        <div key={app.application_id} className="sc-card glass-card">
                            <div className="sc-card-body">
                                <div className="sc-card-header">
                                    <h3 className="sc-card-title">{app.scholarship.title}</h3>
                                    <StatusBadge status={app.status} />
                                </div>

                                <div className="sc-card-meta">
                                    <div className="sc-meta-item">
                                        <Building2 size={16} />
                                        <span>Đối tác: {app.scholarship.partner?.company_name || 'NEU Partner'}</span>
                                    </div>
                                    <div className="sc-meta-item">
                                        <Calendar size={16} />
                                        <span>Ngày đăng: {new Date(app.scholarship.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>

                                <div className="sc-description-box">
                                    <span className="sc-desc-label">Mô tả chương trình</span>
                                    <p className="sc-desc-content">{app.scholarship.description}</p>

                                    <div style={{ marginTop: '1.25rem' }}>
                                        <span className="sc-desc-label">Điều kiện đáp ứng</span>
                                        <ul className="sc-criteria-list">
                                            {app.scholarship.criteria?.min_gpa && (
                                                <li className="sc-criteria-item">GPA tối thiểu: {app.scholarship.criteria.min_gpa}</li>
                                            )}
                                            {app.scholarship.criteria?.required_certificates?.map((c, i) => (
                                                <li key={i} className="sc-criteria-item">Chứng chỉ: {c.name} (≥ {c.min_score})</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {app.status === 'ELIGIBLE_PENDING_CONSENT' && (
                                <div className="sc-card-footer">
                                    <p style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>
                                        <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                        Bạn đã đủ điều kiện! Vui lòng cấp quyền để tham gia xét duyệt.
                                    </p>
                                    <button
                                        onClick={() => handleApply(app.scholarship.id)}
                                        disabled={actionLoading === app.scholarship.id}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1rem' }}
                                    >
                                        {actionLoading === app.scholarship.id ? "Đang xử lý..." : "Cấp quyền & Nộp hồ sơ ngay"}
                                    </button>
                                </div>
                            )}

                            {app.status === 'APPLIED' && (
                                <div className="sc-card-footer">
                                    <div className="sc-status-applied">
                                        <div className="sc-status-icon">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <p style={{ fontWeight: 800, color: 'var(--p-primary)' }}>Hồ sơ đã được gửi thành công</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>
                                            Ngày nộp: {new Date(app.applied_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

