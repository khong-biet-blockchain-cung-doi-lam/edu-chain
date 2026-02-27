import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { 
    LayoutDashboard, 
    UserCircle, 
    Award, 
    FileBadge,
    LogOut,
    GraduationCap,
    Menu,
    X,
    ClipboardEdit
} from 'lucide-react';
import './Sidebar.css';


export default function Layout() {
    const { profile, loading, errorMsg, logout } = useStudent();
    const [isOpen, setIsOpen] = useState(true);

    if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',color:'#8b5cf6',fontWeight:'bold'}}>Đang tải dữ liệu...</div>;
    
    if (!profile) return (
        <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'100vh',background:'#f8fafc'}}>
            <div style={{background:'white',padding:'2rem',borderRadius:'12px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',textAlign:'center',maxWidth:'400px',borderTop:'4px solid #ef4444'}}>
                <div style={{width:'64px',height:'64px',background:'#fef2f2',color:'#ef4444',borderRadius:'50%',display:'flex',justifyContent:'center',alignItems:'center',margin:'0 auto 1rem',fontSize:'2rem',fontWeight:'bold'}}>!</div>
                <h2 style={{fontSize:'1.25rem',fontWeight:'bold',color:'#0f172a',marginBottom:'0.5rem'}}>Lỗi Xác Thực</h2>
                <p style={{color:'#64748b',marginBottom:'1.5rem',fontSize:'0.875rem'}}>{errorMsg || "Không thể tải thông tin sinh viên"}</p>
                <button 
                    onClick={logout}
                    style={{width:'100%',background:'#8b5cf6',color:'white',fontWeight:'600',padding:'0.75rem 1rem',borderRadius:'8px',border:'none',cursor:'pointer',transition:'background 0.2s'}}
                    onMouseOver={e => e.target.style.background='#7c3aed'}
                    onMouseOut={e => e.target.style.background='#8b5cf6'}
                >
                    Quay lại Trang Đăng Nhập
                </button>
            </div>
        </div>
    );

    const menuItems = [
        {
            section: 'HỌC TẬP',
            items: [
                { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
                { path: '/profile', label: 'Hồ sơ Sinh viên', icon: UserCircle },
                { path: '/certificates', label: 'Chứng chỉ', icon: FileBadge },
                { path: '/course-registration', label: 'Đăng ký Học phần', icon: ClipboardEdit },
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
            {/* Sidebar */}
            <aside className={`portal-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon" style={{background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'}}>
                            <GraduationCap size={22} />
                        </div>
                        {isOpen && <span className="logo-text">Cổng Sinh Viên</span>}
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
                            <div className="user-avatar" style={{background:'linear-gradient(135deg,#8b5cf6,#ec4899)'}}>
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

            {/* Main Content */}
            <main className={`portal-main ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="portal-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
