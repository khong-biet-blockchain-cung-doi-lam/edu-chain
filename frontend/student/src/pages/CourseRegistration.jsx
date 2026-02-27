import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { 
    Search, BookOpen, Users, CheckCircle, XCircle, 
    Plus, Trash2, Filter, Clock
} from "lucide-react";
import "./CourseRegistration.css";

export default function CourseRegistration() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterSem, setFilterSem] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all"); // all | enrolled | available
    const [processingId, setProcessingId] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/student/available-classes');
            setClasses(res.data);
        } catch (e) {
            console.error(e);
            showToast("Không thể tải danh sách lớp học phần", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClasses(); }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleEnroll = async (classId) => {
        setProcessingId(classId);
        try {
            const res = await api.post(`/student/enroll/${classId}`);
            showToast(res.data.msg || "Đăng ký thành công!");
            fetchClasses();
        } catch (e) {
            showToast(e.response?.data?.msg || "Lỗi khi đăng ký", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDrop = async (classId) => {
        if (!window.confirm("Bạn chắc chắn muốn hủy đăng ký?")) return;
        setProcessingId(classId);
        try {
            const res = await api.delete(`/student/enroll/${classId}`);
            showToast(res.data.msg || "Đã hủy đăng ký");
            fetchClasses();
        } catch (e) {
            showToast(e.response?.data?.msg || "Lỗi khi hủy", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const semesters = [...new Set(classes.map(c => c.semester))];

    const filtered = classes.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                           c.subject.toLowerCase().includes(search.toLowerCase()) ||
                           c.code.toLowerCase().includes(search.toLowerCase());
        const matchSem = filterSem === "all" || c.semester === filterSem;
        const matchStatus = filterStatus === "all" || 
                           (filterStatus === "enrolled" && c.enrolled) ||
                           (filterStatus === "available" && !c.enrolled);
        return matchSearch && matchSem && matchStatus;
    });

    const enrolledCount = classes.filter(c => c.enrolled).length;
    const totalCreditEnrolled = classes.filter(c => c.enrolled).reduce((s, c) => s + c.credits, 0);

    return (
        <div className="cr-page">
            {/* Toast */}
            {toast && (
                <div className={`cr-toast ${toast.type}`}>
                    {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="cr-header">
                <div>
                    <h1 className="cr-title">Đăng ký Học phần</h1>
                    <p className="cr-subtitle">Chọn các lớp học phần bạn muốn đăng ký cho học kỳ này</p>
                </div>
                <div className="cr-summary-badges">
                    <div className="cr-badge blue">
                        <BookOpen size={14} />
                        <span>{enrolledCount} lớp đã đăng ký</span>
                    </div>
                    <div className="cr-badge green">
                        <CheckCircle size={14} />
                        <span>{totalCreditEnrolled} tín chỉ</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="cr-filters">
                <div className="cr-search">
                    <Search size={16} className="cr-search-icon" />
                    <input 
                        placeholder="Tìm theo tên lớp, môn học, mã lớp..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="cr-search-input"
                    />
                </div>
                <div className="cr-filter-group">
                    <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="cr-select">
                        <option value="all">Tất cả học kỳ</option>
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="cr-select">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="enrolled">Đã đăng ký</option>
                        <option value="available">Chưa đăng ký</option>
                    </select>
                </div>
            </div>

            {/* Class Grid */}
            {loading ? (
                <div className="cr-loading">Đang tải danh sách lớp học phần...</div>
            ) : filtered.length === 0 ? (
                <div className="cr-empty">
                    <BookOpen size={48} />
                    <p>Không tìm thấy lớp học phần phù hợp</p>
                </div>
            ) : (
                <div className="cr-grid">
                    {filtered.map(cls => (
                        <div key={cls.id} className={`cr-card ${cls.enrolled ? 'enrolled' : ''}`}>
                            {cls.enrolled && <div className="cr-enrolled-badge">✓ Đã đăng ký</div>}
                            <div className="cr-card-header">
                                <div className="cr-card-icon">
                                    <BookOpen size={18} />
                                </div>
                                <span className="cr-card-code">{cls.code}</span>
                            </div>
                            <div className="cr-card-body">
                                <h3 className="cr-card-name">{cls.name}</h3>
                                <div className="cr-card-details">
                                    <div className="cr-detail">
                                        <BookOpen size={12} />
                                        <span>{cls.subject}</span>
                                    </div>
                                    <div className="cr-detail">
                                        <Clock size={12} />
                                        <span>{cls.semester}</span>
                                    </div>
                                    <div className="cr-detail">
                                        <Users size={12} />
                                        <span>{cls.student_count} sinh viên</span>
                                    </div>
                                </div>
                                <div className="cr-credits">
                                    <span className="cr-credit-badge">{cls.credits} tín chỉ</span>
                                    <span className="cr-lecturer">{cls.lecturer}</span>
                                </div>
                            </div>
                            <div className="cr-card-footer">
                                {cls.enrolled ? (
                                    <button 
                                        className="cr-btn-drop"
                                        onClick={() => handleDrop(cls.id)}
                                        disabled={processingId === cls.id}
                                    >
                                        <Trash2 size={14} />
                                        {processingId === cls.id ? "Đang xử lý..." : "Hủy đăng ký"}
                                    </button>
                                ) : (
                                    <button 
                                        className="cr-btn-enroll"
                                        onClick={() => handleEnroll(cls.id)}
                                        disabled={processingId === cls.id}
                                    >
                                        <Plus size={14} />
                                        {processingId === cls.id ? "Đang xử lý..." : "Đăng ký"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
