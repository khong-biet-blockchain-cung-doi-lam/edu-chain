import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useLecturer } from '../context/LecturerContext';
import { LayoutDashboard, Users } from 'lucide-react';

export default function Layout() {
    const { isAuthenticated, loading, logout } = useLecturer();

    if (loading) return <div className="flex justify-center items-center h-screen text-[#C41212] font-bold">Đang tải dữ liệu...</div>;
    
    if (!isAuthenticated) return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md border-t-4 border-red-500">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex justify-center items-center mx-auto mb-4 text-3xl font-bold">!</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi Xác Thực</h2>
                <p className="text-gray-600 mb-6 text-sm">Không tìm thấy thông tin đăng nhập của Giảng viên</p>
                <button 
                    onClick={logout}
                    className="w-full bg-[#C41212] hover:bg-red-800 text-white font-medium py-2.5 px-4 rounded transition shadow-sm"
                >
                    Quay lại Trang Đăng Nhập
                </button>
            </div>
        </div>
    );

    const navItems = [
        { path: '/', label: 'Tổng quan Lớp học', icon: <LayoutDashboard size={20} /> }
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-[#C41212] text-white flex flex-col hidden md:flex">
                <div className="p-4 border-b border-red-800 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#C41212] font-bold text-xl border-2 border-[#FFC101]">N</div>
                    <div>
                        <h1 className="font-bold text-lg uppercase leading-tight">NEU</h1>
                        <p className="text-xs text-[#FFC101]">Cổng Giảng Viên</p>
                    </div>
                </div>
                <nav className="flex-1 py-4">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path} className="px-3 mb-1">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => 
                                        `flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors ${
                                            isActive ? 'bg-red-800 text-white font-medium' : 'text-red-100 hover:bg-red-800/50'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-10 border-b border-gray-200">
                    <div className="px-6 py-3 flex justify-between items-center">
                        <div className="font-bold text-gray-700 md:hidden">Cổng Giảng Viên NEU</div>
                        <div className="hidden md:block text-gray-500 text-sm">
                            Trường Đại Học Kinh Tế Quốc Dân
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <span className="block font-bold text-sm text-[#C41212]">Giảng Viên</span>
                            </div>
                            <button 
                                onClick={logout}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm font-medium transition shadow-sm">
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
