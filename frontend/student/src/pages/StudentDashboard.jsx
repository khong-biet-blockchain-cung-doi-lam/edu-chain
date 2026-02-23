import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";

export default function StudentDashboard() {
    const [profile, setProfile] = useState(null);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get('/student/profile');
                setProfile(profileRes.data);
                
                const gradesRes = await api.get('/student/grades');
                setGrades(gradesRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen text-[#00528C] font-bold">Đang tải dữ liệu...</div>;
    if (!profile) return <div className="text-center text-red-500 mt-10">Không thể tải thông tin sinh viên</div>;

    return (
        <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
            <header className="bg-[#00528C] text-white shadow-md z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#00528C] font-bold text-xl border-2 border-[#FFC101]">N</div>
                        <div>
                            <h1 className="font-bold text-lg uppercase leading-tight">Trường ĐH Kinh Tế Quốc Dân</h1>
                            <p className="text-xs text-[#FFC101] opacity-90">Cổng thông tin Đào tạo</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden md:block">
                            <span className="block font-bold text-sm">{profile.personal_info.first_name} {profile.personal_info.last_name}</span>
                            <span className="block text-xs text-gray-300">{profile.student_id}</span>
                        </div>
                        <button className="bg-[#C41212] hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium shadow-sm transition">
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-gray-400">N</div>
                        <h3 className="font-bold text-gray-800">{profile.personal_info.first_name} {profile.personal_info.last_name}</h3>
                        <p className="text-sm text-gray-500">Lớp: {profile.personal_info.class_name}</p>
                        <p className="text-sm text-gray-500">Email: {profile.contact_info.email_edu}</p>
                        <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            {profile.personal_info.academic_status}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-[#00528C]">
                            <p className="text-gray-500 text-xs font-bold uppercase">Ngành đào tạo</p>
                            <p className="text-xl font-bold text-[#00528C] mt-1">{profile.enrollment_info.major}</p>
                        </div>
                        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-[#FFC101]">
                            <p className="text-gray-500 text-xs font-bold uppercase">Khóa học</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">{profile.enrollment_info.cohort}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="font-bold text-[#00528C] uppercase text-sm">Kết quả học tập</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Môn học</th>
                                        <th className="px-6 py-3 font-semibold text-center">Số TC</th>
                                        <th className="px-6 py-3 font-semibold text-center">Điểm hệ 10</th>
                                        <th className="px-6 py-3 font-semibold text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {grades.map((g, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition">
                                            <td className="px-6 py-4 font-medium text-gray-800">{g.subject_name}</td>
                                            <td className="px-6 py-4 text-center">{g.credits}</td>
                                            <td className="px-6 py-4 text-center">{g.scores.total}</td>
                                            <td className="px-6 py-4 text-center font-bold text-[#00528C]">{g.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}