import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerritory, setFilterTerritory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Metadata
  const [territories, setTerritories] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);

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
    territoryId: '',
    customerSegmentId: '',
    type: 'PHARMACY',
    latitude: '',
    longitude: '',
    description: '',
    // New Fields
    channel: '',
    classification: '',
    pharmacistName: '',
    staffName: '',
    organizationType: '',
    orderPhone: '',
    orderFrequency: '',
    linkCode: '',
    isChain: false
  });

  useEffect(() => {
    loadCustomers();
    loadMetadata();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, filterTerritory, customers]);

  const loadMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const [terrRes, segRes] = await Promise.all([
        fetch(`${API_BASE}/territories`, { headers }),
        fetch(`${API_BASE}/customer-segments`, { headers })
      ]);

      if (terrRes.ok) setTerritories(await terrRes.json());
      if (segRes.ok) setCustomerSegments(await segRes.json());

    } catch (error) {
      console.error('Error loading metadata:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/pharmacies/admin/all`, {
        headers: {
          'x-auth-token': token
        }
      });
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
        (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.phone.includes(searchTerm) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTerritory !== 'all') {
      filtered = filtered.filter(c => c.territoryId === filterTerritory);
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
      territoryId: '',
      customerSegmentId: '',
      type: 'PHARMACY',
      latitude: '',
      longitude: '',
      description: '',
      channel: '',
      classification: '',
      pharmacistName: '',
      staffName: '',
      organizationType: '',
      orderPhone: '',
      orderFrequency: '',
      linkCode: '',
      isChain: false
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
      territoryId: customer.territoryId || '',
      customerSegmentId: customer.customerSegmentId || '',
      type: customer.type || 'PHARMACY',
      latitude: customer.latitude?.toString() || '',
      longitude: customer.longitude?.toString() || '',
      description: customer.description || '',
      channel: customer.channel || '',
      classification: customer.classification || '',
      pharmacistName: customer.pharmacistName || '',
      staffName: customer.staffName || '',
      organizationType: customer.organizationType || '',
      orderPhone: customer.orderPhone || '',
      orderFrequency: customer.orderFrequency || '',
      linkCode: customer.linkCode || '',
      isChain: customer.isChain || false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khách hàng này?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/pharmacies/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
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
        code: formData.code || null,
        ownerName: formData.owner || null,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address,
        province: formData.province || null,
        district: formData.district || null,
        ward: formData.ward || null,
        territoryId: formData.territoryId || null,
        customerSegmentId: formData.customerSegmentId || null,
        type: formData.type || 'PHARMACY',
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        description: formData.description || null,
        // New Fields
        channel: formData.channel || null,
        classification: formData.classification || null,
        pharmacistName: formData.pharmacistName || null,
        staffName: formData.staffName || null,
        organizationType: formData.organizationType || null,
        orderPhone: formData.orderPhone || null,
        orderFrequency: formData.orderFrequency || null,
        linkCode: formData.linkCode || null,
        isChain: formData.isChain || false,
      };

      const url = editingCustomer
        ? `${API_BASE}/pharmacies/${editingCustomer.id}`
        : `${API_BASE}/pharmacies`;
      const method = editingCustomer ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
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

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredCustomers.map(customer => ({
      'Mã': customer.code || '',
      'Tên': customer.name || '',
      'Phân loại': customer.type || '',
      'Phân nhóm': customer.customerSegment?.name || '',
      'Địa bàn': customer.territory?.name || '',
      'Vùng': customer.territory?.region?.name || '',
      'TDV Phụ trách': customer.customerAssignments?.map(a => a.user.name).join(', ') || '',
      'Chủ sở hữu': customer.ownerName || '',
      'Địa chỉ': customer.address || '',
      'Số điện thoại': customer.phone || '',
      'Email': customer.email || '',
      'Tỉnh/TP': customer.province || '',
      'Quận/Huyện': customer.district || '',
      'Phường/Xã': customer.ward || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách khách hàng');
    XLSX.writeFile(wb, `Danh_sach_khach_hang_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      {
        'Mã KH': 'KH001',
        'Tên KH': 'Nhà thuốc A',
        'Số điện thoại': '0909000000',
        'Địa chỉ': '123 Đường ABC, Phường 1',
        'Tỉnh/TP': 'TP. Hồ Chí Minh',
        'Quận/Huyện': 'Quận 1',
        'Phường/Xã': 'Phường Bến Nghé',
        'Chủ sở hữu': 'Nguyễn Văn B',
        'Email': 'b@example.com',
        'Phân loại': 'PHARMACY',
        'Kênh': 'OTC',
        'Mã Địa bàn': 'DB01',
        'Mã Phân nhóm': 'SEGMENT01',
        'Cấp độ': 'B',
        'Dược sĩ': 'DS. Nguyễn Thị C',
        'Nhân viên BT': 'NV. Trần D',
        'SĐT Đặt hàng': '0908111111',
        'Tần suất ĐH': 'F2',
        'Loại hình TT': 'Cá nhân',
        'Chain': 'false',
        'Xác minh': 'false',
        'Trạng thái': 'true',
        'Mô tả': 'Ghi chú'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Khach_hang.xlsx');
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('File không có dữ liệu');
          return;
        }

        if (!window.confirm(`Tìm thấy ${data.length} dòng dữ liệu. Bạn có muốn import không?`)) return;

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
          try {
            // Lookup IDs
            const territoryCode = row['Mã Địa bàn'];
            const segmentCode = row['Mã Phân nhóm'];

            const territory = territories.find(t => t.code === territoryCode || t.name === territoryCode);
            const segment = customerSegments.find(s => s.code === segmentCode || s.name === segmentCode);

            const payload = {
              code: row['Mã KH']?.toString(),
              name: row['Tên KH'],
              phone: row['Số điện thoại']?.toString(),
              address: row['Địa chỉ'],
              ownerName: row['Chủ sở hữu'],
              email: row['Email'],
              type: row['Phân loại'] || 'PHARMACY',
              territoryId: territory?.id || null,
              customerSegmentId: segment?.id || null,
              description: row['Mô tả']
            };

            if (!payload.name || !payload.phone || !payload.address) {
              console.warn('Skipping invalid row:', row);
              errorCount++;
              continue;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/pharmacies`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
              },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (err) {
            console.error('Error importing row:', err);
            errorCount++;
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${errorCount}`);
        loadCustomers();
      } catch (error) {
        console.error('Error parsing excel:', error);
        alert('Lỗi khi đọc file Excel');
      } finally {
        setLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  const pharmacyTypes = [
    { value: 'PHARMACY', label: 'Nhà thuốc' },
    { value: 'CLINIC', label: 'Phòng khám' },
    { value: 'HOSPITAL', label: 'Bệnh viện' },
    { value: 'DRUGSTORE', label: 'Quầy thuốc' },
    { value: 'WHOLESALER', label: 'Đại lý/Sỉ' }
  ];

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
            onClick={handleDownloadTemplate}
            style={{
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
            }}
          >
            <span>📥</span>
            <span>Template</span>
          </button>
          <label
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
            <span>📤</span>
            <span>Import</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              style={{ display: 'none' }}
            />
          </label>
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
          value={filterTerritory}
          onChange={(e) => setFilterTerritory(e.target.value)}
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
          <option value="all">Tất cả Địa bàn</option>
          {territories.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Desktop Table View */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '50px 80px 150px 100px 100px 100px 120px 100px 120px 80px 80px 1fr 100px',
          gap: '16px',
          padding: '16px 20px',
          background: '#f9fafb',
          borderBottom: '2px solid #e5e7eb',
          fontWeight: '600',
          fontSize: '14px',
          color: '#1a1a2e',
          minWidth: '1500px'
        }}>
          <div>STT</div>
          <div>Mã</div>
          <div>Tên KH</div>
          <div>Phân loại</div>
          <div>Kênh</div>
          <div>Hạng</div>
          <div>Địa bàn</div>
          <div>Vùng</div>
          <div>TDV</div>
          <div>Mã LK</div>
          <div>Chuỗi</div>
          <div>Địa chỉ</div>
          <div>Thao tác</div>
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto', minWidth: '1500px' }}>
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '50px 80px 150px 100px 100px 100px 120px 100px 120px 80px 80px 1fr 100px',
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
                {pharmacyTypes.find(t => t.value === customer.type)?.label || customer.type}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>{customer.channel || '-'}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{customer.classification || '-'}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {customer.territory?.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {customer.territory?.region?.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {customer.customerAssignments?.map(a => a.user.name).join(', ')}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>{customer.linkCode || '-'}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{customer.isChain ? '✅' : '-'}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                {customer.address.length > 30 ? customer.address.substring(0, 30) + '...' : customer.address}
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
              maxWidth: '800px',
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
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã KH</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên KH *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phân loại</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  {pharmacyTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phân nhóm</label>
                <select
                  value={formData.customerSegmentId}
                  onChange={(e) => setFormData({ ...formData, customerSegmentId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">-- Chọn phân nhóm --</option>
                  {customerSegments.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Địa bàn</label>
                <select
                  value={formData.territoryId}
                  onChange={(e) => setFormData({ ...formData, territoryId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">-- Chọn địa bàn --</option>
                  {territories.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Chủ sở hữu</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Địa chỉ *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>

              {/* New Fields Section */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Kênh</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">-- Chọn --</option>
                  <option value="OTC">OTC</option>
                  <option value="ETC">ETC</option>
                  <option value="MT">MT</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Phân hạng</label>
                <select
                  value={formData.classification}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">-- Chọn phân hạng --</option>
                  {customerSegments.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  {!customerSegments.some(s => s.name === formData.classification) && formData.classification && (
                    <option value={formData.classification}>{formData.classification}</option>
                  )}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên Dược sĩ</label>
                <input
                  type="text"
                  value={formData.pharmacistName}
                  onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Người liên hệ (Nhân viên)</label>
                <input
                  type="text"
                  value={formData.staffName}
                  onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Loại hình T.Chức</label>
                <input
                  type="text"
                  value={formData.organizationType}
                  onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>SĐT Đặt hàng</label>
                <input
                  type="text"
                  value={formData.orderPhone}
                  onChange={(e) => setFormData({ ...formData, orderPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tần suất đặt hàng</label>
                <input
                  type="text"
                  value={formData.orderFrequency}
                  onChange={(e) => setFormData({ ...formData, orderFrequency: e.target.value })}
                  placeholder="VD: Tuần 2 lần"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã liên kết (Link Code)</label>
                <input
                  type="text"
                  value={formData.linkCode}
                  onChange={(e) => setFormData({ ...formData, linkCode: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.isChain}
                  onChange={(e) => setFormData({ ...formData, isChain: e.target.checked })}
                  id="isChain"
                />
                <label htmlFor="isChain" style={{ fontWeight: '500' }}>Là Chuỗi nhà thuốc?</label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 24px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#4b5563',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
