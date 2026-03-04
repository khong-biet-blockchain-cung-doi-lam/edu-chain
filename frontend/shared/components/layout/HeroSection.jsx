import React from 'react';
import './HeroSection.css';

export default function HeroSection({ title, subtitle, ctaText, onCtaClick }) {
    return (
        <section className="neu-hero">
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1 className="hero-title">{title || "KNOWLEDGE FOR DEVELOPMENT"}</h1>
                <p className="hero-subtitle">{subtitle || "Nâng tầm trí tuệ - Khơi dậy tiềm năng - Kiến tạo tương lai"}</p>
                <button className="btn btn-neu-red hero-cta" onClick={onCtaClick}>
                    {ctaText || "NỘP HỒ SƠ NGAY"}
                </button>
            </div>

            <div className="hero-geometric-pattern"></div>
        </section>
    );
}
