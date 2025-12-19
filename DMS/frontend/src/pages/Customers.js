import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pharmaciesAPI } from '../services/api';
import { LoadingSpinner, EmptyState } from '../components/LoadingStates';

const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, ACTIVE, INACTIVE

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchText, filterType, customers]);

    const loadCustomers = async () => {
        try {
            const data = await pharmaciesAPI.getAll();
            setCustomers(data || []);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...customers];

        // Search
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(search) ||
                c.address.toLowerCase().includes(search) ||
                (c.code && c.code.toLowerCase().includes(search))
            );
        }

        // Status filter
        if (filterType === 'ACTIVE') {
            filtered = filtered.filter(c => c.isActive !== false);
        } else if (filterType === 'INACTIVE') {
            filtered = filtered.filter(c => c.isActive === false);
        }

        setFilteredCustomers(filtered);
    };

    if (loading) return <LoadingSpinner message="Đang tải danh sách khách hàng..." />;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1E4A8B 0%, #2563EB 100%)',
                padding: '20px',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(30,74,139,0.2)'
            }}>
                <h2 style={{ margin: '0 0 12px 0', fontSize: 20 }}>👥 Khách hàng của tôi</h2>

                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="🔍 Tìm theo tên, địa chỉ, mã..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 40px 12px 16px',
                            borderRadius: 12,
                            border: 'none',
                            fontSize: 15,
                            background: 'rgba(255,255,255,0.95)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    {searchText && (
                        <button
                            onClick={() => setSearchText('')}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                border: 'none',
                                background: '#E5E7EB',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                cursor: 'pointer',
                                fontSize: 12,
                                color: '#64748B'
                            }}
                        >✕</button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
                padding: '12px 20px',
                background: '#fff',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                gap: 8
            }}>
                {[
                    { key: 'ALL', label: 'Tất cả', count: customers.length },
                    { key: 'ACTIVE', label: 'Hoạt động', count: customers.filter(c => c.isActive !== false).length },
                    { key: 'INACTIVE', label: 'Ngừng', count: customers.filter(c => c.isActive === false).length }
                ].map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setFilterType(filter.key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 20,
                            border: 'none',
                            background: filterType === filter.key ? '#1E4A8B' : '#F1F5F9',
                            color: filterType === filter.key ? '#fff' : '#64748B',
                            fontSize: 13,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            {/* Customers List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px 20px' }}>
                {filteredCustomers.length === 0 ? (
                    <EmptyState
                        icon="👥"
                        title="Không tìm thấy khách hàng"
                        subtitle="Thử tìm kiếm với từ khóa khác hoặc thêm khách hàng mới"
                        action={
                            <button
                                onClick={() => navigate('/create-pharmacy')}
                                style={{
                                    padding: '12px 24px',
                                    background: '#1E4A8B',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(30,74,139,0.2)'
                                }}
                            >
                                + Thêm khách hàng
                            </button>
                        }
                    />
                ) : (
                    filteredCustomers.map(customer => (
                        <div
                            key={customer.id}
                            style={{
                                background: '#fff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 12,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                border: '1px solid #F1F5F9'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>
                                            {customer.name}
                                        </h3>
                                        {customer.isActive === false && (
                                            <span style={{
                                                padding: '2px 8px',
                                                background: '#FEE2E2',
                                                color: '#DC2626',
                                                borderRadius: 8,
                                                fontSize: 10,
                                                fontWeight: 'bold'
                                            }}>
                                                Ngừng
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>
                                        📍 {customer.address}
                                    </div>
                                    {customer.phone && (
                                        <div style={{ fontSize: 12, color: '#94A3B8' }}>
                                            📞 {customer.phone}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <Link
                                    to={`/visit/${customer.id}`}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: 'linear-gradient(135deg, #1E4A8B 0%, #2563EB 100%)',
                                        color: '#fff',
                                        borderRadius: 10,
                                        fontSize: 13,
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 8px rgba(30,74,139,0.2)'
                                    }}
                                >
                                    ✓ Viếng thăm
                                </Link>
                                <Link
                                    to={`/order/create/${customer.id}`}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#F0F9FF',
                                        color: '#0284C7',
                                        border: '1px solid #BAE6FD',
                                        borderRadius: 10,
                                        fontSize: 13,
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        textAlign: 'center'
                                    }}
                                >
                                    🛒 Đặt hàng
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => navigate('/create-pharmacy')}
                style={{
                    position: 'fixed',
                    bottom: 90,
                    right: 20,
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 24,
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
                    zIndex: 100
                }}
            >
                +
            </button>
        </div>
    );
};

export default Customers;
