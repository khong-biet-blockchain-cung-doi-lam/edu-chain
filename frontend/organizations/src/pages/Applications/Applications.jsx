// frontend/organizations/src/pages/Applications/Applications.jsx
import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Check, X, Clock } from 'lucide-react';
import './Applications.css';

export default function Applications() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

  const applications = [
    {
      id: 1,
      studentName: 'Emily Martinez',
      studentInitials: 'EM',
      email: 'emily.martinez@student.edu',
      scholarship: 'Women in Tech 2026',
      appliedDate: '2026-02-01',
      status: 'pending',
      gpa: '3.92',
      program: 'Computer Science',
      year: 'Junior',
      gradient: 'gradient-blue'
    },
    {
      id: 2,
      studentName: 'James Chen',
      studentInitials: 'JC',
      email: 'james.chen@student.edu',
      scholarship: 'STEM Excellence Grant',
      appliedDate: '2026-02-02',
      status: 'reviewing',
      gpa: '3.85',
      program: 'Electrical Engineering',
      year: 'Senior',
      gradient: 'gradient-purple'
    },
    {
      id: 3,
      studentName: 'Sophia Patel',
      studentInitials: 'SP',
      email: 'sophia.patel@student.edu',
      scholarship: 'Future Leaders Grant',
      appliedDate: '2026-01-28',
      status: 'approved',
      gpa: '4.00',
      program: 'Mathematics',
      year: 'Sophomore',
      gradient: 'gradient-green'
    },
    {
      id: 4,
      studentName: 'Michael Johnson',
      studentInitials: 'MJ',
      email: 'michael.j@student.edu',
      scholarship: 'Engineering Excellence',
      appliedDate: '2026-01-25',
      status: 'rejected',
      gpa: '3.78',
      program: 'Mechanical Engineering',
      year: 'Junior',
      gradient: 'gradient-orange'
    },
    {
      id: 5,
      studentName: 'Aisha Lopez',
      studentInitials: 'AL',
      email: 'aisha.lopez@student.edu',
      scholarship: 'Women in Tech 2026',
      appliedDate: '2026-02-03',
      status: 'pending',
      gpa: '3.95',
      program: 'Data Science',
      year: 'Senior',
      gradient: 'gradient-pink'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Applications', count: applications.length },
    { id: 'pending', label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
    { id: 'reviewing', label: 'Reviewing', count: applications.filter(a => a.status === 'reviewing').length },
    { id: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
    { id: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pending Review', class: 'status-pending', icon: Clock },
      reviewing: { label: 'Under Review', class: 'status-reviewing', icon: Eye },
      approved: { label: 'Approved', class: 'status-approved', icon: Check },
      rejected: { label: 'Rejected', class: 'status-rejected', icon: X }
    };
    return configs[status] || configs.pending;
  };

  const filteredApplications = applications.filter(app => {
    const matchesTab = selectedTab === 'all' || app.status === selectedTab;
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.scholarship.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleReview = (application) => {
    setSelectedApplication(application);
  };

  const handleApprove = (id) => {
    console.log('Approving application:', id);
    // API call to approve
  };

  const handleReject = (id) => {
    console.log('Rejecting application:', id);
    // API call to reject
  };

  return (
    <div className="applications-page">
      <div className="applications-header">
        <div>
          <h1 className="applications-title">Applications</h1>
          <p className="applications-subtitle">Review and manage scholarship applications</p>
        </div>
        <button className="btn btn-secondary">
          <Download size={18} />
          Export Applications
        </button>
      </div>

      {/* Tabs */}
      <div className="applications-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="applications-toolbar">
        <div className="search-box-large">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by student name or scholarship..."
            className="search-input-large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Applications List */}
      <div className="applications-grid">
        {filteredApplications.map((application) => {
          const statusConfig = getStatusConfig(application.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div key={application.id} className="application-card">
              <div className="application-card-header">
                <div className="student-info-card">
                  <div className={`student-avatar-large ${application.gradient}`}>
                    {application.studentInitials}
                  </div>
                  <div>
                    <h3 className="student-name-large">{application.studentName}</h3>
                    <p className="student-email">{application.email}</p>
                  </div>
                </div>
                <span className={`status-badge-large ${statusConfig.class}`}>
                  <StatusIcon size={16} />
                  {statusConfig.label}
                </span>
              </div>

              <div className="application-card-body">
                <div className="application-detail-row">
                  <span className="detail-label">Scholarship:</span>
                  <span className="detail-value">{application.scholarship}</span>
                </div>
                <div className="application-detail-row">
                  <span className="detail-label">Program:</span>
                  <span className="detail-value">{application.program}</span>
                </div>
                <div className="application-detail-row">
                  <span className="detail-label">Year:</span>
                  <span className="detail-value">{application.year}</span>
                </div>
                <div className="application-detail-row">
                  <span className="detail-label">GPA:</span>
                  <span className="detail-value font-bold">{application.gpa}</span>
                </div>
                <div className="application-detail-row">
                  <span className="detail-label">Applied:</span>
                  <span className="detail-value">
                    {new Date(application.appliedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="application-card-actions">
                <button
                  onClick={() => handleReview(application)}
                  className="btn btn-secondary btn-sm btn-full"
                >
                  <Eye size={16} />
                  View Details
                </button>
                {application.status === 'pending' && (
                  <div className="action-buttons-group">
                    <button
                      onClick={() => handleApprove(application.id)}
                      className="btn btn-success btn-sm"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(application.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">No applications found</h3>
          <p className="empty-text">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'No applications match the selected filter'}
          </p>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-student-info">
                <div className={`student-avatar-large ${selectedApplication.gradient}`}>
                  {selectedApplication.studentInitials}
                </div>
                <div>
                  <h3 className="student-name-large">{selectedApplication.studentName}</h3>
                  <p className="student-email">{selectedApplication.email}</p>
                </div>
              </div>

              <div className="modal-details-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Scholarship</span>
                  <span className="modal-detail-value">{selectedApplication.scholarship}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Program</span>
                  <span className="modal-detail-value">{selectedApplication.program}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">Year Level</span>
                  <span className="modal-detail-value">{selectedApplication.year}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-label">GPA</span>
                  <span className="modal-detail-value font-bold">{selectedApplication.gpa}</span>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Documents</h4>
                <div className="documents-list">
                  <div className="document-item">
                    <span>📄 Academic Transcript</span>
                    <button className="btn btn-link">Download</button>
                  </div>
                  <div className="document-item">
                    <span>📝 Personal Essay</span>
                    <button className="btn btn-link">Download</button>
                  </div>
                  <div className="document-item">
                    <span>📋 Resume</span>
                    <button className="btn btn-link">Download</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setSelectedApplication(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {selectedApplication.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="btn btn-danger"
                  >
                    <X size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="btn btn-success"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}