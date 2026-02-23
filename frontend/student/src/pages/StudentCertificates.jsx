import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function StudentCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        score: "",
        issued_date: "",
        image_url: ""
    });

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/student/certificates');
            setCertificates(res.data);
        } catch (error) {
            console.error("Failed to fetch certificates", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: "", type: "" });
        try {
            await api.post('/student/certificates', formData);
            setMsg({ text: "Thêm chứng chỉ thành công", type: "success" });
            fetchCertificates();
            setShowModal(false);
            setFormData({ name: "", code: "", score: "", issued_date: "", image_url: "" });
            
            setTimeout(() => setMsg({ text: "", type: "" }), 3000);
        } catch (error) {
            console.error(error);
            setMsg({ text: "Lỗi: " + (error.response?.data?.msg || "Không thể thêm chứng chỉ"), type: "error" });
        }
    };

    const StatusBadge = ({ status }) => {
        if (status === 'VERIFIED') return <span className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={14} /><span>Đã Xác Thực</span></span>;
        if (status === 'REJECTED') return <span className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={14} /><span>Bị Từ Chối</span></span>;
        return <span className="flex items-center space-x-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold"><Clock size={14} /><span>Chờ Duyệt</span></span>;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Chứng chỉ</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-[#00528C] hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium transition flex items-center shadow-sm"
                >
                    <Plus size={16} className="mr-2" /> Thêm Chứng chỉ
                </button>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-lg font-medium text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {msg.text}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-700">Danh sách Chứng chỉ của bạn</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải chứng chỉ...</div>
                ) : certificates.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Không có chứng chỉ nào hệ thống ghi nhận. Hãy tự khai báo bằng nút "Thêm Chứng chỉ".</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8fafc] text-gray-600">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Tên Chứng chỉ</th>
                                    <th className="px-6 py-3 font-medium text-center">Mã số (Code)</th>
                                    <th className="px-6 py-3 font-medium text-center">Điểm số/Xếp loại</th>
                                    <th className="px-6 py-3 font-medium text-center">Ngày cấp</th>
                                    <th className="px-6 py-3 font-medium text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {certificates.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">{cert.name}</td>
                                        <td className="px-6 py-4 text-center text-gray-600 font-mono">{cert.code || '-'}</td>
                                        <td className="px-6 py-4 text-center font-medium text-[#00528C]">{cert.score || '-'}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{cert.issued_date ? new Date(cert.issued_date).toLocaleDateString('vi-VN') : '-'}</td>
                                        <td className="px-6 py-4 flex justify-center">
                                            <StatusBadge status={cert.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Thêm Chứng Chỉ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg text-gray-800">Thêm Chứng chỉ mới</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Chứng chỉ *</label>
                                <input 
                                    type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Ví dụ: IELTS, TOEIC..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00528C]/50 focus:border-[#00528C] transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác nhận (Code)</label>
                                    <input 
                                        type="text" name="code" value={formData.code} onChange={handleChange} placeholder="Mã tra cứu"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00528C]/50 focus:border-[#00528C] transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm / Kết quả</label>
                                    <input 
                                        type="text" name="score" value={formData.score} onChange={handleChange} placeholder="Chuyên môn, IELTS 7.5..."
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00528C]/50 focus:border-[#00528C] transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                                <input 
                                    type="date" name="issued_date" value={formData.issued_date} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00528C]/50 focus:border-[#00528C] transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh chụp minh chứng</label>
                                <input 
                                    type="url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00528C]/50 focus:border-[#00528C] transition"
                                />
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button 
                                    type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#00528C] text-white rounded-lg hover:bg-blue-800 font-medium transition shadow-sm"
                                >
                                    Nộp Chứng Chỉ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
