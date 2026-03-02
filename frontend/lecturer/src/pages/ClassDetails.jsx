import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { ArrowLeft, Save, Loader2, CheckCircle2, UserCircle, MessageSquare } from 'lucide-react';

export default function ClassDetails() {
    const { id } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // State for tracking inline edits
    const [editingGrades, setEditingGrades] = useState({});
    const [savingId, setSavingId] = useState(null);

    const fetchClassDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/lecturer/classes/${id}`);
            setClassInfo(res.data.class_info);

            // Format students and prepare editing state
            const studs = res.data.students || [];
            setStudents(studs);

            const initialEdits = {};
            studs.forEach(s => {
                initialEdits[s.grade_id] = {
                    regular: s.scores.regular ?? '',
                    midterm: s.scores.midterm ?? '',
                    final: s.scores.final ?? ''
                };
            });
            setEditingGrades(initialEdits);

        } catch (error) {
            console.error("Failed to fetch class details", error);
            setErrorMsg("Không thể tải thông tin lớp học");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassDetails();
    }, [id]);

    const handleScoreChange = (gradeId, field, value) => {
        setEditingGrades(prev => ({
            ...prev,
            [gradeId]: {
                ...prev[gradeId],
                [field]: value
            }
        }));
    };

    const handleSaveGrade = async (student) => {
        setSavingId(student.grade_id);
        const currentEdit = editingGrades[student.grade_id];

        const payload = {
            grade_id: student.grade_id,
            scores: {
                regular: currentEdit.regular === '' ? null : parseFloat(currentEdit.regular),
                midterm: currentEdit.midterm === '' ? null : parseFloat(currentEdit.midterm),
                final: currentEdit.final === '' ? null : parseFloat(currentEdit.final)
            }
        };

        try {
            const res = await api.post('/lecturer/grades', payload);

            setStudents(prev => prev.map(s => {
                if (s.grade_id === student.grade_id) {
                    return {
                        ...s,
                        scores: {
                            ...s.scores,
                            ...payload.scores,
                            total: res.data.total
                        },
                        status: res.data.status
                    };
                }
                return s;
            }));
        } catch (error) {
            console.error("Failed to save grade", error);
            alert("Lỗi khi lưu điểm: " + (error.response?.data?.msg || "Vui lòng thử lại"));
        } finally {
            setSavingId(null);
        }
    };

    const handleRequestReview = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn gửi yêu cầu xét duyệt cho toàn bộ lớp học? Sau khi gửi, bạn sẽ không thể chỉnh sửa điểm cho đến khi có phản hồi từ phòng Khảo thí.")) return;

        setLoading(true);
        try {
            await api.post(`/lecturer/classes/${id}/request-review`);
            alert("Đã gửi yêu cầu xét duyệt thành công!");
            fetchClassDetails();
        } catch (error) {
            console.error("Failed to request review", error);
            alert("Lỗi khi gửi yêu cầu: " + (error.response?.data?.msg || "Vui lòng thử lại"));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải thông tin lớp học và danh sách sinh viên...</div>;
    if (errorMsg) return <div className="p-8 text-center text-red-500 font-bold">{errorMsg}</div>;
    if (!classInfo) return <div className="p-8 text-center text-gray-500">Không tìm thấy lớp học</div>;

    const isLocked = classInfo.is_pending_review || classInfo.is_finalized;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-2">
                <Link to="/" className="p-2 bg-white rounded-full text-gray-500 hover:text-[#C41212] hover:bg-red-50 transition shadow-sm border border-gray-200">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Lớp học</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#C41212] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{classInfo.name}</h2>
                    <p className="text-gray-500 mt-1">Mã lớp: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[#C41212]">{classInfo.code}</span></p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-red-50 px-4 py-2 rounded-lg text-right">
                        <p className="text-xs text-red-800 font-bold uppercase mb-1">Môn học</p>
                        <p className="font-bold text-[#C41212]">{classInfo.subject}</p>
                    </div>
                    {classInfo.is_finalized ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                            <CheckCircle2 size={14} className="mr-1" /> ĐÃ CHỐT ĐIỂM
                        </span>
                    ) : classInfo.is_pending_review ? (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center">
                            <Loader2 size={14} className="mr-1 animate-spin" /> ĐANG CHỜ XÉT DUYỆT
                        </span>
                    ) : (
                        <button
                            onClick={handleRequestReview}
                            className="px-4 py-2 bg-[#C41212] text-white rounded-lg text-sm font-bold hover:bg-red-800 transition shadow-sm flex items-center gap-2"
                        >
                            <Save size={16} /> Gửi yêu cầu xét duyệt
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Danh sách Sinh viên ({students.length})</h3>
                    <div className="text-xs text-gray-500 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Đã qua môn
                        <span className="w-2 h-2 rounded-full bg-red-500 ml-3 mr-1"></span> Trượt môn
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f8fafc] text-gray-600">
                            <tr>
                                <th className="px-6 py-4 font-medium">Sinh viên</th>
                                <th className="px-4 py-4 font-medium text-center w-24">Quá trình (10%)</th>
                                <th className="px-4 py-4 font-medium text-center w-24">Giữa kỳ (40%)</th>
                                <th className="px-4 py-4 font-medium text-center w-24">Cuối kỳ (50%)</th>
                                <th className="px-4 py-4 font-medium text-center">Tổng Kết</th>
                                <th className="px-6 py-4 font-medium text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((s) => {
                                const currentScores = editingGrades[s.grade_id] || {};
                                const isDirty =
                                    currentScores.regular !== (s.scores.regular ?? '') ||
                                    currentScores.midterm !== (s.scores.midterm ?? '') ||
                                    currentScores.final !== (s.scores.final ?? '');

                                const isSaving = savingId === s.grade_id;

                                return (
                                    <tr key={s.grade_id} className="hover:bg-red-50/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <UserCircle className="text-gray-400" size={24} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-800">{s.full_name}</p>
                                                        {s.review_notes && (
                                                            <div className="group relative">
                                                                <MessageSquare size={14} className="text-amber-500 cursor-help" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
                                                                    {s.review_notes}
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{s.student_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                step="0.1" min="0" max="10"
                                                className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded focus:outline-none focus:border-[#C41212] focus:ring-1 focus:ring-[#C41212] disabled:bg-gray-50 disabled:text-gray-400"
                                                value={currentScores.regular}
                                                disabled={isLocked}
                                                onChange={(e) => handleScoreChange(s.grade_id, 'regular', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                step="0.1" min="0" max="10"
                                                className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded focus:outline-none focus:border-[#C41212] focus:ring-1 focus:ring-[#C41212] disabled:bg-gray-50 disabled:text-gray-400"
                                                value={currentScores.midterm}
                                                disabled={isLocked}
                                                onChange={(e) => handleScoreChange(s.grade_id, 'midterm', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                step="0.1" min="0" max="10"
                                                className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded focus:outline-none focus:border-[#C41212] focus:ring-1 focus:ring-[#C41212] disabled:bg-gray-50 disabled:text-gray-400"
                                                value={currentScores.final}
                                                disabled={isLocked}
                                                onChange={(e) => handleScoreChange(s.grade_id, 'final', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`font-bold text-lg ${s.status === 'PASSED' ? 'text-green-600' : s.status === 'FAILED' ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {s.scores.total !== null ? parseFloat(s.scores.total).toFixed(1) : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleSaveGrade(s)}
                                                disabled={!isDirty || isSaving || isLocked}
                                                className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition w-24 mx-auto 
                                                    ${isSaving ? 'bg-gray-100 text-gray-500 cursor-not-allowed' :
                                                        isDirty ? 'bg-[#C41212] text-white hover:bg-red-800 shadow-sm' :
                                                            'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                {isSaving ? (
                                                    <><Loader2 size={14} className="animate-spin" /> <span>Lưu...</span></>
                                                ) : isDirty ? (
                                                    <><Save size={14} /> <span>Lưu điểm</span></>
                                                ) : (
                                                    <><CheckCircle2 size={14} /> <span>Đã đồng bộ</span></>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {students.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Lớp học phần này chưa có sinh viên nào đăng ký.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
