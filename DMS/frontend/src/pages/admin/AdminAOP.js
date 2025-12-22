
import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, ComposedChart, AreaChart, Area
} from 'recharts';
import {
    Target, Users, Map as MapIcon, DollarSign,
    Settings, Share2, Layers, Layout, TrendingUp, Activity
} from 'lucide-react';
import './AdminAOP.css';

// --- THEME & STYLES ---
const THEME = {
    primary: '#0f172a',
    secondary: '#334155',
    accent: '#3b82f6',    // Blue
    success: '#10b981',   // Green
    warning: '#f59e0b',   // Amber
    danger: '#ef4444',    // Red
    purple: '#8b5cf6',
    teal: '#14b8a6',
    bg: '#f1f5f9',
    card: '#ffffff',
    border: '#e2e8f0',
    text: '#1e293b'
};

const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('vi-VN').format(val);

// --- COMPONENT ---
const AdminAOP = () => {
    const [activeTab, setActiveTab] = useState('market'); // market, regions, org, phasing
    const [isEditingRegions, setIsEditingRegions] = useState(false);
    const [showSaveMsg, setShowSaveMsg] = useState(false);

    // --- 1. GLOBAL STATE (RTM Model Inputs) ---
    const [marketParams, setMarketParams] = useState({
        // Universe (Reference Only now)
        totalUniverse: 55000,
        chainUniverse: 10000,
        retailUniverse: 45000,

        // DIRECT TARGETS (Replaced % Share)
        targetChains: 3000, // Direct Number
        targetRetail: 6750, // Direct Number

        // Segmentation mix (Retail only)
        retailMix: { a: 10, b: 30, c: 60 }, // % sum to 100

        // Workload & Revenue Assumptions
        visitFreq: { chain: 4, a: 4, b: 2, c: 1 }, // visits/month
        avgOrder: { chain: 15000000, a: 8000000, b: 3000000, c: 1000000 }, // VND/month

        // NEW: SKU Targets per Customer
        skuTarget: { chain: 120, a: 80, b: 40, c: 15 }, // SKUs

        // Productivity (Norms)
        visitsPerDay: 12,
        workingDays: 22,

        // Management Ratios
        spanSS: 6, // 1 SS manages 6 Reps
        spanASM: 4 // 1 ASM manages 4 SS
    });

    // Seasonality (Monthly Weights - Default Flat-ish curve with Q4 peak)
    const [seasonality, setSeasonality] = useState([
        7, 6, 8,   // Q1
        8, 9, 9,   // Q2
        8, 8, 9,   // Q3
        9, 9, 10   // Q4
    ]);

    const [regionalAlloc, setRegionalAlloc] = useState({
        hcm: { name: 'Ho Chi Minh', weight: 40 },
        hn: { name: 'Ha Noi', weight: 30 },
        me: { name: 'Mekong', weight: 15 },
        cen: { name: 'Central', weight: 15 }
    });

    // --- 2. CALCULATIONS ENGINE ---
    const calculated = useMemo(() => {
        // 1. Customer Targets (Direct Input)
        const targetChains = marketParams.targetChains;
        const targetRetail = marketParams.targetRetail;
        const totalCustomers = targetChains + targetRetail;

        // 2. Retail Segmentation
        const retailA = Math.round(targetRetail * (marketParams.retailMix.a / 100));
        const retailB = Math.round(targetRetail * (marketParams.retailMix.b / 100));
        const retailC = Math.round(targetRetail * (marketParams.retailMix.c / 100));

        // 3. Workload (Visits/Month)
        const visitsChain = targetChains * marketParams.visitFreq.chain;
        const visitsA = retailA * marketParams.visitFreq.a;
        const visitsB = retailB * marketParams.visitFreq.b;
        const visitsC = retailC * marketParams.visitFreq.c;
        const totalVisits = visitsChain + visitsA + visitsB + visitsC;

        // 4. Manpower Needs
        const visitCapacity = marketParams.visitsPerDay * marketParams.workingDays; // visits/rep/month
        const requiredTDV = Math.ceil(totalVisits / visitCapacity);
        const requiredSS = Math.ceil(requiredTDV / marketParams.spanSS);
        const requiredASM = Math.ceil(requiredSS / marketParams.spanASM);

        // 5. Revenue Forecast (Monthly Average if flat)
        const revChain = targetChains * marketParams.avgOrder.chain;
        const revA = retailA * marketParams.avgOrder.a;
        const revB = retailB * marketParams.avgOrder.b;
        const revC = retailC * marketParams.avgOrder.c;
        const totalMonthlyRevBase = revChain + revA + revB + revC;
        const totalAnnualRev = totalMonthlyRevBase * 12;

        return {
            targetChains, targetRetail, totalCustomers,
            retailA, retailB, retailC,
            totalVisits, visitCapacity,
            requiredTDV, requiredSS, requiredASM,
            totalMonthlyRevBase, totalAnnualRev,
            revDetails: { revChain, revA, revB, revC }
        };
    }, [marketParams]);

    // Derived Regional Data
    const regionalData = useMemo(() => {
        return Object.keys(regionalAlloc).map(key => {
            const reg = regionalAlloc[key];
            const ratio = reg.weight / 100;
            return {
                id: key,
                name: reg.name,
                customers: Math.round(calculated.totalCustomers * ratio),
                revenue: calculated.totalAnnualRev * ratio,
                tdv: Math.round(calculated.requiredTDV * ratio) || 1, // At least 1
                ss: Math.ceil((calculated.requiredTDV * ratio) / marketParams.spanSS) || 1,
                asm: Math.max(1, Math.round((calculated.requiredASM * ratio))) // Usually 1 per region roughly
            };
        });
    }, [regionalAlloc, calculated]);

    // Phasing Data
    const phasingData = useMemo(() => {
        const totalWeight = seasonality.reduce((a, b) => a + b, 0);
        let cumulative = 0;
        return seasonality.map((weight, idx) => {
            const monthlyRev = (calculated.totalAnnualRev * weight) / totalWeight;
            cumulative += monthlyRev;
            return {
                month: `Tháng ${idx + 1}`,
                weight,
                revenue: monthlyRev,
                cumulative
            };
        });
    }, [seasonality, calculated]);

    // --- HANDLERS ---
    const updateMarket = (field, value) => {
        setMarketParams(prev => {
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return { ...prev, [parent]: { ...prev[parent], [child]: Number(value) } };
            }
            return { ...prev, [field]: Number(value) };
        });
    };

    const updateRegionWeight = (id, newWeight) => {
        setRegionalAlloc(prev => ({
            ...prev,
            [id]: { ...prev[id], weight: Number(newWeight) }
        }));
    };

    const handleSeasonalityChange = (index, val) => {
        const newD = [...seasonality];
        newD[index] = Number(val);
        setSeasonality(newD);
    };

    const handleSave = () => {
        setIsEditingRegions(false);
        setShowSaveMsg(true);
        setTimeout(() => setShowSaveMsg(false), 3000);
    };

    // --- RENDERERS ---

    const renderMarketTab = () => (
        <div className="grid-layout">
            {/* INPUT PANEL */}
            <div className="panel input-panel">
                <PanelHeader icon={Settings} title="RTM Parameters" />
                <div className="scroll-content">
                    <SectionTitle>1. Market Universe (Tham khảo)</SectionTitle>
                    <InputGroup label="Total Pharmacies" value={marketParams.totalUniverse} disabled />
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginBottom: '16px' }}>
                        *Số liệu tham khảo từ Tổng cục thống kê
                    </div>

                    <SectionTitle>2. Target Coverage (Kế hoạch Bao phủ)</SectionTitle>
                    <div className="row-2">
                        <InputGroup label="Target Chains" value={marketParams.targetChains} onChange={(v) => updateMarket('targetChains', v)} />
                        <InputGroup label="Target Retail" value={marketParams.targetRetail} onChange={(v) => updateMarket('targetRetail', v)} />
                    </div>
                    <div style={{ fontSize: '12px', color: THEME.success, fontWeight: '600', marginBottom: '16px' }}>
                        Tổng KH mục tiêu: {formatNumber(calculated.totalCustomers)}
                    </div>

                    <SectionTitle>3. Customer Segmentation (Retail Mix)</SectionTitle>
                    <div className="row-3">
                        <InputGroup label="% Class A" value={marketParams.retailMix.a} onChange={(v) => updateMarket('retailMix.a', v)} />
                        <InputGroup label="% Class B" value={marketParams.retailMix.b} onChange={(v) => updateMarket('retailMix.b', v)} />
                        <InputGroup label="% Class C" value={marketParams.retailMix.c} onChange={(v) => updateMarket('retailMix.c', v)} />
                    </div>

                    <SectionTitle>4. Visit Frequency (F)</SectionTitle>
                    <div className="row-4">
                        <InputGroup label="Chain" value={marketParams.visitFreq.chain} onChange={(v) => updateMarket('visitFreq.chain', v)} />
                        <InputGroup label="Class A" value={marketParams.visitFreq.a} onChange={(v) => updateMarket('visitFreq.a', v)} />
                        <InputGroup label="Class B" value={marketParams.visitFreq.b} onChange={(v) => updateMarket('visitFreq.b', v)} />
                        <InputGroup label="Class C" value={marketParams.visitFreq.c} onChange={(v) => updateMarket('visitFreq.c', v)} />
                    </div>

                    <SectionTitle>5. Targets per Customer (KPIs)</SectionTitle>
                    <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Target Revenue (VND/Month)</div>
                    <div className="row-4">
                        <InputGroup label="Chain" value={marketParams.avgOrder.chain} onChange={(v) => updateMarket('avgOrder.chain', v)} />
                        <InputGroup label="Class A" value={marketParams.avgOrder.a} onChange={(v) => updateMarket('avgOrder.a', v)} />
                        <InputGroup label="Class B" value={marketParams.avgOrder.b} onChange={(v) => updateMarket('avgOrder.b', v)} />
                        <InputGroup label="Class C" value={marketParams.avgOrder.c} onChange={(v) => updateMarket('avgOrder.c', v)} />
                    </div>
                    <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginTop: '8px' }}>Target SKUs (Số mặt hàng)</div>
                    <div className="row-4">
                        <InputGroup label="Chain" value={marketParams.skuTarget.chain} onChange={(v) => updateMarket('skuTarget.chain', v)} />
                        <InputGroup label="Class A" value={marketParams.skuTarget.a} onChange={(v) => updateMarket('skuTarget.a', v)} />
                        <InputGroup label="Class B" value={marketParams.skuTarget.b} onChange={(v) => updateMarket('skuTarget.b', v)} />
                        <InputGroup label="Class C" value={marketParams.skuTarget.c} onChange={(v) => updateMarket('skuTarget.c', v)} />
                    </div>

                    <SectionTitle>6. Productivity Norms</SectionTitle>
                    <div className="row-2">
                        <InputGroup label="Visits / Day" value={marketParams.visitsPerDay} onChange={(v) => updateMarket('visitsPerDay', v)} />
                        <InputGroup label="Working Days" value={marketParams.workingDays} onChange={(v) => updateMarket('workingDays', v)} />
                    </div>
                </div>
            </div>

            {/* DASHBOARD PANEL */}
            <div className="panel dashboard-panel">
                {/* TOP CARDS */}
                <div className="kpi-grid">
                    <KpiCard title="Total Customers" value={formatNumber(calculated.totalCustomers)} sub="Planned Direct Coverage" icon={Target} color={THEME.accent} />
                    <KpiCard title="Annual Revenue" value={formatMoney(calculated.totalAnnualRev)} sub="Total Forecast" icon={DollarSign} color={THEME.success} />
                    <KpiCard title="Total Visits/Month" value={formatNumber(calculated.totalVisits)} sub="Workload" icon={Activity} color={THEME.warning} />
                    <KpiCard title="Headcount TDV" value={calculated.requiredTDV} sub="Sales Reps Needed" icon={Users} color={THEME.purple} />
                </div>

                {/* CHARTS ROW 1 */}
                <div className="charts-row">
                    <div className="chart-box">
                        <h4 className="chart-title">Cấu trúc Khách Hàng (Customer Structure)</h4>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Chains', value: calculated.targetChains, color: THEME.purple },
                                        { name: 'Class A', value: calculated.retailA, color: THEME.success },
                                        { name: 'Class B', value: calculated.retailB, color: THEME.accent },
                                        { name: 'Class C', value: calculated.retailC, color: THEME.warning },
                                    ]}
                                    innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
                                >
                                    {[0, 1, 2, 3].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={[THEME.purple, THEME.success, THEME.accent, THEME.warning][index]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => formatNumber(val)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-box">
                        <h4 className="chart-title">Doanh Thu Theo Phân Khúc (Revenue Mix)</h4>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={[
                                { name: 'Chains', value: calculated.revDetails.revChain, fill: THEME.purple },
                                { name: 'Class A', value: calculated.revDetails.revA, fill: THEME.success },
                                { name: 'Class B', value: calculated.revDetails.revB, fill: THEME.accent },
                                { name: 'Class C', value: calculated.revDetails.revC, fill: THEME.warning },
                            ]} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip formatter={(val) => formatMoney(val)} />
                                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                    {
                                        [THEME.purple, THEME.success, THEME.accent, THEME.warning].map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SUMMARY TABLE */}
                <div className="table-box">
                    <h4 className="chart-title">Tổng Hợp Quy Hoạch Tuyến (Route Planning Summary)</h4>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Channel / Segment</th>
                                <th>Target Customers</th>
                                <th>Freq (F)</th>
                                <th>Monthly Visits</th>
                                <th>Target Rev/Cust</th>
                                <th>Target SKU/Cust</th>
                                <th>Total Demand</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Row label="Key Accounts (Chain)" cust={calculated.targetChains} freq={marketParams.visitFreq.chain} sales={marketParams.avgOrder.chain} sku={marketParams.skuTarget.chain} visits={calculated.targetChains * marketParams.visitFreq.chain} />
                            <Row label="Retail - Class A" cust={calculated.retailA} freq={marketParams.visitFreq.a} sales={marketParams.avgOrder.a} sku={marketParams.skuTarget.a} visits={calculated.retailA * marketParams.visitFreq.a} />
                            <Row label="Retail - Class B" cust={calculated.retailB} freq={marketParams.visitFreq.b} sales={marketParams.avgOrder.b} sku={marketParams.skuTarget.b} visits={calculated.retailB * marketParams.visitFreq.b} />
                            <Row label="Retail - Class C" cust={calculated.retailC} freq={marketParams.visitFreq.c} sales={marketParams.avgOrder.c} sku={marketParams.skuTarget.c} visits={calculated.retailC * marketParams.visitFreq.c} />
                            <tr className="total-row">
                                <td>TOTAL</td>
                                <td>{formatNumber(calculated.totalCustomers)}</td>
                                <td>-</td>
                                <td>{formatNumber(calculated.totalVisits)}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>{formatMoney(calculated.totalMonthlyRevBase)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderRegionsTab = () => {
        const totalAlloc = Object.values(regionalAlloc).reduce((acc, curr) => acc + curr.weight, 0);

        return (
            <div className="panel full-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <PanelHeader icon={MapIcon} title="Regional Allocation Strategy 2026" />
                    <div>
                        {!isEditingRegions ? (
                            <button onClick={() => setIsEditingRegions(true)} style={{ background: THEME.accent, color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                ✏️ Configure Regions
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: totalAlloc === 100 ? THEME.success : THEME.danger }}>
                                    Total: {totalAlloc}%
                                </span>
                                <button onClick={handleSave} style={{ background: THEME.success, color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                    💾 Save Strategy
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="region-grid">
                    {regionalData.map(reg => (
                        <div key={reg.id} className="region-card">
                            <div className="region-header">
                                <h3>{reg.name}</h3>
                                {isEditingRegions ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <input
                                            type="number"
                                            value={regionalAlloc[reg.id].weight}
                                            onChange={(e) => updateRegionWeight(reg.id, e.target.value)}
                                            style={{ width: '60px', padding: '4px', borderRadius: '4px', border: `1px solid ${THEME.accent}` }}
                                        />
                                        <span style={{ fontSize: '12px' }}>%</span>
                                    </div>
                                ) : (
                                    <span className="badge">{regionalAlloc[reg.id].weight}% Allocation</span>
                                )}
                            </div>
                            <div className="region-stats">
                                <StatRow label="Target Revenue" value={formatMoney(reg.revenue)} bold />
                                <StatRow label="Customers" value={formatNumber(reg.customers)} />
                                <div className="divider" />
                                <StatRow label="ASM" value={reg.asm} color={THEME.danger} />
                                <StatRow label="SS (Supervisors)" value={reg.ss} color={THEME.warning} />
                                <StatRow label="TDV (Sales Reps)" value={reg.tdv} color={THEME.accent} size="lg" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chart-box" style={{ marginTop: '24px' }}>
                    <h4 className="chart-title">Biểu đồ Phân Bổ Doanh Số & Nhân Sự</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={regionalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke={THEME.success} tickFormatter={(val) => (val / 1000000000).toFixed(0) + 'B'} />
                            <YAxis yAxisId="right" orientation="right" stroke={THEME.accent} />
                            <Tooltip formatter={(val, name) => name === 'revenue' ? formatMoney(val) : val} />
                            <Legend />
                            <Bar yAxisId="right" dataKey="tdv" name="Headcount (TDV)" fill={THEME.accent} barSize={40} />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue Target" stroke={THEME.success} strokeWidth={3} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    const renderOrgTab = () => {
        return (
            <div className="panel full-panel">
                <PanelHeader icon={Layers} title="Organizational Structure & Financial Forecast" />

                <div className="org-container">
                    <div className="org-level level-1">
                        <div className="org-node asm">
                            <div className="role">National Sales Manager</div>
                            <div className="count">1 Head</div>
                        </div>
                    </div>
                    <div className="org-connector-v" />
                    <div className="org-level level-2">
                        {regionalData.map((reg, idx) => (
                            <div key={idx} className="org-branch">
                                <div className="org-connector-h"></div>
                                <div className="org-node asm">
                                    <div className="role">ASM {reg.name}</div>
                                    <div className="count">{reg.asm} Head</div>
                                </div>
                                <div className="org-connector-v" />
                                <div className="org-node ss">
                                    <div className="role">Sales Sup</div>
                                    <div className="count">{reg.ss} Heads</div>
                                </div>
                                <div className="org-connector-v" />
                                <div className="org-node tdv">
                                    <div className="role">TDV (Reps)</div>
                                    <div className="count">{reg.tdv} Heads</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-6">
                    <div className="table-box">
                        <h4 className="chart-title">Định Biên Nhân Sự (Headcount Plan)</h4>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Headcount</th>
                                    <th>Est. Avg Salary</th>
                                    <th>Monthly Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>App/Sys Admin</td>
                                    <td>1</td>
                                    <td>{formatMoney(25000000)}</td>
                                    <td>{formatMoney(25000000)}</td>
                                </tr>
                                <tr>
                                    <td>National Sales Manager</td>
                                    <td>1</td>
                                    <td>{formatMoney(60000000)}</td>
                                    <td>{formatMoney(60000000)}</td>
                                </tr>
                                <tr>
                                    <td>Area Sales Manager (ASM)</td>
                                    <td>{calculated.requiredASM}</td>
                                    <td>{formatMoney(40000000)}</td>
                                    <td>{formatMoney(calculated.requiredASM * 40000000)}</td>
                                </tr>
                                <tr>
                                    <td>Sales Supervisor (SS)</td>
                                    <td>{calculated.requiredSS}</td>
                                    <td>{formatMoney(25000000)}</td>
                                    <td>{formatMoney(calculated.requiredSS * 25000000)}</td>
                                </tr>
                                <tr>
                                    <td>Sales Rep (TDV)</td>
                                    <td>{calculated.requiredTDV}</td>
                                    <td>{formatMoney(15000000)}</td>
                                    <td>{formatMoney(calculated.requiredTDV * 15000000)}</td>
                                </tr>
                                <tr className="total-row">
                                    <td>TOTAL</td>
                                    <td>{2 + calculated.requiredASM + calculated.requiredSS + calculated.requiredTDV}</td>
                                    <td></td>
                                    <td>{formatMoney(25000000 + 60000000 + (calculated.requiredASM * 40000000) + (calculated.requiredSS * 25000000) + (calculated.requiredTDV * 15000000))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="table-box">
                        <h4 className="chart-title">P&L Forecast 2026 (Preliminary)</h4>
                        <table className="data-table">
                            <tbody>
                                <tr>
                                    <td>Gross Revenue</td>
                                    <td className="text-right bold text-success">{formatMoney(calculated.totalAnnualRev)}</td>
                                </tr>
                                <tr>
                                    <td>COGS (Est. 65%)</td>
                                    <td className="text-right text-danger">-{formatMoney(calculated.totalAnnualRev * 0.65)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Gross Profit</strong></td>
                                    <td className="text-right bold">{formatMoney(calculated.totalAnnualRev * 0.35)}</td>
                                </tr>
                                <tr>
                                    <td>Sales Salaries (Annual)</td>
                                    <td className="text-right text-danger">
                                        -{formatMoney(12 * (85000000 + (calculated.requiredASM * 40000000) + (calculated.requiredSS * 25000000) + (calculated.requiredTDV * 15000000)))}
                                    </td>
                                </tr>
                                <tr>
                                    <td>T&E + Ops (10% Rev)</td>
                                    <td className="text-right text-danger">-{formatMoney(calculated.totalAnnualRev * 0.10)}</td>
                                </tr>
                                <tr className="total-row" style={{ fontSize: '16px' }}>
                                    <td>EBITDA</td>
                                    <td className="text-right" style={{ color: THEME.accent }}>
                                        {formatMoney(
                                            (calculated.totalAnnualRev * 0.35) -
                                            (12 * (85000000 + (calculated.requiredASM * 40000000) + (calculated.requiredSS * 25000000) + (calculated.requiredTDV * 15000000))) -
                                            (calculated.totalAnnualRev * 0.10)
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    const renderPhasingTab = () => (
        <div className="panel full-panel">
            <PanelHeader icon={TrendingUp} title="Monthly Phasing & Seasonality (Kế hoạch Chi tiết)" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div className="table-box">
                    <h4 className="chart-title">Seasonality Weights (Tỷ trọng tháng)</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Adjust monthly weights to reflect market seasonality.</p>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Weight</th>
                                <th>Target Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {phasingData.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.month}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={seasonality[i]}
                                            onChange={(e) => handleSeasonalityChange(i, e.target.value)}
                                            style={{ width: '60px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td className="bold">{formatMoney(p.revenue)}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td>TOTAL</td>
                                <td>{seasonality.reduce((a, b) => a + b, 0)}</td>
                                <td>{formatMoney(calculated.totalAnnualRev)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="chart-box">
                    <h4 className="chart-title">Monthly Revenue Phasing</h4>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={phasingData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(val) => (val / 1000000000).toFixed(0) + 'B'} />
                            <Tooltip formatter={(val) => formatMoney(val)} />
                            <Area type="monotone" dataKey="revenue" stroke={THEME.accent} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-aop-page">
            <div className="header-bar">
                <div>
                    <h1 className="page-title">
                        <Layout className="mr-2" /> Route-to-Market (RTM) Model 2026
                    </h1>
                    <p className="page-sub">Strategic Planning & Manpower Allocation System</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {showSaveMsg && <div style={{ color: THEME.success, fontWeight: 'bold' }}>✅ Saved Successfully!</div>}
                    <div className="tabs">
                        <TabButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={Target} label="Market Target" />
                        <TabButton active={activeTab === 'regions'} onClick={() => setActiveTab('regions')} icon={MapIcon} label="Regional Plan" />
                        <TabButton active={activeTab === 'phasing'} onClick={() => setActiveTab('phasing')} icon={TrendingUp} label="Monthly Phasing" />
                        <TabButton active={activeTab === 'org'} onClick={() => setActiveTab('org')} icon={Layers} label="P&L Forecast" />
                    </div>
                </div>
            </div>

            <div className="content-area">
                {activeTab === 'market' && renderMarketTab()}
                {activeTab === 'regions' && renderRegionsTab()}
                {activeTab === 'phasing' && renderPhasingTab()}
                {activeTab === 'org' && renderOrgTab()}
            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button className={`tab-btn ${active ? 'active' : ''}`} onClick={onClick}>
        <Icon size={18} /> {label}
    </button>
);

const PanelHeader = ({ icon: Icon, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}><Icon size={20} color="#334155" /></div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{title}</h3>
    </div>
);

const SectionTitle = ({ children }) => (
    <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginTop: '20px', marginBottom: '12px' }}>{children}</h4>
);

const InputGroup = ({ label, value, onChange, disabled }) => (
    <div style={{ marginBottom: '12px', flex: 1 }}>
        <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600', color: '#475569' }}>{label}</label>
        <input
            type="number"
            value={value}
            onChange={e => onChange && onChange(e.target.value)}
            disabled={disabled}
            style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                background: disabled ? '#f8fafc' : 'white', fontSize: '14px', fontWeight: '500'
            }}
        />
    </div>
);

const RangeGroup = ({ label, value, onChange, color }) => (
    <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{label}</label>
            <span style={{ fontSize: '13px', fontWeight: '700', color: color }}>{value}%</span>
        </div>
        <input
            type="range" min="0" max="100" value={value} onChange={e => onChange(e.target.value)}
            style={{ width: '100%', accentColor: color }}
        />
    </div>
);

const KpiCard = ({ title, value, sub, icon: Icon, color }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: color }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>{title}</span>
            <Icon size={20} color={color} />
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{value}</div>
        <div style={{ fontSize: '12px', fontWeight: '500', color: color, marginTop: '4px' }}>{sub}</div>
    </div>
);

const Row = ({ label, cust, freq, sales, sku, visits }) => (
    <tr>
        <td>{label}</td>
        <td>{formatNumber(cust)}</td>
        <td>F{freq}</td>
        <td>{formatNumber(visits)}</td>
        <td>{formatMoney(sales)}</td>
        <td>{sku} SKUs</td>
        <td>{formatMoney(cust * sales)}</td>
    </tr>
);

const StatRow = ({ label, value, color = '#334155', bold, size }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: size === 'lg' ? '18px' : '14px', fontWeight: bold || size === 'lg' ? '700' : '500', color }}>{value}</span>
    </div>
);

export default AdminAOP;
