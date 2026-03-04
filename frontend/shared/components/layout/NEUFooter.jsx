import React from 'react';
import { Facebook, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import './NEUFooter.css';

export default function NEUFooter() {
    return (
        <footer className="neu-footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-col brand-col">
                        <h3 className="footer-title">ĐẠI HỌC KINH TẾ QUỐC DÂN</h3>
                        <p className="footer-desc">
                            Tiên phong trong đào tạo, nghiên cứu và tư vấn về kinh tế, quản lý và quản trị kinh doanh tại Việt Nam.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-icon"><Facebook size={20} /></a>
                            <a href="#" className="social-icon"><Linkedin size={20} /></a>
                            <a href="#" className="social-icon"><Twitter size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-col contact-col">
                        <h4 className="col-title">Thông tin liên hệ</h4>
                        <ul className="contact-list">
                            <li><MapPin size={18} className="icon-azure" /> 207 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội</li>
                            <li><Phone size={18} className="icon-azure" /> (84) 24 36280280</li>
                            <li><Mail size={18} className="icon-azure" /> dhktqd@neu.edu.vn</li>
                        </ul>
                    </div>

                    <div className="footer-col map-col">
                        <h4 className="col-title">Bản đồ</h4>
                        <div className="footer-map-placeholder">
                            <div className="map-overlay">
                                <span>NEU Map</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} National Economics University. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
