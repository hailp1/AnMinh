import React, { useState } from 'react';

const DataGrid = ({ columns, data, loading, pageSize = 15 }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [density, setDensity] = useState('comfortable'); // 'compact' | 'comfortable'

    // Sort
    const sortedData = React.useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    // Filter
    const filteredData = React.useMemo(() => {
        return sortedData.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                const itemValue = String(item[key] || '').toLowerCase();
                return itemValue.includes(filters[key].toLowerCase());
            });
        });
    }, [sortedData, filters]);

    // Paginate
    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    if (loading) {
        return (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const cellPadding = density === 'compact' ? '8px 12px' : '16px 20px';
    const fontSize = density === 'compact' ? '13px' : '14px';

    return (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column' }}>

            {/* Toolbar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                    Hiển thị <b>{Math.min(filteredData.length, pageSize)}</b> trên tổng <b>{filteredData.length}</b> dòng
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setDensity('compact')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: density === 'compact' ? '1px solid #3B82F6' : '1px solid #E2E8F0', background: density === 'compact' ? '#EFF6FF' : '#fff', color: density === 'compact' ? '#3B82F6' : '#64748B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Compact
                    </button>
                    <button
                        onClick={() => setDensity('comfortable')}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: density === 'comfortable' ? '1px solid #3B82F6' : '1px solid #E2E8F0', background: density === 'comfortable' ? '#EFF6FF' : '#fff', color: density === 'comfortable' ? '#3B82F6' : '#64748B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        Default
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: fontSize, minWidth: '800px' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', boxShadow: '0 1px 0 #E2E8F0' }}>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key}
                                    style={{
                                        padding: cellPadding,
                                        textAlign: col.align || 'left',
                                        fontWeight: '600',
                                        color: '#475569',
                                        borderBottom: '1px solid #E2E8F0',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        width: col.width || 'auto',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onClick={() => requestSort(col.key)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start' }}>
                                        {col.label}
                                        {sortConfig.key === col.key && (
                                            <span style={{ fontSize: '10px', color: '#3B82F6' }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                                        )}
                                        {sortConfig.key !== col.key && <span style={{ fontSize: '10px', color: '#CBD5E1' }}>⇵</span>}
                                    </div>
                                </th>
                            ))}
                        </tr>
                        {/* Inline Filters */}
                        <tr style={{ background: '#F8FAFC' }}>
                            {columns.map(col => (
                                <th key={`filter-${col.key}`} style={{ padding: '0 8px 8px 8px', borderBottom: '1px solid #E2E8F0' }}>
                                    {col.filterable && (
                                        <input
                                            type="text"
                                            placeholder="..."
                                            value={filters[col.key] || ''}
                                            onChange={e => { setFilters({ ...filters, [col.key]: e.target.value }); setCurrentPage(1); }}
                                            style={{
                                                width: '100%',
                                                padding: '6px 8px',
                                                borderRadius: '6px',
                                                border: '1px solid #E2E8F0',
                                                fontSize: '12px',
                                                outline: 'none',
                                                background: '#fff',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, idx) => (
                            <tr key={idx}
                                style={{ background: idx % 2 === 0 ? '#fff' : '#FAFAFA', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFAFA'}
                            >
                                {columns.map(col => (
                                    <td key={col.key} style={{ padding: cellPadding, borderBottom: '1px solid #F1F5F9', color: '#334155', verticalAlign: 'middle', textAlign: col.align || 'left' }}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Không có dữ liệu phù hợp</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: currentPage === 1 ? '#F1F5F9' : '#fff', color: currentPage === 1 ? '#94A3B8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Trước
                    </button>
                    <span style={{ fontSize: '14px', color: '#64748B' }}>Trang {currentPage} / {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', background: currentPage === totalPages ? '#F1F5F9' : '#fff', color: currentPage === totalPages ? '#94A3B8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataGrid;
