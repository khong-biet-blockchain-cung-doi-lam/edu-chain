import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { ArrowLeft, Save, Loader2, CheckCircle2, UserCircle, FileSpreadsheet, Upload, X, SendHorizontal } from 'lucide-react';

export default function ClassDetails() {
    const { id } = useParams();
    const [classInfo, setClassInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // State for tracking inline edits
    const [editingGrades, setEditingGrades] = useState({});
    const [savingId, setSavingId] = useState(null);

    // Review request
    const [requestingReview, setRequestingReview] = useState(false);
    const [reviewMsg, setReviewMsg] = useState('');

    // Excel upload states
    const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadResults, setUploadResults] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

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
        // Validate input logic can go here (e.g. 0-10)
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

        // Convert to numbers or null
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

            // Update local state with new total and status
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

            // Temporary success highlight could be added here
        } catch (error) {
            console.error("Failed to save grade", error);
            alert("Lỗi khi lưu điểm: " + (error.response?.data?.msg || "Vui lòng thử lại"));
        } finally {
            setSavingId(null);
        }
    };

    const handleRequestReview = async () => {
        setRequestingReview(true);
        try {
            await api.post(`/lecturer/classes/${id}/request-review`);
            setReviewMsg('✅ Đã gửi yêu cầu xét duyệt tới Phòng Khảo Thí!');
            setTimeout(() => setReviewMsg(''), 5000);
            fetchClassDetails();
        } catch (error) {
            setReviewMsg('❌ ' + (error.response?.data?.msg || 'Gửi yêu cầu thất bại'));
            setTimeout(() => setReviewMsg(''), 4000);
        } finally {
            setRequestingReview(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleExcelUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setIsUploading(true);
            const res = await api.post(`/lecturer/classes/${id}/upload-grades`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUploadResults(res.data);
            fetchClassDetails(); // Refresh the list
        } catch (error) {
            console.error("Failed to upload excel", error);
            alert("Lỗi khi upload file: " + (error.response?.data?.msg || "Vui lòng kiểm tra lại định dạng file"));
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải thông tin lớp học và danh sách sinh viên...</div>;
    if (errorMsg) return <div className="p-8 text-center text-red-500 font-bold">{errorMsg}</div>;
    if (!classInfo) return <div className="p-8 text-center text-gray-500">Không tìm thấy lớp học</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                    <Link to="/" className="p-2 bg-white rounded-full text-gray-500 hover:text-[#C41212] hover:bg-red-50 transition shadow-sm border border-gray-200">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Lớp học</h1>
                </div>
                <div className="flex items-center space-x-3">
                    {reviewMsg && (
                        <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${reviewMsg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>{reviewMsg}</span>
                    )}
                    <button
                        onClick={handleRequestReview}
                        disabled={requestingReview || classInfo?.is_pending_review || classInfo?.is_finalized}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition shadow-sm border ${classInfo?.is_pending_review || classInfo?.is_finalized
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-indigo-600 border-indigo-400 hover:bg-indigo-50'
                            }`}
                        title={classInfo?.is_finalized ? 'Điểm đã được chốt' : classInfo?.is_pending_review ? 'Đang chờ xét duyệt' : 'Gửi yêu cầu xét duyệt điểm'}
                    >
                        {requestingReview ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                        <span>
                            {classInfo?.is_finalized ? 'Đã chốt điểm' : classInfo?.is_pending_review ? 'Đang chờ xét duyệt' : 'Yêu cầu xét duyệt'}
                        </span>
                    </button>
                    <button
                        onClick={() => { setUploadResults(null); setSelectedFile(null); setIsExcelModalOpen(true); }}
                        className="flex items-center space-x-2 bg-white text-[#C41212] border border-[#C41212] px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition shadow-sm"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Nhập điểm từ Excel</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#C41212] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{classInfo.name}</h2>
                    <p className="text-gray-500 mt-1">Mã lớp: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[#C41212]">{classInfo.code}</span></p>
                </div>
                <div className="bg-red-50 px-4 py-2 rounded-lg text-right">
                    <p className="text-xs text-red-800 font-bold uppercase mb-1">Môn học</p>
                    <p className="font-bold text-[#C41212]">{classInfo.subject}</p>
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
                                                    <p className="font-bold text-gray-800">{s.full_name}</p>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{s.student_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                step="0.1" min="0" max="10"
                                                className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded focus:outline-none focus:border-[#C41212] focus:ring-1 focus:ring-[#C41212]"
                                                value={currentScores.regular}
                                                onChange={(e) => handleScoreChange(s.grade_id, 'regular', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                step="0.1" min="0" max="10"
                                                className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded focus:outline-none focus:border-[#C41212] focus:ring-1 focus:ring-[#C41212]"
                                                value={currentScores.midterm}
                                                onChange={(e) => handleScoreChange(s.grade_id, 'midterm', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                step="0.1" min="0" max="10"
                                                className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded focus:outline-none focus:border-[#C41212] focus:ring-1 focus:ring-[#C41212]"
                                                value={currentScores.final}
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
                                                disabled={!isDirty || isSaving}
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

            {/* Excel Import Modal */}
            {isExcelModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-gray-800">Import Điểm từ Excel</h2>
                            <button
                                onClick={() => setIsExcelModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 text-center">
                            {!uploadResults ? (
                                <div className="space-y-6">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-[#C41212]">
                                        <Upload size={32} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Chọn file Excel của lớp</p>
                                        <p className="text-xs text-gray-500 mt-1">File .xlsx hoặc .xls bao gồm student_id, regular_score, midterm_score, final_score</p>
                                    </div>

                                    <label className="block">
                                        <span className="sr-only">Choose file</span>
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-red-50 file:text-[#C41212]
                                                hover:file:bg-red-100
                                                cursor-pointer border border-dashed border-gray-300 rounded-lg p-2"
                                        />
                                    </label>

                                    <div className="flex space-x-3 pt-2">
                                        <button
                                            onClick={() => setIsExcelModalOpen(false)}
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition"
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            disabled={!selectedFile || isUploading}
                                            onClick={handleExcelUpload}
                                            className={`flex-1 px-4 py-2 rounded-lg font-bold text-white transition shadow-md
                                                ${!selectedFile || isUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#C41212] hover:bg-red-800'}`}
                                        >
                                            {isUploading ? 'Đang xử lý...' : 'Bắt đầu Import'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-left space-y-4">
                                    <div className={`p-4 rounded-lg flex items-start space-x-3 ${uploadResults.errors?.length > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                                        <CheckCircle2 size={20} className={uploadResults.errors?.length > 0 ? 'text-orange-600' : 'text-green-600'} />
                                        <div>
                                            <p className={`font-bold ${uploadResults.errors?.length > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                                                Xử lý hoàn tất
                                            </p>
                                            <div className="text-sm mt-1 space-y-1">
                                                <p>Tổng số: <span className="font-bold">{uploadResults.total}</span></p>
                                                <p>Thành công: <span className="font-bold text-green-600">{uploadResults.updated + uploadResults.created}</span></p>
                                                <p>Lỗi: <span className="font-bold text-red-600">{uploadResults.errors?.length || 0}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {uploadResults.errors?.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto border border-red-100 rounded-lg p-3 bg-red-50/30">
                                            <p className="text-xs font-bold text-red-800 mb-2 uppercase">Chi tiết lỗi:</p>
                                            {uploadResults.errors.map((err, idx) => (
                                                <div key={idx} className="text-xs text-red-700 py-1 border-b border-red-100 last:border-0">
                                                    <span className="font-bold">{err.row}:</span> {err.msg}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setIsExcelModalOpen(false)}
                                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg font-bold hover:bg-black transition"
                                    >
                                        Đóng lại
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
