import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useStudent } from "../context/StudentContext";
import { BookOpen, GraduationCap, Award } from "lucide-react";

export default function StudentDashboard() {
    const { profile } = useStudent();
    const [grades, setGrades] = useState([]);
    const [loadingGrades, setLoadingGrades] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const gradesRes = await api.get('/student/grades');
                setGrades(gradesRes.data);
            } catch (error) {
                console.error("Failed to load grades:", error);
            } finally {
                setLoadingGrades(false);
            }
        };
        if (profile) fetchGrades();
    }, [profile]);

    // Calculate basic stats
    const totalCredits = grades.reduce((sum, g) => sum + g.credits, 0);
    const passedCredits = grades.filter(g => g.scores.total >= 4.0).reduce((sum, g) => sum + g.credits, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Tổng quan Học tập</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Ngành đào tạo</p>
                        <p className="font-bold text-gray-800 break-words">{profile.enrollment_info.major}</p>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Trạng thái học tập</p>
                        <p className="font-bold text-gray-800">{profile.personal_info.academic_status}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-full">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tín chỉ tích luỹ</p>
                        <p className="font-bold text-gray-800">{passedCredits} / {totalCredits}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-700">Kết quả học tập (Hệ 10)</h2>
                </div>
                
                {loadingGrades ? (
                    <div className="p-8 text-center text-gray-500">Đang tải điểm số...</div>
                ) : grades.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Chưa có kết quả học tập nào được ghi nhận.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8fafc] text-gray-600">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Môn học</th>
                                    <th className="px-6 py-3 font-medium text-center">Số TC</th>
                                    <th className="px-6 py-3 font-medium text-center">QT</th>
                                    <th className="px-6 py-3 font-medium text-center">GK</th>
                                    <th className="px-6 py-3 font-medium text-center">CK</th>
                                    <th className="px-6 py-3 font-medium text-center">Tổng kết</th>
                                    <th className="px-6 py-3 font-medium text-center">Đánh giá</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grades.map((g, idx) => {
                                    const isPass = g.scores.total >= 4.0;
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-800">{g.subject_name}</td>
                                            <td className="px-6 py-4 text-center text-gray-600">{g.credits}</td>
                                            <td className="px-6 py-4 text-center">{g.scores.regular ?? '-'}</td>
                                            <td className="px-6 py-4 text-center">{g.scores.midterm ?? '-'}</td>
                                            <td className="px-6 py-4 text-center">{g.scores.final ?? '-'}</td>
                                            <td className="px-6 py-4 text-center font-bold text-[#00528C]">{g.scores.total ?? '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                {g.scores.total !== null ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {isPass ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                                                    </span>
                                                ) : <span className="text-gray-400">-</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}