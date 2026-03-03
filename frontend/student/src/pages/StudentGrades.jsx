import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useStudent } from "../context/StudentContext";
import {
    GraduationCap, BookOpen, CheckCircle,
    Award, ShieldCheck, Download, Filter,
    ChevronDown, Info, Calendar
} from "lucide-react";
import "./StudentGrades.css";

export default function StudentGrades() {
    const { profile } = useStudent();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await api.get('/student/grades');
                setGrades(res.data);
            } catch (err) {
                console.error("Error fetching grades:", err);
                setError("Không thể tải bảng điểm. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, []);

    // Grouping grades by semester
    const groupedGrades = grades.reduce((acc, grade) => {
        const semName = grade.semester_name || "Học kỳ khác";
        if (!acc[semName]) acc[semName] = [];
        acc[semName].push(grade);
        return acc;
    }, {});

    // Sort semesters (assuming names like "Học kỳ 1 2023-2024")
    const sortedSemesters = Object.keys(groupedGrades).sort((a, b) => b.localeCompare(a));

    const calculateGPA = (semesterGrades) => {
        const graded = semesterGrades.filter(g => g.scores.total !== null);
        if (graded.length === 0) return 0;
        const sum = graded.reduce((s, g) => s + g.scores.total, 0);
        return (sum / graded.length).toFixed(2);
    };

    const totalPassedCredits = grades
        .filter(g => g.scores.total !== null && g.scores.total >= 4.0)
        .reduce((s, g) => s + (g.credits || 0), 0);

    const overallGPA = grades.filter(g => g.scores.total !== null).length > 0
        ? (grades.filter(g => g.scores.total !== null).reduce((s, g) => s + g.scores.total, 0) / grades.filter(g => g.scores.total !== null).length).toFixed(2)
        : "0.00";

    if (loading) return (
        <div className="sv-loading-container">
            <div className="sv-spinner"></div>
            <p>Đang tải bảng điểm hệ thống...</p>
        </div>
    );

    return (
        <div className="sv-grades-page">
            <header className="grades-header">
                <div>
                    <h1 className="grades-title">Kết quả Học tập</h1>
                    <p className="grades-subtitle">Bảng điểm chính thức & Chứng thực ZKP</p>
                </div>
                <button className="download-btn">
                    <Download size={18} />
                    <span>Xuất PDF</span>
                </button>
            </header>

            {/* Overall Stats */}
            <div className="overall-stats">
                <div className="overall-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#6366f1' }}>
                        <GraduationCap size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">ĐTB Tích lũy (Hệ 10)</p>
                        <p className="stat-value">{overallGPA}</p>
                    </div>
                </div>
                <div className="overall-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Tín chỉ Tích lũy</p>
                        <p className="stat-value">{totalPassedCredits}</p>
                    </div>
                </div>
                <div className="overall-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fff7ed', color: '#f97316' }}>
                        <Award size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Xếp loại học lực</p>
                        <p className="stat-value">{parseFloat(overallGPA) >= 8.0 ? "Giỏi" : (parseFloat(overallGPA) >= 6.5 ? "Khá" : "Trung bình")}</p>
                    </div>
                </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {sortedSemesters.length === 0 ? (
                <div className="no-grades">
                    <BookOpen size={64} />
                    <p>Bạn chưa có dữ liệu điểm số nào trong hệ thống.</p>
                </div>
            ) : (
                sortedSemesters.map(semester => {
                    const semesterGrades = groupedGrades[semester];
                    const semGPA = calculateGPA(semesterGrades);
                    const semCredits = semesterGrades.reduce((s, g) => s + (g.credits || 0), 0);

                    return (
                        <div key={semester} className="semester-section">
                            <div className="semester-header">
                                <div className="semester-name">
                                    <Calendar size={20} className="text-slate-400" />
                                    {semester}
                                </div>
                                <div className="semester-summary">
                                    <div className="summary-item">
                                        TC đăng ký: <span className="value">{semCredits}</span>
                                    </div>
                                    <div className="summary-item">
                                        ĐTB học kỳ: <span className="value">{semGPA}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grades-table-container">
                                <table className="grades-table">
                                    <thead>
                                        <tr>
                                            <th>Môn học</th>
                                            <th className="center">STC</th>
                                            <th className="center">Quá trình</th>
                                            <th className="center">Giữa kỳ</th>
                                            <th className="center">Cuối kỳ</th>
                                            <th className="center">Tổng kết</th>
                                            <th className="center">Trạng thái</th>
                                            <th className="center">ZKP Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {semesterGrades.map((g, idx) => {
                                            const total = g.scores.total;
                                            const isPass = total !== null && total >= 4.0;
                                            const isFinal = g.is_finalized;

                                            return (
                                                <tr key={g.grade_id || idx}>
                                                    <td>
                                                        <div className="subject-info">
                                                            <span className="subject-name">{g.subject_name}</span>
                                                            <span className="subject-id">{g.class_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="center">{g.credits}</td>
                                                    <td className="center score-cell">{g.scores.regular ?? '—'}</td>
                                                    <td className="center score-cell">{g.scores.midterm ?? '—'}</td>
                                                    <td className="center score-cell">{g.scores.final ?? '—'}</td>
                                                    <td className="center">
                                                        <span className="final-score">{total ?? '—'}</span>
                                                    </td>
                                                    <td className="center">
                                                        {total !== null ? (
                                                            <span className={`status-badge ${isPass ? 'pass' : 'fail'}`}>
                                                                {isPass ? "ĐẠT" : "KHÔNG ĐẠT"}
                                                            </span>
                                                        ) : (
                                                            <span className="status-badge pending">ĐANG CẬP NHẬT</span>
                                                        )}
                                                    </td>
                                                    <td className="center">
                                                        {g.onchain_hash ? (
                                                            <div className="hash-cell" title={g.onchain_hash}>
                                                                <ShieldCheck size={14} className="inline mr-1 text-green-500" />
                                                                {g.onchain_hash.substring(0, 12)}...
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}

            <div className="grades-footer-info">
                <Info size={16} />
                <span>Điểm tổng kết được tính theo trọng số: Chuyên cần (10%), Giữa kỳ (40%), Cuối kỳ (50%).</span>
            </div>
        </div>
    );
}
