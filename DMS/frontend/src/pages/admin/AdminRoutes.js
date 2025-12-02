import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usersAPI, customerAssignmentsAPI, visitPlansAPI, routesAPI } from '../../services/api';
import * as XLSX from 'xlsx';
import './AdminRoutes.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Icons
const createCustomIcon = (color) => new L.DivIcon({
    className: 'custom-map-marker',
    html: `<div style="
        background-color: ${color};
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

const Icons = {
    default: createCustomIcon('#9ca3af'), // Gray for unassigned
    selected: createCustomIcon('#1E4A8B'), // Blue for current day
    assigned: createCustomIcon('#10b981'), // Green for assigned to other days
};

// Map Component to handle bounds
const MapController = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);
    return null;
};

const AdminRoutes = () => {
    // State
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [customers, setCustomers] = useState([]); // All assigned customers
    const [routePlan, setRoutePlan] = useState({
        2: [], // Monday
        3: [], // Tuesday
        4: [], // Wednesday
        5: [], // Thursday
        6: [], // Friday
        7: []  // Saturday
    });
    const [activeDay, setActiveDay] = useState(2); // Default Monday (2)
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Load Users on Mount
    useEffect(() => {
        loadUsers();
    }, []);

    // Load Customers and Routes when User Selected
    useEffect(() => {
        if (selectedUser) {
            loadCustomers(selectedUser);
            loadRoutes(selectedUser);
        } else {
            setCustomers([]);
            setRoutePlan({ 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] });
        }
    }, [selectedUser]);

    const loadRoutes = async (userId) => {
        try {
            const routes = await routesAPI.getAll({ userId });
            const newPlan = { 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

            routes.forEach(r => {
                let dayInt;
                if (r.dayOfWeek === 'CN') dayInt = 8; // Assuming 8 for Sunday in UI? UI has 2-7.
                // UI only has 2-7 (Mon-Sat). If Sunday is needed, need to add it.
                // For now, handle T2-T7.
                else dayInt = parseInt(r.dayOfWeek.replace('T', ''));

                if (newPlan[dayInt]) {
                    newPlan[dayInt].push({
                        ...r.pharmacy,
                        frequency: 'F4'
                    });
                }
            });
            setRoutePlan(newPlan);
        } catch (error) {
            console.error('Error loading routes:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await usersAPI.getAll();
            const reps = data.filter(u => u.role === 'PHARMACY_REP' || u.role === 'TDV');
            setUsers(reps);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadCustomers = async (userId) => {
        setLoading(true);
        try {
            const data = await customerAssignmentsAPI.getAll({ userId });
            // Filter valid coordinates
            const validCustomers = data
                .map(item => item.pharmacy)
                .filter(c => c.latitude && c.longitude);
            setCustomers(validCustomers);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleAddToRoute = (customer) => {
        if (!selectedUser) return;

        setRoutePlan(prev => {
            const currentDayList = prev[activeDay];
            // Check if customer is already in the current day's list
            if (currentDayList.some(c => c.id === customer.id)) {
                return prev; // Customer already exists, do nothing
            }

            // Check if customer is already assigned to another day
            for (const day in prev) {
                if (day !== activeDay.toString() && prev[day].some(c => c.id === customer.id)) {
                    setMessage(`Khách hàng ${customer.name} đã được xếp vào Thứ ${day}.`);
                    setTimeout(() => setMessage(''), 3000);
                    return prev; // Customer already assigned to another day
                }
            }

            return {
                ...prev,
                [activeDay]: [...currentDayList, { ...customer, frequency: 'F4' }] // Default frequency
            };
        });
    };

    const handleRemoveFromRoute = (customerId, day) => {
        setRoutePlan(prev => ({
            ...prev,
            [day]: prev[day].filter(c => c.id !== customerId)
        }));
    };

    const handleChangeFrequency = (customerId, day, newFrequency) => {
        setRoutePlan(prev => ({
            ...prev,
            [day]: prev[day].map(c =>
                c.id === customerId ? { ...c, frequency: newFrequency } : c
            )
        }));
    };

    const handleMoveUp = (index, day) => {
        if (index === 0) return;
        setRoutePlan(prev => {
            const newDayList = [...prev[day]];
            const [movedItem] = newDayList.splice(index, 1);
            newDayList.splice(index - 1, 0, movedItem);
            return { ...prev, [day]: newDayList };
        });
    };

    const handleMoveDown = (index, day) => {
        if (index === routePlan[day].length - 1) return;
        setRoutePlan(prev => {
            const newDayList = [...prev[day]];
            const [movedItem] = newDayList.splice(index, 1);
            newDayList.splice(index + 1, 0, movedItem);
            return { ...prev, [day]: newDayList };
        });
    };

    const handleSaveMCP = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            // 1. Save to Route table (Persist configuration)
            const user = users.find(u => u.id === selectedUser);
            const routePayloads = [];
            for (const [dayStr, customerList] of Object.entries(routePlan)) {
                const day = parseInt(dayStr);
                const dayCode = day === 8 ? 'CN' : `T${day}`;

                customerList.forEach((c) => {
                    routePayloads.push({
                        employeeCode: user.employeeCode,
                        customerCode: c.code,
                        dayOfWeek: dayCode
                    });
                });
            }

            if (routePayloads.length > 0) {
                await routesAPI.import({ data: routePayloads });
            }

            // 2. Generate Visit Plans
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 28); // 4 weeks

            const promises = [];

            for (const [dayStr, customerList] of Object.entries(routePlan)) {
                const day = parseInt(dayStr);
                if (customerList.length === 0) continue;

                // Group by Frequency to optimize API calls
                const groups = {};
                customerList.forEach(c => {
                    const freq = c.frequency || 'F4';
                    if (!groups[freq]) groups[freq] = [];
                    groups[freq].push(c.id);
                });

                for (const [freq, ids] of Object.entries(groups)) {
                    let effectiveStartDate = startDate;
                    let apiFreq = freq;

                    if (freq === 'F2-ODD') {
                        apiFreq = 'F2';
                    } else if (freq === 'F2-EVEN') {
                        apiFreq = 'F2';
                        const nextWeek = new Date(startDate);
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        effectiveStartDate = nextWeek;
                    }

                    const payload = {
                        userId: selectedUser,
                        pharmacyIds: ids,
                        daysOfWeek: [day === 8 ? 0 : day - 1],
                        startDate: effectiveStartDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                        frequency: apiFreq
                    };
                    promises.push(visitPlansAPI.generate(payload));
                }
            }

            await Promise.all(promises);
            setMessage('Đã lưu Tuyến mẫu và sinh lịch thành công!');
            setTimeout(() => setMessage(''), 3000);

        } catch (error) {
            console.error('Error saving MCP:', error);
            alert('Lỗi khi lưu tuyến');
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

                // Expected format: { "Mã NV": "TDV01", "Mã KH": "KH01", "Thứ": "T2" }
                const payload = data.map(row => ({
                    employeeCode: row['Mã NV'],
                    customerCode: row['Mã KH'],
                    dayOfWeek: row['Thứ']
                })).filter(x => x.employeeCode && x.customerCode && x.dayOfWeek);

                if (payload.length === 0) {
                    alert('Không tìm thấy dữ liệu hợp lệ');
                    return;
                }

                setLoading(true);
                const res = await routesAPI.import({ data: payload });

                alert(`Import xong: ${res.success} thành công. ${res.errors.length} lỗi.`);
                if (selectedUser) loadRoutes(selectedUser);

            } catch (err) {
                console.error(err);
                alert('Lỗi import');
            } finally {
                setLoading(false);
                e.target.value = null;
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadTemplate = () => {
        const headers = [
            { 'Mã NV': 'TDV001', 'Mã KH': 'KH001', 'Thứ': 'T2' },
            { 'Mã NV': 'TDV001', 'Mã KH': 'KH002', 'Thứ': 'T3' }
        ];
        const ws = XLSX.utils.json_to_sheet(headers);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'Template_Tuyen.xlsx');
    };

    // Stats calculation
    const stats = useMemo(() => {
        const total = customers.length;
        const assignedIds = new Set();
        Object.values(routePlan).forEach(dayList => {
            dayList.forEach(c => assignedIds.add(c.id));
        });
        const covered = assignedIds.size;
        return { total, covered, uncovered: total - covered };
    }, [customers, routePlan]);

    // Markers for Map
    const markers = useMemo(() => {
        return customers.map(c => {
            // Determine color
            let type = 'default';
            const isInActiveDay = routePlan[activeDay].find(x => x.id === c.id);

            // Check if in ANY day
            let isInAnyDay = false;
            Object.values(routePlan).forEach(list => {
                if (list.find(x => x.id === c.id)) isInAnyDay = true;
            });

            if (isInActiveDay) type = 'selected';
            else if (isInAnyDay) type = 'assigned';

            return { ...c, type };
        });
    }, [customers, routePlan, activeDay]);

    return (
        <div className="admin-routes-container">
            {/* Header */}
            <div className="routes-header">
                <div className="routes-header-left">
                    <h2 className="routes-header-title">Quản lý Tuyến (MCP)</h2>
                    <select
                        className="tdv-selector"
                        value={selectedUser || ''}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">-- Chọn Trình dược viên --</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.employeeCode})</option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                        <button onClick={handleDownloadTemplate} style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                            📥 Template
                        </button>
                        <label style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                            📤 Import
                            <input type="file" accept=".xlsx" onChange={handleImportExcel} style={{ display: 'none' }} />
                        </label>
                    </div>
                </div>
                <div className="routes-stats">
                    <div className="stat-item">
                        <span className="stat-label">Tổng KH</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Đã xếp tuyến</span>
                        <span className="stat-value" style={{ color: '#10b981' }}>{stats.covered}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Chưa xếp</span>
                        <span className="stat-value" style={{ color: '#ef4444' }}>{stats.uncovered}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="routes-main">
                {/* Left: Map */}
                <div className="routes-map-panel">
                    <MapContainer
                        center={[10.762622, 106.660172]}
                        zoom={13}
                        className="map-container"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />
                        <MapController markers={markers} />

                        {markers.map(customer => (
                            <Marker
                                key={customer.id}
                                position={[customer.latitude, customer.longitude]}
                                icon={Icons[customer.type]}
                                eventHandlers={{
                                    click: () => handleAddToRoute(customer)
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '200px' }}>
                                        <strong>{customer.name}</strong><br />
                                        <small>{customer.address}</small><br />
                                        <button
                                            onClick={() => handleAddToRoute(customer)}
                                            style={{
                                                marginTop: '8px',
                                                padding: '4px 8px',
                                                background: '#1E4A8B',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                width: '100%'
                                            }}
                                        >
                                            Thêm vào Thứ {activeDay}
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Legend */}
                    <div className="map-legend">
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#1E4A8B' }}></div>
                            <span>Đang chọn (Thứ {activeDay})</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#10b981' }}></div>
                            <span>Đã xếp tuyến khác</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot" style={{ background: '#9ca3af' }}></div>
                            <span>Chưa xếp tuyến</span>
                        </div>
                    </div>
                </div>

                {/* Right: Schedule */}
                <div className="routes-schedule-panel">
                    {/* Tabs */}
                    <div className="schedule-tabs">
                        {[2, 3, 4, 5, 6, 7].map(day => (
                            <div
                                key={day}
                                className={`schedule-tab ${activeDay === day ? 'active' : ''}`}
                                onClick={() => setActiveDay(day)}
                            >
                                Thứ {day}
                            </div>
                        ))}
                    </div>

                    {/* List */}
                    <div className="schedule-content">
                        <div className="day-header">
                            <span className="day-title">Lịch trình Thứ {activeDay}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {routePlan[activeDay].length} khách hàng
                            </span>
                        </div>

                        {routePlan[activeDay].length === 0 ? (
                            <div className="empty-state">
                                Chưa có khách hàng nào.<br />
                                Click vào bản đồ để thêm.
                            </div>
                        ) : (
                            routePlan[activeDay].map((customer, index) => (
                                <div key={customer.id} className="customer-card">
                                    <div className="card-header">
                                        <span className="card-code">{customer.code}</span>
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>#{index + 1}</span>
                                    </div>
                                    <div className="card-name">{customer.name}</div>
                                    <div className="card-address">{customer.address}</div>

                                    {/* Frequency & Actions */}
                                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <select
                                            value={customer.frequency || 'F4'}
                                            onChange={(e) => handleChangeFrequency(customer.id, activeDay, e.target.value)}
                                            style={{
                                                padding: '4px',
                                                borderRadius: '4px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '12px',
                                                background: '#f9fafb'
                                            }}
                                        >
                                            <option value="F4">F4 (Hàng tuần)</option>
                                            <option value="F2-ODD">F2 (Tuần 1,3)</option>
                                            <option value="F2-EVEN">F2 (Tuần 2,4)</option>
                                            <option value="F1">F1 (1 lần/tháng)</option>
                                        </select>

                                        <div className="card-actions">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveUp(index, activeDay)}
                                                disabled={index === 0}
                                                title="Lên"
                                            >
                                                ⬆️
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveDown(index, activeDay)}
                                                disabled={index === routePlan[activeDay].length - 1}
                                                title="Xuống"
                                            >
                                                ⬇️
                                            </button>
                                            <button
                                                className="btn-icon btn-remove"
                                                onClick={() => handleRemoveFromRoute(customer.id, activeDay)}
                                                title="Xóa khỏi tuyến"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="schedule-footer">
                        <button
                            className="btn-primary"
                            onClick={handleSaveMCP}
                            disabled={loading || !selectedUser}
                        >
                            {loading ? 'Đang lưu...' : 'LƯU TUYẾN & SINH LỊCH'}
                        </button>
                        {message && (
                            <div style={{ marginTop: '8px', textAlign: 'center', color: '#10b981', fontSize: '13px' }}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default AdminRoutes;
