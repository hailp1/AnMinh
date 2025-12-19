import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pharmaciesAPI, visitPlansAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Visit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [visitStatus, setVisitStatus] = useState('PRE_VISIT');
    const [visitId, setVisitId] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [tasks, setTasks] = useState({
        photo: false,
        inventory: false,
        order: false,
        notes: false
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        let interval;
        if (visitStatus === 'CHECKED_IN' && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [visitStatus, startTime]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await pharmaciesAPI.getById(id);
            setPharmacy(data);
        } catch (err) {
            console.error(err);
            setError('Không thể tải thông tin khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // DECLARE doCheckIn FIRST (before handleCheckIn uses it)
    const doCheckIn = async (lat, lng) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/visit-plans/check-in', {
                userId: user.id,
                pharmacyId: id,
                latitude: lat,
                longitude: lng
            }, { headers: { 'x-auth-token': token } });

            setVisitId(res.data.id);
            setStartTime(Date.now());
            setVisitStatus('CHECKED_IN');
            alert('Check-in thành công!');
        } catch (err) {
            console.error('Check-in Failed:', err);
            alert(`Lỗi Check-in: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleCheckIn = async () => {
        if (!user) return alert('Vui lòng đăng nhập lại');

        const location = { lat: 10.762622, lng: 106.660172 };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    doCheckIn(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    console.warn('GPS Error:', err);
                    alert('Không lấy được vị trí. Đang dùng vị trí mặc định để check-in.');
                    doCheckIn(location.lat, location.lng);
                },
                { timeout: 5000 }
            );
        } else {
            doCheckIn(location.lat, location.lng);
        }
    };

    const handleCheckOut = async () => {
        if (!tasks.photo) {
            if (!window.confirm('Chưa chụp ảnh trưng bày. Tiếp tục check-out?')) return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/visit-plans/check-out', {
                visitId: visitId,
                latitude: 10.762622,
                longitude: 106.660172,
                notes: 'Hoàn thành viếng thăm (Web)'
            }, { headers: { 'x-auth-token': token } });

            setVisitStatus('CHECKED_OUT');
        } catch (err) {
            console.error('Check-out failed:', err);
            alert('Lỗi Check-out. Vui lòng thử lại.');
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setTimeout(() => {
            setTasks(prev => ({ ...prev, photo: true }));
            alert('Đã lưu ảnh (Mô phỏng)');
        }, 1000);
    };

    const handleInventory = () => {
        const qty = prompt('Nhập tồn kho (SKU Chính):', '0');
        if (qty) setTasks(prev => ({ ...prev, inventory: true }));
    };

    if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Đang tải dữ liệu...</div>;
    if (error) return <div style={{ padding: 20, color: 'red', textAlign: 'center' }}>{error}</div>;

    return (
        <div style={{ padding: '20px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', marginRight: 15 }}>←</button>
                <h2 style={{ fontSize: 18, margin: 0 }}>
                    {visitStatus === 'PRE_VISIT' ? 'Chuẩn bị' : visitStatus === 'CHECKED_IN' ? 'Đang viếng thăm' : 'Kết thúc'}
                </h2>
            </div>

            <div style={{ background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: 18, color: '#1E4A8B' }}>{pharmacy?.name}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: 13 }}>📍 {pharmacy?.address}</p>

                {visitStatus === 'CHECKED_IN' && (
                    <div style={{ marginTop: 15, padding: 8, background: '#EFF6FF', color: '#1E4A8B', borderRadius: 8, textAlign: 'center', fontWeight: 'bold' }}>
                        ⏱️ {formatTime(elapsedTime)}
                    </div>
                )}
            </div>

            {/* Customer History */}
            {pharmacy && (
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, margin: '0 0 12px 0', color: '#1E293B' }}>📊 Lịch sử giao dịch</h3>

                    {/* Last Visit */}
                    <div style={{ background: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: '600' }}>Viếng thăm gần nhất</div>
                        {pharmacy.visitPlans && pharmacy.visitPlans.length > 0 ? (
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#1E293B', fontSize: 14 }}>
                                    {new Date(pharmacy.visitPlans[0].visitDate).toLocaleDateString('vi-VN')}
                                </div>
                                {pharmacy.visitPlans[0].notes && (
                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                                        {pharmacy.visitPlans[0].notes}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa có lịch sử viếng thăm</div>
                        )}
                    </div>

                    {/* Last Order */}
                    <div style={{ background: '#fff', padding: 15, borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6, fontWeight: '600' }}>Đơn hàng gần nhất</div>
                        {pharmacy.orders && pharmacy.orders.length > 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#1E293B', fontSize: 14 }}>
                                        {new Date(pharmacy.orders[0].createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div style={{ fontSize: 12, color: pharmacy.orders[0].status === 'APPROVED' ? '#059669' : '#F59E0B', marginTop: 2 }}>
                                        {pharmacy.orders[0].status === 'PENDING' ? '⏳ Chờ duyệt' :
                                            pharmacy.orders[0].status === 'APPROVED' ? '✓ Đã duyệt' :
                                                pharmacy.orders[0].status === 'DELIVERED' ? '📦 Đã giao' : pharmacy.orders[0].status}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#1E4A8B', fontSize: 16 }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pharmacy.orders[0].totalAmount)}
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa có đơn hàng</div>
                        )}
                    </div>
                </div>
            )}


            {visitStatus === 'PRE_VISIT' && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <div style={{ fontSize: 60, marginBottom: 20 }}>📍</div>
                    <p style={{ color: '#666', marginBottom: 30 }}>Bạn đang ở tại điểm viếng thăm</p>
                    <button onClick={handleCheckIn} style={styles.btnPrimaryObj}>
                        BẮT ĐẦU CHECK-IN
                    </button>
                </div>
            )}

            {visitStatus === 'CHECKED_IN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <ActionBtn icon="📸" label="Chụp ảnh trưng bày" done={tasks.photo} onClick={() => fileInputRef.current.click()} />
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} accept="image/*" />

                    <ActionBtn icon="📦" label="Kiểm tồn kho" done={tasks.inventory} onClick={handleInventory} />

                    <Link to={`/order/create/${id}`} style={{ textDecoration: 'none' }}>
                        <ActionBtn icon="🛒" label="Lên đơn hàng" done={tasks.order} highlight onClick={() => setTasks(prev => ({ ...prev, order: true }))} />
                    </Link>

                    <ActionBtn icon="📝" label="Ghi chú" done={tasks.notes} onClick={() => { prompt('Ghi chú:'); setTasks(prev => ({ ...prev, notes: true })); }} />

                    <div style={{ height: 20 }} />
                    <button onClick={handleCheckOut} style={styles.btnDangerObj}>
                        KẾT THÚC VIẾNG THĂM
                    </button>
                </div>
            )}

            {visitStatus === 'CHECKED_OUT' && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <div style={{ fontSize: 60, marginBottom: 20 }}>✅</div>
                    <h3 style={{ color: '#10B981' }}>Hoàn thành!</h3>
                    <p>Tổng thời gian: <b>{formatTime(elapsedTime)}</b></p>
                    <button onClick={() => navigate('/home')} style={styles.btnPrimaryObj}>
                        Về trang chủ
                    </button>
                </div>
            )}
        </div>
    );
};

const ActionBtn = ({ icon, label, done, onClick, highlight }) => (
    <div onClick={onClick} style={{
        background: done ? '#ECFDF5' : '#fff',
        border: done ? '1px solid #10B981' : highlight ? '2px solid #F59E0B' : '1px solid #eee',
        borderRadius: 12, padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontWeight: '600', color: done ? '#047857' : '#333' }}>{label}</span>
        </div>
        {done && <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span>}
    </div>
);

const styles = {
    btnPrimaryObj: {
        width: '100%', padding: 16, borderRadius: 12, border: 'none',
        background: '#1E4A8B', color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(30,74,139,0.3)'
    },
    btnDangerObj: {
        width: '100%', padding: 16, borderRadius: 12, border: 'none',
        background: '#EF4444', color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: 'pointer'
    }
};

export default Visit;
