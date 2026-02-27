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
        name: g.subject_name?.substring(0, 10) + "..." || `Môn ${i+1}`,
        "Điểm": g.scores.total
    }));

    const creditData = [
        { name: "Đã đạt", value: passedCredits, fill: "#10b981" },
        { name: "Chưa đạt", value: totalCredits - passedCredits, fill: "#f43f5e" },
    ];

    return (
        <div className="sv-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Tổng quan Học tập</h1>
                    <p className="dashboard-subtitle">
                        Xin chào, <strong>{profile?.personal_info?.first_name} {profile?.personal_info?.last_name}</strong> — {profile?.enrollment_info?.cohort || "NEU"}
                    </p>
                </div>
                <div className="dashboard-id-badge">
                    <FileText size={14} />
                    {profile?.student_id}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="sv-stats-grid">
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="sv-stat-card">
                            <div className="sv-stat-body">
                                <div className="sv-stat-info">
                                    <p className="sv-stat-title">{s.title}</p>
                                    <p className="sv-stat-value">{s.value}</p>
                                    <p className="sv-stat-sub">{s.sub}</p>
                                </div>
                                <div className="sv-stat-icon" style={{ background: s.bg, color: s.color }}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            {graded.length > 0 && (
                <div className="sv-charts-row">
                    {/* GPA Bar Chart */}
                    <div className="sv-chart-card">
                        <div className="sv-chart-header">
                            <div>
                                <h3 className="sv-chart-title">Điểm theo Môn học</h3>
                                <p className="sv-chart-sub">Kết quả từng môn học (hệ 10)</p>
                            </div>
                            <TrendingUp size={18} style={{color:'#8b5cf6'}} />
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} margin={{top:5,right:10,left:-10,bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize:11}} />
                                <YAxis domain={[0, 10]} stroke="#94a3b8" tick={{fontSize:11}} />
                                <Tooltip 
                                    contentStyle={{background:'white',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'12px'}}
                                />
                                <Bar dataKey="Điểm" fill="#8b5cf6" radius={[6,6,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Credit Progress */}
                    <div className="sv-chart-card">
                        <div className="sv-chart-header">
                            <div>
                                <h3 className="sv-chart-title">Tiến độ Tín chỉ</h3>
                                <p className="sv-chart-sub">Tín chỉ đạt / chưa đạt</p>
                            </div>
                            <ArrowUp size={18} style={{color:'#10b981'}} />
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={creditData} margin={{top:5,right:10,left:-10,bottom:5}} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" stroke="#94a3b8" tick={{fontSize:11}} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{fontSize:11}} width={70} />
                                <Tooltip 
                                    contentStyle={{background:'white',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'12px'}}
                                />
                                <Bar dataKey="value" radius={[0,6,6,0]}>
                                    {creditData.map((entry, i) => (
                                        <rect key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Grades Table */}
            <div className="sv-table-card">
                <div className="sv-table-header">
                    <h2 className="sv-table-title">Kết quả học tập</h2>
                    <span className="sv-table-badge">{grades.length} môn</span>
                </div>

                {loading ? (
                    <div className="sv-loading">Đang tải điểm số...</div>
                ) : grades.length === 0 ? (
                    <div className="sv-empty">
                        <BookOpen size={40} style={{color:'#cbd5e1', marginBottom:'0.75rem'}} />
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
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((g, idx) => {
                                    const isPass = g.scores.total !== null && g.scores.total >= 4.0;
                                    return (
                                        <tr key={idx}>
                                            <td className="subject-name">{g.subject_name}</td>
                                            <td className="center">{g.credits}</td>
                                            <td className="center score">{g.scores.regular ?? '—'}</td>
                                            <td className="center score">{g.scores.midterm ?? '—'}</td>
                                            <td className="center score">{g.scores.final ?? '—'}</td>
                                            <td className="center bold-score">{g.scores.total ?? '—'}</td>
                                            <td className="center">
                                                {g.scores.total !== null 
                                                    ? <span className={`grade-badge ${isPass ? 'pass' : 'fail'}`}>{isPass ? 'ĐẠT' : 'KHÔNG ĐẠT'}</span>
                                                    : <span className="no-grade">—</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}