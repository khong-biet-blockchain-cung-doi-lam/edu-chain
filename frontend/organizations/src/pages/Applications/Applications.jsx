import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Check, X, Clock, Loader2 } from 'lucide-react';
import applicationService from '../../services/applicationService';
import './Applications.css';

export default function Applications() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getAllApplications();
      // map api fields to component fields
      const formatted = data.map(app => ({
        id: app.id,
        studentName: app.student_name,
        studentInitials: app.student_name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
        email: app.student_email,
        scholarship: app.scholarship_title,
        appliedDate: app.applied_at,
        status: app.status.toLowerCase(), // API returns APPLIED, APPROVED, REJECTED
        gpa: app.gpa ? parseFloat(app.gpa).toFixed(2) : 'N/A',
        program: app.program || 'N/A',
        year: app.year || 'N/A',
        gradient: ['gradient-blue', 'gradient-purple', 'gradient-green', 'gradient-orange', 'gradient-pink'][Math.floor(Math.random()*5)]
      }));
      setApplications(formatted);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // API returns "APPLIED" which is "pending" in the old UI.
  // Lets map status for tabs: 'pending' -> 'applied'
  const tabs = [
    { id: 'all', label: 'All Applications', count: applications.length },
    { id: 'applied', label: 'Pending', count: applications.filter(a => a.status === 'applied').length },
    { id: 'reviewing', label: 'Reviewing', count: applications.filter(a => a.status === 'reviewing').length },
    { id: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
    { id: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      applied: { label: 'Pending Review', class: 'status-pending', icon: Clock },
      pending: { label: 'Pending Review', class: 'status-pending', icon: Clock },
      reviewing: { label: 'Under Review', class: 'status-reviewing', icon: Eye },
      approved: { label: 'Approved', class: 'status-approved', icon: Check },
      rejected: { label: 'Rejected', class: 'status-rejected', icon: X }
    };
    return configs[status] || configs.pending;
  };

  const filteredApplications = applications.filter(app => {
    const matchesTab = selectedTab === 'all' || app.status === selectedTab || (selectedTab === 'pending' && app.status === 'applied');
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.scholarship.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleReview = (application) => {
    setSelectedApplication(application);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await applicationService.approveApplication(id);
      fetchApplications();
    } catch (error) {
      console.error(error);
      alert('Error approving application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await applicationService.rejectApplication(id);
      fetchApplications();
    } catch (error) {
      console.error(error);
      alert('Error rejecting application');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="applications-page">
      <div className="applications-header">
        <div>
          <h1 className="applications-title">Applications Data Room</h1>
          <p className="applications-subtitle">Review and manage scholarship applications revealed via ZKP Consent</p>
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
        {loading ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-12 flex justify-center text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu hồ sơ...
          </div>
        ) : filteredApplications.map((application) => {
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
                  <span className="detail-value font-bold text-[#00528C]">{application.gpa}</span>
                </div>
                <div className="application-detail-row">
                  <span className="detail-label">Applied:</span>
                  <span className="detail-value">
                    {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'N/A'}
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
                {application.status === 'applied' && (
                  <div className="action-buttons-group">
                    <button
                      onClick={() => handleApprove(application.id)}
                      disabled={actionLoading === application.id}
                      className="btn btn-success btn-sm flex-1 justify-center"
                    >
                      {actionLoading === application.id ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Approve</>}
                    </button>
                    <button
                      onClick={() => handleReject(application.id)}
                      disabled={actionLoading === application.id}
                      className="btn btn-danger btn-sm flex-1 justify-center"
                    >
                       {actionLoading === application.id ? <Loader2 size={16} className="animate-spin" /> : <><X size={16} /> Reject</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredApplications.length === 0 && (
        <div className="empty-state w-full col-span-full py-12">
          <div className="empty-icon text-4xl mb-3 text-gray-300">📋</div>
          <h3 className="empty-title text-xl font-bold text-gray-600">No applications found</h3>
          <p className="empty-text text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'No students have consented to share their data for this scholarship yet.'}
          </p>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex justify-between items-center">
              <h2 className="modal-title font-bold text-xl text-gray-800">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body p-6">
              <div className="modal-student-info flex items-center mb-6">
                <div className={`student-avatar-large ${selectedApplication.gradient} w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4`}>
                  {selectedApplication.studentInitials}
                </div>
                <div>
                  <h3 className="student-name-large font-bold text-xl text-gray-800">{selectedApplication.studentName}</h3>
                  <p className="student-email text-gray-500">{selectedApplication.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                <div className="modal-detail-item">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Scholarship</span>
                  <span className="font-medium text-gray-800">{selectedApplication.scholarship}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Program</span>
                  <span className="font-medium text-gray-800">{selectedApplication.program}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Year Level</span>
                  <span className="font-medium text-gray-800">{selectedApplication.year}</span>
                </div>
                <div className="modal-detail-item">
                  <span className="block text-xs font-bold text-gray-500 uppercase">ZKP Verified GPA</span>
                  <span className="font-bold text-[#C41212] text-lg">{selectedApplication.gpa}</span>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Verified Documents (ZKP)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-100">
                    <span className="text-green-800 font-medium">✅ Academic Transcript</span>
                    <button className="text-green-600 hover:text-green-800 text-sm font-bold">View Data</button>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                    <span className="text-gray-700 font-medium">✅ IELTS Certificate (7.5)</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">View Data</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer p-4 bg-gray-50 border-t flex justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium transition"
              >
                Close
              </button>
              {selectedApplication.status === 'applied' && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 font-medium transition flex items-center"
                  >
                    <X size={18} className="mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition shadow-sm flex items-center"
                  >
                    <Check size={18} className="mr-1" />
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