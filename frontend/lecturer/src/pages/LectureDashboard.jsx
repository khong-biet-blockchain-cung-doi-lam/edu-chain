import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import { Link } from "react-router-dom";

export default function LecturerDashboard() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách lớp học...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#C41212]">
                <h2 className="text-2xl font-bold text-gray-800">Xin chào, Giảng viên!</h2>
                <p className="text-gray-500 mt-1">Cô/Thầy đang có <span className="font-bold text-[#C41212]">{classes.length}</span> lớp học phần cần quản lý trong học kỳ này.</p>
            </div>

            <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold text-gray-700">Danh sách Lớp học phần được phân công</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((c) => (
                    <div key={c.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition duration-300 border border-gray-200 flex flex-col">
                        <div className="bg-[#C41212] p-4 rounded-t-lg">
                            <h4 className="font-bold text-white text-lg line-clamp-1">{c.name}</h4>
                            <span className="text-xs font-mono bg-white/20 text-white px-2 py-1 rounded inline-block mt-1">{c.code}</span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="space-y-3 text-sm flex-1">
                                <p className="text-gray-600">Môn học: <span className="font-medium text-gray-800 line-clamp-1">{c.subject}</span></p>
                                <p className="text-gray-600">Học kỳ: <span className="font-medium text-gray-800">{c.semester}</span></p>
                            </div>
                            <hr className="my-4 border-gray-100" />
                            <Link 
                                to={`/classes/${c.id}`}
                                className="w-full text-center py-2.5 bg-gray-50 border border-gray-200 text-[#C41212] rounded hover:bg-[#C41212] hover:text-white font-medium transition shadow-sm"
                            >
                                Quản lý Lớp & Nhập điểm
                            </Link>
                        </div>
                    </div>
                ))}
                
                {classes.length === 0 && (
                    <div className="col-span-full p-8 text-center bg-white rounded-lg border border-gray-100">
                        <p className="text-gray-500">Chưa có lớp học phần nào được phân công.</p>
                    </div>
                )}
            </div>
        </div>
    );
}