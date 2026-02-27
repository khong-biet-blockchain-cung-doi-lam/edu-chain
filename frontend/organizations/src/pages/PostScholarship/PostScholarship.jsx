// frontend/organizations/src/pages/PostScholarship/PostScholarship.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Send } from 'lucide-react';
import './PostScholarship.css';

export default function PostScholarship() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    numberOfAwards: '',
    deadline: '',
    program: '',
    description: '',
    requirements: {
      transcript: true,
      essay: true,
      recommendation: false,
      resume: false
    },
    eligibility: {
      minGPA: '',
      yearLevel: [],
      citizenship: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category, field) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  const handleYearLevelChange = (year) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        yearLevel: prev.eligibility.yearLevel.includes(year)
          ? prev.eligibility.yearLevel.filter(y => y !== year)
          : [...prev.eligibility.yearLevel, year]
      }
    }));
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...', formData);
    // API call to save draft
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to publish scholarship
      console.log('Publishing scholarship...', formData);
      setTimeout(() => {
        setLoading(false);
        navigate('/scholarships');
      }, 1500);
    } catch (error) {
      console.error('Error publishing scholarship:', error);
      setLoading(false);
    }
  };

  return (
    <div className="post-scholarship-page">
      <div className="page-header">
        <button onClick={() => navigate('/scholarships')} className="back-btn">
          <ArrowLeft size={20} />
          Trở lại danh sách Học bổng
        </button>
        <div className="header-actions">
          <button onClick={handleSaveDraft} className="btn btn-secondary">
            <Save size={18} />
            Lưu Nháp
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="btn btn-secondary">
            <Eye size={18} />
            Xem trước
          </button>
        </div>
      </div>

      <div className="page-title-section">
        <h1 className="page-title">
          {isEditMode ? 'Chỉnh sửa Học bổng' : 'Tạo Học bổng Mới'}
        </h1>
        <p className="page-subtitle">
          Điền thông tin bên dưới để tạo học bổng mới
        </p>
      </div>

      <form onSubmit={handlePublish} className="scholarship-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2 className="section-title">Thông tin Cơ bản</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Tên Học bổng *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="VD: Học bổng Xuất sắc Công nghệ TechCorp 2026"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <span className="form-hint">Chọn một cái tên rõ ràng và mô tả được học bổng của bạn</span>
            </div>

            <div className="form-group">
              <label className="form-label">Mức Tài trợ *</label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  name="amount"
                  className="form-input input-with-prefix-field"
                  placeholder="10,000"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Số lượng Suất học bổng *</label>
              <input
                type="number"
                name="numberOfAwards"
                className="form-input"
                placeholder="5"
                min="1"
                value={formData.numberOfAwards}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hạn nộp Đơn *</label>
              <input
                type="date"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chương trình Áp dụng *</label>
              <select
                name="program"
                className="form-select"
                value={formData.program}
                onChange={handleInputChange}
                required
              >
                <option value="">Chọn chương trình</option>
                <option value="computer-science">Khoa học Máy tính</option>
                <option value="engineering">Kỹ thuật</option>
                <option value="mathematics">Toán học</option>
                <option value="data-science">Khoa học Dữ liệu</option>
                <option value="all-stem">Tất cả chương trình STEM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h2 className="section-title">Mô tả Học bổng</h2>
          <div className="form-group">
            <label className="form-label">Mô tả chi tiết *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="6"
              placeholder="Cung cấp thông tin chi tiết về học bổng, mục đích và những gì bạn tìm kiếm ở ứng viên..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <span className="form-hint">
              Bao gồm thông tin về tổ chức của bạn, mục tiêu học bổng và tiêu chí lựa chọn
            </span>
          </div>
        </div>

        {/* Eligibility Requirements */}
        <div className="form-section">
          <h2 className="section-title">Điều kiện Xét duyệt</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">GPA tối thiểu</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                className="form-input"
                placeholder="3.5"
                value={formData.eligibility.minGPA}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  eligibility: { ...prev.eligibility, minGPA: e.target.value }
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tình trạng Quốc tịch</label>
              <select
                className="form-select"
                value={formData.eligibility.citizenship}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  eligibility: { ...prev.eligibility, citizenship: e.target.value }
                }))}
              >
                <option value="">Any</option>
                <option value="citizen">Citizens Only</option>
                <option value="permanent-resident">Citizens & Permanent Residents</option>
                <option value="international">International Students Welcome</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Bậc Năm học</label>
              <div className="checkbox-group">
                {['Năm 1', 'Năm 2', 'Năm 3', 'Năm 4', 'Tốt nghiệp'].map((year) => (
                  <label key={year} className="checkbox-label">
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={formData.eligibility.yearLevel.includes(year)}
                      onChange={() => handleYearLevelChange(year)}
                    />
                    <span>{year}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className="form-section">
          <h2 className="section-title">Tài liệu Yêu cầu</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.requirements.transcript}
                onChange={() => handleCheckboxChange('requirements', 'transcript')}
              />
              <span>Bảng điểm Học tập</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.requirements.essay}
                onChange={() => handleCheckboxChange('requirements', 'essay')}
              />
              <span>Bài Tự luận Cá nhân</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.requirements.recommendation}
                onChange={() => handleCheckboxChange('requirements', 'recommendation')}
              />
              <span>Thư Giới thiệu</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.requirements.resume}
                onChange={() => handleCheckboxChange('requirements', 'resume')}
              />
              <span>Resume/CV</span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/scholarships')}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang tải...
              </>
            ) : (
              <>
                <Send size={18} />
                Đăng Học bổng
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}