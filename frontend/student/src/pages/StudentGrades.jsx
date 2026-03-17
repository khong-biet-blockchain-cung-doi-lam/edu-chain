import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useStudent } from "../context/StudentContext";
import { BookOpen, FileText } from "lucide-react";
import "./Grades.css";

export default function StudentGrades() {
    const { profile } = useStudent();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewGrade, setReviewGrade] = useState(null);
    const [reviewReason, setReviewReason] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const res = await api.get('/student/grades');
            setGrades(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) fetchGrades();
    }, [profile]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewReason.trim()) return alert("Vui lòng nhập lý do phúc khảo");

        setSubmittingReview(true);
        try {
            await api.post(`/student/grades/${reviewGrade.grade_id}/review`, {
                reason: reviewReason
            });
            alert("Đã gửi yêu cầu phúc khảo thành công!");
            setReviewGrade(null);
            setReviewReason("");
            fetchGrades();
        } catch (error) {
            console.error(error);
            alert("Lỗi: " + (error.response?.data?.msg || "Không thể gửi yêu cầu phúc khảo"));
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="sv-grades-page">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title title-font">Kết quả Học tập</h1>
                    <p className="dashboard-subtitle">
                        Tra cứu điểm thi và gửi yêu cầu phúc khảo
                    </p>
                </div>
                <div className="dashboard-id-badge">
                    <FileText size={16} />
                    <span>{profile?.student_id}</span>
                </div>
            </div>

            <div className="sv-table-card glass-card">
                <div className="sv-table-header">
                    <h2 className="sv-table-title title-font">Bảng điểm chi tiết</h2>
                    <span className="sv-table-badge">{grades.length} môn học</span>
                </div>

                {loading ? (
                    <div className="sv-loading">Đang tải điểm số...</div>
                ) : grades.length === 0 ? (
                    <div className="sv-empty">
                        <BookOpen size={40} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                        <p>Chưa có kết quả học tập nào.</p>
                    </div>
                ) : (
                    <div className="sv-table-wrap">
                        <table className="sv-table">
                            <thead>
                                <tr>
                                    <th>Môn học</th>
                                    <th className="center">TC</th>
                                    <th className="center">QT</th>
                                    <th className="center">GK</th>
                                    <th className="center">CK</th>
                                    <th className="center">Tổng</th>
                                    <th className="center">Đánh giá</th>
                                    <th className="center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((g, idx) => {
                                    const isPass = g.scores.total !== null && g.scores.total >= 4.0;
                                    const isRequested = g.status === 'REVIEW_REQUESTED';

                                    return (
                                        <tr key={idx}>
                                            <td className="subject-name">{g.subject_name}</td>
                                            <td className="center">{g.credits}</td>
                                            <td className="center score">{g.scores.regular ?? '—'}</td>
                                            <td className="center score">{g.scores.midterm ?? '—'}</td>
                                            <td className="center score">{g.scores.final ?? '—'}</td>
                                            <td className="center bold-score">{g.scores.total ?? '—'}</td>
                                            <td className="center">
                                                {isRequested ? (
                                                    <span className="grade-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>ĐANG PHÚC KHẢO</span>
                                                ) : g.scores.total !== null ? (
                                                    <span className={`grade-badge ${isPass ? 'pass' : 'fail'}`}>{isPass ? 'ĐẠT' : 'KHÔNG ĐẠT'}</span>
                                                ) : (
                                                    <span className="no-grade">—</span>
                                                )}
                                            </td>
                                            <td className="center">
                                                <button
                                                    className="btn-review"
                                                    onClick={() => setReviewGrade(g)}
                                                    disabled={isRequested || g.scores.total === null}
                                                >
                                                    {isRequested ? 'Đã gửi' : 'Phúc khảo'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {reviewGrade && (
                <div className="modal-overlay" onClick={() => setReviewGrade(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Yêu cầu Phúc khảo</h3>
                            <p style={{ color: 'var(--p-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                Môn học: <strong>{reviewGrade.subject_name}</strong>
                            </p>
                        </div>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="modal-body">
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--p-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                    Lý do phúc khảo
                                </label>
                                <textarea
                                    className="form-input"
                                    style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                                    placeholder="Vui lòng nhập lý do cụ thể (vd: Điểm thành phần chưa chính xác...)"
                                    value={reviewReason}
                                    onChange={e => setReviewReason(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn" onClick={() => setReviewGrade(null)}>Hủy</button>
                                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                    {submittingReview ? "Đang gửi..." : "Gửi yêu cầu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
