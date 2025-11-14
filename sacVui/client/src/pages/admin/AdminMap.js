import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import customersData from '../../data/customers.json';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix cho marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const createCustomIcon = (color, iconText) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${iconText}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const hubIcon = createCustomIcon('#e5aa42', '🏢');
const pharmacyIcon = createCustomIcon('#1a5ca2', '💊');

// Hub locations
const hubs = [
  {
    id: 'hub_cuchi',
    name: 'Hub Củ Chi',
    latitude: 10.9733,
    longitude: 106.4933,
    address: 'Củ Chi, TP.HCM'
  },
  {
    id: 'hub_quan4',
    name: 'Hub Quận 4 - HCM',
    latitude: 10.7570,
    longitude: 106.7010,
    address: 'Quận 4, TP.HCM'
  },
  {
    id: 'hub_bienhoa',
    name: 'Hub Biên Hòa',
    latitude: 10.9444,
    longitude: 106.8244,
    address: 'Biên Hòa, Đồng Nai'
  }
];

const AdminMap = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedHub, setSelectedHub] = useState('all');
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]);
  const [mapZoom, setMapZoom] = useState(11);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const stored = localStorage.getItem('adminCustomers');
    if (stored) {
      setCustomers(JSON.parse(stored));
    } else {
      setCustomers(customersData.customers || []);
    }
  };

  const filteredCustomers = selectedHub === 'all' 
    ? customers 
    : customers.filter(c => c.hub === selectedHub);

  const handleHubClick = (hub) => {
    setMapCenter([hub.latitude, hub.longitude]);
    setMapZoom(13);
    setSelectedHub(hub.id);
  };

  return (
    <div style={{ padding: isMobile ? '0' : '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            marginBottom: '8px'
          }}>
            Bản đồ định vị
          </h1>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#666'
          }}>
            {filteredCustomers.length} nhà thuốc • {hubs.length} Hub
          </p>
        </div>
      </div>

      {/* Hub Filter */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '10px' : '12px',
        padding: isMobile ? '16px' : '20px',
        marginBottom: isMobile ? '16px' : '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => {
            setSelectedHub('all');
            setMapCenter([10.7769, 106.7009]);
            setMapZoom(11);
          }}
          style={{
            padding: isMobile ? '8px 14px' : '10px 20px',
            background: selectedHub === 'all' 
              ? 'linear-gradient(135deg, #1a5ca2, #3eb4a8)' 
              : '#f3f4f6',
            border: 'none',
            borderRadius: isMobile ? '6px' : '8px',
            color: selectedHub === 'all' ? '#fff' : '#666',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Tất cả
        </button>
        {hubs.map(hub => (
          <button
            key={hub.id}
            onClick={() => handleHubClick(hub)}
            style={{
              padding: isMobile ? '8px 14px' : '10px 20px',
              background: selectedHub === hub.id 
                ? '#e5aa42' 
                : '#fff',
              border: `2px solid ${selectedHub === hub.id ? '#e5aa42' : '#e5e7eb'}`,
              borderRadius: isMobile ? '6px' : '8px',
              color: selectedHub === hub.id ? '#fff' : '#1a1a2e',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '8px'
            }}
          >
            <span>🏢</span>
            <span>{hub.name}</span>
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? '10px' : '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: isMobile ? '400px' : '600px',
        position: 'relative'
      }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Hub Markers */}
          {hubs.map(hub => (
            <Marker
              key={hub.id}
              position={[hub.latitude, hub.longitude]}
              icon={hubIcon}
            >
              <Popup>
                <div style={{ padding: '8px' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '8px'
                  }}>
                    🏢 {hub.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    {hub.address}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    📍 {hub.latitude.toFixed(4)}, {hub.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Pharmacy Markers */}
          {filteredCustomers.map(customer => (
            <Marker
              key={customer.id}
              position={[customer.latitude, customer.longitude]}
              icon={pharmacyIcon}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '8px'
                  }}>
                    💊 {customer.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    📋 {customer.code}
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
                  <div style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    🏢 Hub: {customer.hub}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    📞 {customer.phone}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          background: 'rgba(255,255,255,0.95)',
          padding: isMobile ? '12px' : '16px',
          borderRadius: isMobile ? '8px' : '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <div style={{
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            marginBottom: isMobile ? '8px' : '12px',
            color: '#1a1a2e'
          }}>
            Chú thích
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#e5aa42',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                🏢
              </div>
              <span style={{ fontSize: '13px', color: '#666' }}>Hub</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#1a5ca2',
                border: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                💊
              </div>
              <span style={{ fontSize: '13px', color: '#666' }}>Nhà thuốc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: isMobile ? '12px' : '16px',
        marginTop: isMobile ? '16px' : '24px'
      }}>
        {hubs.map(hub => {
          const hubCustomers = customers.filter(c => c.hub === hub.name);
          return (
            <div
              key={hub.id}
              style={{
                background: '#fff',
                borderRadius: isMobile ? '10px' : '12px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '2px solid #e5aa42'
              }}
            >
              <div style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                color: '#1a1a2e',
                marginBottom: isMobile ? '10px' : '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🏢</span>
                <span>{hub.name}</span>
              </div>
              <div style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 'bold',
                color: '#e5aa42',
                marginBottom: '4px'
              }}>
                {hubCustomers.length}
              </div>
              <div style={{
                fontSize: isMobile ? '13px' : '14px',
                color: '#666'
              }}>
                Nhà thuốc
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMap;

