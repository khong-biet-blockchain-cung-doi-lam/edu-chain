import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useStudent } from "../context/StudentContext";
import {
    BookOpen, CheckCircle, Star, GraduationCap,
    TrendingUp, ArrowUp, FileText, ChevronRight
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./Dashboard.css";

export default function StudentDashboard() {
    const { profile } = useStudent();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await api.get('/student/grades');
                setGrades(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        if (profile) fetchGrades();
    }, [profile]);

    const totalCredits = grades.reduce((s, g) => s + g.credits, 0);

    const passedCredits = grades.filter(g => g.scores.total >= 4.0).reduce((s, g) => s + g.credits, 0);
    const passedSubjects = grades.filter(g => g.scores.total !== null && g.scores.total >= 4.0).length;
    const graded = grades.filter(g => g.scores.total !== null);
    const avgGPA = graded.length > 0
        ? (graded.reduce((s, g) => s + g.scores.total, 0) / graded.length).toFixed(2)
        : "—";

    const stats = [
        { title: "Tín chỉ tích lũy", value: `${passedCredits}/${totalCredits}`, sub: "TC đạt / Tổng", icon: BookOpen, bg: "#eff6ff", color: "#2563eb" },
        { title: "Môn học đạt", value: `${passedSubjects}/${grades.length}`, sub: "Môn qua / Tổng", icon: CheckCircle, bg: "#f0fdf4", color: "#10b981" },
        { title: "Điểm TB tích lũy", value: avgGPA, sub: "Trung bình hệ 10", icon: Star, bg: "#faf5ff", color: "#8b5cf6" },
        { title: "Trạng thái", value: profile?.personal_info?.academic_status || "—", sub: profile?.enrollment_info?.major || "—", icon: GraduationCap, bg: "#fff7ed", color: "#f97316" }
    ];

    // Chart data from real grades
    const chartData = graded.map((g, i) => ({
        name: g.subject_name?.substring(0, 10) + "..." || `Môn ${i + 1}`,
        "Điểm": g.scores.total
    }));

    const creditData = [
        { name: "Đã đạt", value: passedCredits, fill: "#10b981" },
        { name: "Chưa đạt", value: totalCredits - passedCredits, fill: "#f43f5e" },
    ];


    return (
        <div className="sv-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title title-font">Tổng quan Học tập</h1>
                    <p className="dashboard-subtitle">
                        Mẫu tin sinh viên: <strong>{profile?.student_id}</strong> — {profile?.enrollment_info?.major || "Quản trị Kinh doanh"}
                    </p>
                </div>
                <div className="dashboard-id-badge">
                    <FileText size={16} />
                    <span>{profile?.enrollment_info?.cohort || "K65"}</span>
                </div>
            </div>

            <div className="sv-stats-grid">
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid #FFC101', background: 'rgba(255, 193, 1, 0.1)' }}>
                    <div className="stat-label">ĐIỂM TRUNG BÌNH (GPA)</div>
                    <div className="stat-value" style={{ color: '#FFC101' }}>{profile?.academic_info?.gpa || '3.8'}</div>
                    <div className="stat-desc">Xếp loại: Xuất sắc</div>
                </div>
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid #00528C', background: 'rgba(0, 82, 140, 0.1)' }}>
                    <div className="stat-label">TÍN CHỈ TÍCH LŨY</div>
                    <div className="stat-value" style={{ color: '#00528C' }}>{profile?.academic_info?.credits_earned || '120'}/135</div>
                    <div className="stat-desc">Tiến độ: 88.8%</div>
                </div>
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid #D11319', background: 'rgba(209, 19, 25, 0.1)' }}>
                    <div className="stat-label">TRẠNG THÁI HỌC TẬP</div>
                    <div className="stat-value" style={{ color: '#D11319', fontSize: '1.5rem' }}>Bình thường</div>
                    <div className="stat-desc">Học kỳ: 2023.2</div>
                </div>
            </div>

            {graded.length > 0 && (
                <div className="sv-charts-row">
                    <div className="sv-chart-card glass-card">
                        <div className="sv-chart-header">
                            <div>
                                <h3 className="sv-chart-title">Điểm theo Môn học</h3>
                                <p className="sv-chart-sub">Kết quả từng môn học (hệ 10)</p>
                            </div>
                            <TrendingUp size={18} style={{ color: 'var(--p-primary)' }} />
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                                <Bar dataKey="Điểm" fill="var(--p-primary)" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="sv-chart-card glass-card">
                        <div className="sv-chart-header">
                            <div>
                                <h3 className="sv-chart-title">Tiến độ Tín chỉ</h3>
                                <p className="sv-chart-sub">Tín chỉ đạt / chưa đạt</p>
                            </div>
                            <ArrowUp size={18} style={{ color: 'var(--p-success)' }} />
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={creditData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 600 }} width={70} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                                    {creditData.map((entry, i) => (
                                        <rect key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

        </div>
    );
}

