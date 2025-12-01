import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminLoyalty = () => {
  const [rewards, setRewards] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [loyaltyPoint, setLoyaltyPoint] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('rewards'); // rewards, points, redemptions

  const [rewardFormData, setRewardFormData] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    rewardType: 'VOUCHER',
    rewardValue: '',
    stock: '',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadRewards();
    loadPharmacies();
  }, []);

  useEffect(() => {
    if (selectedPharmacy && activeTab === 'points') {
      loadLoyaltyPoints(selectedPharmacy);
    }
  }, [selectedPharmacy, activeTab]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/loyalty/rewards?isActive=true`);
      if (response.ok) {
        const data = await response.json();
        setRewards(data);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      alert('Lỗi khi tải danh sách phần thưởng');
    } finally {
      setLoading(false);
    }
  };

  const loadPharmacies = async () => {
    try {
      const response = await fetch(`${API_BASE}/pharmacies`);
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data);
      }
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    }
  };

  const loadLoyaltyPoints = async (pharmacyId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/loyalty/points/${pharmacyId}`);
      if (response.ok) {
        const data = await response.json();
        setLoyaltyPoint(data);
      }
    } catch (error) {
      console.error('Error loading loyalty points:', error);
      alert('Lỗi khi tải điểm tích lũy');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReward = () => {
    setEditingReward(null);
    setRewardFormData({
      name: '',
      description: '',
      pointsRequired: '',
      rewardType: 'VOUCHER',
      rewardValue: '',
      stock: '',
      isActive: true,
      startDate: '',
      endDate: '',
    });
    setShowRewardModal(true);
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setRewardFormData({
      name: reward.name,
      description: reward.description || '',
      pointsRequired: reward.pointsRequired.toString(),
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue || '',
      stock: reward.stock?.toString() || '',
      isActive: reward.isActive,
      startDate: reward.startDate ? new Date(reward.startDate).toISOString().split('T')[0] : '',
      endDate: reward.endDate ? new Date(reward.endDate).toISOString().split('T')[0] : '',
    });
    setShowRewardModal(true);
  };

  const handleSaveReward = async () => {
    if (!rewardFormData.name || !rewardFormData.pointsRequired) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...rewardFormData,
        pointsRequired: parseFloat(rewardFormData.pointsRequired),
        stock: rewardFormData.stock ? parseInt(rewardFormData.stock) : null,
        startDate: rewardFormData.startDate || null,
        endDate: rewardFormData.endDate || null,
      };

      const response = await fetch(`${API_BASE}/loyalty/rewards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Tạo phần thưởng thành công!');
        setShowRewardModal(false);
        loadRewards();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu phần thưởng');
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('Lỗi khi lưu phần thưởng');
    } finally {
      setLoading(false);
    }
  };

  const getRewardTypeLabel = (type) => {
    const labels = {
      DISCOUNT: 'Giảm giá',
      PRODUCT: 'Sản phẩm',
      VOUCHER: 'Voucher',
      CASH: 'Tiền mặt',
    };
    return labels[type] || type;
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
              💎 Quản lý Tích lũy & Đổi thưởng
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Quản lý điểm tích lũy và phần thưởng cho khách hàng
            </p>
          </div>
          <button
            onClick={handleAddReward}
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
            <span>➕</span> Thêm phần thưởng
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          {[
            { id: 'rewards', label: '🎁 Phần thưởng', count: rewards.length },
            { id: 'points', label: '💎 Điểm tích lũy', count: null },
            { id: 'redemptions', label: '🔄 Đổi thưởng', count: redemptions.length },
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
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'rewards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {rewards.map((reward) => (
            <div
              key={reward.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${reward.isActive ? '#10b981' : '#e5e7eb'}`,
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
                    {reward.name}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#666',
                    margin: '4px 0'
                  }}>
                    Loại: {getRewardTypeLabel(reward.rewardType)}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#F29E2E',
                    margin: '8px 0'
                  }}>
                    {reward.pointsRequired.toLocaleString()} điểm
                  </p>
                </div>
                <button
                  onClick={() => handleEditReward(reward)}
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

              {reward.description && (
                <p style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '12px'
                }}>
                  {reward.description}
                </p>
              )}

              {reward.stock !== null && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  Tồn kho: {reward.stock}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'points' && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          color: '#1a1a2e'
        }}>
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
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
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
            >
              <option value="">Chọn nhà thuốc</option>
              {pharmacies.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {loyaltyPoint && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#F29E2E',
                  marginBottom: '8px'
                }}>
                  {loyaltyPoint.points.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Điểm hiện tại
                </div>
              </div>
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  marginBottom: '8px'
                }}>
                  {loyaltyPoint.earnedPoints.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Đã tích lũy
                </div>
              </div>
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  marginBottom: '8px'
                }}>
                  {loyaltyPoint.usedPoints.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Đã sử dụng
                </div>
              </div>
              <div style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  {loyaltyPoint.expiredPoints.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Đã hết hạn
                </div>
              </div>
            </div>
          )}

          {loyaltyPoint && loyaltyPoint.transactions && loyaltyPoint.transactions.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '16px',
                color: '#1a1a2e'
              }}>
                Lịch sử giao dịch
              </h3>
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {loyaltyPoint.transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < loyaltyPoint.transactions.length - 1 ? '1px solid #e5e7eb' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '14px', fontWeight: '600', color: '#1a1a2e'
                      }}>
                        {transaction.type === 'EARNED' ? '➕ Tích điểm' :
                         transaction.type === 'USED' ? '➖ Sử dụng điểm' :
                         transaction.type === 'EXPIRED' ? '⏰ Hết hạn' : '🔄 Điều chỉnh'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {transaction.description || 'Không có mô tả'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                        {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: transaction.points > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reward Modal */}
      {showRewardModal && (
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
          onClick={() => setShowRewardModal(false)}
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
              {editingReward ? 'Chỉnh sửa phần thưởng' : 'Thêm phần thưởng mới'}
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
                  Tên phần thưởng *
                </label>
                <input
                  type="text"
                  value={rewardFormData.name}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, name: e.target.value })}
                  placeholder="Voucher 100k"
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
                    Điểm cần thiết *
                  </label>
                  <input
                    type="number"
                    value={rewardFormData.pointsRequired}
                    onChange={(e) => setRewardFormData({ ...rewardFormData, pointsRequired: e.target.value })}
                    placeholder="1000"
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
                    Loại phần thưởng *
                  </label>
                  <select
                    value={rewardFormData.rewardType}
                    onChange={(e) => setRewardFormData({ ...rewardFormData, rewardType: e.target.value })}
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
                    <option value="VOUCHER">Voucher</option>
                    <option value="DISCOUNT">Giảm giá</option>
                    <option value="PRODUCT">Sản phẩm</option>
                    <option value="CASH">Tiền mặt</option>
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
                  Giá trị phần thưởng
                </label>
                <input
                  type="text"
                  value={rewardFormData.rewardValue}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, rewardValue: e.target.value })}
                  placeholder="VOUCHER100K hoặc mã sản phẩm"
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
                  Số lượng (để trống nếu không giới hạn)
                </label>
                <input
                  type="number"
                  value={rewardFormData.stock}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, stock: e.target.value })}
                  placeholder="100"
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
                  value={rewardFormData.description}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, description: e.target.value })}
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
                onClick={() => setShowRewardModal(false)}
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
                onClick={handleSaveReward}
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

export default AdminLoyalty;

