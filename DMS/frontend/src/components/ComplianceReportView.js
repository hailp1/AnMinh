// Enhanced Compliance Report Component
// To be integrated into AdminReports.js

import React from 'react';

const ComplianceReportView = ({ reportData, period, formatCurrency }) => {
    // Calculate KPIs from reportData
    const calculateKPIs = () => {
        if (!reportData || !Array.isArray(reportData)) {
            return {
                planCall: 0,
                visitedCustomer: 0,
                pc: 0,
                strikeRate: 0,
                revenue: 0,
                vpo: 0,
                avgCheckInTime: '--:--',
                avgFirstVisitTime: '--:--'
            };
        }

        const totalPlanCall = reportData.reduce((sum, tdv) => sum + (tdv.planCall || 0), 0);
        const totalVisited = reportData.reduce((sum, tdv) => sum + (tdv.visitedCustomer || 0), 0);
        const totalPC = reportData.reduce((sum, tdv) => sum + (tdv.pc || 0), 0);
        const totalRevenue = reportData.reduce((sum, tdv) => sum + (tdv.revenue || 0), 0);

        return {
            planCall: totalPlanCall,
            visitedCustomer: totalVisited,
            pc: totalPC,
            strikeRate: totalVisited > 0 ? ((totalPC / totalVisited) * 100).toFixed(1) : 0,
            revenue: totalRevenue,
            vpo: totalPC > 0 ? (totalRevenue / totalPC).toFixed(0) : 0,
            avgCheckInTime: calculateAvgTime(reportData, 'checkInTime'),
            avgFirstVisitTime: calculateAvgTime(reportData, 'firstVisitTime')
        };
    };

    const calculateAvgTime = (data, field) => {
        const times = data.map(tdv => tdv[field]).filter(t => t);
        if (times.length === 0) return '--:--';

        const totalMinutes = times.reduce((sum, time) => {
            const [h, m] = time.split(':').map(Number);
            return sum + h * 60 + m;
        }, 0);

        const avgMinutes = totalMinutes / times.length;
        const hours = Math.floor(avgMinutes / 60);
        const minutes = Math.floor(avgMinutes % 60);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const kpis = calculateKPIs();

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>
                    📊 Báo cáo Tuân thủ Tuyến
                </h2>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    {period === 'this_month' ? 'Tháng này' : 'Tháng trước'} - Tổng hợp KPI hoạt động TDV
                </p>
            </div>

            {/* KPI Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <KPICard
                    title="Plan Call"
                    value={kpis.planCall}
                    subtitle="KH cần ghé thăm"
                    icon="📋"
                    color="#3b82f6"
                />
                <KPICard
                    title="Visited Customer"
                    value={kpis.visitedCustomer}
                    subtitle="KH đã ghé thăm"
                    icon="✅"
                    color="#10b981"
                />
                <KPICard
                    title="PC (Orders)"
                    value={kpis.pc}
                    subtitle="Số đơn hàng"
                    icon="🛒"
                    color="#8b5cf6"
                />
                <KPICard
                    title="Strike Rate"
                    value={`${kpis.strikeRate}%`}
                    subtitle="Tỷ lệ thành công"
                    icon="🎯"
                    color="#f59e0b"
                />
                <KPICard
                    title="Revenue"
                    value={formatCurrency(kpis.revenue)}
                    subtitle="Doanh thu"
                    icon="💰"
                    color="#ec4899"
                />
                <KPICard
                    title="VPO"
                    value={formatCurrency(kpis.vpo)}
                    subtitle="DT TB/Khách"
                    icon="📈"
                    color="#06b6d4"
                />
                <KPICard
                    title="Avg Check-in"
                    value={kpis.avgCheckInTime}
                    subtitle="Giờ check-in TB"
                    icon="⏰"
                    color="#84cc16"
                />
                <KPICard
                    title="1st Visit Time"
                    value={kpis.avgFirstVisitTime}
                    subtitle="Ghé thăm đầu TB"
                    icon="🚀"
                    color="#f97316"
                />
            </div>

            {/* TDV Performance Table */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid #f1f5f9',
                    background: 'linear-gradient(135deg, #1E4A8B 0%, #2563eb 100%)',
                    color: '#fff'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                        Chi tiết theo TDV
                    </h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={tableHeaderStyle}>#</th>
                                <th style={tableHeaderStyle}>TDV</th>
                                <th style={tableHeaderStyle}>Plan Call</th>
                                <th style={tableHeaderStyle}>Visited</th>
                                <th style={tableHeaderStyle}>PC</th>
                                <th style={tableHeaderStyle}>Strike Rate</th>
                                <th style={tableHeaderStyle}>Revenue</th>
                                <th style={tableHeaderStyle}>VPO</th>
                                <th style={tableHeaderStyle}>Check-in</th>
                                <th style={tableHeaderStyle}>1st Visit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData && reportData.length > 0 ? (
                                reportData.map((tdv, index) => {
                                    const strikeRate = tdv.visitedCustomer > 0
                                        ? ((tdv.pc / tdv.visitedCustomer) * 100).toFixed(1)
                                        : 0;
                                    const vpo = tdv.pc > 0
                                        ? (tdv.revenue / tdv.pc).toFixed(0)
                                        : 0;

                                    return (
                                        <tr
                                            key={index}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                        >
                                            <td style={tableCellStyle}>{index + 1}</td>
                                            <td style={{ ...tableCellStyle, fontWeight: '600', color: '#1E4A8B' }}>
                                                {tdv.tdvName || tdv.name}
                                            </td>
                                            <td style={tableCellStyle}>{tdv.planCall || 0}</td>
                                            <td style={tableCellStyle}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    background: '#10b98120',
                                                    color: '#10b981',
                                                    borderRadius: '6px',
                                                    fontWeight: '600'
                                                }}>
                                                    {tdv.visitedCustomer || 0}
                                                </span>
                                            </td>
                                            <td style={tableCellStyle}>{tdv.pc || 0}</td>
                                            <td style={tableCellStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '60px',
                                                        height: '6px',
                                                        background: '#e5e7eb',
                                                        borderRadius: '3px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min(strikeRate, 100)}%`,
                                                            height: '100%',
                                                            background: strikeRate >= 70 ? '#10b981' : strikeRate >= 40 ? '#f59e0b' : '#ef4444',
                                                            transition: 'width 0.3s'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontWeight: '600' }}>{strikeRate}%</span>
                                                </div>
                                            </td>
                                            <td style={{ ...tableCellStyle, fontWeight: '700', color: '#10b981' }}>
                                                {formatCurrency(tdv.revenue || 0)}
                                            </td>
                                            <td style={tableCellStyle}>
                                                {formatCurrency(vpo)}
                                            </td>
                                            <td style={tableCellStyle}>
                                                <span style={{
                                                    fontFamily: 'monospace',
                                                    color: '#666'
                                                }}>
                                                    {tdv.checkInTime || '--:--'}
                                                </span>
                                            </td>
                                            <td style={tableCellStyle}>
                                                <span style={{
                                                    fontFamily: 'monospace',
                                                    color: '#666'
                                                }}>
                                                    {tdv.firstVisitTime || '--:--'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                        📭 Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Button */}
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button
                    onClick={() => exportToExcel(reportData, 'Compliance_Report')}
                    style={{
                        padding: '12px 24px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(16,185,129,0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#059669';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#10b981';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    📥 Xuất Excel
                </button>
            </div>
        </div>
    );
};

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon, color }) => (
    <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${color}`,
        transition: 'all 0.3s'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${color}15`,
                borderRadius: '12px'
            }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#666', fontWeight: '500', marginBottom: '4px' }}>
                    {title}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', lineHeight: 1 }}>
                    {value}
                </div>
            </div>
        </div>
        <div style={{ fontSize: '13px', color: '#999', fontWeight: '500' }}>
            {subtitle}
        </div>
    </div>
);

// Table Styles
const tableHeaderStyle = {
    padding: '16px 12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    whiteSpace: 'nowrap'
};

const tableCellStyle = {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#1a1a2e'
};

// Export to Excel function
const exportToExcel = (data, filename) => {
    if (!data || data.length === 0) {
        alert('Không có dữ liệu để xuất');
        return;
    }

    // Create CSV content
    const headers = ['STT', 'TDV', 'Plan Call', 'Visited', 'PC', 'Strike Rate', 'Revenue', 'VPO', 'Check-in', '1st Visit'];
    const csvContent = [
        headers.join(','),
        ...data.map((tdv, index) => {
            const strikeRate = tdv.visitedCustomer > 0
                ? ((tdv.pc / tdv.visitedCustomer) * 100).toFixed(1)
                : 0;
            const vpo = tdv.pc > 0
                ? (tdv.revenue / tdv.pc).toFixed(0)
                : 0;

            return [
                index + 1,
                tdv.tdvName || tdv.name,
                tdv.planCall || 0,
                tdv.visitedCustomer || 0,
                tdv.pc || 0,
                strikeRate,
                tdv.revenue || 0,
                vpo,
                tdv.checkInTime || '',
                tdv.firstVisitTime || ''
            ].join(',');
        })
    ].join('\n');

    // Download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toLocaleDateString('vi-VN')}.csv`;
    link.click();
};

export default ComplianceReportView;
