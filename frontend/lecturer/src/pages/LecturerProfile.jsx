import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { User, Mail, Briefcase, Key } from 'lucide-react';

export default function LecturerProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [formData, setFormData] = useState({
        full_name: "",
        email: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/lecturer/profile');
            setProfile(res.data);
            setFormData({
                full_name: res.data.full_name || "",
                email: res.data.email || ""
            });
            setErrorMsg("");
        } catch (error) {
            console.error(error);
            setErrorMsg("Không thể tải thông tin hồ sơ.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setErrorMsg("");
            setSuccessMsg("");
            await api.put('/lecturer/profile', formData);
            setSuccessMsg("Cập nhật thông tin thành công!");
            setIsEditing(false);
            fetchProfile(); // Refresh data
        } catch (error) {
            console.error(error);
            setErrorMsg("Lỗi khi cập nhật thông tin: " + (error.response?.data?.msg || error.message));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải hồ sơ giảng viên...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">{errorMsg || "Không tìm thấy hồ sơ."}</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#C41212]">
                <h2 className="text-2xl font-bold text-gray-800">Thông tin Giảng Viên</h2>
                <p className="text-gray-500 mt-1">Xem và quản lý hồ sơ cá nhân của bạn trên hệ thống.</p>
            </div>

            {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{errorMsg}</div>}
            {successMsg && <div className="p-4 bg-green-50 text-green-600 rounded-lg border border-green-200">{successMsg}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-[#C41212] text-white rounded-full flex justify-center items-center text-2xl font-bold uppercase shadow-sm">
                            {(profile.full_name || profile.username).substring(0, 2)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{profile.full_name || "Chưa cập nhật tên"}</h3>
                            <p className="text-gray-500 text-sm">Mã GV: <span className="font-mono text-gray-700">{profile.lecturer_code}</span></p>
                        </div>
                    </div>
                    {!isEditing ? (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition shadow-sm"
                        >
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({ full_name: profile.full_name || "", email: profile.email || "" });
                                }}
                                className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition"
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleSave}
                                className="bg-[#C41212] text-white hover:bg-red-800 px-4 py-2 rounded-lg font-medium transition shadow-sm"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <User className="w-5 h-5 mr-2 text-[#C41212]" />
                        Thông tin Chi tiết
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <Key className="w-4 h-4 mr-1" /> Tên đăng nhập
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 font-mono">
                                    {profile.username}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Tên đăng nhập không thể thay đổi.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1" /> Mã Giảng viên
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 font-mono">
                                    {profile.lecturer_code}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-1" /> Họ và Tên
                                </label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm outline-none"
                                        placeholder="Nhập họ và tên..."
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                                        {profile.full_name || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center">
                                    <Mail className="w-4 h-4 mr-1" /> Email liên hệ
                                </label>
                                {isEditing ? (
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm outline-none"
                                        placeholder="Nhập email..."
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                                        {profile.email || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
