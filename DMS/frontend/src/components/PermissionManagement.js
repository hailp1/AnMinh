import React, { useState, useEffect } from 'react';
import { permissionsAPI } from '../services/api';

const ROLES = [
    { id: 'ADMIN', label: 'Quản trị viên (Admin)' },
    { id: 'QL', label: 'Quản lý (Manager)' },
    { id: 'TDV', label: 'Trình dược viên (Sales Rep)' },
    { id: 'KT', label: 'Kế toán (Accountant)' }
];

const MODULES = [
    { id: 'customers', label: 'Khách hàng' },
    { id: 'orders', label: 'Đơn hàng' },
    { id: 'products', label: 'Sản phẩm' },
    { id: 'routes', label: 'Tuyến & Lịch' },
    { id: 'reports', label: 'Báo cáo' },
    { id: 'users', label: 'Người dùng' },
    { id: 'settings', label: 'Cài đặt' },
    { id: 'promotions', label: 'Khuyến mãi' },
    { id: 'loyalty', label: 'Tích lũy điểm' },
    { id: 'approvals', label: 'Phê duyệt' }
];

const ACTIONS = [
    { id: 'view', label: 'Xem' },
    { id: 'create', label: 'Thêm' },
    { id: 'edit', label: 'Sửa' },
    { id: 'delete', label: 'Xóa' },
    { id: 'export', label: 'Xuất Excel' }
];

const PermissionManagement = ({ isMobile }) => {
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState('TDV');

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        setLoading(true);
        try {
            const data = await permissionsAPI.getAll();
            if (data && data.length > 0) {
                const permMap = {};
                data.forEach(item => {
                    permMap[item.role] = item.permissions;
                });
                setPermissions(permMap);
            } else {
                // Default permissions if DB is empty
                setPermissions({
                    ADMIN: MODULES.reduce((acc, m) => ({ ...acc, [m.id]: ACTIONS.map(a => a.id) }), {}),
                    TDV: {
                        customers: ['view', 'create', 'edit'],
                        orders: ['view', 'create'],
                        products: ['view'],
                        routes: ['view'],
                        reports: ['view']
                    }
                });
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
            // Fallback to localStorage if API fails
            const stored = localStorage.getItem('rolePermissions');
            if (stored) {
                setPermissions(JSON.parse(stored));
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (module, action, checked) => {
        setPermissions(prev => {
            const rolePerms = prev[selectedRole] || {};
            const modulePerms = rolePerms[module] || [];

            let newModulePerms;
            if (checked) {
                newModulePerms = [...modulePerms, action];
            } else {
                newModulePerms = modulePerms.filter(a => a !== action);
            }

            return {
                ...prev,
                [selectedRole]: {
                    ...rolePerms,
                    [module]: newModulePerms
                }
            };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save to API
            await permissionsAPI.update(selectedRole, permissions[selectedRole]);

            // Also save to localStorage as backup
            localStorage.setItem('rolePermissions', JSON.stringify(permissions));

            alert('Đã lưu phân quyền thành công!');
        } catch (error) {
            console.error('Error saving permissions:', error);
            alert('Lỗi khi lưu phân quyền');
        } finally {
            setSaving(false);
        }
    };

    const isChecked = (module, action) => {
        return permissions[selectedRole]?.[module]?.includes(action);
    };

    return (
        <div>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '600', marginBottom: '24px', color: '#1a1a2e' }}>
                🛡️ Quản lý Phân quyền
            </h2>

            {/* Role Selector */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Chọn Vai trò:</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {ROLES.map(role => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: selectedRole === role.id ? '2px solid #1E4A8B' : '1px solid #e5e7eb',
                                background: selectedRole === role.id ? '#eef2ff' : '#fff',
                                color: selectedRole === role.id ? '#1E4A8B' : '#4b5563',
                                fontWeight: selectedRole === role.id ? '600' : '400',
                                cursor: 'pointer'
                            }}
                        >
                            {role.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <th style={{ padding: '12px', textAlign: 'left', width: '200px' }}>Chức năng</th>
                            {ACTIONS.map(action => (
                                <th key={action.id} style={{ padding: '12px', textAlign: 'center' }}>{action.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {MODULES.map(module => (
                            <tr key={module.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{module.label}</td>
                                {ACTIONS.map(action => (
                                    <td key={action.id} style={{ padding: '12px', textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={isChecked(module.id, action.id)}
                                            onChange={(e) => handlePermissionChange(module.id, action.id, e.target.checked)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '12px 24px',
                        background: '#1E4A8B',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </div>
    );
};

export default PermissionManagement;
