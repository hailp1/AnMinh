# 📍 GPS TRACKING & CHECK-IN - DELIVERY MODULE ADDON

## Additional Features for TX (Delivery Staff)

### 1. Morning Check-in at Company
### 2. Real-time GPS Tracking  
### 3. Admin Map View with TX Filter

---

## 🗺️ FEATURES TO ADD

### A. TX Mobile - Check-in Screen

**DeliveryCheckInScreen.js:**
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackingAPI } from '../services/api';

const DeliveryCheckInScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Company location (hardcoded or from config)
  const COMPANY_LOCATION = {
    latitude: 10.762622, // Replace with actual company coords
    longitude: 106.660172
  };
  const CHECK_IN_RADIUS = 100; // meters

  useEffect(() => {
    checkTodayCheckIn();
    getCurrentLocation();
  }, []);

  const checkTodayCheckIn = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      const response = await trackingAPI.getTodayCheckIn(user.id);
      setCheckedIn(response.checkedIn);
    } catch (error) {
      console.error('Error checking check-in status:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        Alert.alert('Lỗi', 'Không thể lấy vị trí GPS');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleCheckIn = async () => {
    if (!location) {
      Alert.alert('Lỗi', 'Chưa lấy được vị trí GPS');
      return;
    }

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      COMPANY_LOCATION.latitude,
      COMPANY_LOCATION.longitude
    );

    if (distance > CHECK_IN_RADIUS) {
      Alert.alert(
        'Không thể check-in',
        `Bạn đang cách công ty ${Math.round(distance)}m. Vui lòng đến gần hơn (trong vòng ${CHECK_IN_RADIUS}m)`
      );
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      
      await trackingAPI.checkIn({
        userId: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      });

      setCheckedIn(true);
      Alert.alert('Thành công', 'Check-in thành công!');
      navigation.navigate('DeliveryHome');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const distance = location ? calculateDistance(
    location.latitude,
    location.longitude,
    COMPANY_LOCATION.latitude,
    COMPANY_LOCATION.longitude
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Check-in</Text>
        <Text style={styles.subtitle}>Vui lòng check-in tại công ty</Text>
      </View>

      <View style={styles.content}>
        {checkedIn ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Đã check-in hôm nay</Text>
            <Text style={styles.successTime}>
              {new Date().toLocaleTimeString('vi-VN')}
            </Text>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => navigation.navigate('DeliveryHome')}
            >
              <Text style={styles.continueBtnText}>Tiếp tục →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.locationCard}>
              <Text style={styles.cardTitle}>📍 Vị trí hiện tại</Text>
              {location ? (
                <>
                  <Text style={styles.coords}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.distance}>
                    Cách công ty: {distance ? `${Math.round(distance)}m` : '---'}
                  </Text>
                  {distance && distance <= CHECK_IN_RADIUS && (
                    <Text style={styles.inRange}>✓ Trong phạm vi check-in</Text>
                  )}
                  {distance && distance > CHECK_IN_RADIUS && (
                    <Text style={styles.outRange}>
                      ⚠️ Vui lòng đến gần hơn ({CHECK_IN_RADIUS}m)
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.loading}>Đang lấy vị trí GPS...</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.checkInBtn,
                (!location || (distance && distance > CHECK_IN_RADIUS)) && styles.checkInBtnDisabled
              ]}
              onPress={handleCheckIn}
              disabled={loading || !location || (distance && distance > CHECK_IN_RADIUS)}
            >
              <Text style={styles.checkInBtnText}>
                {loading ? 'Đang check-in...' : '✓ Check-in'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={getCurrentLocation}
            >
              <Text style={styles.refreshBtnText}>🔄 Làm mới vị trí</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#FF6B00',
    padding: 40,
    paddingTop: 60,
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9
  },
  content: {
    flex: 1,
    padding: 20
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a2e'
  },
  coords: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'monospace'
  },
  distance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8
  },
  inRange: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 8
  },
  outRange: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 8
  },
  loading: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  checkInBtn: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  checkInBtnDisabled: {
    backgroundColor: '#ccc'
  },
  checkInBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  refreshBtn: {
    padding: 14,
    alignItems: 'center'
  },
  refreshBtnText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '600'
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8
  },
  successTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30
  },
  continueBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default DeliveryCheckInScreen;
```

---

### B. GPS Tracking Service

**trackingService.js:**
```javascript
// mobile/src/services/trackingService.js
import Geolocation from 'react-native-geolocation-service';
import { trackingAPI } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class TrackingService {
  watchId = null;
  isTracking = false;

  async startTracking() {
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      
      this.watchId = Geolocation.watchPosition(
        async (position) => {
          const location = {
            userId: user.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy,
            speed: position.coords.speed
          };

          // Send to backend every 30 seconds
          await trackingAPI.updateLocation(location);
          console.log('Location updated:', location);
        },
        (error) => {
          console.error('GPS Error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10, // Update every 10 meters
          interval: 30000, // Update every 30 seconds
          fastestInterval: 15000
        }
      );

      this.isTracking = true;
      console.log('GPS Tracking started');
    } catch (error) {
      console.error('Start tracking error:', error);
    }
  }

  stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('GPS Tracking stopped');
    }
  }
}

