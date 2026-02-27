import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import scholarshipService from "../../services/scholarshipService";
import "./ScholarshipList.css";

export default function ScholarshipList() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const data = await scholarshipService.getAllScholarships();
      setScholarships(data || []);
    } catch (err) {
      console.error("Failed to fetch scholarships", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa học bổng này?")) {
      try {
        await scholarshipService.deleteScholarship(id);
        fetchScholarships();
      } catch (err) {
        alert("Lỗi khi xóa học bổng");
      }
    }
  };

  const stats = [
    {
      label: "Đang mở",
      value: scholarships.filter((s) => s.status === "OPEN").length,
    },
    {
      label: "Tổng số ứng viên",
      value: "N/A", // Removed applicants count mock
    },
    {
      label: "Hợp lệ",
      value: scholarships.length,
    },
  ];

  const filters = [
    { id: "all", label: "Tất cả", count: scholarships.length },
    {
      id: "OPEN",
      label: "Đang mở",
      count: scholarships.filter((s) => s.status === "OPEN").length,
    },
    {
      id: "CLOSED",
      label: "Đã đóng",
      count: scholarships.filter((s) => s.status === "CLOSED").length,
    },
  ];

  const filteredScholarships = scholarships.filter((scholarship) => {
    const matchesFilter =
      selectedFilter === "all" || scholarship.status === selectedFilter;
    const matchesSearch = scholarship.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusClass = (status) => {
    const classes = {
      OPEN: "status-active",
      CLOSED: "status-closed",
    };
    return classes[status] || "status-default";
  };

  return (
    <div className="scholarship-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Học bổng</h1>
          <p className="page-subtitle">
            Quản lý các chương trình học bổng của Doanh nghiệp
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/scholarships/post")}
        >
          <Plus size={18} />
          Tạo Học bổng Mới
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
            className={`filter-btn ${selectedFilter === filter.id ? "active" : ""}`}
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
            placeholder="Tìm kiếm chương trình học bổng..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Scholarship Grid */}
      <div className="scholarships-grid">
        {loading ? (
          <div
            className="loading-state"
            style={{
              gridColumn: "1 / -1",
              padding: "40px",
              textAlign: "center",
            }}
          >
            Đang tải dữ liệu...
          </div>
        ) : (
          filteredScholarships.map((scholarship) => (
            <div key={scholarship.id} className="scholarship-card">
              <div className="scholarship-header">
                <h3 className="scholarship-title">{scholarship.title}</h3>
                <span
                  className={`status-badge ${getStatusClass(scholarship.status)}`}
                >
                  {scholarship.status === "OPEN"
                    ? "Đang Mở"
                    : scholarship.status === "CLOSED"
                      ? "Đã Đóng"
                      : scholarship.status}
                </span>
              </div>

              <div className="scholarship-amount">Học bổng Doanh nghiệp</div>

              <div className="scholarship-details">
                <div className="detail-item">
                  <span className="detail-label">Mã HB:</span>
                  <span className="detail-value text-xs font-mono">
                    {scholarship.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">GPA Yêu cầu:</span>
                  <span className="detail-value">
                    {scholarship.criteria?.min_gpa || "N/A"}
                  </span>
                </div>
              </div>

              <div className="scholarship-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/applications`)}
                >
                  <Eye size={16} />
                  Ứng viên
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => alert("Đang phát triển")}
                >
                  <Edit size={16} />
                  Sửa
                </button>
                <button
                  className="btn btn-outline danger"
                  onClick={() => handleDelete(scholarship.id)}
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && filteredScholarships.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <h3 className="empty-title">Không tìm thấy học bổng</h3>
          <p className="empty-text">
            Chưa có hoặc không có học bổng nào phù hợp với tìm kiếm.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/scholarships/post")}
          >
            <Plus size={18} />
            Tạo Học bổng
          </button>
        </div>
      )}
    </div>
  );
}
