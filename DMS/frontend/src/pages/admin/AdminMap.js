import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { usersAPI, visitPlansAPI } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createCustomIcon = (color, text) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;box-shadow:0 2px 5px rgba(0,0,0,0.3)">${text}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const AdminMap = () => {
  const [tdvs, setTdvs] = useState([]);
  const [selectedTdv, setSelectedTdv] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeData, setRouteData] = useState([]);
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]); // HCM
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    loadTdvs();
  }, []);

  useEffect(() => {
    if (selectedTdv && selectedDate) {
      loadRoute();
    }
  }, [selectedTdv, selectedDate]);

  const loadTdvs = async () => {
    try {
      const data = await usersAPI.getAll({ role: 'TDV' });
      setTdvs(data);
      if (data.length > 0) setSelectedTdv(data[0].id);
    } catch (error) {
      console.error('Error loading TDVs:', error);
    }
  };

  const loadRoute = async () => {
    try {
      // Use the new endpoint we just created
      // Note: We need to add this method to api.js or call fetch directly
      const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/visit-plans/route-summary?userId=${selectedTdv}&date=${selectedDate}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setRouteData(data);
        // Center map on first visit if available
        const firstValid = data.find(v => v.pharmacy?.latitude);
        if (firstValid) {
          setMapCenter([firstValid.pharmacy.latitude, firstValid.pharmacy.longitude]);
        }
      }
    } catch (error) {
      console.error('Error loading route:', error);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const getMarkerColor = (visit) => {
    if (visit.status === 'COMPLETED') {
      return visit.order ? '#10b981' : '#f59e0b'; // Green if order, Orange if no order
    }
    if (visit.status === 'CANCELLED') return '#ef4444'; // Red
    return '#6b7280'; // Gray for Planned
  };

  const polylinePositions = routeData
    .filter(v => v.pharmacy?.latitude && v.pharmacy?.longitude)
    .map(v => [v.pharmacy.latitude, v.pharmacy.longitude]);

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <div style={{ padding: '15px', background: '#fff', display: 'flex', gap: '15px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', zIndex: 10 }}>
        <select
          value={selectedTdv}
          onChange={e => setSelectedTdv(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
        >
          <option value="">Chọn TDV</option>
          {tdvs.map(u => <option key={u.id} value={u.id}>{u.name} ({u.employeeCode})</option>)}
        </select>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
        />
        <div style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 'bold' }}>
          Tổng số KH: {routeData.length} | Đã thăm: {routeData.filter(v => v.status === 'COMPLETED').length}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Route Line */}
          <Polyline positions={polylinePositions} color="#3b82f6" weight={3} dashArray="5, 10" />

          {/* Markers */}
          {routeData.map((visit, index) => {
            if (!visit.pharmacy?.latitude) return null;
            return (
              <Marker
                key={visit.id}
                position={[visit.pharmacy.latitude, visit.pharmacy.longitude]}
                icon={createCustomIcon(getMarkerColor(visit), index + 1)}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#1E4A8B' }}>{visit.pharmacy.name}</h3>
                    <div style={{ fontSize: '13px', marginBottom: '5px' }}>{visit.pharmacy.address}</div>
                    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '5px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>Trạng thái:</span>
                      <span style={{ fontWeight: 'bold', color: getMarkerColor(visit) }}>
                        {visit.status === 'COMPLETED' ? 'Đã viếng thăm' : 'Chưa viếng thăm'}
                      </span>
                    </div>

                    {visit.checkInTime && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Check-in: {new Date(visit.checkInTime).toLocaleTimeString()}
                      </div>
                    )}

                    {visit.order ? (
                      <div style={{ marginTop: '5px', background: '#ecfdf5', padding: '5px', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 'bold', color: '#059669' }}>Đơn hàng: {formatCurrency(visit.order.totalAmount)}</div>
                      </div>
                    ) : (
                      <div style={{ marginTop: '5px', fontSize: '12px', color: '#999' }}>Không có đơn hàng</div>
                    )}

                    <div style={{ marginTop: '10px', fontSize: '12px' }}>
                      <div>Doanh số tháng: <strong>{formatCurrency(visit.stats?.mtd || 0)}</strong></div>
                      <div>Doanh số năm: <strong>{formatCurrency(visit.stats?.ytd || 0)}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ padding: '10px', background: '#fff', display: 'flex', gap: '15px', fontSize: '12px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, background: '#6b7280', borderRadius: '50%' }}></span> Chưa thăm</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: '50%' }}></span> Đã thăm (Không đơn)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%' }}></span> Có đơn hàng</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%' }}></span> Hủy bỏ</div>
      </div>
    </div>
  );
};

export default AdminMap;
