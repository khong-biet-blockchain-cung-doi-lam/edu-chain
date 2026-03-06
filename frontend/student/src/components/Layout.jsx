import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import {
    LayoutDashboard,
    User,
    Award,
    CheckSquare,
    LogOut,
    Menu,
    X,
    BookOpen
} from 'lucide-react';
import './Sidebar.css';
import NEUHeader from '@shared/components/layout/NEUHeader';
import NEUFooter from '@shared/components/layout/NEUFooter';


export default function Layout() {
    const { profile, loading, errorMsg, logout } = useStudent();
    const [isOpen, setIsOpen] = useState(true);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--neu-azure)', fontWeight: 'bold' }}>Đang tải dữ liệu...</div>;

    if (!profile) return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-page)' }}>
            <div className="card-neu" style={{ textAlign: 'center', maxWidth: '400px', borderTop: '4px solid var(--neu-red-crimson)' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--neu-azure-light)', color: 'var(--neu-red-crimson)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 'bold' }}>!</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--neu-navy-deep)', marginBottom: '0.5rem' }}>Lỗi Xác Thực</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{errorMsg || "Không thể tải thông tin sinh viên"}</p>
                <button
                    onClick={logout}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    Quay lại Trang Đăng Nhập
                </button>
            </div>
        </div>
    );

    const menuItems = [
        {
            section: 'Học tập', // Changed case
            items: [
                { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
                { path: '/grades', label: 'Kết quả học tập', icon: CheckSquare }, // Added new item
                { path: '/profile', label: 'Hồ sơ Sinh viên', icon: User }, // Changed icon
                { path: '/certificates', label: 'Chứng chỉ', icon: Award }, // Changed icon
                { path: '/course-registration', label: 'Đăng ký Học phần', icon: BookOpen }, // Changed icon
            ]
        },
        {
            section: 'HỌC BỔNG',
            items: [
                { path: '/scholarships', label: 'Học bổng & ZKP', icon: Award },
            ]
        }
    ];

    return (
        <div className="portal-layout student-portal">
            {/* Sidebar - Now Full Height */}
            <aside className={`portal-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            {isOpen && <div className="nav-section-title">{section.section}</div>}
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <item.icon size={20} className="nav-icon" />
                                    {isOpen && <span className="nav-label">{item.label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {isOpen && profile && (
                        <div className="user-info">
                            <div className="user-avatar" style={{ background: 'var(--neu-azure)' }}>
                                {(profile.personal_info?.first_name?.[0] || 'S')}
                            </div>
                            <div className="user-details">
                                <div className="user-name">{profile.personal_info?.first_name} {profile.personal_info?.last_name}</div>
                                <div className="user-role">{profile.student_id}</div>
                            </div>
                        </div>
                    )}
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={20} />
                        {isOpen && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main Wrapper - Header & Content & Footer */}
            <div className={`portal-main-wrapper ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <NEUHeader />
                <main className="portal-main">
                    <div className="portal-content">
                        <Outlet />
                    </div>
                </main>
                <NEUFooter />
            </div>
        </div>
    );
}
