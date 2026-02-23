import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";

export default function LecturerDashboard() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get('token');
        
        if (token) {
            localStorage.setItem('access_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

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

    if (loading) return <div className="flex justify-center items-center h-screen text-[#C41212] font-bold">Đang tải...</div>;

    return (
        <div className="bg-gray-50 font-sans min-h-screen">
            <header className="bg-[#C41212] text-white shadow-md">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#C41212] font-bold text-xl shadow-sm">N</div>
                        <div>
                            <h1 className="font-bold text-lg uppercase">Cổng Giảng Viên</h1>
                            <p className="text-xs text-white/80">Hệ thống Quản lý Đào tạo</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => {
                                localStorage.removeItem('access_token');
                                window.location.href = import.meta.env.VITE_LOGIN_URL || 'http://localhost:3000';
                            }}
                            className="bg-white text-[#C41212] hover:bg-red-50 font-medium px-4 py-1.5 rounded text-sm transition shadow-sm">
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-[#00528C]">
                    <h2 className="text-2xl font-bold text-gray-800">Xin chào, Giảng viên!</h2>
                    <p className="text-gray-500 mt-1">Cô/Thầy đang có <span className="font-bold text-[#C41212]">{classes.length}</span> lớp học phần cần quản lý.</p>
                </div>

                <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Danh sách Lớp học phần</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((c, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition duration-300 border border-gray-200">
                            <div className="bg-[#00528C] p-4 rounded-t-lg">
                                <h4 className="font-bold text-white text-lg">{c.name}</h4>
                                <span className="text-xs bg-white/20 text-white px-2 py-1 rounded inline-block mt-1">{c.code}</span>
                            </div>
                            <div className="p-5 space-y-3 text-sm">
                                <p className="text-gray-600">Môn học: <span className="font-medium text-gray-800">{c.subject}</span></p>
                                <p className="text-gray-600">Học kỳ: <span className="font-medium text-gray-800">{c.semester}</span></p>
                                <hr className="my-2 border-gray-100" />
                                <div className="flex space-x-2 pt-1">
                                    <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition">
                                        DS Lớp
                                    </button>
                                    <button className="flex-1 py-2 bg-[#C41212] text-white rounded hover:bg-red-700 font-medium transition shadow-sm">
                                        Nhập điểm
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}