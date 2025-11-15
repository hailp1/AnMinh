import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [actionFormData, setActionFormData] = useState({
    action: 'APPROVE',
    comment: '',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadRequests();
    loadUsers();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, filterStatus, filterType, requests]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/approvals`);
      if (response.ok) {
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
      } else {
        console.warn('Failed to load requests:', response.status);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      alert(`Lỗi khi tải danh sách yêu cầu: ${error.message}`);
      setRequests([]);
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

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.requester?.name && r.requester.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.requestType === filterType);
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setActionFormData({
      action: 'APPROVE',
      comment: '',
    });
    setShowActionModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setActionFormData({
      action: 'REJECT',
      comment: '',
    });
    setShowActionModal(true);
  };

  const handleSaveAction = async () => {
    if (!selectedRequest) return;

    if (actionFormData.action === 'REJECT' && !actionFormData.comment) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/approvals/${selectedRequest.id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: actionFormData.action,
          comment: actionFormData.comment,
        }),
      });

      if (response.ok) {
        alert(actionFormData.action === 'APPROVE' ? 'Phê duyệt thành công!' : 'Từ chối thành công!');
        setShowActionModal(false);
        loadRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xử lý yêu cầu');
      }
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Lỗi khi xử lý yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      ORDER_APPROVAL: 'Phê duyệt đơn hàng',
      EXPENSE_APPROVAL: 'Phê duyệt chi phí',
      LEAVE_APPROVAL: 'Phê duyệt nghỉ phép',
      PRICE_APPROVAL: 'Phê duyệt giá',
      DISCOUNT_APPROVAL: 'Phê duyệt giảm giá',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ phê duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Đã từ chối',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      REJECTED: '#ef4444',
      CANCELLED: '#6b7280',
    };
    return colors[status] || '#666';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      LOW: 'Thấp',
      NORMAL: 'Bình thường',
      HIGH: 'Cao',
      URGENT: 'Khẩn cấp',
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: '#6b7280',
      NORMAL: '#3b82f6',
      HIGH: '#f59e0b',
      URGENT: '#ef4444',
    };
    return colors[priority] || '#666';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              ✅ Quản lý Phê duyệt
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Tổng số: {requests.length} yêu cầu
            </p>
          </div>
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
            placeholder="Tìm kiếm theo tiêu đề, mô tả, người yêu cầu..."
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
            <option value="ORDER_APPROVAL">Phê duyệt đơn hàng</option>
            <option value="EXPENSE_APPROVAL">Phê duyệt chi phí</option>
            <option value="LEAVE_APPROVAL">Phê duyệt nghỉ phép</option>
            <option value="PRICE_APPROVAL">Phê duyệt giá</option>
            <option value="DISCOUNT_APPROVAL">Phê duyệt giảm giá</option>
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
            <option value="PENDING">Chờ phê duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Đã từ chối</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading && requests.length === 0 ? (
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
      ) : filteredRequests.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#1a1a2e'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1a1a2e' }}>
            {requests.length === 0 ? 'Chưa có yêu cầu nào' : 'Không tìm thấy yêu cầu phù hợp'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(500px, 1fr))',
          gap: '20px'
        }}>
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${getStatusColor(request.status)}20`,
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
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a1a2e',
                      margin: 0
                    }}>
                      {request.title}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      background: `${getStatusColor(request.status)}15`,
                      color: getStatusColor(request.status),
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {getStatusLabel(request.status)}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      background: `${getPriorityColor(request.priority)}15`,
                      color: getPriorityColor(request.priority),
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {getPriorityLabel(request.priority)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: '4px 0'
                  }}>
                    Loại: {getTypeLabel(request.requestType)}
                  </p>
                  {request.requester && (
                    <p style={{
                      fontSize: '12px',
                      color: '#666',
                      margin: '4px 0'
                    }}>
                      Người yêu cầu: {request.requester.name} ({request.requester.employeeCode})
                    </p>
                  )}
                </div>
              </div>

              {request.description && (
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  {request.description}
                </p>
              )}

              {request.amount && (
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#F29E2E',
                  marginBottom: '12px'
                }}>
                  Số tiền: {request.amount.toLocaleString()}đ
                </div>
              )}

              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '12px'
              }}>
                <div>📅 Tạo lúc: {formatDate(request.createdAt)}</div>
                {request.approvedAt && (
                  <div>✅ Duyệt lúc: {formatDate(request.approvedAt)}</div>
                )}
                {request.rejectedAt && (
                  <div>❌ Từ chối lúc: {formatDate(request.rejectedAt)}</div>
                )}
                {request.rejectionReason && (
                  <div style={{ marginTop: '8px', color: '#ef4444' }}>
                    Lý do: {request.rejectionReason}
                  </div>
                )}
              </div>

              {request.actions && request.actions.length > 0 && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <strong>Lịch sử xử lý:</strong>
                  {request.actions.map((action, idx) => (
                    <div key={idx} style={{ marginTop: '8px', paddingLeft: '12px' }}>
                      {action.actionType === 'APPROVE' ? '✅' : '❌'} {action.comment || 'Không có ghi chú'} - {formatDate(action.createdAt)}
                    </div>
                  ))}
                </div>
              )}

              {request.status === 'PENDING' && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px'
                }}>
                  <button
                    onClick={() => handleApprove(request)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#10b981',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ✅ Duyệt
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
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
          onClick={() => setShowActionModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '500px',
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
              {actionFormData.action === 'APPROVE' ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                <strong>Yêu cầu:</strong> {selectedRequest.title}
              </p>
              {selectedRequest.description && (
                <p style={{ fontSize: '13px', color: '#666' }}>
                  {selectedRequest.description}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a2e'
              }}>
                {actionFormData.action === 'REJECT' ? 'Lý do từ chối *' : 'Ghi chú'}
              </label>
              <textarea
                value={actionFormData.comment}
                onChange={(e) => setActionFormData({ ...actionFormData, comment: e.target.value })}
                rows="4"
                placeholder={actionFormData.action === 'REJECT' ? 'Nhập lý do từ chối...' : 'Nhập ghi chú (tùy chọn)...'}
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
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowActionModal(false)}
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
                onClick={handleSaveAction}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: actionFormData.action === 'APPROVE' ? '#10b981' : '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang xử lý...' : (actionFormData.action === 'APPROVE' ? 'Duyệt' : 'Từ chối')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;

