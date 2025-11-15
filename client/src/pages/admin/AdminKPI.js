import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminKPI = () => {
  const [targets, setTargets] = useState([]);
  const [results, setResults] = useState([]);
  const [incentives, setIncentives] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('targets'); // targets, results, incentives
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);
  const [editingResult, setEditingResult] = useState(null);
  const [editingIncentive, setEditingIncentive] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [targetFormData, setTargetFormData] = useState({
    userId: '',
    period: '',
    periodType: 'MONTH',
    targetSales: '',
    targetOrders: '',
    targetVisits: '',
    targetNewCustomers: '',
  });

  const [resultFormData, setResultFormData] = useState({
    targetId: '',
    actualSales: '',
    actualOrders: '',
    actualVisits: '',
    actualNewCustomers: '',
  });

  const [incentiveFormData, setIncentiveFormData] = useState({
    userId: '',
    period: '',
    periodType: 'MONTH',
    type: 'BONUS',
    amount: '',
    status: 'PENDING',
    description: '',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadUsers();
    if (activeTab === 'targets') {
      loadTargets();
    } else if (activeTab === 'results') {
      loadResults();
    } else if (activeTab === 'incentives') {
      loadIncentives();
    }
  }, [activeTab, selectedUserId]);

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

  const loadTargets = async () => {
    try {
      setLoading(true);
      const url = selectedUserId
        ? `${API_BASE}/kpi/targets?userId=${selectedUserId}`
        : `${API_BASE}/kpi/targets`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTargets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading targets:', error);
      alert(`Lỗi khi tải mục tiêu KPI: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      const url = selectedUserId
        ? `${API_BASE}/kpi/results?userId=${selectedUserId}`
        : `${API_BASE}/kpi/results`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIncentives = async () => {
    try {
      setLoading(true);
      const url = selectedUserId
        ? `${API_BASE}/kpi/incentives?userId=${selectedUserId}`
        : `${API_BASE}/kpi/incentives`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setIncentives(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading incentives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTarget = () => {
    setEditingTarget(null);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    setTargetFormData({
      userId: users.length > 0 ? users[0].id : '',
      period: currentMonth,
      periodType: 'MONTH',
      targetSales: '',
      targetOrders: '',
      targetVisits: '',
      targetNewCustomers: '',
    });
    setShowTargetModal(true);
  };

  const handleEditTarget = (target) => {
    setEditingTarget(target);
    setTargetFormData({
      userId: target.userId,
      period: target.period,
      periodType: target.periodType,
      targetSales: target.targetSales?.toString() || '',
      targetOrders: target.targetOrders?.toString() || '',
      targetVisits: target.targetVisits?.toString() || '',
      targetNewCustomers: target.targetNewCustomers?.toString() || '',
    });
    setShowTargetModal(true);
  };

  const handleSaveTarget = async () => {
    if (!targetFormData.userId || !targetFormData.period) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...targetFormData,
        targetSales: targetFormData.targetSales ? parseFloat(targetFormData.targetSales) : null,
        targetOrders: targetFormData.targetOrders ? parseInt(targetFormData.targetOrders) : null,
        targetVisits: targetFormData.targetVisits ? parseInt(targetFormData.targetVisits) : null,
        targetNewCustomers: targetFormData.targetNewCustomers ? parseInt(targetFormData.targetNewCustomers) : null,
      };

      const url = editingTarget
        ? `${API_BASE}/kpi/targets/${editingTarget.id}`
        : `${API_BASE}/kpi/targets`;
      const method = editingTarget ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingTarget ? 'Cập nhật mục tiêu thành công!' : 'Tạo mục tiêu thành công!');
        setShowTargetModal(false);
        loadTargets();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu mục tiêu');
      }
    } catch (error) {
      console.error('Error saving target:', error);
      alert('Lỗi khi lưu mục tiêu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResult = () => {
    setEditingResult(null);
    setResultFormData({
      targetId: targets.length > 0 ? targets[0].id : '',
      actualSales: '',
      actualOrders: '',
      actualVisits: '',
      actualNewCustomers: '',
    });
    setShowResultModal(true);
  };

  const handleSaveResult = async () => {
    if (!resultFormData.targetId) {
      alert('Vui lòng chọn mục tiêu');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...resultFormData,
        actualSales: resultFormData.actualSales ? parseFloat(resultFormData.actualSales) : null,
        actualOrders: resultFormData.actualOrders ? parseInt(resultFormData.actualOrders) : null,
        actualVisits: resultFormData.actualVisits ? parseInt(resultFormData.actualVisits) : null,
        actualNewCustomers: resultFormData.actualNewCustomers ? parseInt(resultFormData.actualNewCustomers) : null,
      };

      const url = editingResult
        ? `${API_BASE}/kpi/results/${editingResult.id}`
        : `${API_BASE}/kpi/results`;
      const method = editingResult ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingResult ? 'Cập nhật kết quả thành công!' : 'Tạo kết quả thành công!');
        setShowResultModal(false);
        loadResults();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu kết quả');
      }
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Lỗi khi lưu kết quả');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncentive = () => {
    setEditingIncentive(null);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    setIncentiveFormData({
      userId: users.length > 0 ? users[0].id : '',
      period: currentMonth,
      periodType: 'MONTH',
      type: 'BONUS',
      amount: '',
      status: 'PENDING',
      description: '',
    });
    setShowIncentiveModal(true);
  };

  const handleSaveIncentive = async () => {
    if (!incentiveFormData.userId || !incentiveFormData.period || !incentiveFormData.amount) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...incentiveFormData,
        amount: parseFloat(incentiveFormData.amount),
      };

      const url = editingIncentive
        ? `${API_BASE}/kpi/incentives/${editingIncentive.id}`
        : `${API_BASE}/kpi/incentives`;
      const method = editingIncentive ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingIncentive ? 'Cập nhật thưởng thành công!' : 'Tạo thưởng thành công!');
        setShowIncentiveModal(false);
        loadIncentives();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu thưởng');
      }
    } catch (error) {
      console.error('Error saving incentive:', error);
      alert('Lỗi khi lưu thưởng');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodTypeLabel = (type) => {
    const labels = {
      MONTH: 'Tháng',
      QUARTER: 'Quý',
      YEAR: 'Năm',
    };
    return labels[type] || type;
  };

  const getIncentiveTypeLabel = (type) => {
    const labels = {
      BONUS: 'Thưởng',
      COMMISSION: 'Hoa hồng',
      GIFT: 'Quà tặng',
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ xử lý',
      APPROVED: 'Đã duyệt',
      PAID: 'Đã thanh toán',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      APPROVED: '#10b981',
      PAID: '#3b82f6',
      CANCELLED: '#ef4444',
    };
    return colors[status] || '#666';
  };

  const calculateCompletion = (target, result) => {
    if (!target || !result) return null;
    const salesCompletion = target.targetSales ? (result.actualSales / target.targetSales * 100) : null;
    const ordersCompletion = target.targetOrders ? (result.actualOrders / target.targetOrders * 100) : null;
    return {
      sales: salesCompletion,
      orders: ordersCompletion,
    };
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
              📊 Quản lý KPI & Thưởng
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Quản lý mục tiêu, kết quả và thưởng cho nhân viên
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'targets' && (
              <button
                onClick={handleAddTarget}
                style={{
                  padding: '12px 24px',
                  background: '#F29E2E',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ➕ Thêm mục tiêu
              </button>
            )}
            {activeTab === 'results' && (
              <button
                onClick={handleAddResult}
                style={{
                  padding: '12px 24px',
                  background: '#F29E2E',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ➕ Thêm kết quả
              </button>
            )}
            {activeTab === 'incentives' && (
              <button
                onClick={handleAddIncentive}
                style={{
                  padding: '12px 24px',
                  background: '#F29E2E',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ➕ Thêm thưởng
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#1a1a2e'
          }}>
            Lọc theo nhân viên
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a2e',
              background: '#fff'
            }}
          >
            <option value="">Tất cả nhân viên</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.employeeCode || u.id})
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          {[
            { id: 'targets', label: '🎯 Mục tiêu', count: targets.length },
            { id: 'results', label: '📈 Kết quả', count: results.length },
            { id: 'incentives', label: '💰 Thưởng', count: incentives.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #F29E2E' : '3px solid transparent',
                color: activeTab === tab.id ? '#F29E2E' : '#666',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                position: 'relative',
                bottom: '-2px'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'targets' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {targets.map((target) => {
            const result = results.find(r => r.targetId === target.id);
            const completion = calculateCompletion(target, result);
            
            return (
              <div
                key={target.id}
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
                      {target.user?.name || 'N/A'}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: '#666',
                      margin: '4px 0'
                    }}>
                      {getPeriodTypeLabel(target.periodType)}: {target.period}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditTarget(target)}
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
                </div>

                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  {target.targetSales && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Doanh số:</strong> {target.targetSales.toLocaleString()}đ
                      {completion?.sales && (
                        <span style={{
                          marginLeft: '8px',
                          color: completion.sales >= 100 ? '#10b981' : '#f59e0b'
                        }}>
                          ({completion.sales.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  )}
                  {target.targetOrders && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Số đơn:</strong> {target.targetOrders}
                      {completion?.orders && (
                        <span style={{
                          marginLeft: '8px',
                          color: completion.orders >= 100 ? '#10b981' : '#f59e0b'
                        }}>
                          ({completion.orders.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  )}
                  {target.targetVisits && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Số lượt viếng thăm:</strong> {target.targetVisits}
                    </div>
                  )}
                  {target.targetNewCustomers && (
                    <div>
                      <strong>Khách hàng mới:</strong> {target.targetNewCustomers}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'incentives' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {incentives.map((incentive) => (
            <div
              key={incentive.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${getStatusColor(incentive.status)}20`,
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
                    {incentive.user?.name || 'N/A'}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#F29E2E',
                    margin: '8px 0'
                  }}>
                    {incentive.amount.toLocaleString()}đ
                  </p>
                  <span style={{
                    padding: '4px 8px',
                    background: `${getStatusColor(incentive.status)}15`,
                    color: getStatusColor(incentive.status),
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {getStatusLabel(incentive.status)}
                  </span>
                </div>
              </div>

              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '12px'
              }}>
                <div>Loại: {getIncentiveTypeLabel(incentive.type)}</div>
                <div>{getPeriodTypeLabel(incentive.periodType)}: {incentive.period}</div>
                {incentive.description && (
                  <div style={{ marginTop: '8px' }}>{incentive.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Target Modal */}
      {showTargetModal && (
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
          onClick={() => setShowTargetModal(false)}
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
              {editingTarget ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
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
                  Nhân viên *
                </label>
                <select
                  value={targetFormData.userId}
                  onChange={(e) => setTargetFormData({ ...targetFormData, userId: e.target.value })}
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
                  <option value="">-- Chọn nhân viên --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.employeeCode || u.id})
                    </option>
                  ))}
                </select>
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
                    Kỳ *
                  </label>
                  <input
                    type="text"
                    value={targetFormData.period}
                    onChange={(e) => setTargetFormData({ ...targetFormData, period: e.target.value })}
                    placeholder="2024-01"
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
                    Loại kỳ *
                  </label>
                  <select
                    value={targetFormData.periodType}
                    onChange={(e) => setTargetFormData({ ...targetFormData, periodType: e.target.value })}
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
                    <option value="MONTH">Tháng</option>
                    <option value="QUARTER">Quý</option>
                    <option value="YEAR">Năm</option>
                  </select>
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
                  Mục tiêu doanh số (đ)
                </label>
                <input
                  type="number"
                  value={targetFormData.targetSales}
                  onChange={(e) => setTargetFormData({ ...targetFormData, targetSales: e.target.value })}
                  placeholder="10000000"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1a1a2e'
                  }}>
                    Số đơn
                  </label>
                  <input
                    type="number"
                    value={targetFormData.targetOrders}
                    onChange={(e) => setTargetFormData({ ...targetFormData, targetOrders: e.target.value })}
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
                    Số lượt viếng thăm
                  </label>
                  <input
                    type="number"
                    value={targetFormData.targetVisits}
                    onChange={(e) => setTargetFormData({ ...targetFormData, targetVisits: e.target.value })}
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
                    KH mới
                  </label>
                  <input
                    type="number"
                    value={targetFormData.targetNewCustomers}
                    onChange={(e) => setTargetFormData({ ...targetFormData, targetNewCustomers: e.target.value })}
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
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowTargetModal(false)}
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
                onClick={handleSaveTarget}
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

      {/* Incentive Modal - Similar structure, shortened for brevity */}
      {showIncentiveModal && (
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
          onClick={() => setShowIncentiveModal(false)}
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
              {editingIncentive ? 'Chỉnh sửa thưởng' : 'Thêm thưởng mới'}
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
                  Nhân viên *
                </label>
                <select
                  value={incentiveFormData.userId}
                  onChange={(e) => setIncentiveFormData({ ...incentiveFormData, userId: e.target.value })}
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
                  <option value="">-- Chọn nhân viên --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.employeeCode || u.id})
                    </option>
                  ))}
                </select>
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
                    Loại thưởng *
                  </label>
                  <select
                    value={incentiveFormData.type}
                    onChange={(e) => setIncentiveFormData({ ...incentiveFormData, type: e.target.value })}
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
                    <option value="BONUS">Thưởng</option>
                    <option value="COMMISSION">Hoa hồng</option>
                    <option value="GIFT">Quà tặng</option>
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
                    Số tiền (đ) *
                  </label>
                  <input
                    type="number"
                    value={incentiveFormData.amount}
                    onChange={(e) => setIncentiveFormData({ ...incentiveFormData, amount: e.target.value })}
                    placeholder="1000000"
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
                  Mô tả
                </label>
                <textarea
                  value={incentiveFormData.description}
                  onChange={(e) => setIncentiveFormData({ ...incentiveFormData, description: e.target.value })}
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
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowIncentiveModal(false)}
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
                onClick={handleSaveIncentive}
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

export default AdminKPI;

