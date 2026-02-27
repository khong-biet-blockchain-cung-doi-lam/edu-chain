import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { 
    BookOpen, Users, CheckCircle, XCircle, 
    Plus, Trash2, Search, Clock
} from "lucide-react";
import "./ClassAssignment.css";

export default function ClassAssignment() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [processingId, setProcessingId] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/lecturer/available-classes');
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

    const handleClaim = async (classId) => {
        setProcessingId(classId);
        try {
            const res = await api.post(`/lecturer/claim-class/${classId}`);
            showToast(res.data.msg || "Nhận lớp thành công!");
            fetchClasses();
        } catch (e) {
            showToast(e.response?.data?.msg || "Lỗi khi nhận lớp", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRelease = async (classId) => {
        if (!window.confirm("Bạn chắc chắn muốn trả lại lớp này?")) return;
        setProcessingId(classId);
        try {
            const res = await api.delete(`/lecturer/claim-class/${classId}`);
            showToast(res.data.msg || "Đã trả lại lớp");
            fetchClasses();
        } catch (e) {
            showToast(e.response?.data?.msg || "Lỗi khi trả lại lớp", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = classes.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                           c.subject.toLowerCase().includes(search.toLowerCase()) ||
                           c.code.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" ||
                           (filterStatus === "claimed" && c.claimed) ||
                           (filterStatus === "available" && !c.claimed);
        return matchSearch && matchStatus;
    });

    const claimedCount = classes.filter(c => c.claimed).length;
    const availableCount = classes.filter(c => !c.claimed).length;

    return (
        <div className="ca-page">
            {toast && (
                <div className={`ca-toast ${toast.type}`}>
                    {toast.type === "success" ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                    {toast.msg}
                </div>
            )}

            <div className="ca-header">
                <div>
                    <h1 className="ca-title">Nhận Lớp Học phần</h1>
                    <p className="ca-subtitle">Xem và nhận các lớp học phần cần giảng viên phụ trách</p>
                </div>
                <div className="ca-summary-badges">
                    <div className="ca-badge blue">
                        <BookOpen size={14}/>
                        <span>{claimedCount} lớp đã nhận</span>
                    </div>
                    <div className="ca-badge orange">
                        <Clock size={14}/>
                        <span>{availableCount} lớp chờ người dạy</span>
                    </div>
                </div>
            </div>

            <div className="ca-filters">
                <div className="ca-search">
                    <Search size={16} className="ca-search-icon"/>
                    <input
                        placeholder="Tìm theo tên lớp, môn học, mã lớp..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="ca-search-input"
                    />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="ca-select">
                    <option value="all">Tất cả</option>
                    <option value="claimed">Đã nhận</option>
                    <option value="available">Chưa có GV</option>
                </select>
            </div>

            {loading ? (
                <div className="ca-loading">Đang tải danh sách lớp học phần...</div>
            ) : filtered.length === 0 ? (
                <div className="ca-empty">
                    <BookOpen size={48}/>
                    <p>Không tìm thấy lớp học phần phù hợp</p>
                </div>
            ) : (
                <div className="ca-grid">
                    {filtered.map(cls => (
                        <div key={cls.id} className={`ca-card ${cls.claimed ? 'claimed' : ''}`}>
                            {cls.claimed && <div className="ca-claimed-tag">✓ Của tôi</div>}
                            <div className="ca-card-header">
                                <div className="ca-card-icon">
                                    <BookOpen size={18}/>
                                </div>
                                <span className="ca-card-code">{cls.code}</span>
                            </div>
                            <div className="ca-card-body">
                                <h3 className="ca-card-name">{cls.name}</h3>
                                <div className="ca-card-details">
                                    <div className="ca-detail"><BookOpen size={12}/><span>{cls.subject}</span></div>
                                    <div className="ca-detail"><Clock size={12}/><span>{cls.semester}</span></div>
                                    <div className="ca-detail"><Users size={12}/><span>{cls.student_count} sinh viên</span></div>
                                </div>
                                <div className="ca-credits">
                                    <span className="ca-credit-badge">{cls.credits} tín chỉ</span>
                                </div>
                            </div>
                            <div className="ca-card-footer">
                                {cls.claimed ? (
                                    <button 
                                        className="ca-btn-release"
                                        onClick={() => handleRelease(cls.id)}
                                        disabled={processingId === cls.id}
                                    >
                                        <Trash2 size={14}/>
                                        {processingId === cls.id ? "Đang xử lý..." : "Trả lại lớp"}
                                    </button>
                                ) : (
                                    <button 
                                        className="ca-btn-claim"
                                        onClick={() => handleClaim(cls.id)}
                                        disabled={processingId === cls.id}
                                    >
                                        <Plus size={14}/>
                                        {processingId === cls.id ? "Đang xử lý..." : "Nhận lớp này"}
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
