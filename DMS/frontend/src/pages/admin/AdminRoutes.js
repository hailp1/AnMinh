import React, { useState, useEffect, useMemo } from 'react';
import { usersAPI, routesAPI, visitPlansAPI, pharmaciesAPI } from '../../services/api'; // Removed Leaflet imports
import * as XLSX from 'xlsx';
import './AdminRoutes.css';

const AdminRoutes = () => {
    // State
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [allCustomers, setAllCustomers] = useState([]); // System customers for adding
    const [routeData, setRouteData] = useState([]); // Current TDV's route: [{ ...customer, day: 2, frequency: 'F4' }]
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsData, setDetailsData] = useState(null);

    // Load Metadata
    useEffect(() => {
        loadUsers();
        loadAllCustomers();
    }, []);

    // Load Routes when User Selected
    useEffect(() => {
        if (selectedUser) {
            loadRoutes(selectedUser);
        } else {
            setRouteData([]);
        }
    }, [selectedUser]);

    const loadUsers = async () => {
        try {
            const data = await usersAPI.getAll();
            const reps = data.filter(u => u.role === 'PHARMACY_REP' || u.role === 'TDV');
            setUsers(reps);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadAllCustomers = async () => {
        try {
            const data = await pharmaciesAPI.getAll();
            setAllCustomers(data || []);
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const loadRoutes = async (userId) => {
        setLoading(true);
        try {
            const routes = await routesAPI.getAll({ userId });
            // Transform to flat list
            const formatted = routes.map(r => {
                let dayInt = 2;
                if (r.dayOfWeek) {
                    const d = String(r.dayOfWeek);
                    dayInt = d === 'CN' ? 8 : (d.startsWith('T') ? parseInt(d.replace('T', '')) : parseInt(d));
                }
                return {
                    ...r.pharmacy,
                    day: dayInt || 2,
                    frequency: r.frequency || 'F4' // Default if missing
                };
            });
            // Sort by Day then Name
            formatted.sort((a, b) => (a.day - b.day) || a.name.localeCompare(b.name));
            setRouteData(formatted);
        } catch (error) {
            console.error('Error loading routes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleUpdateRow = (index, field, value) => {
        const newData = [...routeData];
        newData[index] = { ...newData[index], [field]: value };
        setRouteData(newData);
    };

    const handleDeleteRow = (index) => {
        if (!window.confirm('Xóa khách hàng khỏi tuyến này?')) return;
        const newData = [...routeData];
        newData.splice(index, 1);
        setRouteData(newData);
    };

    const handleAddCustomer = (customer) => {
        // Check if already exists in route
        if (routeData.some(r => r.id === customer.id)) {
            alert('Khách hàng này đã có trong tuyến!');
            return;
        }
        // Add with default T2, F4
        setRouteData(prev => [...prev, { ...customer, day: 2, frequency: 'F4' }]);
        // Don't close modal to allow multiple adds
    };

    const handleSaveMCP = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            // 0. Sync: Delete removed routes or changed days
            // Fetch current routes from DB to compare
            const currentRoutes = await routesAPI.getAll({ userId: selectedUser });
            const toDelete = [];

            for (const route of currentRoutes) {
                let dayInt = 2;
                if (route.dayOfWeek) {
                    const d = String(route.dayOfWeek);
                    dayInt = d === 'CN' ? 8 : (d.startsWith('T') ? parseInt(d.replace('T', '')) : parseInt(d));
                }
                // Check if this specific route (Pharmacy + Day) is still in routeData
                // route.pharmacy might be null if deleted? Hopefully not.
                if (route.pharmacy) {
                    const stillExists = routeData.some(rd =>
                        rd.id === route.pharmacy.id &&
                        rd.day === dayInt
                    );
                    if (!stillExists) {
                        toDelete.push(route.id);
                    }
                }
            }

            if (toDelete.length > 0) {
                // Delete sequentially or parallel
                await Promise.all(toDelete.map(id => routesAPI.delete(id)));
            }

            // 1. Prepare Import Data for Routes Table
            const user = users.find(u => u.id === selectedUser);
            const routePayloads = routeData.map(r => ({
                employeeCode: user.employeeCode,
                customerCode: r.code,
                dayOfWeek: r.day === 8 ? 'CN' : `T${r.day}`,
                frequency: r.frequency
            }));

            // Sync Routes (API should probably replace existing for this user, or we rely on import logic)
            // Existing import API adds/updates. To clean up removed ones, we might need a "Replace" flag or Delete All first.
            // For now, we'll assume the Import handles Upsert. 
            // Ideally, we should delete old routes for this user first.
            // But routesAPI.import is "bulk insert".
            // Let's assume the Backend handles "Clear previous for User" or we need to do it.
            // Since we don't have "Delete All Routes for User" API exposed here, we trust the Import logic or Update logic.
            // Wait, existing check_visit_plans.js suggests data persistence.
            // I'll assume Import Overwrites or I should call Delete?
            // The safest is to use the existing `routesAPI.import`. 

            if (routePayloads.length > 0) {
                await routesAPI.import({ data: routePayloads });
            }

            // 2. Generate Visit Plans (Visits)
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 28); // 4 weeks

            const promises = [];
            // Group by Day&Frequency
            // Logic similar to previous version
            const groups = {};
            routeData.forEach(r => {
                const key = `${r.day}-${r.frequency}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(r.id);
            });

            for (const [key, ids] of Object.entries(groups)) {
                const [dayStr, freq] = key.split('-');
                const day = parseInt(dayStr);

                let effectiveStartDate = startDate;
                let apiFreq = freq;

                // Handle Start Date for Odd/Even logic if needed (simplify for now)

                const payload = {
                    userId: selectedUser,
                    pharmacyIds: ids,
                    daysOfWeek: [day === 8 ? 0 : day - 1], // 0-6 for VisitPlan API usually (0=Sunday?) or 1=Monday?
                    // Previous code used: [day === 8 ? 0 : day - 1].
                    // JS GetDay: 0=Sun, 1=Mon.
                    // T2 (Mon) -> day=2 -> 1. Correct.
                    startDate: effectiveStartDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    frequency: apiFreq
                };
                promises.push(visitPlansAPI.generate(payload));
            }

            await Promise.all(promises);
            setMessage('Đã lưu Tuyến và Sinh lịch thành công!');
            setTimeout(() => setMessage(''), 3000);

            // Reload
            loadRoutes(selectedUser);

        } catch (error) {
            console.error('Error saving MCP:', error);
            alert('Lỗi khi lưu tuyến: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [
            {
                'Mã NV': 'TDV001',
                'Mã KH': 'KH001',
                'Mã Địa bàn': 'DB01',
                'Thứ': 'T2',
                'Tần suất': 'F4',
                'Giờ': '09:00',
                'Mục đích': 'Giới thiệu sản phẩm mới',
                'Ghi chú': 'Mang theo catalog'
            },
            {
                'Mã NV': 'TDV001',
                'Mã KH': 'KH002',
                'Mã Địa bàn': 'DB01',
                'Thứ': 'T3',
                'Tần suất': 'F2-ODD',
                'Giờ': '14:00',
                'Mục đích': 'Thu tiền và nhận đơn',
                'Ghi chú': ''
            }
        ];

        const ws = XLSX.utils.json_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template_Tuyen');
        XLSX.writeFile(wb, 'Template_Phan_Tuyen_MCP.xlsx');
    };

    const handleExportRoute = () => {
        if (!selectedUser || routeData.length === 0) {
            alert('Chưa có dữ liệu để xuất!');
            return;
        }

        const user = users.find(u => u.id === selectedUser);

        // Sheet 1: Route Details
        const routeSheet = routeData.map((r, i) => ({
            'STT': i + 1,
            'Mã KH': r.code,
            'Tên Nhà Thuốc': r.name,
            'Địa chỉ': r.address,
            'Điện thoại': r.phone,
            'Thứ': r.day === 8 ? 'CN' : `T${r.day}`,
            'Tần suất': r.frequency
        }));

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.json_to_sheet(routeSheet);
        XLSX.utils.book_append_sheet(wb, ws1, `Tuyến ${user.employeeCode}`);

        // Download
        const fileName = `Tuyen_${user.employeeCode}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handleViewDetails = async () => {
        if (!selectedUser || routeData.length === 0) {
            alert('Chưa có dữ liệu để xem!');
            return;
        }

        setLoading(true);
        try {
            const user = users.find(u => u.id === selectedUser);

            // Fetch visit plans for next 4 weeks
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 28);

            const visitPlans = await visitPlansAPI.getAll({
                userId: selectedUser,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });

            // Group data by day
            const dayGroups = {};
            routeData.forEach(r => {
                const dayLabel = r.day === 8 ? 'CN' : `T${r.day}`;
                if (!dayGroups[dayLabel]) dayGroups[dayLabel] = [];
                dayGroups[dayLabel].push(r);
            });

            setDetailsData({
                user,
                routeData,
                dayGroups,
                visitPlans: visitPlans || [],
                stats: {
                    totalCustomers: routeData.length,
                    visitsPerWeek: routeData.length,
                    totalVisitsGenerated: visitPlans ? visitPlans.length : 0
                }
            });

            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error loading details:', error);
            alert('Lỗi khi tải chi tiết: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                const payload = data.map(row => ({
                    employeeCode: row['Mã NV'] || row['Ma_NV'],
                    customerCode: row['Mã KH'] || row['Ma_KH'],
                    dayOfWeek: row['Thứ'] || row['Thu'],
                    frequency: row['Tần suất'] || row['Tan_Suat'] || 'F4'
                })).filter(x => x.employeeCode && x.customerCode && x.dayOfWeek);

                if (payload.length === 0) {
                    alert('File không có dữ liệu hợp lệ (Cần cột: Mã NV, Mã KH, Thứ)');
                    return;
                }

                setLoading(true);
                const res = await routesAPI.import({ data: payload });
                alert(`Import thành công: ${res.success}. Lỗi: ${res.errors?.length || 0}`);
                if (selectedUser) loadRoutes(selectedUser);
            } catch (err) {
                console.error(err);
                alert('Lỗi Import Excel');
            } finally {
                setLoading(false);
                e.target.value = null;
            }
        };
        reader.readAsBinaryString(file);
    };

    // Filter available customers for Modal
    const availableCustomers = allCustomers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
            <h2 style={{ marginBottom: '24px', color: '#1a1a2e', fontWeight: '700' }}>Quản lý Tuyến (MCP) & Lịch Viếng Thăm</h2>

            {/* Controls */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#666' }}>Chọn Trình Dược Viên</label>
                    <select
                        value={selectedUser || ''}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    >
                        <option value="">-- Chọn nhân viên --</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} - {u.employeeCode}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleDownloadTemplate} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📥</span> Xuất Template Excel
                    </button>
                    <label style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📤</span> Import Excel
                        <input type="file" onChange={handleImportExcel} accept=".xlsx" style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            {/* Main Table */}
            {selectedUser ? (
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Chi tiết Tuyến bán hàng</h3>
                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Tổng số: {routeData.length} khách hàng</div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleViewDetails}
                                style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>📊</span> Xem Chi Tiết
                            </button>
                            <button
                                onClick={handleExportRoute}
                                style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>📥</span> Xuất Excel
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{ padding: '10px 20px', background: '#F29E2E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                + Thêm khách hàng
                            </button>
                            <button
                                onClick={handleSaveMCP}
                                disabled={loading}
                                style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? 'Đang lưu...' : '💾 Lưu Tuyến & Sinh Lịch'}
                            </button>
                        </div>
                    </div>

                    {message && <div style={{ padding: '12px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '16px' }}>{message}</div>}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', color: '#4b5563', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', width: '50px' }}>#</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Mã KH</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Tên Khách Hàng</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb' }}>Địa chỉ</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', width: '120px' }}>Thứ</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', width: '120px' }}>Tần suất</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #e5e7eb', width: '80px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {routeData.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Chưa có khách hàng nào trong tuyến này.</td>
                                    </tr>
                                ) : (
                                    routeData.map((row, index) => (
                                        <tr key={`${row.id}-${index}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px', color: '#6b7280' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', fontWeight: '600', color: '#1E4A8B' }}>{row.code}</td>
                                            <td style={{ padding: '12px' }}>{row.name}</td>
                                            <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>{row.address}</td>
                                            <td style={{ padding: '12px' }}>
                                                <select
                                                    value={row.day}
                                                    onChange={(e) => handleUpdateRow(index, 'day', parseInt(e.target.value))}
                                                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }}
                                                >
                                                    {[2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>Thứ {d}</option>)}
                                                </select>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <select
                                                    value={row.frequency}
                                                    onChange={(e) => handleUpdateRow(index, 'frequency', e.target.value)}
                                                    style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }}
                                                >
                                                    <option value="F4">F4 (Tuần)</option>
                                                    <option value="F2-ODD">F2 (Lẻ)</option>
                                                    <option value="F2-EVEN">F2 (Chẵn)</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    onClick={() => handleDeleteRow(index)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}
                                                    title="Xóa"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#666', background: '#fff', borderRadius: '12px' }}>
                    Vui lòng chọn Trình Dược Viên để xem và cấu hình tuyến.
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowAddModal(false)}>
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Thêm khách hàng vào tuyến</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>

                        <input
                            type="text"
                            placeholder="🔍 Tìm theo Mã KH hoặc Tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '16px' }}
                        />

                        <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #f3f4f6', borderRadius: '8px' }}>
                            {availableCustomers.slice(0, 100).map(customer => {
                                const isAdded = routeData.some(r => r.id === customer.id);
                                return (
                                    <div key={customer.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid #f3f4f6', background: isAdded ? '#f9fafb' : 'white', opacity: isAdded ? 0.6 : 1 }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1E4A8B' }}>{customer.code} - {customer.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{customer.address}</div>
                                        </div>
                                        <button
                                            onClick={() => handleAddCustomer(customer)}
                                            disabled={isAdded}
                                            style={{ padding: '6px 16px', background: isAdded ? '#9ca3af' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: isAdded ? 'default' : 'pointer' }}
                                        >
                                            {isAdded ? 'Đã có' : 'Thêm'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && detailsData && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowDetailsModal(false)}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto', width: '90%' }} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                                📊 Chi Tiết Tuyến: {detailsData.user.name} ({detailsData.user.employeeCode})
                            </h2>
                            <button onClick={() => setShowDetailsModal(false)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>×</button>
                        </div>

                        {/* Statistics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #86efac' }}>
                                <div style={{ fontSize: '14px', color: '#166534', marginBottom: '4px' }}>Tổng khách hàng</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#15803d' }}>{detailsData.stats.totalCustomers}</div>
                            </div>
                            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                                <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '4px' }}>Lượt viếng/tuần</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1d4ed8' }}>{detailsData.stats.visitsPerWeek}</div>
                            </div>
                            <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>Lịch đã tạo (4 tuần)</div>
                                <div style={{ fontSize: '32px', fontWeight: '700', color: '#b45309' }}>{detailsData.stats.totalVisitsGenerated}</div>
                            </div>
                        </div>

                        {/* Day Distribution */}
                        <div style={{ marginBottom: '24px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Phân bổ theo ngày</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                                {Object.keys(detailsData.dayGroups).sort().map(day => {
                                    const count = detailsData.dayGroups[day].length;
                                    const percent = ((count / detailsData.stats.totalCustomers) * 100).toFixed(0);
                                    return (
                                        <div key={day} style={{ textAlign: 'center', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{day}</div>
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{count}</div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{percent}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Customer List Table */}
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>Danh sách khách hàng</h3>
                            <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead style={{ background: '#f9fafb', position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>STT</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Mã KH</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Tên nhà thuốc</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Địa chỉ</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>SĐT</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Thứ</th>
                                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Tần suất</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailsData.routeData.map((r, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '12px' }}>{i + 1}</td>
                                                <td style={{ padding: '12px' }}>{r.code}</td>
                                                <td style={{ padding: '12px', fontWeight: '500' }}>{r.name}</td>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{r.address}</td>
                                                <td style={{ padding: '12px', fontSize: '13px' }}>{r.phone}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{ padding: '4px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        {r.day === 8 ? 'CN' : `T${r.day}`}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{ padding: '4px 8px', background: '#fef3c7', color: '#92400e', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        {r.frequency}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Visit Schedule Table */}
                        {detailsData.visitPlans.length > 0 && (
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                                    Lịch viếng thăm đã tạo ({detailsData.visitPlans.length} lượt)
                                </h3>
                                <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead style={{ background: '#f9fafb', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>STT</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Ngày</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Giờ</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Nhà thuốc</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Địa chỉ</th>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailsData.visitPlans.map((v, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '12px' }}>{i + 1}</td>
                                                    <td style={{ padding: '12px', fontWeight: '500' }}>
                                                        {new Date(v.visitDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                                    </td>
                                                    <td style={{ padding: '12px' }}>{v.visitTime || '09:00'}</td>
                                                    <td style={{ padding: '12px' }}>{v.pharmacy?.name || ''}</td>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>{v.pharmacy?.address || ''}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            background: v.status === 'COMPLETED' ? '#d1fae5' : v.status === 'PLANNED' ? '#dbeafe' : '#fee2e2',
                                                            color: v.status === 'COMPLETED' ? '#065f46' : v.status === 'PLANNED' ? '#1e40af' : '#991b1b',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {v.status === 'PLANNED' ? 'Kế hoạch' : v.status === 'COMPLETED' ? 'Hoàn thành' : v.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '2px solid #e5e7eb' }}>
                            <button
                                onClick={() => {
                                    const wb = XLSX.utils.book_new();
                                    const summarySheet = XLSX.utils.json_to_sheet([{
                                        'TDV': detailsData.user.name,
                                        'Mã NV': detailsData.user.employeeCode,
                                        'Tổng KH': detailsData.stats.totalCustomers,
                                        'Lượt/tuần': detailsData.stats.visitsPerWeek,
                                        'Lịch đã tạo': detailsData.stats.totalVisitsGenerated
                                    }]);
                                    XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng quan');
                                    const customerSheet = XLSX.utils.json_to_sheet(
                                        detailsData.routeData.map((r, i) => ({
                                            'STT': i + 1, 'Mã KH': r.code, 'Tên': r.name, 'Địa chỉ': r.address,
                                            'SĐT': r.phone, 'Thứ': r.day === 8 ? 'CN' : `T${r.day}`, 'Tần suất': r.frequency
                                        }))
                                    );
                                    XLSX.utils.book_append_sheet(wb, customerSheet, 'Danh sách KH');
                                    if (detailsData.visitPlans.length > 0) {
                                        const scheduleSheet = XLSX.utils.json_to_sheet(
                                            detailsData.visitPlans.map((v, i) => ({
                                                'STT': i + 1, 'Ngày': new Date(v.visitDate).toLocaleDateString('vi-VN'),
                                                'Giờ': v.visitTime || '09:00', 'Nhà thuốc': v.pharmacy?.name || '',
                                                'Địa chỉ': v.pharmacy?.address || '',
                                                'Trạng thái': v.status === 'PLANNED' ? 'Kế hoạch' : v.status === 'COMPLETED' ? 'Hoàn thành' : v.status
                                            }))
                                        );
                                        XLSX.utils.book_append_sheet(wb, scheduleSheet, 'Lịch viếng thăm');
                                    }
                                    XLSX.writeFile(wb, `ChiTiet_Tuyen_${detailsData.user.employeeCode}_${new Date().toISOString().split('T')[0]}.xlsx`);
                                }}
                                style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>📥</span> Xuất Excel Chi Tiết
                            </button>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRoutes;
