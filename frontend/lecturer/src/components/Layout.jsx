import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useLecturer } from '../context/LecturerContext';
import { 
    LayoutDashboard, 
    User,
    LogOut,
    BookOpen,
    Menu,
    X,
    ClipboardCheck
} from 'lucide-react';
import './Sidebar.css';

export default function Layout() {
    const { isAuthenticated, loading, logout } = useLecturer();
    const [isOpen, setIsOpen] = useState(true);

    if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#2563eb',fontWeight:'bold'}}>Đang tải dữ liệu...</div>;
    
    if (!isAuthenticated) return (
        <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'100vh',background:'#f8fafc'}}>
            <div style={{background:'white',padding:'2rem',borderRadius:'12px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',textAlign:'center',maxWidth:'400px',borderTop:'4px solid #ef4444'}}>
                <div style={{width:'64px',height:'64px',background:'#fef2f2',color:'#ef4444',borderRadius:'50%',display:'flex',justifyContent:'center',alignItems:'center',margin:'0 auto 1rem',fontSize:'2rem',fontWeight:'bold'}}>!</div>
                <h2 style={{fontSize:'1.25rem',fontWeight:'bold',color:'#0f172a',marginBottom:'0.5rem'}}>Lỗi Xác Thực</h2>
                <p style={{color:'#64748b',marginBottom:'1.5rem',fontSize:'0.875rem'}}>Không tìm thấy thông tin đăng nhập của Giảng viên</p>
                <button 
                    onClick={logout}
                    style={{width:'100%',background:'#2563eb',color:'white',fontWeight:'600',padding:'0.75rem 1rem',borderRadius:'8px',border:'none',cursor:'pointer'}}
                >
                    Quay lại Trang Đăng Nhập
                </button>
            </div>
        </div>
    );

    const menuItems = [
        {
            section: 'GIẢNG DẠY',
            items: [
                { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
                { path: '/profile', label: 'Thông tin cá nhân', icon: User },
            ]
        },
        {
            section: 'HỌC PHẦN',
            items: [
                { path: '/class-assignment', label: 'Nhận Lớp Học phần', icon: ClipboardCheck },
            ]
        }
    ];

    return (
        <div className="portal-layout lecturer-portal">
            {/* Sidebar */}
            <aside className={`portal-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon" style={{background: 'linear-gradient(135deg, #2563eb, #0ea5e9)'}}>
                            <BookOpen size={22} />
                        </div>
                        {isOpen && <span className="logo-text">Cổng Giảng Viên</span>}
                    </div>
                    <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={18}/> : <Menu size={18}/>}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            {isOpen && <div className="nav-section-title">{section.section}</div>}
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path + idx}
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
                    {isOpen && (
                        <div className="user-info">
                            <div className="user-avatar" style={{background:'linear-gradient(135deg,#2563eb,#0ea5e9)'}}>
                                GV
                            </div>
                            <div className="user-details">
                                <div className="user-name">Giảng viên</div>
                                <div className="user-role">NEU Portal</div>
                            </div>
                        </div>
                    )}
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={20} />
                        {isOpen && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`portal-main ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="portal-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
