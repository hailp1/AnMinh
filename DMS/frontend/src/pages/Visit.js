import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { pharmaciesAPI } from '../services/api';

const Visit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPharmacy = async () => {
            try {
                const data = await pharmaciesAPI.getById(id);
                setPharmacy(data);
            } catch (error) {
                console.error('Error fetching pharmacy:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacy();
    }, [id]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!pharmacy) {
        return <div className="error">Không tìm thấy nhà thuốc</div>;
    }

    return (
        <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '15px', border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer' }}>
                ← Quay lại
            </button>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h1 style={{ fontSize: '20px', color: '#1E4A8B', marginBottom: '10px' }}>{pharmacy.name}</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>📍 {pharmacy.address}</p>
                <p style={{ color: '#666', fontSize: '14px' }}>📞 {pharmacy.phone}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button
                    onClick={() => alert('Tính năng đang phát triển')}
                    style={{
                        padding: '16px',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#666',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    📸 Chụp trưng bày (Đang phát triển)
                </button>

                <Link
                    to={`/customer/edit/${id}`}
                    style={{
                        padding: '16px',
                        background: '#fff',
                        border: '1px solid #1E4A8B',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1E4A8B',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    📝 Cập nhật thông tin
                </Link>

                <Link
                    to={`/order/create/${id}`}
                    style={{
                        padding: '16px',
                        background: '#F29E2E',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#fff',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(242, 158, 46, 0.3)'
                    }}
                >
                    🛒 Nhập đơn hàng
                </Link>
            </div>
        </div>
    );
};

export default Visit;
