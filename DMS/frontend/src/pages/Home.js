import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pharmaciesAPI, ordersAPI, visitPlansAPI } from '../services/api';

// --- Icons (Inline SVGs) ---
const Icons = {
  Map: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
  ),
  Navigation: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  )
};

const Skeleton = ({ width, height, borderRadius = '4px' }) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'loading 1.5s infinite'
  }} />
);

const Home = () => {
  const { user } = useAuth();
  const [visitPlans, setVisitPlans] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (user) {
      getCurrentLocationAndVisitPlans();
      loadUserStats();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const loadUserStats = async () => {
    try {
      setStatsLoading(true);
      // Use Summary APIs (Optimized)
      const [orderStats, pharmacyStats] = await Promise.all([
        ordersAPI.getSummary({ userId: user?.id }),
        pharmaciesAPI.getSummary()
      ]);

      setStats({
        totalPharmacies: pharmacyStats.count || 0,
        totalOrders: orderStats.count || 0,
        totalRevenue: orderStats.revenue || 0
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      // Silent fail for stats is acceptable, but maybe show partial data
    } finally {
      setStatsLoading(false);
    }
  };

  const getCurrentLocationAndVisitPlans = () => {
    setLoading(true);
    setError(null);

    // Helper to fetch plans
    const doFetchPlans = (lat, lng) => fetchVisitPlans(lat, lng);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          doFetchPlans(latitude, longitude);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Không thể lấy vị trí hiện tại. Đang dùng vị trí mặc định.');
          // Fallback to TP.HCM center
          const defaultLoc = { lat: 10.7769, lng: 106.7009 };
          setUserLocation(defaultLoc);
          doFetchPlans(defaultLoc.lat, defaultLoc.lng);
        },
        { timeout: 10000 }
      );
    } else {
      setError('Trình duyệt không hỗ trợ định vị.');
      const defaultLoc = { lat: 10.7769, lng: 106.7009 };
      setUserLocation(defaultLoc);
      doFetchPlans(defaultLoc.lat, defaultLoc.lng);
    }
  };

  const fetchVisitPlans = async (lat, lng) => {
    try {
      const today = new Date().toISOString();
      const plans = await visitPlansAPI.getAll({ userId: user.id, visitDate: today });

      const pharmaciesWithDistance = plans
        .map(plan => {
          const pharmacy = plan.pharmacy;
          // Protect against data integrity issues
          if (!pharmacy) return null;

          let distance = null;
          if (pharmacy.latitude && pharmacy.longitude) {
            distance = calculateDistance(lat, lng, pharmacy.latitude, pharmacy.longitude);
          }
          return { ...pharmacy, distance, visitPlan: plan };
        })
        .filter(p => p !== null)
        .sort((a, b) => {
          if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
          if (a.distance !== null) return -1;
          if (b.distance !== null) return 1;
          return 0;
        });

      setVisitPlans(pharmaciesWithDistance);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Không thể tải lịch viếng thăm. Vui lòng kiểm tra kết nối mạng.');
      setVisitPlans([]);
    } finally {
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
    return distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount).replace('₫', '');
  };

  const openDirections = (pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // --- Styles ---
  const styles = {
    container: {
      minHeight: '100%',
      background: '#F0F2F5',
      paddingBottom: '80px',
      fontFamily: "'Inter', sans-serif"
    },
    header: {
      background: 'linear-gradient(135deg, #1E4A8B 0%, #00d2ff 100%)',
      padding: '24px 20px 60px 20px',
      color: 'white',
      borderBottomLeftRadius: '30px',
      borderBottomRightRadius: '30px',
      marginBottom: '-40px',
      position: 'relative',
      zIndex: 1
    },
    statsContainer: {
      padding: '0 20px',
      marginBottom: '24px',
      position: 'relative',
      zIndex: 2
    },
    statsCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '20px',
      boxShadow: '0 10px 30px -10px rgba(30, 74, 139, 0.2)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '10px'
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative'
    },
    statValue: {
      fontSize: '18px',
      fontWeight: '800',
      color: '#1E4A8B',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: '11px',
      color: '#64748B',
      fontWeight: '600'
    },
    divider: {
      width: '1px',
      height: '30px',
      background: '#E2E8F0',
      position: 'absolute',
      right: '-5px',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    visitCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: '1px solid #F1F5F9',
      position: 'relative',
      overflow: 'hidden'
    },
    toast: {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#DC2626', // Red-600
      color: 'white',
      padding: '12px 20px',
      borderRadius: '50px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      fontSize: '13px',
      fontWeight: '600',
      animation: 'slideDown 0.3s ease-out'
    }
  };

  return (
    <main style={styles.container}>
      {/* Toast Notification */}
      {error && (
        <div style={styles.toast}>
          <Icons.AlertCircle />
          {error}
        </div>
      )}

      {/* 1. Header Section */}
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', margin: 0 }}>
              Hello, {user?.name?.split(' ').pop()}! 👋
            </h1>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>
              📍 {user?.hub ? `Hub ${user.hub}` : 'TP. HCM'}
            </div>
          </div>
          <Link to="/profile" aria-label="View Profile">
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '18px', fontWeight: 'bold',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              {user?.name?.charAt(0)}
            </div>
          </Link>
        </div>
      </header>

      {/* 2. Stats Card with Skeleton */}
      <section style={styles.statsContainer} aria-label="Statistics">
        <div style={styles.statsCard}>
          <Link to="/kpi" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={styles.statItem}>
              {statsLoading ? <Skeleton width="60px" height="24px" /> : (
                <div style={styles.statValue}>
                  {stats.totalRevenue ? `${formatCurrency(stats.totalRevenue / 1000000)}M` : '0'}
                </div>
              )}
              <div style={styles.statLabel}>Doanh thu</div>
              <div style={styles.divider}></div>
            </div>
          </Link>
          <Link to="/kpi" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={styles.statItem}>
              {statsLoading ? <Skeleton width="40px" height="24px" /> : (
                <div style={styles.statValue}>{stats.totalOrders}</div>
              )}
              <div style={styles.statLabel}>Đơn hàng</div>
              <div style={styles.divider}></div>
            </div>
          </Link>
          <Link to="/kpi" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={styles.statItem}>
              {statsLoading ? <Skeleton width="40px" height="24px" /> : (
                <div style={styles.statValue}>{stats.totalPharmacies}</div>
              )}
              <div style={styles.statLabel}>Khách hàng</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Quick Actions (Static, no loader needed) */}
      <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '0 20px', marginBottom: '30px' }} aria-label="Quick Actions">
        {[
          { to: '/map', icon: <Icons.Map />, text: 'Bản đồ', color: '#3B82F6', bg: '#EFF6FF' },
          { to: '/customers', icon: <Icons.Users />, text: 'Khách hàng', color: '#10B981', bg: '#ECFDF5' },
          { to: '/kpi', icon: <Icons.TrendingUp />, text: 'KPI', color: '#8b5cf6', bg: '#ede9fe' },
          { to: '/create-pharmacy', icon: <span style={{ fontSize: '20px' }}>+</span>, text: 'Thêm mới', color: '#f97316', bg: '#fff7ed' }
        ].map((item, index) => (
          <Link key={index} to={item.to} style={{
            background: 'white', borderRadius: '16px', padding: '12px 5px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {item.icon}
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>{item.text}</span>
          </Link>
        ))}
      </nav>

      {/* 4. Today's Plan with Skeleton */}
      <section style={{ padding: '0 20px' }} aria-label="Today's Visit Plan">
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>📅 Lịch trình hôm nay</h2>
          <Link to="/map" style={{ fontSize: '13px', color: '#3B82F6', textDecoration: 'none', fontWeight: '600' }}>
            Xem bản đồ →
          </Link>
        </div>

        {loading ? (
          // Skeleton Loader for List
          [1, 2, 3].map(i => (
            <div key={i} style={{ ...styles.visitCard, height: '100px', display: 'flex', alignItems: 'center' }}>
              <Skeleton width="48px" height="48px" borderRadius="12px" />
              <div style={{ marginLeft: '15px', flex: 1 }}>
                <Skeleton width="60%" height="20px" />
                <div style={{ marginTop: '8px' }}><Skeleton width="40%" height="16px" /></div>
              </div>
            </div>
          ))
        ) : visitPlans.length > 0 ? (
          visitPlans.map((pharmacy) => (
            <div key={pharmacy.id} style={styles.visitCard}>
              {pharmacy.distance && (
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: '#FEF3C7', color: '#D97706', padding: '4px 10px',
                  borderRadius: '100px', fontSize: '11px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Icons.Navigation /> {getDistanceText(pharmacy)}
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1E4A8B, #3B82F6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '20px', flexShrink: 0
                }}>
                  🏥
                </div>
                <div style={{ flex: 1, paddingRight: '60px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', marginBottom: '4px', lineHeight: '1.3' }}>
                    {pharmacy.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4', marginBottom: '8px' }}>
                    {pharmacy.address}
                  </p>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openDirections(pharmacy)}
                      style={{
                        padding: '6px 12px', background: '#F1F5F9', color: '#475569',
                        border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '600'
                      }}
                    >
                      Dẫn đường
                    </button>
                    <Link
                      to={`/visit/${pharmacy.id}`}
                      style={{
                        padding: '6px 12px', background: '#1E4A8B', color: 'white',
                        border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '600', textDecoration: 'none'
                      }}
                    >
                      Check-in
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            background: 'white', borderRadius: '20px', padding: '40px 20px',
            textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.5 }}>☕</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
              Không có lịch hôm nay
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Hãy xem bản đồ hoặc danh sách khách hàng để lên kế hoạch.
            </p>
            <Link
              to="/customers"
              style={{
                display: 'inline-block', marginTop: '16px', padding: '10px 20px',
                background: '#EFF6FF', color: '#3B82F6', borderRadius: '10px',
                fontSize: '13px', fontWeight: '600', textDecoration: 'none'
              }}
            >
              Tìm khách hàng
            </Link>
          </div>
        )}
      </section>

      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </main>
  );
};

export default Home;