export default new TrackingService();
```

---

### C. Backend API Updates

**1. Create Location Tracking Model**

Add to schema.prisma:
```prisma
model LocationTracking {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  latitude  Float
  longitude Float
  accuracy  Float?
  speed     Float?
  
  timestamp DateTime @default(now())
  type      String   @default("TRACKING") // CHECK_IN, TRACKING, DELIVERY
  
  orderId   String?  // If tracking during delivery
  order     Order?   @relation(fields: [orderId], references: [id])
  
  @@index([userId, timestamp])
  @@index([type, timestamp])
}

// Add to User model:
model User {
  // ... existing fields
  locationTrackings LocationTracking[]
}
```

**2. Tracking Routes**

```javascript
// backend/routes/tracking.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Check-in
router.post('/check-in', auth, async (req, res) => {
  try {
    const { latitude, longitude, timestamp } = req.body;
    
    const tracking = await prisma.locationTracking.create({
      data: {
        userId: req.user.id,
        latitude,
        longitude,
        timestamp: new Date(timestamp),
        type: 'CHECK_IN'
      }
    });
    
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.post('/location', auth, async (req, res) => {
  try {
    const { latitude, longitude, accuracy, speed, orderId } = req.body;
    
    const tracking = await prisma.locationTracking.create({
      data: {
        userId: req.user.id,
        latitude,
        longitude,
        accuracy,
        speed,
        type: 'TRACKING',
        orderId: orderId || null
      }
    });
    
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's check-in
router.get('/check-in/today/:userId', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const checkIn = await prisma.locationTracking.findFirst({
      where: {
        userId: req.params.userId,
        type: 'CHECK_IN',
        timestamp: { gte: startOfDay }
      }
    });
    
    res.json({ checkedIn: !!checkIn, checkIn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's tracking history
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const where = {
      userId: req.params.userId
    };
    
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (type) {
      where.type = type;
    }
    
    const tracking = await prisma.locationTracking.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000
    });
    
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time locations of all delivery staff
router.get('/live', auth, async (req, res) => {
  try {
    // Get latest location for each delivery staff
    const deliveryStaff = await prisma.user.findMany({
      where: { role: 'DELIVERY', isActive: true }
    });
    
    const liveLocations = await Promise.all(
      deliveryStaff.map(async (staff) => {
        const latest = await prisma.locationTracking.findFirst({
          where: {
            userId: staff.id,
            timestamp: {
              gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
          },
          orderBy: { timestamp: 'desc' }
        });
        
        return {
          userId: staff.id,
          name: staff.name,
          employeeCode: staff.employeeCode,
          location: latest
        };
      })
    );
    
    res.json(liveLocations.filter(l => l.location));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**3. Add to server.js:**
```javascript
import trackingRoutes from './routes/tracking.js';
app.use('/api/tracking', trackingRoutes);
```

---

### D. Admin Map View with TX Filter

Update existing MapView or create new:

```javascript
// frontend/src/pages/admin/AdminMapTracking.js
import React, { useState, useEffect } from 'react';

const AdminMapTracking = () => {
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filter, setFilter] = useState('all'); // all | delivery | tdv

  useEffect(() => {
    fetchLiveLocations();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveLocations, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchLiveLocations = async () => {
    try {
      const response = await fetch('/api/tracking/live', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await response.json();
      setDeliveryStaff(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', background: '#fff', padding: '20px', overflowY: 'auto' }}>
        <h2>📍 Theo dõi TX</h2>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        >
          <option value="all">Tất cả</option>
          <option value="delivery">Chỉ TX (Giao hàng)</option>
          <option value="tdv">Chỉ TDV</option>
        </select>

        {/* Staff List */}
        {deliveryStaff.map(staff => (
          <div
            key={staff.userId}
            style={{
              padding: '12px',
              background: selectedStaff?.userId === staff.userId ? '#FF6B0020' : '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '8px',
              cursor: 'pointer',
              border: '1px solid #e0e0e0'
            }}
            onClick={() => setSelectedStaff(staff)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              🚚 {staff.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {staff.employeeCode}
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              Cập nhật: {new Date(staff.location?.timestamp).toLocaleTimeString('vi-VN')}
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${selectedStaff?.location?.latitude || 10.762622},${selectedStaff?.location?.longitude || 106.660172}&zoom=15`}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default AdminMapTracking;
```

---

## 🚀 IMPLEMENTATION SUMMARY

### Database Migration
```bash
docker exec dms_backend npx prisma db push
```

### Mobile App
1. Add DeliveryCheckInScreen.js
2. Update navigation: Login → CheckIn → DeliveryHome
3. Add trackingService to start/stop GPS
4. Install: `npm install react-native-geolocation-service`

### Backend
1. Add LocationTracking model
2. Add /api/tracking routes
3. Test endpoints

### Admin
1. Add MapTracking page
2. Filter by role (TX/TDV)
3. Real-time refresh

---

Ready to implement! 🎯
