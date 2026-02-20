
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import './ScholarshipList.css';

export default function ScholarshipList() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const scholarships = [
    {
      id: 1,
      title: 'Technology Excellence Scholarship',
      amount: 5000,
      awards: 10,
      applicants: 45,
      deadline: '2026-03-15',
      status: 'active',
      created: '2026-01-10'
    },
    {
      id: 2,
      title: 'STEM Women Leadership Award',
      amount: 7500,
      awards: 5,
      applicants: 32,
      deadline: '2026-03-20',
      status: 'active',
      created: '2026-01-12'
    },
    {
      id: 3,
      title: 'Community Service Grant',
      amount: 3000,
      awards: 15,
      applicants: 58,
      deadline: '2026-02-28',
      status: 'active',
      created: '2026-01-05'
    },
    {
      id: 4,
      title: 'Innovation in AI Scholarship',
      amount: 10000,
      awards: 3,
      applicants: 67,
      deadline: '2026-04-01',
      status: 'active',
      created: '2026-01-15'
    },
    {
      id: 5,
      title: 'First Generation College Award',
      amount: 4000,
      awards: 20,
      applicants: 0,
      deadline: '2026-05-15',
      status: 'draft',
      created: '2026-02-01'
    }
  ];

  const stats = [
    { 
      label: 'Active Scholarships', 
      value: scholarships.filter(s => s.status === 'active').length 
    },
    { 
      label: 'Total Applicants', 
      value: scholarships.reduce((sum, s) => sum + s.applicants, 0) 
    },
    { 
      label: 'Total Funding', 
      value: `$${scholarships.reduce((sum, s) => sum + (s.amount * s.awards), 0).toLocaleString()}` 
    }
  ];

  const filters = [
    { id: 'all', label: 'All', count: scholarships.length },
    { id: 'active', label: 'Active', count: scholarships.filter(s => s.status === 'active').length },
    { id: 'draft', label: 'Draft', count: scholarships.filter(s => s.status === 'draft').length },
    { id: 'closed', label: 'Closed', count: scholarships.filter(s => s.status === 'closed').length }
  ];

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesFilter = selectedFilter === 'all' || scholarship.status === selectedFilter;
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusClass = (status) => {
    const classes = {
      active: 'status-active',
      draft: 'status-draft',
      closed: 'status-closed'
    };
    return classes[status] || 'status-default';
  };

  return (
    <div className="scholarship-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scholarship Programs</h1>
          <p className="page-subtitle">Manage your scholarship offerings</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Create New Scholarship
        </button>
      </div>

      {/* Stats */}
      <div className="scholarship-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="scholarship-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
          >
            {filter.label}
            <span className="filter-count">{filter.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="scholarship-search">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search scholarships..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Scholarship Grid */}
      <div className="scholarships-grid">
        {filteredScholarships.map((scholarship) => (
          <div key={scholarship.id} className="scholarship-card">
            <div className="scholarship-header">
              <h3 className="scholarship-title">{scholarship.title}</h3>
              <span className={`status-badge ${getStatusClass(scholarship.status)}`}>
                {scholarship.status}
              </span>
            </div>

            <div className="scholarship-amount">
              ${scholarship.amount.toLocaleString()}
            </div>

            <div className="scholarship-details">
              <div className="detail-item">
                <span className="detail-label">Awards:</span>
                <span className="detail-value">{scholarship.awards}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Applicants:</span>
                <span className="detail-value">{scholarship.applicants}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Deadline:</span>
                <span className="detail-value">
                  {new Date(scholarship.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="scholarship-actions">
              <button className="btn btn-outline">
                <Eye size={16} />
                View
              </button>
              <button className="btn btn-outline">
                <Edit size={16} />
                Edit
              </button>
              <button className="btn btn-outline danger">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3 className="empty-title">No scholarships found</h3>
          <p className="empty-text">Try adjusting your search or create a new scholarship</p>
          <button className="btn btn-primary">
            <Plus size={18} />
            Create Scholarship
          </button>
        </div>
      )}
    </div>
  );
}