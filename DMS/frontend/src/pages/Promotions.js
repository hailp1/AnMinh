import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { promotionsAPI } from '../services/api';

const Promotions = () => {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, UPCOMING, EXPIRED

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
        try {
            const data = await promotionsAPI.getAll();
            setPromotions(data || []);
        } catch (error) {
            console.error('Error loading promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (promo) => {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);

        if (now < start) return 'UPCOMING';
        if (now > end) return 'EXPIRED';
        return 'ACTIVE';
    };

    const filteredPromotions = promotions.filter(p => {
        if (filter === 'ALL') return true;
        return getStatus(p) === filter;
    });

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            ACTIVE: { bg: '#ECFDF5', text: '#059669' },
            UPCOMING: { bg: '#EFF6FF', text: '#2563EB' },
            EXPIRED: { bg: '#FEE2E2', text: '#DC2626' }
        };
        const labels = {
            ACTIVE: 'Đang chạy',
            UPCOMING: 'Sắp diễn ra',
            EXPIRED: 'Đã kết thúc'
        };
        return (
            <span style={{
                background: colors[status].bg,
                color: colors[status].text,
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 'bold'
            }}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div style={{ padding: 20, paddingBottom: 100 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', marginRight: 15 }}>←</button>
                <h2 style={{ fontSize: 20, margin: 0, color: '#1E4A8B' }}>🎁 Chương trình khuyến mãi</h2>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
                {['ALL', 'ACTIVE', 'UPCOMING', 'EXPIRED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '8px 16px',
                        borderRadius: 20,
                        border: 'none',
                        background: filter === f ? '#1E4A8B' : '#fff',
                        color: filter === f ? '#fff' : '#666',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        {f === 'ALL' ? 'Tất cả' : f === 'ACTIVE' ? 'Đang chạy' : f === 'UPCOMING' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                    </button>
                ))}
            </div>

            {/* Promotions List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Đang tải...</div>
            ) : filteredPromotions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
                    <div style={{ color: '#999' }}>Không có chương trình khuyến mãi</div>
                </div>
            ) : (
                filteredPromotions.map(promo => {
                    const status = getStatus(promo);
                    return (
                        <div key={promo.id} style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            border: status === 'ACTIVE' ? '2px solid #059669' : '1px solid #eee'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                                <h3 style={{ margin: 0, fontSize: 16, color: '#1E293B', flex: 1 }}>{promo.name}</h3>
                                <StatusBadge status={status} />
                            </div>

                            <p style={{ margin: '8px 0', color: '#64748B', fontSize: 13 }}>{promo.description}</p>

                            <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: '#94A3B8' }}>
                                <div>
                                    <span>📅 Từ: </span>
                                    <b style={{ color: '#475569' }}>{formatDate(promo.startDate)}</b>
                                </div>
                                <div>
                                    <span>📅 Đến: </span>
                                    <b style={{ color: '#475569' }}>{formatDate(promo.endDate)}</b>
                                </div>
                            </div>

                            {promo.discountType && (
                                <div style={{ marginTop: 12, padding: 10, background: '#FEF3C7', borderRadius: 8 }}>
                                    <span style={{ fontSize: 13, color: '#92400E' }}>
                                        💰 {promo.discountType === 'PERCENTAGE' ? `Giảm ${promo.discountValue}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(promo.discountValue)}đ`}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Promotions;
