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
          Back to Scholarships
        </button>
        <div className="header-actions">
          <button onClick={handleSaveDraft} className="btn btn-secondary">
            <Save size={18} />
            Save Draft
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="btn btn-secondary">
            <Eye size={18} />
            Preview
          </button>
        </div>
      </div>

      <div className="page-title-section">
        <h1 className="page-title">
          {isEditMode ? 'Edit Scholarship' : 'Create New Scholarship'}
        </h1>
        <p className="page-subtitle">
          Fill in the details below to create a new scholarship opportunity
        </p>
      </div>

      <form onSubmit={handlePublish} className="scholarship-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Scholarship Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g., TechCorp STEM Excellence Scholarship 2026"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <span className="form-hint">Choose a clear, descriptive title for your scholarship</span>
            </div>

            <div className="form-group">
              <label className="form-label">Award Amount *</label>
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
              <label className="form-label">Number of Awards *</label>
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
              <label className="form-label">Application Deadline *</label>
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
              <label className="form-label">Eligible Programs *</label>
              <select
                name="program"
                className="form-select"
                value={formData.program}
                onChange={handleInputChange}
                required
              >
                <option value="">Select program</option>
                <option value="computer-science">Computer Science</option>
                <option value="engineering">Engineering</option>
                <option value="mathematics">Mathematics</option>
                <option value="data-science">Data Science</option>
                <option value="all-stem">All STEM Programs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="form-section">
          <h2 className="section-title">Scholarship Description</h2>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="6"
              placeholder="Provide detailed information about the scholarship, its purpose, and what you're looking for in candidates..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <span className="form-hint">
              Include information about your organization, scholarship goals, and selection criteria
            </span>
          </div>
        </div>

        {/* Eligibility Requirements */}
        <div className="form-section">
          <h2 className="section-title">Eligibility Requirements</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Minimum GPA</label>
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
              <label className="form-label">Citizenship Status</label>
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
              <label className="form-label">Year Level</label>
              <div className="checkbox-group">
                {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map((year) => (
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
          <h2 className="section-title">Required Documents</h2>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.requirements.transcript}
                onChange={() => handleCheckboxChange('requirements', 'transcript')}
              />
              <span>Academic Transcript</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.requirements.essay}
                onChange={() => handleCheckboxChange('requirements', 'essay')}
              />
              <span>Personal Essay</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.requirements.recommendation}
                onChange={() => handleCheckboxChange('requirements', 'recommendation')}
              />
              <span>Letters of Recommendation</span>
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
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Publishing...
              </>
            ) : (
              <>
                <Send size={18} />
                Publish Scholarship
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}