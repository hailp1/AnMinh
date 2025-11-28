import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const OrderInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [order, setOrder] = useState(state?.order || null);

    // If we navigated here without state (e.g. direct link), we would fetch the order
    // For now, we rely on state or mock data if missing
    useEffect(() => {
        if (!order) {
            // Mock fetch if no state
            setOrder({
                id: id || 'MOCK-001',
                createdAt: new Date().toISOString(),
                customer: {
                    name: 'Nhà thuốc Mẫu',
                    address: '123 Đường ABC, TP.HCM',
                    phone: '0909123456'
                },
                items: [
                    { name: 'Thuốc mẫu 1', quantity: 10, price: 50000, unit: 'Hộp' },
                    { name: 'Thuốc mẫu 2', quantity: 5, price: 120000, unit: 'Hộp' }
                ],
                totalAmount: 1100000
            });
        }
    }, [id, order]);

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    if (!order) return <div>Loading...</div>;

    return (
        <div className="invoice-container" style={{ padding: '20px', background: '#fff', minHeight: '100vh', color: '#000' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src="/image/logo.webp" alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>HÓA ĐƠN BÁN HÀNG</h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Mã đơn: {order.id}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Ngày: {formatDate(order.createdAt)}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {order.customer?.name}</p>
                <p><strong>Địa chỉ:</strong> {order.customer?.address}</p>
                <p><strong>SĐT:</strong> {order.customer?.phone}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Chi tiết đơn hàng</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Sản phẩm</th>
                            <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>SL</th>
                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Đơn giá</th>
                            <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{item.name}</td>
                                <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.quantity}</td>
                                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{formatCurrency(item.price)}</td>
                                <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" style={{ padding: '15px 8px', textAlign: 'right', fontWeight: 'bold' }}>Tổng cộng:</td>
                            <td style={{ padding: '15px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>{formatCurrency(order.totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '40px' }}>
                <button
                    onClick={() => navigate('/home')}
                    style={{ flex: 1, padding: '15px', background: '#f3f4f6', color: '#1a1a2e', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                    Về trang chủ
                </button>
                <button
                    onClick={handlePrint}
                    style={{ flex: 1, padding: '15px', background: '#1E4A8B', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                    🖨️ In hóa đơn
                </button>
            </div>

            <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .invoice-container {
            padding: 0 !important;
            min-height: auto !important;
          }
        }
      `}</style>
        </div>
    );
};

export default OrderInvoice;
