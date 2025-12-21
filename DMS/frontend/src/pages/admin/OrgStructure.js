import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Professional CSS Styles - BLUE THEME
const THEME = {
    bg: '#0a1628',
    bgGradient: 'linear-gradient(135deg, #0a1628 0%, #0f2744 100%)',
    card: 'rgba(15, 39, 68, 0.8)',
    cardBorder: 'rgba(59, 130, 246, 0.2)',
    cardHeader: 'rgba(15, 39, 68, 0.95)',
    text: '#ffffff',
    textSec: '#94a3b8',
    accent: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444'
};

const OrgStructure = () => {
    const [activeTab, setActiveTab] = useState('orgchart');
    const [loading, setLoading] = useState(true);

    // Data states
    const [roles, setRoles] = useState([]);
    const [roleHierarchy, setRoleHierarchy] = useState([]);
    const [territoryKpis, setTerritoryKpis] = useState([]);
    const [assignmentRules, setAssignmentRules] = useState([]);
    const [orgChartData, setOrgChartData] = useState([]); // State for Org Chart Tree
    const [positions, setPositions] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            switch (activeTab) {
                case 'roles':
                    const rolesRes = await fetch(`${API_BASE}/role-hierarchy/roles`, { headers });
                    if (rolesRes.ok) {
                        const data = await rolesRes.json();
                        setRoles(data.roles || []);
                        setRoleHierarchy(data.hierarchy || []);
                    }
                    break;
                case 'kpis':
                    const kpiRes = await fetch(`${API_BASE}/territory-kpi/`, { headers });
                    if (kpiRes.ok) setTerritoryKpis(await kpiRes.json());
                    break;
                case 'rules':
                    const rulesRes = await fetch(`${API_BASE}/assignment-rules/`, { headers });
                    if (rulesRes.ok) setAssignmentRules(await rulesRes.json());
                    break;
                case 'positions':
                    const posRes = await fetch(`${API_BASE}/org-structure/positions`, { headers });
                    if (posRes.ok) setPositions(await posRes.json());
                    break;
                case 'employees':
                    const empRes = await fetch(`${API_BASE}/org-structure/employees`, { headers });
                    if (empRes.ok) setEmployees(await empRes.json());
                    // Also fetch positions for dropdowns
                    const posRes2 = await fetch(`${API_BASE}/org-structure/positions`, { headers });
                    if (posRes2.ok) setPositions(await posRes2.json());
                    break;
                case 'orgchart':
                    const chartRes = await fetch(`${API_BASE}/org-structure/org-chart`, { headers });
                    if (chartRes.ok) setOrgChartData(await chartRes.json());
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Load data error:', error);
            setMessage({ type: 'error', text: 'Lỗi tải dữ liệu' });
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (text) => {
        setMessage({ type: 'success', text });
        setTimeout(() => setMessage(null), 3000);
    };

    const showError = (text) => {
        setMessage({ type: 'error', text });
        setTimeout(() => setMessage(null), 5000);
    };

    // Tab definitions
    const tabs = [
        { id: 'orgchart', label: '🌳 Org Chart', icon: '🌳' }, // Moved to first tab
        { id: 'roles', label: '🏛️ Role Hierarchy', icon: '🏛️' },
        { id: 'kpis', label: '📊 Territory KPIs', icon: '📊' },
        // Rules tab removed
        { id: 'positions', label: '💼 Positions', icon: '💼' },
        { id: 'employees', label: '👥 Employees', icon: '👥' }
    ];

    return (
        <div style={{ background: THEME.bgGradient, minHeight: '100vh', color: THEME.text, fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ background: THEME.cardHeader, borderBottom: `1px solid ${THEME.cardBorder}`, padding: '20px 32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(135deg, #3b82f6, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    🏢 Org Structure Enterprise 2.0 (Live)
                </h1>
                <p style={{ color: THEME.textSec, fontSize: '14px', marginTop: '4px' }}>
                    Enterprise Org Structure • Reporting Lines • KPIs • Territory Management
                </p>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    margin: '16px 32px',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${message.type === 'success' ? THEME.success : THEME.danger}`,
                    color: message.type === 'success' ? THEME.success : THEME.danger
                }}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div style={{ padding: '24px 32px 0' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: THEME.card, padding: '8px', borderRadius: '16px', width: 'fit-content' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                                border: activeTab === tab.id ? 'none' : `1px solid ${THEME.cardBorder}`,
                                borderRadius: '10px',
                                color: activeTab === tab.id ? '#fff' : THEME.textSec,
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 32px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: THEME.textSec }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        Đang tải...
                    </div>
                ) : (
                    <>
                        {/* ROLES TAB */}
                        {activeTab === 'roles' && (
                            <RolesTab roles={roles} hierarchy={roleHierarchy} onRefresh={loadData} showSuccess={showSuccess} showError={showError} />
                        )}

                        {/* ORG CHART TAB */}
                        {activeTab === 'orgchart' && (
                            <OrgChartTab data={orgChartData} />
                        )}

                        {/* KPIs TAB */}
                        {activeTab === 'kpis' && (
                            <KpisTab kpis={territoryKpis} onRefresh={loadData} showSuccess={showSuccess} />
                        )}

                        {/* RULES TAB */}
                        {activeTab === 'rules' && (
                            <RulesTab rules={assignmentRules} onRefresh={loadData} showSuccess={showSuccess} showError={showError} />
                        )}

                        {/* POSITIONS TAB */}
                        {activeTab === 'positions' && (
                            <PositionsTab positions={positions} onRefresh={loadData} showSuccess={showSuccess} />
                        )}

                        {/* EMPLOYEES TAB */}
                        {activeTab === 'employees' && (
                            <EmployeesTab employees={employees} positions={positions} onRefresh={loadData} showSuccess={showSuccess} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ================================
// ROLES TAB COMPONENT
// ================================
const RolesTab = ({ roles, hierarchy, onRefresh, showSuccess, showError }) => {
    const renderRoleNode = (role, level = 0) => (
        <div key={role.id} style={{ marginLeft: level * 24, marginBottom: '8px' }}>
            <div style={{
                background: level === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid rgba(59, 130, 246, ${0.4 - level * 0.05})`,
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>
                            {level === 0 ? '👑' : level === 1 ? '🎯' : level === 2 ? '📍' : level === 3 ? '🏷️' : level === 4 ? '📋' : '👤'}
                        </span>
                        <div>
                            <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{role.name}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{role.nameVi || role.code} • Level {role.level}</div>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: role.dataScope === 'ALL' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: role.dataScope === 'ALL' ? '#22c55e' : '#3b82f6'
                    }}>
                        {role.dataScope}
                    </span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {role._count?.users || 0} users
                    </span>
                </div>
            </div>
            {role.children?.map(child => renderRoleNode(child, level + 1))}
        </div>
    );

    const seedRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/role-hierarchy/seed-roles`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                showSuccess('Đã tạo Role Hierarchy mặc định!');
                onRefresh();
            }
        } catch (error) {
            showError('Lỗi tạo roles');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>🏛️ Role Hierarchy (Salesforce-style)</h2>
                    <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Quản lý phân quyền truy cập dữ liệu theo cấp bậc</p>
                </div>
                <button onClick={seedRoles} style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    🔄 Seed Default Roles
                </button>
            </div>

            {/* Hierarchy Tree */}
            <Card title="📊 Role Hierarchy Tree" subtitle={`${roles.length} roles`}>
                {hierarchy.length > 0 ? (
                    hierarchy.map(role => renderRoleNode(role))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
                        Chưa có Role nào. Click "Seed Default Roles" để tạo!
                    </div>
                )}
            </Card>

            {/* Permissions Matrix */}
            {roles.length > 0 && (
                <Card title="🔐 Permissions Matrix" subtitle="Object-level permissions" style={{ marginTop: '24px' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${THEME.cardBorder}` }}>
                                    <th style={thStyle}>Role</th>
                                    <th style={thStyle}>Data Scope</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>View Sub</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Edit Sub</th>
                                    <th style={{ ...thStyle, textAlign: 'center' }}>Delete Sub</th>
                                    <th style={thStyle}>Access Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role.id} style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                                        <td style={tdStyle}>
                                            <strong style={{ color: '#fff' }}>{role.name}</strong>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{role.code}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                                                {role.dataScope}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{role.canViewSubordinates ? '✅' : '❌'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{role.canEditSubordinates ? '✅' : '❌'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>{role.canDeleteSubordinates ? '✅' : '❌'}</td>
                                        <td style={tdStyle}>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: role.accessLevel === 'ALL' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(139, 92, 246, 0.2)', color: role.accessLevel === 'ALL' ? '#22c55e' : '#8b5cf6' }}>
                                                {role.accessLevel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

// ================================
// KPIs TAB COMPONENT
// ================================
const KpisTab = ({ kpis, onRefresh, showSuccess }) => {
    const seedKpis = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/territory-kpi/seed`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            showSuccess('Đã tạo Territory KPIs demo!');
            onRefresh();
        }
    };

    const formatCurrency = (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
        return val;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>📊 Territory KPIs</h2>
                    <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Quản lý Target & Achievement theo Territory</p>
                </div>
                <button onClick={seedKpis} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                    📊 Seed Demo KPIs
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <KpiSummaryCard title="Tổng Target" value={formatCurrency(kpis.reduce((s, k) => s + k.salesTarget, 0))} icon="🎯" color="#3b82f6" />
                <KpiSummaryCard title="Tổng Actual" value={formatCurrency(kpis.reduce((s, k) => s + k.salesActual, 0))} icon="💰" color="#22c55e" />
                <KpiSummaryCard title="Avg Achievement" value={kpis.length > 0 ? (kpis.reduce((s, k) => s + parseFloat(k.salesAchievement || 0), 0) / kpis.length).toFixed(1) + '%' : '0%'} icon="📈" color="#8b5cf6" />
                <KpiSummaryCard title="Territories" value={kpis.length} icon="🗺️" color="#f59e0b" />
            </div>

            {/* KPI Table */}
            <Card title="🗺️ Territory Performance" subtitle={`${kpis.length} territories`}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${THEME.cardBorder}` }}>
                                <th style={thStyle}>Territory</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Sales Target</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Sales Actual</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Achievement</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Visits</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Strike Rate</th>
                                <th style={{ ...thStyle, width: '150px' }}>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kpis.map(kpi => {
                                const achievement = kpi.salesTarget > 0 ? (kpi.salesActual / kpi.salesTarget * 100) : 0;
                                return (
                                    <tr key={kpi.id} style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                                        <td style={tdStyle}>
                                            <strong style={{ color: '#fff' }}>{kpi.territoryId}</strong>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{kpi.year}/{kpi.month || 'Yearly'}</div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#e2e8f0' }}>{formatCurrency(kpi.salesTarget)}</td>
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#22c55e', fontWeight: '600' }}>{formatCurrency(kpi.salesActual)}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                background: achievement >= 100 ? 'rgba(34, 197, 94, 0.2)' : achievement >= 80 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: achievement >= 100 ? '#22c55e' : achievement >= 80 ? '#f59e0b' : '#ef4444'
                                            }}>
                                                {achievement.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#e2e8f0' }}>{kpi.visitActual}/{kpi.visitTarget}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#e2e8f0' }}>{kpi.strikeRateActual?.toFixed(1) || 0}%</td>
                                        <td style={tdStyle}>
                                            <div style={{ height: '8px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.min(achievement, 100)}%`,
                                                    background: achievement >= 100 ? '#22c55e' : achievement >= 80 ? '#f59e0b' : '#ef4444',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// ================================
// RULES TAB COMPONENT
// ================================
const RulesTab = ({ rules, onRefresh, showSuccess, showError }) => {
    const seedRules = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/assignment-rules/seed`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            showSuccess('Đã tạo Assignment Rules demo!');
            onRefresh();
        }
    };

    const toggleRule = async (id) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/assignment-rules/${id}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showSuccess('Đã cập nhật rule!');
            onRefresh();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>⚡ Assignment Rules Engine</h2>
                    <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Tự động phân bổ Customer/Territory theo điều kiện</p>
                </div>
                <button onClick={seedRules} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                    ⚡ Seed Demo Rules
                </button>
            </div>

            {/* Rules List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {rules.map((rule, idx) => (
                    <Card key={rule.id} title={rule.name} subtitle={rule.description}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Type</div>
                                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                                    {rule.ruleType}
                                </span>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Priority</div>
                                <span style={{ color: '#fff', fontWeight: '600' }}>{rule.priority}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Executed</div>
                                <span style={{ color: '#22c55e', fontWeight: '600' }}>{rule.executionCount} times</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Conditions:</div>
                            <code style={{ color: '#e2e8f0', fontSize: '12px' }}>
                                {JSON.stringify(rule.conditions, null, 2)}
                            </code>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: rule.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: rule.isActive ? '#22c55e' : '#ef4444'
                            }}>
                                {rule.isActive ? '✅ Active' : '❌ Inactive'}
                            </span>
                            <button onClick={() => toggleRule(rule.id)} style={{
                                padding: '8px 16px',
                                background: rule.isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                border: 'none',
                                borderRadius: '6px',
                                color: rule.isActive ? '#ef4444' : '#22c55e',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}>
                                {rule.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </Card>
                ))}
                {rules.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
                        Chưa có Rule nào. Click "Seed Demo Rules" để tạo!
                    </div>
                )}
            </div>
        </div>
    );
};

// ================================
// POSITIONS TAB COMPONENT
// ================================
const PositionsTab = ({ positions, onRefresh, showSuccess }) => (
    <Card title="💼 Danh sách Chức vụ" subtitle={`${positions.length} positions`}>
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.cardBorder}` }}>
                        <th style={thStyle}>Code</th>
                        <th style={thStyle}>Tên chức vụ</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Level</th>
                        <th style={thStyle}>Department</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map(pos => (
                        <tr key={pos.id} style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                            <td style={tdStyle}><strong style={{ color: '#3b82f6' }}>{pos.code}</strong></td>
                            <td style={tdStyle}><span style={{ color: '#fff' }}>{pos.name}</span></td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                                    {pos.level}
                                </span>
                            </td>
                            <td style={tdStyle}><span style={{ color: '#94a3b8' }}>{pos.department || '-'}</span></td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>{pos.isActive ? '✅' : '❌'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

// ================================
// EMPLOYEES TAB COMPONENT
// ================================
const EmployeesTab = ({ employees, positions, onRefresh, showSuccess, showError }) => {
    const [editingEmp, setEditingEmp] = useState(null);
    const [formData, setFormData] = useState({});

    const handleEdit = (emp) => {
        setEditingEmp(emp.id);
        setFormData({
            name: emp.name,
            employeeCode: emp.employeeCode,
            positionId: emp.positionId,
            managerId: emp.managerId || '',
            status: emp.status
        });
    };

    const handleCancel = () => {
        setEditingEmp(null);
        setFormData({});
    };

    const handleSave = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const dataToUpdate = {
                ...formData,
                managerId: formData.managerId === '' ? null : formData.managerId
            };

            const res = await fetch(`${API_BASE}/org-structure/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToUpdate)
            });

            if (res.ok) {
                showSuccess('Đã cập nhật nhân viên thành công!');
                setEditingEmp(null);
                onRefresh();
            } else {
                showError('Lỗi cập nhật nhân viên');
            }
        } catch (error) {
            showError('Lỗi kết nối server');
        }
    };

    // Filter potential managers based on selected position
    const getPotentialManagers = (currentPositionId) => {
        if (!currentPositionId) return employees;

        const currentPos = positions.find(p => p.id === currentPositionId);
        if (!currentPos) return employees;

        // Simple logic: Manager must be higher level (smaller level number)
        return employees.filter(e => {
            const mgrPos = positions.find(p => p.id === e.positionId);
            return mgrPos && mgrPos.level < currentPos.level;
        });
    };

    const potentialManagers = editingEmp ? getPotentialManagers(formData.positionId) : [];

    return (
        <Card title="👥 Quản lý Nhân viên & Reporting Line" subtitle="Phân công quản lý trực tiếp (được đồng bộ sang BizReview)">
            <div style={{ overflowX: 'auto', minHeight: '400px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${THEME.cardBorder}` }}>
                            <th style={thStyle}>Mã NV</th>
                            <th style={thStyle}>Họ tên</th>
                            <th style={thStyle}>Chức vụ</th>
                            <th style={{ ...thStyle, width: '250px' }}>Manager (Báo cáo cho)</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                            <th style={{ ...thStyle, width: '100px', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} style={{ borderBottom: `1px solid ${THEME.cardBorder}`, background: editingEmp === emp.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                                <td style={tdStyle}>
                                    <strong style={{ color: '#3b82f6' }}>{emp.employeeCode}</strong>
                                </td>

                                {/* Name Field */}
                                <td style={tdStyle}>
                                    {editingEmp === emp.id ? (
                                        <input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            style={inputStyle}
                                        />
                                    ) : (
                                        <span style={{ color: '#fff' }}>{emp.name}</span>
                                    )}
                                </td>

                                {/* Position Field */}
                                <td style={tdStyle}>
                                    {editingEmp === emp.id ? (
                                        <select
                                            value={formData.positionId || ''}
                                            onChange={e => setFormData({ ...formData, positionId: e.target.value })}
                                            style={selectStyle}
                                        >
                                            <option value="">-- Chọn chức vụ --</option>
                                            {positions.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span style={{ color: '#94a3b8' }}>{emp.position?.name || '-'}</span>
                                    )}
                                </td>

                                {/* Manager Field */}
                                <td style={tdStyle}>
                                    {editingEmp === emp.id ? (
                                        <select
                                            value={formData.managerId || ''}
                                            onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                                            style={selectStyle}
                                        >
                                            <option value="">-- Không có Manager --</option>
                                            {potentialManagers.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} ({m.position?.code} - {m.employeeCode})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {emp.manager ? (
                                                <>
                                                    <span style={{ fontSize: '12px' }}>👤</span>
                                                    <div>
                                                        <div style={{ color: '#e2e8f0', fontSize: '13px' }}>{emp.manager.name}</div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{emp.manager.position?.code}</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <span style={{ color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>Không có quản lý</span>
                                            )}
                                        </div>
                                    )}
                                </td>

                                {/* Status Field */}
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    {editingEmp === emp.id ? (
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            style={{ ...selectStyle, width: 'auto' }}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    ) : (
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: emp.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: emp.status === 'ACTIVE' ? '#22c55e' : '#ef4444'
                                        }}>
                                            {emp.status}
                                        </span>
                                    )}
                                </td>

                                {/* Actions */}
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                                    {editingEmp === emp.id ? (
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            <button onClick={() => handleSave(emp.id)} style={actionBtnStyle('save')}>💾</button>
                                            <button onClick={handleCancel} style={actionBtnStyle('cancel')}>❌</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEdit(emp)} style={actionBtnStyle('edit')}>✏️</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const inputStyle = {
    background: 'rgba(15, 39, 68, 0.5)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: '6px',
    padding: '6px 8px',
    color: '#fff',
    width: '100%',
    boxSizing: 'border-box'
};

const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
};

const actionBtnStyle = (type) => ({
    background: type === 'save' ? '#22c55e' : type === 'cancel' ? '#ef4444' : 'rgba(59, 130, 246, 0.2)',
    border: 'none',
    borderRadius: '4px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '14px',
    transition: 'all 0.2s'
});

// ================================
// ORG CHART TAB COMPONENT (SUCCESSFACTORS STYLE)
// ================================
const OrgChartTab = ({ data }) => {
    // State to track collapsed nodes. Key usually ID, value = true (collapsed)
    const [collapsedNodes, setCollapsedNodes] = useState({});

    // Toggle collapse state
    const toggleNode = (nodeId) => {
        setCollapsedNodes(prev => ({
            ...prev,
            [nodeId]: !prev[nodeId]
        }));
    };

    // Recursive render function
    const renderNode = (node) => {
        if (!node) return null;

        const isVacant = !node.name || node.name.startsWith('VACANT');
        const isPlan = node.name && node.name.includes('Plan');
        const hasChildren = node.subordinates && node.subordinates.length > 0;
        const isCollapsed = collapsedNodes[node.id];

        // SuccessFactors Card Style Variables
        const cardWidth = '220px';
        const cardHeight = '100px';
        const avatarSize = '50px';

        // Status Strip Color (Top Border)
        const statusColor = isVacant ? '#ef4444' : isPlan ? '#94a3b8' : THEME.accent;
        const initials = node.name ? node.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '??';

        return (
            <li key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                <div style={{
                    position: 'relative',
                    width: cardWidth,
                    height: cardHeight,
                    background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    borderTop: `4px solid ${statusColor}`, // Color strip like SF
                    border: `1px solid ${THEME.cardBorder}`,
                    borderTopWidth: '4px', // Restore top strip
                    borderTopColor: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    marginBottom: hasChildren && !isCollapsed ? '30px' : '0', // Spacing for line
                    zIndex: 2,
                    opacity: isPlan ? 0.7 : 1
                }}>
                    {/* Avatar Circle */}
                    <div style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: '50%',
                        background: isVacant ? 'rgba(239, 68, 68, 0.2)' : '#334155',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: '700', fontSize: '18px',
                        border: `2px solid ${isVacant ? '#ef4444' : '#64748b'}`,
                        flexShrink: 0
                    }}>
                        {isVacant ? '!' : initials}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#fff',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {node.name || 'Position Vacant'}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: statusColor,
                            marginTop: '2px',
                            fontWeight: '600'
                        }}>
                            {node.position || node.positionCode || 'N/A'}
                        </div>
                        {node.employeeCode && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                #{node.employeeCode}
                            </div>
                        )}
                    </div>

                    {/* Expand/Collapse Button (Bottom Center) - Only if children */}
                    {hasChildren && (
                        <div
                            onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                            style={{
                                position: 'absolute',
                                bottom: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '24px',
                                height: '24px',
                                background: '#1e293b',
                                border: '2px solid #64748b',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 'bold', fontSize: '16px', lineHeight: 1,
                                cursor: 'pointer', zIndex: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}
                            title={isCollapsed ? `Expand (${node.subordinates.length} reports)` : 'Collapse'}
                        >
                            {isCollapsed ? '+' : '-'}
                        </div>
                    )}

                    {/* Count Badge (Top Right) IF collapsed */}
                    {hasChildren && isCollapsed && (
                        <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: THEME.accent,
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            {node.subordinates.length}
                        </div>
                    )}
                </div>

                {/* Recursive Children - UL */}
                {hasChildren && !isCollapsed && (
                    <div className="org-children-container">
                        <ul style={{ display: 'flex', paddingTop: '20px', position: 'relative' }}>
                            {node.subordinates.map(child => renderNode(child))}
                        </ul>
                    </div>
                )}
            </li>
        );
    };

    if (!data || data.length === 0) {
        return (
            <Card title="🌳 Sơ đồ Tổ chức Thực tế" subtitle="Reporting Lines">
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌳</div>
                    <div>Chưa có dữ liệu cây tổ chức hoặc đang tải...</div>
                    <small>(Hãy bấm Seed Demo và làm mới trang)</small>
                </div>
            </Card>
        );
    }

    return (
        <Card title="🌳 Sơ đồ Tổ chức (SuccessFactors Style)" subtitle={`Hiển thị ${data.length} nhánh chính • ${data.reduce((acc, n) => acc + 1 + (n.subordinates?.length || 0), 0)} vị trí`}>
            <div className="org-chart-wrapper" style={{ overflowX: 'auto', padding: '40px 20px', minHeight: '700px', background: 'rgba(10, 22, 40, 0.5)', borderRadius: '12px' }}>
                <div className="org-tree" style={{ display: 'flex', justifyContent: 'center', width: 'fit-content', minWidth: '100%' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '40px' }}>
                        {data.map(rootNode => renderNode(rootNode))}
                    </ul>
                </div>

                {/* CSS for Tree Connectors */}
                <style>{`
                    .org-tree ul {
                        position: relative; transition: all 0.5s;
                        display: flex; justify-content: center;
                    }
                    .org-tree li {
                        float: left; text-align: center; list-style-type: none;
                        position: relative; padding: 20px 10px 0 10px;
                        transition: all 0.5s;
                    }
                    /* Vertical line down from parent */
                    .org-tree ul::before {
                        content: ''; position: absolute; top: 0; left: 50%; border-left: 1px solid #94a3b8; width: 0; height: 20px;
                    }
                    /* Horizontal lines connecting siblings */
                    .org-tree li::before, .org-tree li::after {
                        content: ''; position: absolute; top: 0; right: 50%;
                        border-top: 1px solid #94a3b8; width: 51%; height: 20px;
                    }
                    .org-tree li::after {
                        right: auto; left: 50%; border-left: 1px solid #94a3b8;
                    }
                    /* Remove connectors from single child */
                    .org-tree li:only-child::after, .org-tree li:only-child::before {
                        display: none;
                    }
                    .org-tree li:only-child { padding-top: 0; }
                    /* Remove left connector from first child and right connector from last child */
                    .org-tree li:first-child::before, .org-tree li:last-child::after {
                        border: 0 none;
                    }
                    /* Add back vertical line for last child */
                    .org-tree li:last-child::before {
                        border-right: 1px solid #94a3b8; border-radius: 0 0 0 0;
                    }
                    .org-tree li:first-child::after {
                        border-radius: 0 0 0 0;
                    }
                    /* Connector down from node to children */
                    .org-tree li > div::after {
                        content: ''; position: absolute; bottom: -20px; left: 50%;
                        border-left: 1px solid #94a3b8; width: 0; height: 20px;
                    }
                    /* Hide connector if collapsed or no children */
                    .org-tree li:has(> div + div) > div::after {
                         display: none;
                    }
                `}</style>
            </div>
        </Card>
    );
};

// ================================
// SHARED COMPONENTS
// ================================
const Card = ({ title, subtitle, children, style = {} }) => (
    <div style={{ background: THEME.card, borderRadius: '16px', border: `1px solid ${THEME.cardBorder}`, overflow: 'hidden', ...style }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.cardBorder}`, background: THEME.cardHeader }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff' }}>{title}</h3>
            {subtitle && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{subtitle}</p>}
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
    </div>
);

const KpiSummaryCard = ({ title, value, icon, color }) => (
    <div style={{
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1px solid ${color}40`,
        borderRadius: '12px',
        padding: '20px'
    }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>{icon}</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{value}</span>
        </div>
    </div>
);

const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase'
};

const tdStyle = {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#e2e8f0'
};

export default OrgStructure;
