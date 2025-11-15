import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminCustomerSegments = () => {
  const [segments, setSegments] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredSegments, setFilteredSegments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    criteria: {
      minOrderValue: '',
      minOrderCount: '',
      minOrderFrequency: '',
      customerType: '',
    },
    benefits: {
      discountPercent: '',
      freeShipping: false,
      prioritySupport: false,
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadSegments();
    loadPharmacies();
  }, []);

  useEffect(() => {
    filterSegments();
  }, [searchTerm, segments]);

  const loadSegments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/customer-segments`);
      if (response.ok) {
        const data = await response.json();
        setSegments(Array.isArray(data) ? data : []);
      } else {
        console.warn('Failed to load segments:', response.status);
        setSegments([]);
      }
    } catch (error) {
      console.error('Error loading segments:', error);
      alert(`Lỗi khi tải danh sách phân nhóm: ${error.message}`);
      setSegments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPharmacies = async () => {
    try {
      const response = await fetch(`${API_BASE}/pharmacies`);
      if (response.ok) {
        const data = await response.json();
        setPharmacies(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    }
  };

  const filterSegments = () => {
    let filtered = [...segments];
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredSegments(filtered);
  };

  const handleAdd = () => {
    setEditingSegment(null);
    setFormData({
      name: '',
      description: '',
      criteria: {
        minOrderValue: '',
        minOrderCount: '',
        minOrderFrequency: '',
        customerType: '',
      },
      benefits: {
        discountPercent: '',
        freeShipping: false,
        prioritySupport: false,
      },
    });
    setShowModal(true);
  };

  const handleEdit = (segment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      criteria: {
        minOrderValue: segment.criteria?.minOrderValue?.toString() || '',
        minOrderCount: segment.criteria?.minOrderCount?.toString() || '',
        minOrderFrequency: segment.criteria?.minOrderFrequency?.toString() || '',
        customerType: segment.criteria?.customerType || '',
      },
      benefits: {
        discountPercent: segment.benefits?.discountPercent?.toString() || '',
        freeShipping: segment.benefits?.freeShipping || false,
        prioritySupport: segment.benefits?.prioritySupport || false,
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa phân nhóm này?')) return;

    try {
      const response = await fetch(`${API_BASE}/customer-segments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa phân nhóm thành công!');
        loadSegments();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xóa phân nhóm');
      }
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert('Lỗi khi xóa phân nhóm');
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên phân nhóm');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        criteria: {
          minOrderValue: formData.criteria.minOrderValue ? parseFloat(formData.criteria.minOrderValue) : null,
          minOrderCount: formData.criteria.minOrderCount ? parseInt(formData.criteria.minOrderCount) : null,
          minOrderFrequency: formData.criteria.minOrderFrequency ? parseInt(formData.criteria.minOrderFrequency) : null,
          customerType: formData.criteria.customerType || null,
        },
        benefits: {
          discountPercent: formData.benefits.discountPercent ? parseFloat(formData.benefits.discountPercent) : null,
          freeShipping: formData.benefits.freeShipping,
          prioritySupport: formData.benefits.prioritySupport,
        },
      };

      const url = editingSegment
        ? `${API_BASE}/customer-segments/${editingSegment.id}`
        : `${API_BASE}/customer-segments`;
      const method = editingSegment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingSegment ? 'Cập nhật phân nhóm thành công!' : 'Tạo phân nhóm thành công!');
        setShowModal(false);
        loadSegments();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu phân nhóm');
      }
    } catch (error) {
      console.error('Error saving segment:', error);
      alert('Lỗi khi lưu phân nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPharmacy = (segment) => {
    setSelectedSegment(segment);
    setShowAssignModal(true);
  };

  const handleSaveAssignment = async (pharmacyId) => {
    if (!selectedSegment) return;

    try {
      const response = await fetch(`${API_BASE}/pharmacies/${pharmacyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerSegmentId: selectedSegment.id,
        }),
      });

      if (response.ok) {
        alert('Phân bổ nhà thuốc thành công!');
        setShowAssignModal(false);
        loadPharmacies();
        loadSegments();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi phân bổ nhà thuốc');
      }
    } catch (error) {
      console.error('Error assigning pharmacy:', error);
      alert('Lỗi khi phân bổ nhà thuốc');
    }
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
              🏷️ Quản lý Phân nhóm Khách hàng
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Tổng số: {segments.length} phân nhóm
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
            <span>➕</span> Thêm phân nhóm
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1a1a2e',
            background: '#fff'
          }}
        />
      </div>

      {/* Segments List */}
      {loading && segments.length === 0 ? (
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
      ) : filteredSegments.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#1a1a2e'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1a1a2e' }}>
            {segments.length === 0 ? 'Chưa có phân nhóm nào' : 'Không tìm thấy phân nhóm phù hợp'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {filteredSegments.map((segment) => (
            <div
              key={segment.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '2px solid #e5e7eb',
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
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    margin: '0 0 8px 0'
                  }}>
                    {segment.name}
                  </h3>
                  {segment.description && (
                    <p style={{
                      fontSize: '13px',
                      color: '#666',
                      marginBottom: '12px'
                    }}>
                      {segment.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(segment)}
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
                    onClick={() => handleDelete(segment.id)}
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

              {segment.criteria && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <strong>Tiêu chí:</strong>
                  <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                    {segment.criteria.minOrderValue && (
                      <li>Đơn hàng tối thiểu: {segment.criteria.minOrderValue.toLocaleString()}đ</li>
                    )}
                    {segment.criteria.minOrderCount && (
                      <li>Số đơn tối thiểu: {segment.criteria.minOrderCount}</li>
                    )}
                    {segment.criteria.minOrderFrequency && (
                      <li>Tần suất: {segment.criteria.minOrderFrequency} đơn/tháng</li>
                    )}
                  </ul>
                </div>
              )}

              {segment.benefits && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <strong>Ưu đãi:</strong>
                  <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                    {segment.benefits.discountPercent && (
                      <li>Giảm giá: {segment.benefits.discountPercent}%</li>
                    )}
                    {segment.benefits.freeShipping && <li>Miễn phí vận chuyển</li>}
                    {segment.benefits.prioritySupport && <li>Hỗ trợ ưu tiên</li>}
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleAssignPharmacy(segment)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '10px',
                  background: '#1E4A8B',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Phân bổ nhà thuốc
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
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
              maxWidth: '600px',
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
              {editingSegment ? 'Chỉnh sửa phân nhóm' : 'Thêm phân nhóm mới'}
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
                  Tên phân nhóm *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VIP, Thường, Mới..."
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
                  rows="3"
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

              <div style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#1a1a2e'
                }}>
                  Tiêu chí phân loại
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#666'
                    }}>
                      Đơn hàng tối thiểu (đ)
                    </label>
                    <input
                      type="number"
                      value={formData.criteria.minOrderValue}
                      onChange={(e) => setFormData({
                        ...formData,
                        criteria: { ...formData.criteria, minOrderValue: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#1a1a2e',
                        background: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#666'
                    }}>
                      Số đơn tối thiểu
                    </label>
                    <input
                      type="number"
                      value={formData.criteria.minOrderCount}
                      onChange={(e) => setFormData({
                        ...formData,
                        criteria: { ...formData.criteria, minOrderCount: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#1a1a2e',
                        background: '#fff'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#1a1a2e'
                }}>
                  Ưu đãi
                </h3>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#666'
                  }}>
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    value={formData.benefits.discountPercent}
                    onChange={(e) => setFormData({
                      ...formData,
                      benefits: { ...formData.benefits, discountPercent: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#1a1a2e',
                      background: '#fff'
                    }}
                  />
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.benefits.freeShipping}
                      onChange={(e) => setFormData({
                        ...formData,
                        benefits: { ...formData.benefits, freeShipping: e.target.checked }
                      })}
                    />
                    Miễn phí vận chuyển
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.benefits.prioritySupport}
                      onChange={(e) => setFormData({
                        ...formData,
                        benefits: { ...formData.benefits, prioritySupport: e.target.checked }
                      })}
                    />
                    Hỗ trợ ưu tiên
                  </label>
                </div>
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

      {/* Assign Pharmacy Modal */}
      {showAssignModal && selectedSegment && (
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
          onClick={() => setShowAssignModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
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
              Phân bổ nhà thuốc cho: {selectedSegment.name}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a2e'
              }}>
                Chọn nhà thuốc
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleSaveAssignment(e.target.value);
                  }
                }}
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
                <option value="">-- Chọn nhà thuốc --</option>
                {pharmacies.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.code && `(${p.code})`}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAssignModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#1a1a2e'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerSegments;

