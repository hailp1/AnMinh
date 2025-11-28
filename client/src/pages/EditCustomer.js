import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pharmaciesAPI } from '../services/api';

const EditCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        contactPerson: '',
        latitude: '',
        longitude: '',
        image1: null,
        image2: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPharmacy = async () => {
            try {
                const data = await pharmaciesAPI.getById(id);
                setFormData({
                    name: data.name || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    contactPerson: data.contactPerson || '',
                    latitude: data.latitude || '',
                    longitude: data.longitude || '',
                    image1: null,
                    image2: null
                });
            } catch (error) {
                console.error('Error fetching pharmacy:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacy();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e, field) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, [field]: e.target.files[0] });
        }
    };

    const getCoordinates = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({ ...prev, latitude, longitude }));
                    alert(`Đã lấy tọa độ: ${latitude}, ${longitude}`);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Không thể lấy tọa độ. Vui lòng bật định vị.');
                }
            );
        } else {
            alert('Trình duyệt không hỗ trợ Geolocation');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // In a real app, we would upload images first or use FormData
            // For now, we just update the text fields
            const { image1, image2, ...dataToUpdate } = formData;
            await pharmaciesAPI.update(id, dataToUpdate);
            alert('Cập nhật thành công!');
            navigate(-1);
        } catch (error) {
            console.error('Error updating pharmacy:', error);
            alert('Cập nhật thất bại');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '15px', border: 'none', background: 'none', fontSize: '16px', cursor: 'pointer' }}>
                ← Quay lại
            </button>
            <h1 style={{ fontSize: '24px', color: '#1E4A8B', marginBottom: '20px' }}>Cập nhật thông tin</h1>

            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Tên nhà thuốc</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Địa chỉ</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Vĩ độ</label>
                        <input
                            type="text"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Kinh độ</label>
                        <input
                            type="text"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={getCoordinates}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        background: '#fff',
                        border: '1px solid #1E4A8B',
                        color: '#1E4A8B',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    📍 Lấy tọa độ hiện tại
                </button>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Hình ảnh 1</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'image1')}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Hình ảnh 2</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'image2')}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Người liên hệ</label>
                    <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#1E4A8B',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Lưu thay đổi
                </button>
            </form>
        </div>
    );
};

export default EditCustomer;
