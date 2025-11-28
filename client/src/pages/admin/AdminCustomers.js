import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHub, setFilterHub] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    owner: '',
    province: '',
    district: '',
    ward: '',
    hub: 'CENTRAL',
    latitude: '',
    longitude: '',
    description: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, filterHub, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/pharmacies/admin/all`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : []);
      } else {
        console.warn('Failed to load customers:', response.status);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      alert(`Lỗi khi tải danh sách khách hàng: ${error.message}`);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterHub !== 'all') {
      filtered = filtered.filter(c => (c.hub || 'CENTRAL') === filterHub);
    }

    setFilteredCustomers(filtered);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      code: '',
      name: '',
      address: '',
      phone: '',
      email: '',
      owner: '',
      province: '',
      district: '',
      ward: '',
      hub: 'CENTRAL',
      latitude: '',
      longitude: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code || '',
      name: customer.name || '',
      address: customer.address || '',
      phone: customer.phone || '',
      email: customer.email || '',
      owner: customer.ownerName || '',
      province: customer.province || '',
      district: customer.district || '',
      ward: customer.ward || '',
      hub: customer.hub || 'CENTRAL',
      latitude: customer.latitude?.toString() || '',
      longitude: customer.longitude?.toString() || '',
      description: customer.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khách hàng này?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/pharmacies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa khách hàng thành công!');
        loadCustomers();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi xóa khách hàng');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Lỗi khi xóa khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        ownerName: formData.owner || null,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address,
        province: formData.province || null,
        district: formData.district || null,
        ward: formData.ward || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        hub: formData.hub || 'CENTRAL',
        description: formData.description || null,
      };

      const url = editingCustomer
        ? `${API_BASE}/pharmacies/${editingCustomer.id}`
        : `${API_BASE}/pharmacies`;
      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingCustomer ? 'Cập nhật khách hàng thành công!' : 'Tạo khách hàng thành công!');
        setShowModal(false);
        setEditingCustomer(null);
        loadCustomers();
      } else {
        const error = await response.json();
        alert(error.error || 'Lỗi khi lưu khách hàng');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Lỗi khi lưu khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const hubs = ['CENTRAL', 'CUCHI', 'DONGNAI'];

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredCustomers.map(customer => ({
      'Mã': customer.code || '',
      'Tên': customer.name || '',
      'Chủ sở hữu': customer.owner || '',
      'Địa chỉ': customer.address || '',
      'Số điện thoại': customer.phone || '',
      'Email': customer.email || '',
      'Hub': customer.hub || '',
      'Tỉnh/TP': customer.province || '',
      'Quận/Huyện': customer.district || '',
      'Phường/Xã': customer.ward || '',
      'Vĩ độ': customer.latitude || '',
      'Kinh độ': customer.longitude || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách hàng');

    // Auto-size columns
    const colWidths = [
      { wch: 10 }, // Mã
      { wch: 30 }, // Tên
      { wch: 20 }, // Chủ sở hữu
      { wch: 40 }, // Địa chỉ
      { wch: 15 }, // Số điện thoại
      { wch: 25 }, // Email
      { wch: 12 }, // Hub
      { wch: 15 }, // Tỉnh/TP
      { wch: 15 }, // Quận/Huyện
      { wch: 15 }, // Phường/Xã
      { wch: 12 }, // Vĩ độ
      { wch: 12 }  // Kinh độ
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Danh_sach_khach_hang_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Import from Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and map data
        const importedCustomers = jsonData.map((row, index) => {
          const code = (row['Mã'] || row['Code'] || '').toString().trim();
          const name = (row['Tên'] || row['Tên nhà thuốc'] || row['Name'] || '').toString().trim();

          if (!name) {
            throw new Error(`Dòng ${index + 2}: Thiếu Tên khách hàng`);
          }

          return {
            name,
            ownerName: (row['Chủ sở hữu'] || row['Owner'] || '').toString().trim() || null,
            address: (row['Địa chỉ'] || row['Address'] || '').toString().trim(),
            phone: (row['Số điện thoại'] || row['Phone'] || '').toString().trim(),
            email: (row['Email'] || '').toString().trim() || null,
            hub: (row['Hub'] || 'CENTRAL').toString().trim(),
            province: (row['Tỉnh/TP'] || row['Province'] || '').toString().trim() || null,
            district: (row['Quận/Huyện'] || row['District'] || '').toString().trim() || null,
            ward: (row['Phường/Xã'] || row['Ward'] || '').toString().trim() || null,
            latitude: row['Vĩ độ'] || row['Latitude'] ? parseFloat(row['Vĩ độ'] || row['Latitude']) : null,
            longitude: row['Kinh độ'] || row['Longitude'] ? parseFloat(row['Kinh độ'] || row['Longitude']) : null,
            description: null
          };
        });

        // Import customers via API
        let successCount = 0;
        let errorCount = 0;

        for (const importedCustomer of importedCustomers) {
          try {
            const response = await fetch(`${API_BASE}/pharmacies`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(importedCustomer),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              const error = await response.json();
              console.error(`Error importing customer ${importedCustomer.name}:`, error.error);
            }
          } catch (error) {
            errorCount++;
            console.error(`Error importing customer ${importedCustomer.name}:`, error);
          }
        }

        alert(`Đã import ${successCount} khách hàng thành công${errorCount > 0 ? `, ${errorCount} lỗi` : ''}!`);
        loadCustomers(); // Reload customers from API
        e.target.value = ''; // Reset input
      } catch (error) {
        alert(`Lỗi import: ${error.message}`);
        e.target.value = ''; // Reset input
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Mã': 'NT001',
        'Tên': 'Nhà thuốc ABC',
        'Chủ sở hữu': 'Nguyễn Văn A',
        'Địa chỉ': '123 Đường ABC, Quận 1, TP.HCM',
        'Số điện thoại': '0901234567',
        'Email': 'nt001@example.com',
        'Hub': 'Trung tâm',
        'Tỉnh/TP': 'TP.HCM',
        'Quận/Huyện': 'Quận 1',
        'Phường/Xã': 'Phường 1',
        'Vĩ độ': '10.7769',
        'Kinh độ': '106.7009'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    const colWidths = [
      { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 40 }, { wch: 15 },
      { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'Template_Import_Khach_Hang.xlsx');
  };

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Quản lý khách hàng
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#666'
          }}>
            Tổng số: {filteredCustomers.length} khách hàng
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleDownloadTemplate}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: isMobile ? '10px' : '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>📥</span>
            <span>Template</span>
          </button>
          <label style={{
            padding: isMobile ? '10px 16px' : '12px 24px',
            background: '#10b981',
            border: 'none',
            borderRadius: isMobile ? '10px' : '12px',
            color: '#fff',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}>
            <span>📤</span>
            <span>Import Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={handleExportExcel}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#8b5cf6',
              border: 'none',
              borderRadius: isMobile ? '10px' : '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>📊</span>
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleAdd}
            style={{
              padding: isMobile ? '10px 16px' : '12px 24px',
              background: '#F29E2E',
              border: 'none',
              borderRadius: isMobile ? '10px' : '12px',
              color: '#fff',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>➕</span>
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '10px' : '12px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '16px' : '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: isMobile ? '12px' : '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: isMobile ? '1 1 100%' : '1',
            minWidth: isMobile ? '100%' : '300px',
            padding: isMobile ? '10px 14px' : '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: isMobile ? '8px' : '10px',
            fontSize: isMobile ? '13px' : '14px',
            boxSizing: 'border-box'
          }}
        />
        <select
          value={filterHub}
          onChange={(e) => setFilterHub(e.target.value)}
          style={{
            padding: isMobile ? '10px 14px' : '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: isMobile ? '8px' : '10px',
            fontSize: isMobile ? '13px' : '14px',
            cursor: 'pointer',
            flex: isMobile ? '1 1 100%' : 'none',
            minWidth: isMobile ? '100%' : '150px',
            boxSizing: 'border-box'
          }}
        >
          <option value="all">Tất cả Hub</option>
          {hubs.map(hub => (
            <option key={hub} value={hub}>{hub}</option>
          ))}
        </select>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1E4A8B',
                    marginBottom: '4px'
                  }}>
                    {customer.code}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '8px'
                  }}>
                    {customer.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    📍 {customer.address}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    👤 {customer.owner}
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  background: customer.hub === 'Củ Chi' || customer.hub === 'Đồng Nai' ? '#F29E2E15' : '#1E4A8B15',
                  color: customer.hub === 'Củ Chi' || customer.hub === 'Đồng Nai' ? '#F29E2E' : '#1E4A8B',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  {customer.hub}
                </span>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleEdit(customer)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#FBC93D15',
                    border: '1px solid #FBC93D',
                    borderRadius: '8px',
                    color: '#FBC93D',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 120px 1fr 200px 150px 120px 120px',
            gap: '16px',
            padding: '16px 20px',
            background: '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '14px',
            color: '#1a1a2e'
          }}>
            <div>STT</div>
            <div>Mã</div>
            <div>Tên nhà thuốc</div>
            <div>Địa chỉ</div>
            <div>Chủ sở hữu</div>
            <div>Hub</div>
            <div>Thao tác</div>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredCustomers.map((customer, index) => (
              <div
                key={customer.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 120px 1fr 200px 150px 120px 120px',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <div style={{ fontSize: '14px', color: '#666' }}>{index + 1}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1E4A8B' }}>
                  {customer.code}
                </div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                  {customer.name}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {customer.address.length > 30 ? customer.address.substring(0, 30) + '...' : customer.address}
                </div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                  {customer.owner}
                </div>
                <div>
                  <span style={{
                    padding: '4px 12px',
                    background: customer.hub === 'Củ Chi' ? '#F29E2E15' :
                      customer.hub === 'Đồng Nai' ? '#F29E2E15' : '#1E4A8B15',
                    color: customer.hub === 'Củ Chi' ? '#F29E2E' :
                      customer.hub === 'Đồng Nai' ? '#F29E2E' : '#1E4A8B',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {customer.hub}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleEdit(customer)}
                    style={{
                      padding: '6px 12px',
                      background: '#FBC93D15',
                      border: '1px solid #FBC93D',
                      borderRadius: '6px',
                      color: '#FBC93D',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      color: '#dc2626',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '20px' : '32px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Mã khách hàng
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Hub
                </label>
                <select
                  value={formData.hub}
                  onChange={(e) => setFormData({ ...formData, hub: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                >
                  {hubs.map(hub => (
                    <option key={hub} value={hub}>{hub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a2e'
              }}>
                Tên nhà thuốc *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1a1a2e',
                  background: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#1a1a2e'
              }}>
                Địa chỉ *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1a1a2e',
                  background: '#fff'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Chủ sở hữu
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Vĩ độ
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#1a1a2e'
                }}>
                  Kinh độ
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a2e',
                    background: '#fff'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
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
                  padding: '12px 24px',
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

export default AdminCustomers;

