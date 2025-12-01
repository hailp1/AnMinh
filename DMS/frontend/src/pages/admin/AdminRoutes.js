import React, { useState, useEffect } from 'react';
import { usersAPI, customerAssignmentsAPI, visitPlansAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const AdminRoutes = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [message, setMessage] = useState('');
    const [importErrors, setImportErrors] = useState([]);

    const [config, setConfig] = useState({
        frequency: 'F4',
        daysOfWeek: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            loadCustomers(selectedUser);
        } else {
            setCustomers([]);
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

    const loadCustomers = async (userId) => {
        setLoading(true);
        try {
            const data = await customerAssignmentsAPI.getAll({ userId });
            const pharmacyList = data.map(item => item.pharmacy);
            setCustomers(pharmacyList);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedCustomerIds(customers.map(c => c.id));
        } else {
            setSelectedCustomerIds([]);
        }
    };

    const handleSelectCustomer = (id) => {
        if (selectedCustomerIds.includes(id)) {
            setSelectedCustomerIds(selectedCustomerIds.filter(cid => cid !== id));
        } else {
            setSelectedCustomerIds([...selectedCustomerIds, id]);
        }
    };

    const handleDayToggle = (day) => {
        const currentDays = config.daysOfWeek;
        if (currentDays.includes(day)) {
            setConfig({ ...config, daysOfWeek: currentDays.filter(d => d !== day) });
        } else {
            setConfig({ ...config, daysOfWeek: [...currentDays, day] });
        }
    };

    const handleGenerate = async () => {
        if (!selectedUser || selectedCustomerIds.length === 0 || config.daysOfWeek.length === 0) {
            alert('Vui lòng chọn TDV, Khách hàng và ít nhất 1 ngày trong tuần');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                userId: selectedUser,
                pharmacyIds: selectedCustomerIds,
                daysOfWeek: config.daysOfWeek,
                startDate: config.startDate,
                endDate: config.endDate,
                frequency: config.frequency
            };

            const response = await visitPlansAPI.generate(payload);
            setMessage(`Thành công: ${response.message}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error generating plans:', error);
            alert('Có lỗi xảy ra khi sinh lịch');
        } finally {
            setLoading(false);
        }
    };

    // --- Excel Import/Export ---

    const handleExportTemplate = () => {
        const template = [
            {
                EmployeeCode: 'TDV001',
                CustomerCode: 'KH001',
                Frequency: 'F4',
                Days: '2,5',
                StartDate: '2023-11-01',
                EndDate: '2023-11-30'
            },
            {
                EmployeeCode: 'TDV001',
                CustomerCode: 'KH002',
                Frequency: 'F8',
                Days: '2,4,6',
                StartDate: '2023-11-01',
                EndDate: '2023-11-30'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Route_Template.xlsx");
    };

    const handleImportExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setImportErrors([]);
        setMessage('');

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert('File Excel không có dữ liệu');
                    setLoading(false);
                    return;
                }

                // Map data
                const routes = data.map(row => ({
                    employeeCode: row.EmployeeCode,
                    customerCode: row.CustomerCode,
                    frequency: row.Frequency,
                    days: row.Days ? row.Days.toString() : '',
                    startDate: row.StartDate,
                    endDate: row.EndDate
                }));

                // Call API
                const response = await visitPlansAPI.importRoutes({ routes });

                if (response.errors && response.errors.length > 0) {
                    setImportErrors(response.errors);
                    setMessage(`Đã xử lý xong với một số lỗi. Thành công: ${response.successCount}`);
                } else {
                    setMessage(response.message);
                }

            } catch (error) {
                console.error('Error importing excel:', error);
                alert('Lỗi khi đọc file Excel');
            } finally {
                setLoading(false);
                // Reset file input
                e.target.value = null;
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 100px)' }}>

            {/* Top Bar: Import/Export */}
            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#1E4A8B' }}>Quản lý Tuyến & Lịch viếng thăm</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleExportTemplate}
                        style={{ padding: '10px 15px', background: '#fff', border: '1px solid #1E4A8B', color: '#1E4A8B', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        📥 Tải Template Excel
                    </button>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleImportExcel}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        <button
                            style={{ padding: '10px 15px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            📤 Import Excel
                        </button>
                    </div>
                </div>
            </div>

            {importErrors.length > 0 && (
                <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '8px', border: '1px solid #ef4444', maxHeight: '150px', overflowY: 'auto' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#b91c1c' }}>Lỗi Import ({importErrors.length}):</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#b91c1c', fontSize: '13px' }}>
                        {importErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                    </ul>
                </div>
            )}

            <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                {/* Left Panel: User Selection & Config */}
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0 }}>1. Chọn TDV</h3>
                        <select
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                            value={selectedUser || ''}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">-- Chọn Trình dược viên --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.employeeCode})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1 }}>
                        <h3 style={{ marginTop: 0 }}>3. Cấu hình Thủ công</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tần suất (F)</label>
                            <select
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                value={config.frequency}
                                onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
                            >
                                <option value="F1">F1 (1 lần/tháng)</option>
                                <option value="F2">F2 (2 lần/tháng)</option>
                                <option value="F4">F4 (1 lần/tuần)</option>
                                <option value="F8">F8 (2 lần/tuần)</option>
                                <option value="F12">F12 (3 lần/tuần)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Thứ trong tuần</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {[2, 3, 4, 5, 6, 7].map(day => (
                                    <button
                                        key={day}
                                        onClick={() => handleDayToggle(day)}
                                        style={{
                                            padding: '8px 12px',
                                            border: '1px solid #1E4A8B',
                                            borderRadius: '4px',
                                            background: config.daysOfWeek.includes(day) ? '#1E4A8B' : '#fff',
                                            color: config.daysOfWeek.includes(day) ? '#fff' : '#1E4A8B',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        T{day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Thời gian áp dụng</label>
                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                <input
                                    type="date"
                                    value={config.startDate}
                                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <span style={{ textAlign: 'center' }}>đến</span>
                                <input
                                    type="date"
                                    value={config.endDate}
                                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#F29E2E',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Đang xử lý...' : 'SINH LỊCH VIẾNG THĂM'}
                        </button>

                        {message && !importErrors.length && (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '13px' }}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Customer List */}
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between' }}>
                        <span>2. Chọn Khách hàng ({selectedCustomerIds.length}/{customers.length})</span>
                    </h3>

                    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee', width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={customers.length > 0 && selectedCustomerIds.length === customers.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Mã KH</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Tên Nhà thuốc</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #eee' }}>Địa chỉ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length > 0 ? (
                                    customers.map(c => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomerIds.includes(c.id)}
                                                    onChange={() => handleSelectCustomer(c.id)}
                                                />
                                            </td>
                                            <td style={{ padding: '12px', color: '#666' }}>{c.code}</td>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{c.name}</td>
                                            <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>{c.address}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                            {selectedUser ? 'Không có khách hàng nào' : 'Vui lòng chọn TDV trước'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRoutes;
