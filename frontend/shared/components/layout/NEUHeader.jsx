import React from 'react';
import { Search } from 'lucide-react';
import './NEUHeader.css';

export default function NEUHeader() {
    return (
        <header className="neu-header">
            <div className="header-top-bar">
                <div className="header-container">
                    <div className="header-brand">
                        <div className="neu-logo-circle">
                            <div className="map-red"></div>
                        </div>
                        <div className="brand-text">
                            <span className="brand-name">ĐẠI HỌC KINH TẾ QUỐC DÂN</span>
                            <span className="brand-tagline">NATIONAL ECONOMICS UNIVERSITY</span>
                        </div>
                    </div>

                    <nav className="header-nav">
                        <ul className="nav-list">
                            <li><a href="/" className="nav-link">Trang chủ</a></li>
                            <li><a href="/about" className="nav-link">Giới thiệu</a></li>
                            <li><a href="/admissions" className="nav-link">Tuyển sinh</a></li>
                            <li><a href="/training" className="nav-link">Đào tạo</a></li>
                            <li><a href="/research" className="nav-link">Nghiên cứu</a></li>
                        </ul>
                    </nav>

                    <div className="header-actions">
                        <button className="btn-search">
                            <Search size={20} color="var(--neu-azure)" />
                        </button>
                        <button className="btn btn-neu-red btn-enroll">
                            TUYỂN SINH
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
