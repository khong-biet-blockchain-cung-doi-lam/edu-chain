// frontend/organizations/src/pages/Profile/Profile.jsx
import React, { useState } from 'react';
import { 
  Building2, MapPin, Mail, Phone, Globe, Users, 
  Calendar, Award, CheckCircle, Edit, Save, X 
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: 'TechCorp Foundation Inc.',
    industry: 'Technology',
    founded: '2015',
    size: '500-1000',
    website: 'https://www.techcorpfoundation.org',
    email: 'contact@techcorpfoundation.org',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Street, San Francisco, CA 94105',
    description: 'TechCorp Foundation is dedicated to empowering the next generation of technology leaders through educational scholarships and mentorship programs. We believe in creating opportunities for talented students from diverse backgrounds.',
    mission: 'To bridge the gap between education and industry by providing financial support and career development opportunities to aspiring technologists.',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: 'https://twitter.com/techcorp',
      facebook: 'https://facebook.com/techcorp'
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = () => {
    console.log('Saving profile...', formData);
    // API call to save profile
    setIsEditing(false);
  };

  const stats = [
    { label: 'Scholarships Created', value: '23', icon: Award },
    { label: 'Students Supported', value: '156', icon: Users },
    { label: 'Years Active', value: '9', icon: Calendar },
    { label: 'Success Rate', value: '87%', icon: CheckCircle }
  ];

  return (
    <div className="profile-page">
      {/* Header Section */}
      <div className="profile-header-section">
        <div className="profile-header-content">
          <div className="organization-logo-large">
            <Building2 size={48} />
          </div>
          <div className="organization-info">
            <h1 className="organization-name">{formData.organizationName}</h1>
            <div className="organization-meta">
              <span className="meta-item">
                <MapPin size={16} />
                San Francisco, CA
              </span>
              <span className="meta-item">
                <Building2 size={16} />
                {formData.industry}
              </span>
              <span className="verified-badge">
                <CheckCircle size={16} />
                Verified Partner
              </span>
            </div>
          </div>
        </div>
        <div className="profile-header-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary">
              <Edit size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                <X size={18} />
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="profile-stat-card">
              <div className="profile-stat-icon">
                <Icon size={24} />
              </div>
              <div className="profile-stat-value">{stat.value}</div>
              <div className="profile-stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="profile-content-grid">
        {/* Left Column */}
        <div className="profile-main-column">
          {/* About Section */}
          <div className="profile-section">
            <h2 className="section-title">About Organization</h2>
            {isEditing ? (
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <p className="section-text">{formData.description}</p>
            )}
          </div>

          {/* Mission Section */}
          <div className="profile-section">
            <h2 className="section-title">Our Mission</h2>
            {isEditing ? (
              <div className="form-group">
                <label className="form-label">Mission Statement</label>
                <textarea
                  name="mission"
                  className="form-textarea"
                  rows="3"
                  value={formData.mission}
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <p className="section-text">{formData.mission}</p>
            )}
          </div>

          {/* Company Information */}
          <div className="profile-section">
            <h2 className="section-title">Company Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Organization Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="organizationName"
                    className="form-input"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="info-value">{formData.organizationName}</div>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Industry</label>
                {isEditing ? (
                  <select
                    name="industry"
                    className="form-select"
                    value={formData.industry}
                    onChange={handleInputChange}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="info-value">{formData.industry}</div>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Founded</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="founded"
                    className="form-input"
                    value={formData.founded}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="info-value">{formData.founded}</div>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Company Size</label>
                {isEditing ? (
                  <select
                    name="size"
                    className="form-select"
                    value={formData.size}
                    onChange={handleInputChange}
                  >
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500-1000">500-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                ) : (
                  <div className="info-value">{formData.size} employees</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Info */}
        <div className="profile-sidebar-column">
          {/* Contact Information */}
          <div className="profile-section">
            <h2 className="section-title">Contact Information</h2>
            <div className="contact-list">
              <div className="contact-item">
                <div className="contact-icon">
                  <Globe size={20} />
                </div>
                <div className="contact-details">
                  <div className="contact-label">Website</div>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      className="form-input"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="contact-value link">
                      {formData.website}
                    </a>
                  )}
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={20} />
                </div>
                <div className="contact-details">
                  <div className="contact-label">Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <a href={`mailto:${formData.email}`} className="contact-value link">
                      {formData.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={20} />
                </div>
                <div className="contact-details">
                  <div className="contact-label">Phone</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="contact-value">{formData.phone}</div>
                  )}
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>
                <div className="contact-details">
                  <div className="contact-label">Address</div>
                  {isEditing ? (
                    <textarea
                      name="address"
                      className="form-textarea"
                      rows="2"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="contact-value">{formData.address}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="profile-section">
            <h2 className="section-title">Social Media</h2>
            <div className="social-links">
              <div className="social-item">
                <div className="social-icon linkedin">in</div>
                {isEditing ? (
                  <input
                    type="url"
                    name="socialMedia.linkedin"
                    className="form-input"
                    placeholder="LinkedIn URL"
                    value={formData.socialMedia.linkedin}
                    onChange={handleInputChange}
                  />
                ) : (
                  <a href={formData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    LinkedIn
                  </a>
                )}
              </div>
              <div className="social-item">
                <div className="social-icon twitter">𝕏</div>
                {isEditing ? (
                  <input
                    type="url"
                    name="socialMedia.twitter"
                    className="form-input"
                    placeholder="Twitter URL"
                    value={formData.socialMedia.twitter}
                    onChange={handleInputChange}
                  />
                ) : (
                  <a href={formData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                    Twitter
                  </a>
                )}
              </div>
              <div className="social-item">
                <div className="social-icon facebook">f</div>
                {isEditing ? (
                  <input
                    type="url"
                    name="socialMedia.facebook"
                    className="form-input"
                    placeholder="Facebook URL"
                    value={formData.socialMedia.facebook}
                    onChange={handleInputChange}
                  />
                ) : (
                  <a href={formData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="profile-section verification-section">
            <h2 className="section-title">Verification Status</h2>
            <div className="verification-item verified">
              <CheckCircle size={20} />
              <span>Email Verified</span>
            </div>
            <div className="verification-item verified">
              <CheckCircle size={20} />
              <span>Organization Verified</span>
            </div>
            <div className="verification-item verified">
              <CheckCircle size={20} />
              <span>Tax ID Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}