import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { Link } from "react-router-dom";
import {
    BookOpen, Users, ClipboardList,
    Award, Clock, FileText
} from "lucide-react";
import "./LecturerDashboard.css";
import HeroSection from "@shared/components/layout/HeroSection";

export default function LecturerDashboard() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.get('/lecturer/classes');
                setClasses(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const stats = [
        {
            title: "Lớp được phân công",
            value: loading ? "—" : classes.length,
            subtitle: "Lớp học phần hiện tại",
            icon: ClipboardList,
            bg: "var(--neu-azure-light)",
            accent: "var(--neu-azure)"
        },
        {
            title: "Tổng số sinh viên",
            value: "—",
            subtitle: "Trong tất cả lớp học",
            icon: Users,
            bg: "var(--neu-azure-light)",
            accent: "var(--neu-azure)"
        },
        {
            title: "Môn học đảm nhiệm",
            value: loading ? "—" : new Set(classes.map(c => c.subject)).size,
            subtitle: "Môn học khác nhau",
            icon: BookOpen,
            bg: "var(--neu-azure-light)",
            accent: "var(--neu-azure)"
        },
        {
            title: "Học kỳ hiện tại",
            value: loading || classes.length === 0 ? "—" : (classes[0]?.semester || "—"),
            subtitle: "Kỳ học đang diễn ra",
            icon: Award,
            bg: "var(--neu-azure-light)",
            accent: "var(--neu-azure)"
        }
    ];

    return (
        <div className="lec-dashboard">
            <HeroSection
                subtitle="Chào mừng Giảng viên quay trở lại! Chúc thầy/cô một ngày làm việc hiệu quả tại NEU."
            />

            {/* Header */}
            <div className="lec-header card-neu" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="lec-title">Tổng quan Giảng dạy</h1>
                    <p className="lec-subtitle">Dưới đây là thống kê và danh sách các lớp học phần thầy/cô đang phụ trách.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="lec-stats-grid">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="lec-stat-card card-neu">
                            <div className="lec-stat-body">
                                <div className="lec-stat-info">
                                    <p className="lec-stat-label">{stat.title}</p>
                                    <p className="lec-stat-value">{stat.value}</p>
                                    <p className="lec-stat-sub">{stat.subtitle}</p>
                                </div>
                                <div className="lec-stat-icon" style={{ background: stat.bg, color: stat.accent }}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Class List */}
            <div className="lec-section card-neu">
                <div className="lec-section-header">
                    <h2 className="lec-section-title">Danh sách Lớp học phần</h2>
                    <span className="lec-section-badge bg-navy">{classes.length} lớp</span>
                </div>

                {loading ? (
                    <div className="lec-loading">Đang tải danh sách lớp học...</div>
                ) : classes.length === 0 ? (
                    <div className="lec-empty">
                        <ClipboardList size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                        <p>Chưa có lớp học phần nào được phân công.</p>
                    </div>
                ) : (
                    <div className="lec-class-grid">
                        {classes.map((c) => (
                            <div key={c.id} className="lec-class-card card-neu">
                                <div className="lec-class-header">
                                    <div className="lec-class-icon bg-navy">
                                        <BookOpen size={20} color="white" />
                                    </div>
                                    <div className="lec-class-meta">
                                        <span className="lec-class-code">{c.code}</span>
                                    </div>
                                </div>
                                <div className="lec-class-body">
                                    <h3 className="lec-class-name">{c.name}</h3>
                                    <div className="lec-class-details">
                                        <div className="lec-detail">
                                            <BookOpen size={13} className="text-azure" />
                                            <span>{c.subject}</span>
                                        </div>
                                        <div className="lec-detail">
                                            <Clock size={13} className="text-azure" />
                                            <span>{c.semester}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="lec-class-footer">
                                    <Link
                                        to={`/classes/${c.id}`}
                                        className="btn btn-primary"
                                        style={{ width: '100%', fontSize: '0.85rem' }}
                                    >
                                        <FileText size={15} />
                                        Quản lý &amp; Nhập điểm
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}