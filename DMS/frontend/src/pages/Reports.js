import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const REPORTS = [
    { id: 'orders-detail', name: 'Chi tiết Đơn hàng', desc: 'Danh sách chi tiết từng đơn hàng, trạng thái, và tổng tiền.' },
    { id: 'sales-by-staff', name: 'Hiệu suất Nhân viên', desc: 'Tổng hợp doanh số và số đơn hàng theo từng TDV.' },
    { id: 'sales-by-territory', name: 'Doanh số theo Địa bàn', desc: 'Phân tích doanh số theo từng khu vực quản lý.' },
    { id: 'sales-by-product', name: 'Báo cáo Sản phẩm', desc: 'Chi tiết số lượng bán ra và doanh thu từng sản phẩm/nhóm hàng.' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
    const [selectedReport, setSelectedReport] = useState(REPORTS[0].id);
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [range, setRange] = useState('this_month');
    const [previewData, setPreviewData] = useState([]);

    // Auto-fetch preview on change
    useEffect(() => {
        loadPreview();
    }, [selectedReport, range]);

    const loadPreview = async () => {
        setPreviewLoading(true);
        try {
            const data = await analyticsAPI.getReport(selectedReport, { range });
            setPreviewData(data || []);
        } catch (error) {
            console.error(error);
            setPreviewData([]);
        } finally {
            setPreviewLoading(false);
        }
    };

    // Handle Export
    const handleExport = () => {
        if (!previewData || previewData.length === 0) {
            alert('Không có dữ liệu để xuất.');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(previewData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");

        const reportName = REPORTS.find(r => r.id === selectedReport)?.name || 'Report';
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `AM_DMS_${reportName}_${dateStr}.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Render Chart based on Report Type
    const renderChart = () => {
        if (previewData.length === 0) return null;

        let dataKey = 'Doanh số';
        let nameKey = '';

        if (selectedReport === 'sales-by-staff') nameKey = 'Tên NV';
        else if (selectedReport === 'sales-by-territory') nameKey = 'Khu vực / Địa bàn';
        else if (selectedReport === 'sales-by-product') nameKey = 'Sản phẩm';
        else return null; // No chart for orders-detail

        // Sort Top 10 for Chart
        const chartData = [...previewData]
            .sort((a, b) => b[dataKey] - a[dataKey])
            .slice(0, 10);

        return (
            <div style={{ height: 300, marginTop: 20 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey={nameKey} type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(val) => formatCurrency(val)} />
                        <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div style={{ padding: '24px', background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 100 }}>
            <div style={{ width: '100%', maxWidth: 1000 }}>
                <div style={{ marginBottom: 32, textAlign: 'center' }}>
                    <h2 style={{ margin: '0 0 8px', color: '#1E293B' }}>📑 Trung tâm Báo cáo</h2>
                    <p style={{ margin: 0, color: '#64748B' }}>Chọn loại báo cáo và xem trước dữ liệu</p>
                </div>

                <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}>

                    {/* Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
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
                                <option value="last_month">Tháng trước</option>
                                <option value="all_time">Toàn thời gian</option>
                            </select>
                        </div>
                    </div>

                    {/* Report Description */}
                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20, fontStyle: 'italic' }}>
                        {REPORTS.find(r => r.id === selectedReport)?.desc}
                    </div>

                    {/* PREVIEW SECTION */}
                    <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, minHeight: 200, marginBottom: 24, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 16, color: '#334155' }}>👀 Xem trước dữ liệu</h3>
                            <span style={{ fontSize: 12, background: '#E2E8F0', padding: '4px 8px', borderRadius: 8 }}>
                                {previewData.length} bản ghi
                            </span>
                        </div>

                        {previewLoading ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Đang tải dữ liệu...</div>
                        ) : previewData.length > 0 ? (
                            <>
                                {/* Chart Rendering */}
                                {renderChart()}

                                {/* Table Preview (Limit 5 rows) */}
                                <div style={{ overflowX: 'auto', marginTop: 24, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                        <thead>
                                            <tr>
                                                {Object.keys(previewData[0]).map(key => (
                                                    <th key={key} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', borderBottom: '1px solid #CBD5E1' }}>{key}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.slice(0, 10).map((row, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    {Object.values(row).map((val, idx) => (
                                                        <td key={idx} style={{ padding: '8px 12px', color: '#334155' }}>
                                                            {typeof val === 'number' && val > 1000 ? formatCurrency(val) : val}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {previewData.length > 10 && (
                                        <div style={{ textAlign: 'center', padding: 10, fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
                                            ... và {previewData.length - 10} dòng khác (Tải xuống để xem đầy đủ)
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Không có dữ liệu</div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleExport}
                        disabled={previewLoading || previewData.length === 0}
                        style={{
                            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
                            background: (previewLoading || previewData.length === 0) ? '#CBD5E1' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                            color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: (previewLoading || previewData.length === 0) ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        📥 Tải xuống Báo cáo Excel đầy đủ
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Reports;
