import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmaciesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await pharmaciesAPI.getAll();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f3f4f6',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                background: '#fff',
                padding: '16px 20px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <button
                    onClick={() => navigate('/home')}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#1E4A8B',
                        padding: 0
                    }}
                >
                    ←
                </button>
                <h1 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1E4A8B',
                    margin: 0,
                    flex: 1
                }}>
                    Viếng thăm ({customers.length})
                </h1>
            </div>

            {/* Search */}
            <div style={{ padding: '16px 20px', background: '#fff' }}>
                <div style={{
                    position: 'relative',
                    marginBottom: '10px'
                }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên, địa chỉ, mã KH..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 40px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            fontSize: '15px',
                            outline: 'none',
                            background: '#f9fafb',
                            boxSizing: 'border-box'
                        }}
                    />
                    <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '18px',
                        color: '#9ca3af'
                    }}>
                        🔍
                    </span>
                </div>
            </div>

            {/* List */}
            <div style={{ padding: '16px 20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #1E4A8B',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 10px'
                        }}></div>
                        <p style={{ color: '#666', fontSize: '14px' }}>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredCustomers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => navigate(`/station/${customer.id}`)}
                                style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    cursor: 'pointer',
                                    border: '1px solid #f0f0f0'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                                        {customer.name}
                                    </h3>
                                    {customer.code && (
                                        <span style={{
                                            fontSize: '12px',
                                            background: '#eff6ff',
                                            color: '#1E4A8B',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontWeight: '500'
                                        }}>
                                            {customer.code}
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                                    📍 {customer.address}
                                </p>
                                <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#4b5563', marginBottom: '12px' }}>
                                    <span>📞 {customer.phone}</span>
                                </div>
                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/order/create/${customer.id}`);
                                        }}
                                        style={{
                                            background: '#F29E2E',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        🛒 Lên đơn hàng
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>Không tìm thấy khách hàng nào</p>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Customers;
