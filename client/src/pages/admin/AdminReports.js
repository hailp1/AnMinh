import React, { useState, useEffect } from 'react';
import customersData from '../../data/customers.json';
import productsData from '../../data/products.json';
import { getFromLocalStorage } from '../../utils/mockData';

const AdminReports = () => {
  const [selectedHub, setSelectedHub] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    averageOrderValue: 0,
    customerActivityRate: 0
  });
  const [businessActivity, setBusinessActivity] = useState([]);
  const [coverageData, setCoverageData] = useState({
    byProduct: [],
    byCategory: [],
    byCustomerType: [],
    byHub: []
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadReportData();
  }, [selectedHub, selectedPeriod]);

  const loadReportData = () => {
    // Mock data for reports
    const orders = getFromLocalStorage('orders', []);
    const customers = selectedHub === 'all' 
      ? (customersData.customers || [])
      : (customersData.customers || []).filter(c => c.hub === selectedHub);
    
    const allProducts = productsData.productGroups?.flatMap(g => g.products) || [];
    
    // Calculate stats
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const activeCustomers = orders.reduce((set, o) => {
      if (o.customerId) set.add(o.customerId);
      return set;
    }, new Set()).size;
    
    setStats({
      totalRevenue,
      totalOrders,
      totalCustomers,
      activeCustomers,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      customerActivityRate: totalCustomers > 0 ? (activeCustomers / totalCustomers * 100) : 0
    });

    // Business Activity (Daily/Weekly/Monthly)
    const activityData = generateActivityData(selectedPeriod);
    setBusinessActivity(activityData);

    // Coverage Data
    const coverage = {
      byProduct: calculateCoverageByProduct(orders, allProducts),
      byCategory: calculateCoverageByCategory(orders, productsData.productGroups || []),
      byCustomerType: calculateCoverageByCustomerType(orders, customers),
      byHub: calculateCoverageByHub(orders, customers)
    };
    setCoverageData(coverage);

    // Performance Data
    const performance = generatePerformanceData(customers, orders);
    setPerformanceData(performance);
  };

  const generateActivityData = (period) => {
    const data = [];
    const now = new Date();
    let days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        revenue: Math.floor(Math.random() * 5000000) + 1000000,
        orders: Math.floor(Math.random() * 50) + 10,
        customers: Math.floor(Math.random() * 20) + 5
      });
    }
    return data;
  };

  const calculateCoverageByProduct = (orders, products) => {
    const productCounts = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productId = item.productId || item.product;
          if (!productCounts[productId]) {
            productCounts[productId] = { orders: 0, quantity: 0, revenue: 0 };
          }
          productCounts[productId].orders++;
          productCounts[productId].quantity += item.quantity || 0;
          productCounts[productId].revenue += (item.price || 0) * (item.quantity || 0);
        });
      }
    });

    return products.slice(0, 10).map(product => ({
      id: product.id,
      name: product.name,
      code: product.code,
      orders: productCounts[product.id]?.orders || 0,
      quantity: productCounts[product.id]?.quantity || 0,
      revenue: productCounts[product.id]?.revenue || 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  const calculateCoverageByCategory = (orders, categories) => {
    const categoryCounts = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const categoryId = item.categoryId || item.productGroup;
          if (!categoryCounts[categoryId]) {
            categoryCounts[categoryId] = { orders: 0, revenue: 0, customers: new Set() };
          }
          categoryCounts[categoryId].orders++;
          categoryCounts[categoryId].revenue += (item.price || 0) * (item.quantity || 0);
          if (order.customerId) {
            categoryCounts[categoryId].customers.add(order.customerId);
          }
        });
      }
    });

    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      orders: categoryCounts[cat.id]?.orders || 0,
      revenue: categoryCounts[cat.id]?.revenue || 0,
      customers: categoryCounts[cat.id]?.customers.size || 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  const calculateCoverageByCustomerType = (orders, customers) => {
    const typeCounts = {
      'Nhà thuốc': { orders: 0, revenue: 0, count: 0 },
      'Bệnh viện': { orders: 0, revenue: 0, count: 0 },
      'Phòng khám': { orders: 0, revenue: 0, count: 0 }
    };

    customers.forEach(customer => {
      const type = customer.type || 'Nhà thuốc';
      if (!typeCounts[type]) typeCounts[type] = { orders: 0, revenue: 0, count: 0 };
      typeCounts[type].count++;
    });

    orders.forEach(order => {
      const customer = customers.find(c => c.id === order.customerId);
      if (customer) {
        const type = customer.type || 'Nhà thuốc';
        typeCounts[type].orders++;
        typeCounts[type].revenue += order.totalAmount || 0;
      }
    });

    return Object.entries(typeCounts).map(([type, data]) => ({
      type,
      ...data
    }));
  };

  const calculateCoverageByHub = (orders, customers) => {
    const hubCounts = {};
    const hubs = ['Trung tâm', 'Củ Chi', 'Đồng Nai'];
    
    hubs.forEach(hub => {
      hubCounts[hub] = {
        customers: customers.filter(c => c.hub === hub).length,
        orders: 0,
        revenue: 0
      };
    });

    orders.forEach(order => {
      const customer = customers.find(c => c.id === order.customerId);
      if (customer && hubCounts[customer.hub]) {
        hubCounts[customer.hub].orders++;
        hubCounts[customer.hub].revenue += order.totalAmount || 0;
      }
    });

    return Object.entries(hubCounts).map(([hub, data]) => ({
      hub,
      ...data
    }));
  };

  const generatePerformanceData = (customers, orders) => {
    return customers.slice(0, 20).map(customer => {
      const customerOrders = orders.filter(o => o.customerId === customer.id);
      const revenue = customerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        id: customer.id,
        name: customer.name,
        code: customer.code,
        hub: customer.hub,
        orders: customerOrders.length,
        revenue: revenue,
        lastOrder: customerOrders.length > 0 
          ? new Date(customerOrders[customerOrders.length - 1].createdAt || Date.now())
          : null
      };
    }).sort((a, b) => b.revenue - a.revenue);
  };

  const formatCurrency = (amount) => {
    const value = amount || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (num) => {
    const value = num || 0;
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '24px',
        flexWrap: 'wrap',
        gap: isMobile ? '12px' : '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Báo cáo & Thống kê
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#666'
          }}>
            Phân tích hoạt động kinh doanh và bao phủ thị trường
          </p>
        </div>
        
        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '8px' : '12px',
          flexWrap: 'wrap',
          width: isMobile ? '100%' : 'auto'
        }}>
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            style={{
              padding: isMobile ? '8px 12px' : '10px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: isMobile ? '6px' : '8px',
              fontSize: isMobile ? '13px' : '14px',
              cursor: 'pointer',
              background: '#fff',
              flex: isMobile ? '1 1 100%' : 'none',
              minWidth: isMobile ? '100%' : '150px',
              boxSizing: 'border-box'
            }}
          >
            <option value="all">Tất cả Hub</option>
            <option value="Trung tâm">Trung tâm</option>
            <option value="Củ Chi">Củ Chi</option>
            <option value="Đồng Nai">Đồng Nai</option>
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: isMobile ? '8px 12px' : '10px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: isMobile ? '6px' : '8px',
              fontSize: isMobile ? '13px' : '14px',
              cursor: 'pointer',
              background: '#fff',
              flex: isMobile ? '1 1 100%' : 'none',
              minWidth: isMobile ? '100%' : '150px',
              boxSizing: 'border-box'
            }}
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: isMobile ? '12px' : '20px',
        marginBottom: isMobile ? '24px' : '32px'
      }}>
        {[
          {
            label: 'Tổng doanh thu',
            value: formatCurrency(stats.totalRevenue),
            icon: '💰',
            color: '#e5aa42',
            change: '+15.2%'
          },
          {
            label: 'Tổng đơn hàng',
            value: formatNumber(stats.totalOrders),
            icon: '📦',
            color: '#1a5ca2',
            change: '+8.5%'
          },
          {
            label: 'Khách hàng',
            value: formatNumber(stats.totalCustomers),
            icon: '👥',
            color: '#3eb4a8',
            change: '+12.3%'
          },
          {
            label: 'Tỷ lệ hoạt động',
            value: `${(stats.customerActivityRate || 0).toFixed(1)}%`,
            icon: '📊',
            color: '#10b981',
            change: '+5.1%'
          },
          {
            label: 'Giá trị đơn TB',
            value: formatCurrency(stats.averageOrderValue),
            icon: '📈',
            color: '#8b5cf6',
            change: '+3.7%'
          },
          {
            label: 'KH hoạt động',
            value: formatNumber(stats.activeCustomers),
            icon: '✅',
            color: '#f59e0b',
            change: '+9.2%'
          }
        ].map((metric, index) => (
          <div
            key={index}
            style={{
              background: '#fff',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: `2px solid ${metric.color}20`
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: isMobile ? '12px' : '16px'
            }}>
              <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '12px',
                background: `${metric.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {metric.icon}
              </div>
              <span style={{
                padding: '4px 10px',
                background: '#10b98115',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#10b981',
                fontWeight: '600'
              }}>
                {metric.change}
              </span>
            </div>
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 'bold',
              color: '#1a1a2e',
              marginBottom: '8px'
            }}>
              {metric.value}
            </div>
            <div style={{
              fontSize: isMobile ? '12px' : '13px',
              color: '#666'
            }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Business Activity Chart */}
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
          marginBottom: isMobile ? '16px' : '24px'
        }}>
          📈 Hoạt động kinh doanh
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(60px, 1fr))' : 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: isMobile ? '8px' : '12px',
          maxHeight: isMobile ? '250px' : '300px',
          overflowY: 'auto'
        }}>
          {businessActivity.map((item, index) => {
            const maxRevenue = Math.max(...businessActivity.map(i => i.revenue));
            const height = (item.revenue / maxRevenue) * 200;
            return (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  height: isMobile ? '150px' : '200px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  marginBottom: isMobile ? '6px' : '8px'
                }}>
                  <div style={{
                    width: '100%',
                    maxWidth: isMobile ? '30px' : '40px',
                    height: `${height}px`,
                    background: 'linear-gradient(180deg, #1a5ca2, #3eb4a8)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s'
                  }}></div>
                </div>
                <div style={{
                  fontSize: isMobile ? '10px' : '11px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#999'
                }}>
                  {formatCurrency(item.revenue)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coverage by Product */}
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
          marginBottom: isMobile ? '16px' : '24px'
        }}>
          💊 Bao phủ theo sản phẩm
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>STT</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Mã SP</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Tên sản phẩm</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Số đơn</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Số lượng</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {coverageData.byProduct?.slice(0, 10).map((product, index) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{index + 1}</td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1a5ca2' }}>{product.code}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1a1a2e' }}>{product.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', color: '#1a1a2e' }}>{formatNumber(product.orders)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', color: '#1a1a2e' }}>{formatNumber(product.quantity)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>{formatCurrency(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coverage by Category & Customer Type */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '24px' : '32px'
      }}>
        {/* By Category */}
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
            marginBottom: '24px'
          }}>
            📂 Bao phủ theo danh mục
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {coverageData.byCategory?.map((cat, index) => {
              const revenues = coverageData.byCategory.map(c => c.revenue || 0);
              const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 0;
              const width = maxRevenue > 0 ? ((cat.revenue || 0) / maxRevenue) * 100 : 0;
              return (
                <div key={cat.id}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>{cat.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{formatCurrency(cat.revenue)}</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${width}%`,
                      background: 'linear-gradient(90deg, #1a5ca2, #3eb4a8)',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '4px'
                  }}>
                    {formatNumber(cat.orders)} đơn • {formatNumber(cat.customers)} KH
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Customer Type */}
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
            marginBottom: '24px'
          }}>
            🏥 Bao phủ theo loại KH
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {coverageData.byCustomerType?.map((type, index) => (
              <div key={index} style={{
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                  marginBottom: '12px'
                }}>
                  {type.type}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Số lượng</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a5ca2' }}>{formatNumber(type.count)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Đơn hàng</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#3eb4a8' }}>{formatNumber(type.orders)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Doanh thu</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>{formatCurrency(type.revenue)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage by Hub */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '24px' : '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a1a2e',
          marginBottom: '24px'
        }}>
          🏢 Bao phủ theo Hub
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: isMobile ? '12px' : '20px'
        }}>
          {coverageData.byHub?.map((hub, index) => (
            <div key={index} style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f9fafb, #fff)',
              borderRadius: '12px',
              border: '2px solid #e5aa42',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a1a2e',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🏢</span>
                <span>{hub.hub}</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Khách hàng</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a5ca2' }}>{formatNumber(hub.customers)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Đơn hàng</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3eb4a8' }}>{formatNumber(hub.orders)}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Doanh thu</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(hub.revenue)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Table */}
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
          marginBottom: '24px'
        }}>
          ⚡ Hoạt động thực hiện - Top khách hàng
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>STT</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Mã KH</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Tên khách hàng</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Hub</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Số đơn</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Doanh thu</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Đơn cuối</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.slice(0, 15).map((customer, index) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{index + 1}</td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#1a5ca2' }}>{customer.code}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1a1a2e' }}>{customer.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: customer.hub === 'Củ Chi' || customer.hub === 'Đồng Nai' ? '#e5aa4215' : '#1a5ca215',
                      color: customer.hub === 'Củ Chi' || customer.hub === 'Đồng Nai' ? '#e5aa42' : '#1a5ca2',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {customer.hub}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', color: '#1a1a2e' }}>{formatNumber(customer.orders)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>{formatCurrency(customer.revenue)}</td>
                  <td style={{ padding: '12px', fontSize: '13px', textAlign: 'center', color: '#666' }}>
                    {customer.lastOrder ? customer.lastOrder.toLocaleDateString('vi-VN') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

