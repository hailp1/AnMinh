import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { analyticsAPI } from '../services/api';

const REPORTS = [
    { id: 'orders-detail', name: 'Chi tiết Đơn hàng', desc: 'Danh sách chi tiết từng đơn hàng, trạng thái, và tổng tiền.' },
    { id: 'sales-by-staff', name: 'Hiệu suất Nhân viên', desc: 'Tổng hợp doanh số và số đơn hàng theo từng TDV.' },
    { id: 'sales-by-territory', name: 'Doanh số theo Địa bàn', desc: 'Phân tích doanh số theo từng khu vực quản lý.' },
    { id: 'sales-by-product', name: 'Báo cáo Sản phẩm', desc: 'Chi tiết số lượng bán ra và doanh thu từng sản phẩm/nhóm hàng.' },
];

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState(REPORTS[0].id);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState('this_month');

    // Handle Export
    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await analyticsAPI.getReport(selectedReport, { range });

            if (!data || data.length === 0) {
                alert('Không có dữ liệu cho báo cáo này trong khoảng thời gian đã chọn.');
                return;
            }

            // Create Worksheet
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");

            // Generate Filename
            const reportName = REPORTS.find(r => r.id === selectedReport)?.name || 'Report';
            const dateStr = new Date().toISOString().split('T')[0];
            const fileName = `AM_DMS_${reportName}_${dateStr}.xlsx`;

            // Download
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error(error);
            alert('Lỗi xuất báo cáo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 800 }}>
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <h2 style={{ margin: '0 0 8px', color: '#1E293B' }}>📑 Trung tâm Báo cáo</h2>
                    <p style={{ margin: 0, color: '#64748B' }}>Chọn loại báo cáo và trích xuất dữ liệu Excel</p>
                </div>

                <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>

                    {/* Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 }}>LOẠI BÁO CÁO</label>
                            <select
                                value={selectedReport}
                                onChange={(e) => setSelectedReport(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 15 }}
                            >
                                {REPORTS.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 }}>THỜI GIAN</label>
                            <select
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 15 }}
                            >
                                <option value="today">Hôm nay</option>
                                <option value="this_month">Tháng này</option>
                                <option value="last_month">Tháng trước (Chưa hỗ trợ)</option> {/* Basic logic supports custom but UI simplified for now */}
                                <option value="all_time">Toàn thời gian</option>
                            </select>
                        </div>
                    </div>

                    {/* Description Box */}
                    <div style={{ background: '#F1F5F9', padding: 20, borderRadius: 12, marginBottom: 32, borderLeft: '4px solid #3B82F6' }}>
                        <div style={{ fontWeight: 'bold', color: '#1E293B', marginBottom: 4 }}>
                            {REPORTS.find(r => r.id === selectedReport)?.name}
                        </div>
                        <div style={{ fontSize: 14, color: '#64748B' }}>
                            {REPORTS.find(r => r.id === selectedReport)?.desc}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                            background: loading ? '#94A3B8' : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                            color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        {loading ? 'Đang xử lý...' : '📥 Tải xuống Excel'}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Reports;
