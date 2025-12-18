import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pharmaciesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Visit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(true);

    // Visit State
    const [visitStatus, setVisitStatus] = useState('PRE_VISIT');
    const [visitId, setVisitId] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Tasks State
    const [tasks, setTasks] = useState({
        photo: false,
        inventory: false,
        order: false,
        notes: false
    });

    const fileInputRef = useRef(null);

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

    // Timer effect
    useEffect(() => {
        let interval;
        if (visitStatus === 'CHECKED_IN' && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [visitStatus, startTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCheckIn = async () => {
        if (!user) return alert('Vui lòng đăng nhập');

        // Mock GPS (or use real if available)
        const lat = 10.762622;
        const lng = 106.660172;

        try {
            const res = await axios.post('/api/visit-plans/check-in', {
                userId: user.id,
                pharmacyId: id,
                latitude: lat,
                longitude: lng
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            setVisitId(res.data.id);
            setStartTime(Date.now());
            setVisitStatus('CHECKED_IN');
        } catch (error) {
            console.error('Check-in error:', error);
            alert('Lỗi Check-in: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCheckOut = async () => {
        if (!tasks.photo) {
            if (!window.confirm('Bạn chưa chụp ảnh trưng bày. Bạn có chắc muốn Check-out?')) return;
        }

        try {
            await axios.post('/api/visit-plans/check-out', {
                visitId,
                latitude: 10.762622,
                longitude: 106.660172,
                notes: 'Hoàn thành viếng thăm'
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            setVisitStatus('CHECKED_OUT');
        } catch (error) {
            console.error('Check-out error:', error);
            alert('Lỗi Check-out: ' + (error.response?.data?.message || error.message));
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.7); // Quality 0.7
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 1. Compress
            const compressedFile = await compressImage(file);

            // 2. Upload
            const formData = new FormData();
            formData.append('userId', user.id);
            formData.append('customerCode', pharmacy.code || pharmacy.id);
            formData.append('image', compressedFile);

            const uploadRes = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': localStorage.getItem('token')
                }
            });

            const imageUrl = uploadRes.data.url;

            // 3. Update Visit Plan
            await axios.put(`/api/visit-plans/${visitId}`, {
                notes: `Đã chụp ảnh: ${imageUrl}` // Ideally save to images array
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });

            alert('Đã chụp và lưu ảnh thành công!');
            setTasks(prev => ({ ...prev, photo: true }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Lỗi lưu ảnh: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleInventoryCheck = async () => {
        const qty = prompt('Nhập số lượng tồn kho SKU chủ lực:', '0');
        if (qty !== null) {
            try {
                await axios.put(`/api/visit-plans/${visitId}`, {
                    notes: `Kiểm tồn: SKU chủ lực = ${qty}`
                }, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setTasks(prev => ({ ...prev, inventory: true }));
            } catch (error) {
                alert('Lỗi lưu tồn kho');
            }
        }
    };

    const TaskButton = ({ icon, label, done, onClick, highlight }) => (
        <button
            onClick={onClick}
            style={{
                padding: '16px',
                background: done ? '#ecfdf5' : '#fff',
                border: done ? '1px solid #10b981' : highlight ? 'none' : '1px solid #ddd',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                color: done ? '#059669' : highlight ? '#fff' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: highlight ? '0 4px 12px rgba(242, 158, 46, 0.3)' : 'none',
                backgroundColor: highlight && !done ? '#F29E2E' : undefined
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <span>{label}</span>
            </div>
            {done && <span style={{ color: '#10b981' }}>✓</span>}
        </button>
    );

    if (loading) return <div className="loading">Loading...</div>;
    if (!pharmacy) return <div className="error">Không tìm thấy nhà thuốc</div>;

    return (
        <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Hidden File Input */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>←</button>
                <div style={{ fontWeight: 'bold', color: '#1E4A8B' }}>
                    {visitStatus === 'PRE_VISIT' ? 'Chuẩn bị viếng thăm' :
                        visitStatus === 'CHECKED_IN' ? 'Đang viếng thăm' : 'Hoàn thành'}
                </div>
                <div style={{ width: '24px' }}></div>
            </div>

            {/* Pharmacy Info Card */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h1 style={{ fontSize: '18px', color: '#1a1a2e', marginBottom: '8px', margin: 0 }}>{pharmacy.name}</h1>
                <p style={{ color: '#666', fontSize: '13px', margin: '0 0 12px 0' }}>📍 {pharmacy.address}</p>

                {visitStatus === 'CHECKED_IN' && (
                    <div style={{
                        background: '#e0f2fe', color: '#0284c7', padding: '8px 12px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold'
                    }}>
                        <span>⏱️</span>
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                )}
            </div>

            {/* Customer History */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', color: '#1a1a2e', margin: 0 }}>Lịch sử gần đây</h3>
                    <Link to={`/customer/history/${id}`} style={{ fontSize: '13px', color: '#1E4A8B', textDecoration: 'none' }}>Xem tất cả</Link>
                </div>

                {/* Last Visit */}
                <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Viếng thăm gần nhất</div>
                    {pharmacy.visitPlans && pharmacy.visitPlans.length > 0 ? (
                        <div>
                            <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                                {new Date(pharmacy.visitPlans[0].visitDate).toLocaleDateString('vi-VN')}
                            </div>
                            <div style={{ fontSize: '13px', color: '#444', marginTop: '4px' }}>
                                {pharmacy.visitPlans[0].notes || 'Không có ghi chú'}
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontSize: '13px', color: '#999' }}>Chưa có lịch sử viếng thăm</div>
                    )}
                </div>

                {/* Last Order */}
                <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Đơn hàng gần nhất</div>
                    {pharmacy.orders && pharmacy.orders.length > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                                    {new Date(pharmacy.orders[0].createdAt).toLocaleDateString('vi-VN')}
                                </div>
                                <div style={{ fontSize: '13px', color: '#10b981' }}>
                                    {pharmacy.orders[0].status}
                                </div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: '#F29E2E' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pharmacy.orders[0].totalAmount)}
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontSize: '13px', color: '#999' }}>Chưa có đơn hàng</div>
                    )}
                </div>
            </div>

            {/* FLOW: PRE_VISIT */}
            {visitStatus === 'PRE_VISIT' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '120px', height: '120px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#1E4A8B' }}>
                        📍
                    </div>
                    <div style={{ textAlign: 'center', color: '#666' }}>
                        Bạn đang cách khách hàng <br /><strong>5m</strong>
                    </div>
                    <button
                        onClick={handleCheckIn}
                        style={{
                            width: '100%', padding: '16px', background: '#1E4A8B', color: 'white',
                            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(30, 74, 139, 0.3)'
                        }}
                    >
                        CHECK-IN
                    </button>
                </div>
            )}

            {/* FLOW: WORKING */}
            {visitStatus === 'CHECKED_IN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <TaskButton
                        icon="📸"
                        label="Chụp ảnh trưng bày"
                        done={tasks.photo}
                        onClick={() => fileInputRef.current.click()}
                    />

                    <TaskButton
                        icon="📦"
                        label="Kiểm tồn kho (Inventory)"
                        done={tasks.inventory}
                        onClick={handleInventoryCheck}
                    />

                    <Link to={`/order/create/${id}`} style={{ textDecoration: 'none' }}>
                        <TaskButton
                            icon="🛒"
                            label="Lên đơn hàng"
                            done={tasks.order}
                            highlight={true}
                            onClick={() => setTasks(prev => ({ ...prev, order: true }))} // Ideally set this on return from order page
                        />
                    </Link>

                    <TaskButton
                        icon="📝"
                        label="Ghi chú viếng thăm"
                        done={tasks.notes}
                        onClick={() => {
                            const note = prompt('Ghi chú của bạn:', '');
                            if (note) setTasks(prev => ({ ...prev, notes: true }));
                        }}
                    />

                    <div style={{ flex: 1 }}></div>

                    <button
                        onClick={handleCheckOut}
                        style={{
                            width: '100%', padding: '16px', background: '#dc2626', color: 'white',
                            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
                            marginTop: '20px'
                        }}
                    >
                        CHECK-OUT
                    </button>
                </div>
            )}

            {/* FLOW: CHECKED_OUT */}
            {visitStatus === 'CHECKED_OUT' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '100px', height: '100px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#10b981' }}>
                        ✅
                    </div>
                    <h2 style={{ color: '#065f46' }}>Viếng thăm hoàn tất!</h2>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '100%', textAlign: 'center' }}>
                        <div style={{ marginBottom: '8px', color: '#666' }}>Thời gian thực hiện</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E4A8B' }}>{formatTime(elapsedTime)}</div>
                    </div>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            width: '100%', padding: '16px', background: '#1E4A8B', color: 'white',
                            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold'
                        }}
                    >
                        Về trang chủ
                    </button>
                </div>
            )}
        </div>
    );
};

export default Visit;
