import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customersData from '../../data/customers.json';
import { getFromLocalStorage } from '../../utils/mockData';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeReps: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const customers = customersData.customers || [];
    const orders = getFromLocalStorage('orders', []);
    const users = getFromLocalStorage('users', []);
    
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0);
    }, 0);

    const activeReps = users.filter(u => 
      u.role === 'PHARMACY_REP' && 
      u.isOnline
    ).length;

    setStats({
      totalCustomers: customers.length,
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      activeReps: activeReps
    });

    // Recent orders
    const recent = orders
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 5);
    setRecentOrders(recent);
  };

  const statCards = [
    {
      title: 'Tổng khách hàng',
      value: stats.totalCustomers,
      icon: '👥',
      color: '#1a5ca2',
      change: '+12%'
    },
    {
      title: 'Tổng đơn hàng',
      value: stats.totalOrders,
      icon: '📦',
      color: '#3eb4a8',
      change: '+8%'
    },
    {
      title: 'Doanh thu',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: '💰',
      color: '#e5aa42',
      change: '+15%'
    },
    {
      title: 'Trình dược viên hoạt động',
      value: stats.activeReps,
      icon: '👨‍⚕️',
      color: '#10b981',
      change: '+5%'
    }
  ];

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '24px' : '32px'
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              background: '#fff',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `1px solid ${stat.color}20`,
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: isMobile ? '12px' : '16px'
            }}>
              <div style={{
                width: isMobile ? '48px' : '56px',
                height: isMobile ? '48px' : '56px',
                borderRadius: '12px',
                background: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '20px' : '24px'
              }}>
                {stat.icon}
              </div>
              <div style={{
                padding: '4px 12px',
                background: '#10b98115',
                borderRadius: '8px',
                fontSize: isMobile ? '11px' : '12px',
                color: '#10b981',
                fontWeight: '600'
              }}>
                {stat.change}
              </div>
            </div>
            <div style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 'bold',
              color: '#1a1a2e',
              marginBottom: '8px'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: isMobile ? '13px' : '14px',
              color: '#666'
            }}>
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '24px' : '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '600',
          color: '#1a1a2e',
          marginBottom: isMobile ? '16px' : '20px'
        }}>
          Thao tác nhanh
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '12px' : '16px'
        }}>
          {[
            { label: 'Thêm khách hàng', icon: '➕', path: '/admin/customers?action=add' },
            { label: 'Tạo lộ trình', icon: '🗺️', path: '/admin/routes?action=add' },
            { label: 'Xem bản đồ', icon: '📍', path: '/admin/map' },
            { label: 'Xuất báo cáo', icon: '📊', path: '/admin/reports' }
          ].map((action, index) => (
            <button
              key={index}
                  onClick={() => navigate(action.path)}
                  style={{
                    padding: isMobile ? '14px' : '16px',
                    background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                    border: 'none',
                    borderRadius: isMobile ? '10px' : '12px',
                    color: '#fff',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '10px' : '12px',
                    transition: 'all 0.2s',
                    minHeight: isMobile ? '48px' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(26, 92, 162, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
            >
              <span style={{ fontSize: '20px' }}>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders & Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: isMobile ? '16px' : '24px'
      }}>
        {/* Recent Orders */}
        <div style={{
          background: '#fff',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '16px' : '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: isMobile ? '16px' : '20px'
          }}>
            Đơn hàng gần đây
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    borderBottom: index < recentOrders.length - 1 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a1a2e',
                      marginBottom: '4px'
                    }}>
                      {order.customerName || 'Khách hàng'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {new Date(order.createdAt || order.date || Date.now()).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#10b981'
                  }}>
                    {order.totalAmount ? `${(order.totalAmount / 1000).toFixed(0)}K` : '0'}đ
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999'
              }}>
                Chưa có đơn hàng nào
              </div>
            )}
          </div>
        </div>

        {/* System Activity */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '20px'
          }}>
            Hoạt động hệ thống
          </h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {[
              { action: 'Đăng nhập hệ thống', user: 'admin', time: '2 phút trước' },
              { action: 'Cập nhật khách hàng', user: 'ketoan', time: '15 phút trước' },
              { action: 'Tạo đơn hàng mới', user: 'Trình dược viên A', time: '30 phút trước' },
              { action: 'Xuất báo cáo', user: 'admin', time: '1 giờ trước' }
            ].map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  borderBottom: index < 3 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a5ca2, #3eb4a8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  📝
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    color: '#1a1a2e',
                    marginBottom: '4px'
                  }}>
                    {activity.action}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {activity.user} • {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

