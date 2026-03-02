import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import api from '../api/axiosClient';
import { Shield, Lock } from 'lucide-react';

export default function StudentProfile() {
    const { profile, fetchProfile } = useStudent();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        national_id: "",
        phone: "",
        email_personal: "",
        address: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.personal_info.first_name || "",
                last_name: profile.personal_info.last_name || "",
                date_of_birth: profile.personal_info.date_of_birth || "",
                gender: profile.personal_info.gender || "",
                national_id: profile.personal_info.national_id || "",
                phone: profile.contact_info.phone || "",
                email_personal: profile.contact_info.email_personal || "",
                address: profile.contact_info.address || ""
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg({ text: "", type: "" });
        try {
            await api.put('/student/profile', formData);
            setMsg({ text: "Cập nhật hồ sơ thành công", type: "success" });
            fetchProfile(); // refresh context
            setIsEditing(false);

            // clear message after 3 seconds
            setTimeout(() => setMsg({ text: "", type: "" }), 3000);
        } catch (error) {
            console.error(error);
            setMsg({
                text: "Lỗi: " + (error.response?.data?.msg || "Không thể cập nhật hồ sơ"),
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    const isLocked = profile.personal_info.is_locked;

    if (!profile) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Sinh viên</h1>
                {!isEditing && !isLocked && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#00528C] hover:bg-blue-800 text-white px-4 py-2 rounded text-sm font-medium transition shadow-sm"
                    >
                        Chỉnh sửa Thông tin
                    </button>
                )}
                {isLocked && (
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 font-medium text-sm">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Hồ sơ đã khóa - Chờ QLĐT duyệt
                    </div>
                )}
            </div>

            {msg.text && (
                <div className={`p-4 rounded-lg font-medium text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {msg.text}
                </div>
            )}

            <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${isLocked ? 'opacity-90' : ''}`}>
                <form onSubmit={handleSubmit}>
                    {/* Card Header Info */}
                    <div className="p-6 border-b border-gray-100 bg-[#f8fafc] flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0">
                        <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#00528C] font-bold text-4xl border-4 shadow-sm ${isLocked ? 'border-amber-400' : 'border-[#00528C]'}`}>
                            {profile.personal_info.first_name?.[0] || 'N'}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-800">{profile.personal_info.first_name} {profile.personal_info.last_name}</h2>
                            <p className="text-gray-500 font-medium">{profile.student_id} - {profile.personal_info.class_name}</p>
                            <div className="flex gap-2 mt-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-[#00528C]/10 text-[#00528C] text-xs font-bold rounded-full uppercase">
                                    {profile.enrollment_info.major}
                                </span>
                                {isLocked && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase border border-amber-200">
                                        ĐÃ KHÓA
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cột 1: Thông tin cá nhân */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Thông tin Cá nhân</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Họ và đệm</label>
                                    <input
                                        type="text" name="first_name" value={formData.first_name} onChange={handleChange} disabled={!isEditing || isLocked}
                                        className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên</label>
                                    <input
                                        type="text" name="last_name" value={formData.last_name} onChange={handleChange} disabled={!isEditing || isLocked}
                                        className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày sinh</label>
                                    <input
                                        type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} disabled={!isEditing || isLocked}
                                        className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giới tính</label>
                                    <select
                                        name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing || isLocked}
                                        className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Chọn...</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CCCD / CMND</label>
                                <input
                                    type="text" name="national_id" value={formData.national_id} onChange={handleChange} disabled={!isEditing || isLocked}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Cột 2: Thông tin liên hệ */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Thông tin Liên hệ</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Trường</label>
                                <input
                                    type="text" value={profile.contact_info.email_edu || ""} disabled
                                    className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-gray-500 font-medium cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Không thể thay đổi email trường.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Cá nhân</label>
                                <input
                                    type="email" name="email_personal" value={formData.email_personal} onChange={handleChange} disabled={!isEditing || isLocked}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing || isLocked}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Địa chỉ thường trú</label>
                                <input
                                    type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing || isLocked}
                                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#00528C] disabled:opacity-75 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center gap-3 bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 text-sm border border-blue-100">
                                <Shield size={16} />
                                <span>Lưu ý: Sau khi bấm <b>Lưu & Khóa</b>, bạn sẽ không thể chỉnh sửa hồ sơ cho đến khi được Phòng QLĐT phê duyệt.</span>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 font-medium transition"
                                    disabled={saving}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#00528C] text-white rounded hover:bg-blue-800 font-medium shadow-sm transition flex items-center gap-2"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} />
                                            Lưu & Khóa hồ sơ
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
