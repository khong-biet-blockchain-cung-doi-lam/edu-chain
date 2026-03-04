import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { Award, Building2, Calendar, CheckCircle2, ShieldCheck, Clock, Check, XCircle } from 'lucide-react';

export default function StudentScholarships() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [msg, setMsg] = useState({ text: "", type: "" });

    const fetchScholarships = async () => {
        setLoading(true);
        try {
            const res = await api.get('/student/scholarships');
            setApplications(res.data);
        } catch (error) {
            console.error("Failed to fetch scholarships", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScholarships();
    }, []);

    const handleApply = async (scholarshipId) => {
        setActionLoading(scholarshipId);
        setMsg({ text: "", type: "" });
        try {
            await api.post(`/student/scholarships/${scholarshipId}/apply`);
            setMsg({ text: "Nộp hồ sơ thành công! Dữ liệu của bạn đã được đối tác truy cập.", type: "success" });
            fetchScholarships();
        } catch (error) {
            console.error(error);
            setMsg({ text: "Lỗi: " + (error.response?.data?.msg || "Không thể apply học bổng"), type: "error" });
        } finally {
            setActionLoading(null);
            setTimeout(() => setMsg({ text: "", type: "" }), 5000);
        }
    };

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'ELIGIBLE_PENDING_CONSENT':
                return <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs flex items-center w-max"><ShieldCheck size={14} className="mr-1"/> Cần cấp quyền ZKP</span>;
            case 'APPLIED':
                return <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-xs flex items-center w-max"><Clock size={14} className="mr-1"/> Đã nộp hồ sơ, Đang chờ duyệt</span>;
            case 'AWARDED':
                return <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs flex items-center w-max"><Check size={14} className="mr-1"/> Trúng tuyển Học bổng!</span>;
            case 'REJECTED':
                return <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs flex items-center w-max"><XCircle size={14} className="mr-1"/> Không trúng tuyển</span>;
            default:
                return <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-xs">{status}</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-[#00528C] rounded-lg shadow-sm p-6 text-white flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center"><Award className="mr-3" size={28}/> Học bổng Doanh nghiệp (ZKP)</h1>
                    <p className="mt-2 text-blue-100 max-w-2xl">
                        Hệ thống tự động sử dụng công nghệ Zero-Knowledge Proof để tìm kiếm các chương trình học bổng phù hợp với điểm GPA và Chứng chỉ của bạn. Dữ liệu của bạn hoàn toàn bảo mật cho đến khi bạn nhấn nút <b>"Cấp quyền chia sẻ"</b>.
                    </p>
                </div>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-lg font-medium text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {msg.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    {msg.text}
                </div>
            )}

            {loading ? (
                <div className="bg-white p-12 text-center text-gray-500 rounded-lg border border-gray-100 shadow-sm">
                    Đang tìm kiếm các học bổng phù hợp...
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-lg border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldCheck size={32}/></div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có Học bổng phù hợp</h3>
                    <p className="text-gray-500">Hệ thống chưa tìm thấy chương trình học bổng nào phù hợp với thành tích học tập và chứng chỉ hiện tại của bạn.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {applications.map((app) => (
                        <div key={app.application_id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-xl text-[#00528C]">{app.scholarship.title}</h3>
                                    <StatusBadge status={app.status} />
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-600 text-sm font-medium">
                                        <Building2 size={16} className="mr-2 text-gray-400"/>
                                        Doanh nghiệp: {app.scholarship.partner?.company_name || 'NEU Partner'}
                                    </div>
                                    <div className="flex items-center text-gray-600 text-sm font-medium">
                                        <Calendar size={16} className="mr-2 text-gray-400"/>
                                        Ngày đăng: {new Date(app.scholarship.created_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 mb-6">
                                    <p className="font-bold text-gray-800 mb-1">Mô tả chương trình:</p>
                                    <p>{app.scholarship.description}</p>
                                    
                                    <div className="mt-3">
                                        <span className="font-bold text-gray-800">Điều kiện đáp ứng:</span>
                                        <ul className="list-disc list-inside mt-1 text-gray-600">
                                            {app.scholarship.criteria?.min_gpa && <li>GPA tối thiểu: {app.scholarship.criteria.min_gpa}</li>}
                                            {app.scholarship.criteria?.required_certificates?.map((c, i) => (
                                                <li key={i}>Chứng chỉ: {c.name} (Tối thiểu: {c.min_score})</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {app.status === 'ELIGIBLE_PENDING_CONSENT' && (
                                <div className="bg-[#f8fafc] border-t border-gray-100 p-6">
                                    <p className="text-xs text-gray-500 mb-3 text-center">
                                        Bạn đã đủ điều kiện nhận học bổng này. Để tham gia xét duyệt, bạn cần cho phép đối tác truy cập vào hồ sơ học tập và chứng chỉ của bạn.
                                    </p>
                                    <button 
                                        onClick={() => handleApply(app.scholarship.id)}
                                        disabled={actionLoading === app.scholarship.id}
                                        className="w-full bg-[#FFC101] hover:bg-yellow-500 text-[#00528C] font-bold py-3 px-4 rounded-lg shadow transition flex items-center justify-center"
                                    >
                                        {actionLoading === app.scholarship.id ? "Đang xử lý..." : <><ShieldCheck size={20} className="mr-2"/> Cấp quyền & Nộp hồ sơ</>}
                                    </button>
                                </div>
                            )}

                            {app.status === 'APPLIED' && (
                                <div className="bg-blue-50 border-t border-blue-100 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle2 size={24}/>
                                    </div>
                                    <p className="text-sm font-bold text-blue-800">Hồ sơ đã được gửi đi</p>
                                    <p className="text-xs text-blue-600 mt-1">Đã nộp lúc: {new Date(app.applied_at).toLocaleString('vi-VN')}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
