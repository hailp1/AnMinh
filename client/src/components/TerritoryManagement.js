import React, { useState, useEffect } from 'react';

const TerritoryManagement = ({ isMobile }) => {
  const API_BASE = process.env.REACT_APP_API_URL || '/api';
  const [regions, setRegions] = useState([]);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [territories, setTerritories] = useState([]);
  const [activeSection, setActiveSection] = useState('regions'); // regions, businessUnits, territories
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    regionId: '',
    businessUnitId: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [regionsRes, businessUnitsRes, territoriesRes] = await Promise.all([
        fetch(`${API_BASE}/regions`).then(r => r.json()),
        fetch(`${API_BASE}/business-units`).then(r => r.json()),
        fetch(`${API_BASE}/territories`).then(r => r.json())
      ]);
      setRegions(regionsRes || []);
      setBusinessUnits(businessUnitsRes || []);
      setTerritories(territoriesRes || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      regionId: '',
      businessUnitId: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      regionId: item.regionId || '',
      businessUnitId: item.businessUnitId || '',
      isActive: item.isActive !== false
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const url = activeSection === 'regions' 
        ? `${API_BASE}/regions`
        : activeSection === 'businessUnits'
        ? `${API_BASE}/business-units`
        : `${API_BASE}/territories`;
      
      const method = editingItem ? 'PUT' : 'POST';
      const endpoint = editingItem ? `${url}/${editingItem.id}` : url;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadData();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    
    try {
      const url = activeSection === 'regions' 
        ? `${API_BASE}/regions/${id}`
        : activeSection === 'businessUnits'
        ? `${API_BASE}/business-units/${id}`
        : `${API_BASE}/territories/${id}`;

      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div>
      <h2 style={{
        fontSize: isMobile ? '18px' : '20px',
        fontWeight: '600',
        marginBottom: '24px',
        color: '#1a1a2e'
      }}>
        🗺️ Quản lý địa bàn
      </h2>

      {/* Section Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'regions', label: '📍 Vùng' },
          { id: 'businessUnits', label: '🏢 Khối kinh doanh' },
          { id: 'territories', label: '🗺️ Địa bàn' }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              padding: '10px 20px',
              background: activeSection === section.id ? '#F29E2E' : '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              color: activeSection === section.id ? '#fff' : '#1a1a2e',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {activeSection === 'regions' && `Tổng: ${regions.length} vùng`}
          {activeSection === 'businessUnits' && `Tổng: ${businessUnits.length} khối`}
          {activeSection === 'territories' && `Tổng: ${territories.length} địa bàn`}
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: '10px 20px',
            background: '#F29E2E',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Thêm mới
        </button>
      </div>

      {/* Data Table */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Mã</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Tên</th>
              {activeSection === 'businessUnits' && (
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Vùng</th>
              )}
              {activeSection === 'territories' && (
                <>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Vùng</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Khối</th>
                </>
              )}
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Mô tả</th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(activeSection === 'regions' ? regions : activeSection === 'businessUnits' ? businessUnits : territories).map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px', fontSize: '14px' }}>{item.code}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{item.name}</td>
                {activeSection === 'businessUnits' && (
                  <td style={{ padding: '12px', fontSize: '14px' }}>{item.region?.name || '-'}</td>
                )}
                {activeSection === 'territories' && (
                  <>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{item.region?.name || '-'}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{item.businessUnit?.name || '-'}</td>
                  </>
                )}
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{item.description || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{
                      padding: '6px 12px',
                      background: '#3b82f6',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginRight: '8px'
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              {editingItem ? 'Sửa' : 'Thêm mới'} {activeSection === 'regions' ? 'Vùng' : activeSection === 'businessUnits' ? 'Khối kinh doanh' : 'Địa bàn'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Mã *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Tên *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {activeSection === 'businessUnits' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Vùng *
                  </label>
                  <select
                    value={formData.regionId}
                    onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Chọn vùng</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeSection === 'territories' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Vùng *
                    </label>
                    <select
                      value={formData.regionId}
                      onChange={(e) => {
                        setFormData({ ...formData, regionId: e.target.value, businessUnitId: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Chọn vùng</option>
                      {regions.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                      Khối kinh doanh *
                    </label>
                    <select
                      value={formData.businessUnitId}
                      onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                      disabled={!formData.regionId}
                    >
                      <option value="">Chọn khối</option>
                      {businessUnits.filter(bu => bu.regionId === formData.regionId).map(bu => (
                        <option key={bu.id} value={bu.id}>{bu.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  background: '#F29E2E',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerritoryManagement;

