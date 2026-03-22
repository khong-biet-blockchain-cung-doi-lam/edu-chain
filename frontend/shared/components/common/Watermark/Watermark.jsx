import React, { useEffect, useState } from 'react';
import './Watermark.css';

/**
 * Data Leak Prevention (DLP) Watermark Component
 * Áp dụng một lớp lưới mờ chứa thông tin định danh của người dùng đè lên giao diện
 * để truy vết nếu màn hình bị chụp lại hoặc quay video.
 */
const Watermark = ({ text = "EDU-CHAIN CONFIDENTIAL" }) => {
    const [watermarkText, setWatermarkText] = useState(text);

    useEffect(() => {
        // Có thể mở rộng lấy thông tin từ localStorage/Context
        // Lấy thời gian hiện tại
        const now = new Date();
        const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        setWatermarkText(`${text} - ${timestamp}`);
    }, [text]);

    // Tạo ra nhiều bản sao của text để phủ kín màn hình
    const numberOfWatermarks = 150; 

    return (
        <div className="dlp-watermark-container">
            <div className="dlp-watermark-layer">
                {Array.from({ length: numberOfWatermarks }).map((_, index) => (
                    <div key={index} className="dlp-watermark-item">
                        {watermarkText}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Watermark;
