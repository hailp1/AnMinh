import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminTradeActivities = () => {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PROMOTION',
    startDate: '',
    endDate: '',
    location: '',
    budget: '',
    organizerId: '',
    status: 'PLANNED',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadActivities();
    loadUsers();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchTerm, filterStatus, filterType, activities]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/trade-activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(Array.isArray(data) ? data : []);
      } else {
        console.warn('Failed to load activities:', response.status);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      alert(`Lỗi khi tải danh sách hoạt động: ${error.message}`);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.location && a.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    setFilteredActivities(filtered);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    setFormData({
      name: '',
      description: '',
      type: 'PROMOTION',
      startDate: now.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      location: '',
      budget: '',
      organizerId: users.length > 0 ? users[0].id : '',
      status: 'PLANNED',
    });
    setShowModal(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || '',
      type: activity.type,
      startDate: new Date(activity.startDate).toISOString().split('T')[0],
      endDate: new Date(activity.endDate).toISOString().split('T')[0],
      location: activity.location || '',
      budget: activity.budget?.toString() || '',
      organizerId: activity.organizerId,
      status: activity.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa hoạt động này?')) return;

    try {
      const response = await fetch(`${API_BASE}/trade-activities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa hoạt động thành công!');
        loadActivities();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xóa hoạt động');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Lỗi khi xóa hoạt động');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.organizerId) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      const url = editingActivity
        ? `${API_BASE}/trade-activities/${editingActivity.id}`
        : `${API_BASE}/trade-activities`;
      const method = editingActivity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingActivity ? 'Cập nhật hoạt động thành công!' : 'Tạo hoạt động thành công!');
        setShowModal(false);
        loadActivities();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu hoạt động');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Lỗi khi lưu hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      PROMOTION: 'Khuyến mãi',
      EXHIBITION: 'Triển lãm',
      SEMINAR: 'Hội thảo',
      TRAINING: 'Đào tạo',
      MEETING: 'Họp mặt',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      PLANNED: 'Đã lên kế hoạch',
      ONGOING: 'Đang diễn ra',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      PLANNED: '#3b82f6',
      ONGOING: '#10b981',
      COMPLETED: '#6b7280',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#666';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        color: '#1a1a2e'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1a1a2e'
            }}>
              🎯 Quản lý Hoạt động Thương mại
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Tổng số: {activities.length} hoạt động
            </p>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: '12px 24px',
              background: '#F29E2E',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>➕</span> Thêm hoạt động
          </button>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mô tả, địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a2e',
              background: '#fff'
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a2e',
              background: '#fff'
            }}
          >
            <option value="all">Tất cả loại</option>
            <option value="PROMOTION">Khuyến mãi</option>
            <option value="EXHIBITION">Triển lãm</option>
            <option value="SEMINAR">Hội thảo</option>
            <option value="TRAINING">Đào tạo</option>
            <option value="MEETING">Họp mặt</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a2e',
              background: '#fff'
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PLANNED">Đã lên kế hoạch</option>
            <option value="ONGOING">Đang diễn ra</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Activities List */}
      {loading && activities.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#1a1a2e'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #F29E2E',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '14px', color: '#666' }}>Đang tải...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#1a1a2e'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1a1a2e' }}>
            {activities.length === 0 ? 'Chưa có hoạt động nào' : 'Không tìm thấy hoạt động phù hợp'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${getStatusColor(activity.status)}20`,
                color: '#1a1a2e'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a1a2e',
                      margin: 0
                    }}>
                      {activity.name}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      background: `${getStatusColor(activity.status)}15`,
                      color: getStatusColor(activity.status),
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(activity.status)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: '4px 0'
                  }}>
                    Loại: {getTypeLabel(activity.type)}
                  </p>
                  {activity.organizer && (
                    <p style={{
                      fontSize: '12px',
                      color: '#666',
                      margin: '4px 0'
                    }}>
                      Người tổ chức: {activity.organizer.name} ({activity.organizer.employeeCode})
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(activity)}
                    style={{
                      padding: '6px 12px',
                      background: '#FBC93D15',
                      border: '1px solid #FBC93D',
                      borderRadius: '6px',
                      color: '#FBC93D',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ef444415',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {activity.description && (
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  {activity.description}
                </p>
              )}

              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '12px'
              }}>
                <div>📅 Thời gian: {formatDate(activity.startDate)} - {formatDate(activity.endDate)}</div>
                {activity.location && (
                  <div>📍 Địa điểm: {activity.location}</div>
                )}
                {activity.budget && (
                  <div>💰 Ngân sách: {activity.budget.toLocaleString()}đ</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#1a1a2e'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1a1a2e'
            }}>
              {editingActivity ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Tên hoạt động *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Hội thảo giới thiệu sản phẩm mới"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Loại hoạt động *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  >
                    <option value="PROMOTION">Khuyến mãi</option>
                    <option value="EXHIBITION">Triển lãm</option>
                    <option value="SEMINAR">Hội thảo</option>
                    <option value="TRAINING">Đào tạo</option>
                    <option value="MEETING">Họp mặt</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Trạng thái *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  >
                    <option value="PLANNED">Đã lên kế hoạch</option>
                    <option value="ONGOING">Đang diễn ra</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Người tổ chức *
                </label>
                <select
                  value={formData.organizerId}
                  onChange={(e) => setFormData({ ...formData, organizerId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                >
                  <option value="">-- Chọn người tổ chức --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.employeeCode || u.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="TP.HCM, Hà Nội..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Ngân sách (đ)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="5000000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#1a1a2e'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: '#F29E2E',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTradeActivities;

