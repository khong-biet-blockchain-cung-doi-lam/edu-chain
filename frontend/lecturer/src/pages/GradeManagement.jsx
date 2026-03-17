import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { Link } from "react-router-dom";
import {
    ClipboardList, BookOpen, Clock,
    ArrowRight, Search, Filter
} from "lucide-react";
import "./GradeManagement.css";

export default function GradeManagement() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grade-mgmt-container">
            <div className="grade-header card-neu">
                <div>
                    <h1 className="grade-title">Quản lý Nhập điểm</h1>
                    <p className="grade-subtitle">Chọn lớp học phần để thực hiện nhập hoặc chỉnh sửa điểm sinh viên.</p>
                </div>
                <div className="grade-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên lớp, mã lớp..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grade-loading">Đang tải danh sách lớp học...</div>
            ) : filteredClasses.length === 0 ? (
                <div className="grade-empty card-neu">
                    <ClipboardList size={48} />
                    <p>Không tìm thấy lớp học phần nào phù hợp.</p>
                </div>
            ) : (
                <div className="grade-table-card card-neu">
                    <table className="grade-table">
                        <thead>
                            <tr>
                                <th>Lớp học phần</th>
                                <th>Môn học</th>
                                <th>Học kỳ</th>
                                <th>Trạng thái</th>
                                <th className="text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClasses.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="class-identity">
                                            <span className="class-code">{c.code}</span>
                                            <span className="class-name">{c.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="subject-info">
                                            <BookOpen size={14} />
                                            <span>{c.subject}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="semester-info">
                                            <Clock size={14} />
                                            <span>{c.semester}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge bg-navy">Đang diễn ra</span>
                                    </td>
                                    <td className="text-right">
                                        <Link
                                            to={`/classes/${c.id}`}
                                            className="btn-enter-grade"
                                        >
                                            Nhập điểm <ArrowRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
