import React, { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import api from '../api/axiosClient';
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Save, X, Edit3 } from 'lucide-react';
import './Profile.css';

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

    if (!profile) return null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">Hồ sơ Sinh viên</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                    >
                        <Edit3 size={18} />
                        Chỉnh sửa Thông tin
                    </button>
                )}
            </div>

            {msg.text && (
                <div className={`status-msg ${msg.type === 'success' ? 'status-success' : 'status-error'}`}>
                    {msg.text}
                </div>
            )}

            <div className="profile-card glass-card">
                <form onSubmit={handleSubmit}>
                    <div className="profile-banner">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar">
                                {profile.personal_info.first_name?.[0] || 'N'}
                            </div>
                        </div>
                    </div>

                    <div className="profile-info-header">
                        <div className="user-main-info">
                            <h2>{profile.personal_info.first_name} {profile.personal_info.last_name}</h2>
                            <p>
                                <span>{profile.student_id}</span>
                                <span className="text-muted">•</span>
                                <span>{profile.personal_info.class_name}</span>
                            </p>
                        </div>
                        <div className="major-badge">
                            {profile.enrollment_info.major}
                        </div>
                    </div>

                    <div className="profile-grid">
                        <div className="info-section">
                            <h3>Thông tin Cá nhân</h3>

                            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Họ và đệm</label>
                                    <input
                                        type="text" name="first_name" value={formData.first_name} onChange={handleChange} disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tên</label>
                                    <input
                                        type="text" name="last_name" value={formData.last_name} onChange={handleChange} disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Ngày sinh</label>
                                    <input
                                        type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} disabled={!isEditing}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giới tính</label>
                                    <select
                                        name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing}
                                        className="form-input"
                                    >
                                        <option value="">Chọn...</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>CCCD / CMND</label>
                                <input
                                    type="text" name="national_id" value={formData.national_id} onChange={handleChange} disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="info-section">
                            <h3>Thông tin Liên hệ</h3>
                            <div className="form-group">
                                <label>Email Trường</label>
                                <input
                                    type="text" value={profile.contact_info.email_edu || ""} disabled
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Cá nhân</label>
                                <input
                                    type="email" name="email_personal" value={formData.email_personal} onChange={handleChange} disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ thường trú</label>
                                <input
                                    type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="profile-actions">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="btn btn-cancel"
                                disabled={saving}
                            >
                                <X size={18} />
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                className="btn btn-save btn-primary"
                                disabled={saving}
                            >
                                <Save size={18} />
                                {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

