import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { usersAPI } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Users, Map as MapIcon, Calendar, Filter, Navigation,
  Smartphone, Battery, Signal, Clock
} from 'lucide-react';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createCustomIcon = (color, text, isSmall = false) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:${isSmall ? 24 : 32}px;height:${isSmall ? 24 : 32}px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;box-shadow:0 2px 5px rgba(0,0,0,0.3);font-size:${isSmall ? 10 : 12}px">${text}</div>`,
  iconSize: [isSmall ? 24 : 32, isSmall ? 24 : 32],
  iconAnchor: [isSmall ? 12 : 16, isSmall ? 12 : 16]
});

const createTdvIcon = (status, name, role) => {
  let color = '#94a3b8'; // Offline (Gray)
  if (status === 'ACTIVE') {
    color = role === 'DRIVER' ? '#f59e0b' : '#22c55e'; // Orange for Driver, Green for TDV
  }

  const displayText = role === 'DRIVER' ? '🚚' : name.charAt(0);

  return L.divIcon({
    className: 'tdv-marker',
    html: `
      <div style="position:relative">
        <div style="background:${color};width:40px;height:40px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:${role === 'DRIVER' ? '20px' : '16px'};box-shadow:0 4px 6px rgba(0,0,0,0.3)">
          ${displayText}
        </div>
        ${status === 'ACTIVE' ? '<div style="position:absolute;bottom:0;right:0;width:12px;height:12px;background:#22c55e;border:2px solid #fff;border-radius:50%"></div>' : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const AdminMap = () => {
  const [viewMode, setViewMode] = useState('TDV'); // Default to Live Tracking
  const [tdvs, setTdvs] = useState([]);
  const [selectedTdv, setSelectedTdv] = useState(''); // For Route View
  const [filterLiveTdv, setFilterLiveTdv] = useState(''); // For Live tracking filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeData, setRouteData] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]); // HCM
  const [zoom, setZoom] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  // Use relative path for production/proxy compatibility
  const API_URL = '/api';

  useEffect(() => {
    loadTdvs();
  }, []);

  // Auto-center when filtering live TDV
  useEffect(() => {
    if (viewMode === 'TDV' && filterLiveTdv) {
      const target = liveLocations.find(l => l.id === filterLiveTdv);
      if (target && target.lat && target.lng) {
        setMapCenter([target.lat, target.lng]);
        // Optional: zoom in a bit if focused
        // setZoom(14); 
      }
    }
  }, [filterLiveTdv, liveLocations, viewMode]);

  useEffect(() => {
    if (viewMode === 'CUSTOMER' && selectedTdv && selectedDate) {
      loadRoute();
    } else if (viewMode === 'TDV') {
      loadLiveLocations();
      // Auto refresh every 30s
      const interval = setInterval(loadLiveLocations, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedTdv, selectedDate, viewMode]);

  const loadTdvs = async () => {
    try {
      const tdvData = await usersAPI.getAll({ role: 'TDV' });
      const driverData = await usersAPI.getAll({ role: 'DRIVER' });
      const allUsers = [...tdvData, ...driverData];
      setTdvs(allUsers);
      if (allUsers.length > 0) setSelectedTdv(allUsers[0].id);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadLiveLocations = async () => {
    try {
      if (liveLocations.length === 0) setIsLoading(true);
      const response = await fetch(`${API_URL}/route-management/live-tracking`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      if (response.ok) {
        const data = await response.json();
        setLiveLocations(data);
      }
    } catch (error) {
      console.error('Error loading live locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoute = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/visit-plans/route-summary?userId=${selectedTdv}&date=${selectedDate}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        setRouteData(data);
        const firstValid = data.find(v => v.pharmacy?.latitude);
        if (firstValid) {
          setMapCenter([firstValid.pharmacy.latitude, firstValid.pharmacy.longitude]);
        }
      }
    } catch (error) {
      console.error('Error loading route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Chưa có dữ liệu';
    return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const polylinePositions = viewMode === 'CUSTOMER'
    ? routeData.filter(v => v.pharmacy?.latitude).map(v => [v.pharmacy.latitude, v.pharmacy.longitude])
    : [];

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Controls Bar */}
      <div style={{
        padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
        zIndex: 10, position: 'relative'
      }}>

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{
            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100
          }}>
            <div style={{
              width: '16px', height: '16px', border: '2px solid #3b82f6',
              borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Updating...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('TDV')}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: viewMode === 'TDV' ? '#fff' : 'transparent',
              color: viewMode === 'TDV' ? '#3b82f6' : '#64748b',
              fontWeight: '600', boxShadow: viewMode === 'TDV' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Navigation size={16} /> Live Tracking
          </button>
          <button
            onClick={() => setViewMode('CUSTOMER')}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              background: viewMode === 'CUSTOMER' ? '#fff' : 'transparent',
              color: viewMode === 'CUSTOMER' ? '#3b82f6' : '#64748b',
              fontWeight: '600', boxShadow: viewMode === 'CUSTOMER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <MapIcon size={16} /> Route Plan
          </button>
        </div>

        {viewMode === 'TDV' && (
          <>
            <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#64748b" />
              <select
                value={filterLiveTdv}
                onChange={(e) => setFilterLiveTdv(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', minWidth: '200px' }}
              >
                <option value="">-- Tất cả TDV & Tài Xế ({liveLocations.length}) --</option>
                {tdvs.map(u => {
                  const status = liveLocations.find(l => l.id === u.id)?.status || 'NO_DATA';
                  const roleLabel = u.role === 'DRIVER' ? ' (Tài xế)' : '';
                  return <option key={u.id} value={u.id}>{u.name}{roleLabel} {status === 'ACTIVE' ? '(Online)' : ''}</option>;
                })}
              </select>
            </div>
          </>
        )}

        {viewMode === 'CUSTOMER' && (
          <>
            <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#64748b" />
              <select
                value={selectedTdv}
                onChange={(e) => setSelectedTdv(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                {tdvs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="#64748b" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            {routeData.length > 0 && (
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981', marginLeft: 'auto' }}>
                {routeData.filter(v => v.status === 'COMPLETED').length}/{routeData.length} Visited
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* LIVE TRACKING VIEW */}
          {viewMode === 'TDV' && liveLocations
            .filter(t => t.lat && t.lng && t.status !== 'NO_DATA')
            .filter(t => !filterLiveTdv || t.id === filterLiveTdv)
            .map((tdv) => (
              <Marker
                key={tdv.id}
                position={[tdv.lat, tdv.lng]}
                icon={createTdvIcon(tdv.status, tdv.name, tdv.role)}
              >
                <Popup className="custom-popup">
                  <div style={{ minWidth: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#1e293b' }}>{tdv.name}</strong>
                        {tdv.role === 'DRIVER' && (
                          <span style={{
                            fontSize: '10px',
                            marginLeft: '6px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#fef3c7',
                            color: '#92400e',
                            fontWeight: 'bold'
                          }}>
                            TÀI XẾ
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 'bold',
                        padding: '2px 6px', borderRadius: '4px',
                        background: tdv.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                        color: tdv.status === 'ACTIVE' ? '#166534' : '#64748b'
                      }}>
                        {tdv.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#64748b" />
                        <span>Last Update: <b>{formatTime(tdv.lastUpdate)}</b> <span style={{ color: '#94a3b8', fontSize: '11px' }}>({formatDate(tdv.lastUpdate)})</span></span>
                      </div>
                      <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Battery size={13} color="#64748b" /> {tdv.details?.battery || 'N/A'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Signal size={13} color="#64748b" /> {tdv.details?.signal || 'N/A'}
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Smartphone size={13} color="#64748b" /> {tdv.details?.device || 'Unknown'} (v{tdv.details?.appVersion || '1.0'})
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* ROUTE VIEW */}
          {viewMode === 'CUSTOMER' && (
            <>
              <Polyline positions={polylinePositions} color="#3b82f6" weight={3} dashArray="5, 10" opacity={0.6} />
              {routeData.filter(v => v.pharmacy?.latitude).map((visit, index) => (
                <Marker
                  key={visit.id}
                  position={[visit.pharmacy.latitude, visit.pharmacy.longitude]}
                  icon={createCustomIcon(
                    visit.status === 'COMPLETED' ? (visit.order ? '#10b981' : '#f59e0b') : '#64748b',
                    index + 1,
                    true
                  )}
                >
                  <Popup>
                    <strong>{index + 1}. {visit.pharmacy.name}</strong><br />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{visit.pharmacy.address}</span>
                    <div style={{ marginTop: '5px', fontSize: '12px' }}>
                      Status: <b style={{ color: visit.status === 'COMPLETED' ? '#10b981' : '#64748b' }}>{visit.status}</b>
                      {visit.checkInTime && <div>Check-in: {formatTime(visit.checkInTime)}</div>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default AdminMap;
