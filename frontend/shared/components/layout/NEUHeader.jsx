import React from 'react';
import './NEUHeader.css';

export default function NEUHeader({ roleLabel = "SINH VIÊN" }) {
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

                    <div className="header-actions">
                        <button className="btn btn-neu-red btn-enroll">
                            {roleLabel}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
