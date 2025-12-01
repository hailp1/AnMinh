import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pharmaciesAPI, ordersAPI, visitPlansAPI } from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [visitPlans, setVisitPlans] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (user) {
      getCurrentLocationAndVisitPlans();
      loadUserStats();
    } else {
      setLoading(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserStats = async () => {
    try {
      // Load orders from API
      const orders = await ordersAPI.getAll({ userId: user?.id });
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Load pharmacies from API
      const allPharmacies = await pharmaciesAPI.getAll();

      setStats({
        totalPharmacies: allPharmacies.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to 0 if API fails
      setStats({
        totalPharmacies: 0,
        totalOrders: 0,
        totalRevenue: 0
      });
    }
  };

  const getCurrentLocationAndVisitPlans = () => {
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchVisitPlans(latitude, longitude);
          setLocationError(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(true);
          // Fallback to TP.HCM center
          setUserLocation({ lat: 10.7769, lng: 106.7009 });
          fetchVisitPlans(10.7769, 106.7009);
        }
      );
    } else {
      setLocationError(true);
      setUserLocation({ lat: 10.7769, lng: 106.7009 });
      fetchVisitPlans(10.7769, 106.7009);
    }
  };

  const fetchVisitPlans = async (lat, lng) => {
    try {
      // Load visit plans for today
      const today = new Date().toISOString();
      const plans = await visitPlansAPI.getAll({ userId: user.id, visitDate: today });

      // Extract pharmacies from plans and calculate distance
      const pharmaciesWithDistance = plans
        .map(plan => {
          const pharmacy = plan.pharmacy;
          if (!pharmacy) return null;

          let distance = null;
          if (pharmacy.latitude && pharmacy.longitude) {
            distance = calculateDistance(lat, lng, pharmacy.latitude, pharmacy.longitude);
          }

          return {
            ...pharmacy,
            distance,
            visitPlan: plan
          };
        })
        .filter(p => p !== null)
        .sort((a, b) => {
          // Sort by distance if available
          if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
          if (a.distance !== null) return -1;
          if (b.distance !== null) return 1;
          return 0;
        });

      setVisitPlans(pharmaciesWithDistance);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visit plans:', error);
      setVisitPlans([]);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceText = (pharmacy) => {
    if (!userLocation || !pharmacy.distance) return '';
    const distance = pharmacy.distance;

    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const openDirections = (pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Guest user view
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1E4A8B',
        padding: '20px'
      }}>
        {/* Hero Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px 20px',
          textAlign: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <img
            src="/image/logo.webp"
            alt="An Minh Business System"
            style={{
              maxWidth: '150px',
              height: 'auto',
              marginBottom: '20px'
            }}
          />
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1E4A8B',
            marginBottom: '10px'
          }}>
            An Minh Business System
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Hệ thống quản lý bán hàng chuyên nghiệp cho Trình dược viên
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginTop: '30px'
          }}>
            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏥</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E4A8B' }}>
                200+
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Nhà thuốc</div>
            </div>

            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>👨‍⚕️</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E4A8B' }}>24/7</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Hỗ trợ</div>
            </div>

            <div style={{
              padding: '15px',
              background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E4A8B' }}>100%</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Hiệu quả</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '30px 20px',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1E4A8B',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Tính năng nổi bật
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#F29E2E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📋
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1a1a2e' }}>
                  Quản lý đơn hàng
                </h3>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  Tạo và theo dõi đơn hàng dễ dàng
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#F29E2E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🗺️
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1a1a2e' }}>
                  Bản đồ tương tác
                </h3>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  Xem vị trí nhà thuốc và đồng nghiệp
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#F29E2E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📊
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1a1a2e' }}>
                  Thống kê doanh thu
                </h3>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  Theo dõi lịch sử và doanh thu
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px',
              background: '#f9fafb',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#F29E2E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                💬
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1a1a2e' }}>
                  Chat đồng nghiệp
                </h3>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                  Liên hệ với đồng nghiệp trong Hub
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            to="/quick-register"
            style={{
              padding: '16px',
              background: '#F29E2E',
              color: '#fff',
              textAlign: 'center',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(26, 92, 162, 0.3)'
            }}
          >
            📱 Đăng ký nhanh
          </Link>

          <Link
            to="/"
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1E4A8B',
              textAlign: 'center',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #1E4A8B'
            }}
          >
            🔐 Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Logged in user view - Dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1E4A8B',
      paddingBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        marginBottom: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1E4A8B',
              margin: '0 0 5px 0'
            }}>
              Xin chào, {user.name}! 👋
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#666',
              margin: 0
            }}>
              {user.hub ? `📍 Hub ${user.hub}` : '📍 An Minh Business System'}
              {locationError ? ' (Vị trí mặc định)' : ' • Đã xác định vị trí'}
            </p>
          </div>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: '#F29E2E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            👨‍⚕️
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px'
        }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E4A8B' }}>
              {stats.totalPharmacies}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Nhà thuốc</div>
          </div>

          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E4A8B' }}>
              {stats.totalOrders}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Đơn hàng</div>
          </div>

          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(26, 92, 162, 0.1), rgba(62, 180, 168, 0.1))',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E4A8B' }}>
              {formatCurrency(stats.totalRevenue).replace('₫', '')}₫
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Doanh thu</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '0 20px', marginBottom: '20px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '12px'
        }}>
          Thao tác nhanh
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <Link
            to="/customers"
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#F29E2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              👥
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a2e',
              textAlign: 'center'
            }}>
              Danh sách khách hàng
            </div>
          </Link>

          <Link
            to="/map"
            style={{
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#F29E2E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🗺️
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a2e',
              textAlign: 'center'
            }}>
              Xem bản đồ
            </div>
          </Link>
        </div>
      </div>

      {/* Visit Plan Today */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
            margin: 0
          }}>
            📅 Lịch viếng thăm hôm nay ({['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][new Date().getDay()]})
          </h2>
          <Link
            to="/map"
            style={{
              fontSize: '13px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #1E4A8B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px'
            }}></div>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Đang tải lịch viếng thăm...
            </p>
          </div>
        ) : visitPlans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {visitPlans.map((pharmacy) => (
              <div
                key={pharmacy.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '15px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '10px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a1a2e',
                      margin: '0 0 6px 0'
                    }}>
                      🏥 {pharmacy.name}
                    </h3>
                    <div style={{
                      display: 'inline-block',
                      background: 'rgba(26, 92, 162, 0.1)',
                      color: '#1E4A8B',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {pharmacy.code}
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: '#666',
                      margin: '4px 0',
                      lineHeight: '1.5'
                    }}>
                      📍 {pharmacy.address}
                    </p>
                  </div>
                  {pharmacy.distance && (
                    <div style={{
                      padding: '6px 12px',
                      background: '#F29E2E',
                      color: '#fff',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {getDistanceText(pharmacy)}
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <div>📞 {pharmacy.phone}</div>
                  <div>🕒 {pharmacy.visitPlan?.visitTime || 'Chưa đặt giờ'}</div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => openDirections(pharmacy)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#f3f4f6',
                      color: '#1a1a2e',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🧭 Chỉ đường
                  </button>
                  <Link
                    to={`/visit/${pharmacy.id}`}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#F29E2E',
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'block'
                    }}
                  >
                    Ghé thăm
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#1a1a2e'
            }}>
              Không có lịch viếng thăm hôm nay
            </h3>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Bạn có thể xem danh sách khách hàng để lên kế hoạch
            </p>
          </div>
        )}
      </div>



      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;
