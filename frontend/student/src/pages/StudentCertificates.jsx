import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { Plus, Clock, CheckCircle2, XCircle, Award, Calendar, Hash, ExternalLink } from 'lucide-react';
import "./Certificates.css";

export default function StudentCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        score: "",
        issued_date: "",
        image_url: ""
    });

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/student/certificates');
            setCertificates(res.data);
        } catch (error) {
            console.error("Failed to fetch certificates", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: "", type: "" });
        try {
            await api.post('/student/certificates', formData);
            setMsg({ text: "Thêm chứng chỉ thành công", type: "success" });
            fetchCertificates();
            setShowModal(false);
            setFormData({ name: "", code: "", score: "", issued_date: "", image_url: "" });

            setTimeout(() => setMsg({ text: "", type: "" }), 3000);
        } catch (error) {
            console.error(error);
            setMsg({ text: "Lỗi: " + (error.response?.data?.msg || "Không thể thêm chứng chỉ"), type: "error" });
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'VERIFIED') return <span className="grade-badge pass"><CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Đã Xác Thực</span>;
        if (status === 'REJECTED') return <span className="grade-badge fail"><XCircle size={14} style={{ marginRight: '4px' }} /> Bị Từ Chối</span>;
        return <span className="grade-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}><Clock size={14} style={{ marginRight: '4px' }} /> Chờ Duyệt</span>;
    };

    return (
        <div className="ce-page">
            <div className="ce-header">
                <div>
                    <h1 className="ce-title">Chứng chỉ & Văn bằng</h1>
                    <p style={{ color: 'var(--p-text-muted)', fontWeight: 500 }}>Quản lý và cập nhật hồ sơ năng lực của bạn</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Thêm Chứng chỉ mới
                </button>
            </div>

            {msg.text && (
                <div className={`cr-toast ${msg.type}`} style={{ position: 'static', animation: 'fadeIn 0.3s ease' }}>
                    {msg.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <span style={{ fontWeight: 700 }}>{msg.text}</span>
                </div>
            )}

            {loading ? (
                <div className="cr-loading" style={{ background: 'white', padding: '4rem', borderRadius: '24px', textAlign: 'center', color: 'var(--p-text-muted)' }}>
                    Đang tải danh sách chứng chỉ...
                </div>
            ) : certificates.length === 0 ? (
                <div className="cr-empty" style={{ background: 'white', padding: '4rem', borderRadius: '24px', textAlign: 'center', color: 'var(--p-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Award size={48} />
                    <p style={{ fontWeight: 700 }}>Chưa có chứng chỉ nào được ghi nhận</p>
                    <button onClick={() => setShowModal(true)} className="btn" style={{ background: 'var(--p-bg-sidebar)' }}>Khai báo ngay</button>
                </div>
            ) : (
                <div className="ce-grid">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="ce-card glass-card">
                            <div className="ce-card-header">
                                <div className="ce-card-icon">
                                    <Award size={24} />
                                </div>
                                <StatusBadge status={cert.status} />
                            </div>

                            <h3 className="ce-card-title">{cert.name}</h3>

                            <div className="ce-card-info">
                                <div className="ce-info-row">
                                    <Hash size={14} />
                                    <span>Mã số: <strong>{cert.code || 'N/A'}</strong></span>
                                </div>
                                <div className="ce-info-row">
                                    <Calendar size={14} />
                                    <span>Ngày cấp: {cert.issued_date ? new Date(cert.issued_date).toLocaleDateString('vi-VN') : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="ce-score-badge">
                                {cert.score || 'Đang cập nhật'}
                            </div>

                            {cert.image_url && (
                                <a
                                    href={cert.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn"
                                    style={{ marginTop: 'auto', background: 'rgba(241, 245, 249, 0.5)', width: '100%', fontSize: '0.8rem' }}
                                >
                                    <ExternalLink size={14} /> Xem minh chứng
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thêm Chứng chỉ mới</h3>
                            <p style={{ color: 'var(--p-text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                                Vui lòng cung cấp thông tin chính xác để hệ thống xác thực.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="modal-body">
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="ce-label">Tên Chứng chỉ/Văn bằng *</label>
                                    <input
                                        className="form-input"
                                        type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Ví dụ: IELTS, TOEIC, Google Cloud Certified..."
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div className="ce-form-grid" style={{ marginBottom: '1.5rem' }}>
                                    <div>
                                        <label className="ce-label">Mã xác nhận (Code)</label>
                                        <input
                                            className="form-input"
                                            type="text" name="code" value={formData.code} onChange={handleChange} placeholder="Mã tra cứu"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="ce-label">Điểm / Xếp loại</label>
                                        <input
                                            className="form-input"
                                            type="text" name="score" value={formData.score} onChange={handleChange} placeholder="7.5, Distinction..."
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>

                                <div className="ce-form-grid" style={{ marginBottom: '1.5rem' }}>
                                    <div>
                                        <label className="ce-label">Ngày cấp</label>
                                        <input
                                            className="form-input"
                                            type="date" name="issued_date" value={formData.issued_date} onChange={handleChange}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="ce-label">Link ảnh minh chứng</label>
                                        <input
                                            className="form-input"
                                            type="url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..."
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn btn-primary">Lưu chứng chỉ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

