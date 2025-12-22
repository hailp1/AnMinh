# DELIVERY MODULE - IMPLEMENTATION PLAN
## Mobile App for Delivery Staff

**Created:** 2025-12-18  
**Status:** READY TO IMPLEMENT  
**Platform:** React Native Mobile App

---

## 📋 OVERVIEW

Phân hệ giao hàng cho phép nhân viên giao hàng:
- Login vào app
- Xem danh sách đơn hàng cần giao
- Xem chi tiết đơn hàng
- Cập nhật trạng thái giao hàng
- Chụp ảnh xác nhận
- GPS tracking

---

## 🎯 USER FLOW

```
1. Login (employeeCode + password)
   ↓
2. Delivery List Screen
   - Đơn hàng "PROCESSING" (đang chuẩn bị)
   - Đơn hàng "SHIPPED" (đang giao)
   - Filter by status
   ↓
3. Click vào đơn hàng
   ↓
4. Delivery Detail Screen
   - Thông tin khách hàng
   - Sản phẩm
   - Địa chỉ giao hàng
   - Map/GPS
   - Actions:
     * Bắt đầu giao (PROCESSING → SHIPPED)
     * Hoàn thành (SHIPPED → DELIVERED)
     * Có vấn đề (note + photo)
```

---

## 📱 SCREENS TO CREATE

### 1. DeliveryLoginScreen.js
**Purpose:** Authentication for delivery staff

**Features:**
- Employee code input
- Password input
- Remember me
- Login button
- Role check (must be DELIVERY_STAFF)

**Code Structure:**
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const DeliveryLoginScreen = ({ navigation }) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Authentication logic
    // Store token
    // Navigate to DeliveryList
  };

  return (
    // UI Design
  );
};
```

---

### 2. DeliveryListScreen.js
**Purpose:** List of orders to deliver

**Features:**
- Filter tabs: "Cần nhận" | "Đang giao" | "Đã giao"
- Order cards with:
  - Order number
  - Customer name
  - Address (truncated)
  - Total amount
  - Status badge
  - Quick actions
- Pull to refresh
- Search

**API Endpoint:**
```
GET /orders?status=PROCESSING,SHIPPED&deliveryStaffId={userId}
```

**Code Structure:**
```javascript
const DeliveryListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all | processing | shipped | delivered

  const fetchOrders = async () => {
    const response = await ordersAPI.getAll({
      status: 'PROCESSING,SHIPPED',
      deliveryStaffId: user.id
    });
    setOrders(response);
  };

  return (
    <View>
      {/* Filter Tabs */}
      {/* Order List */}
    </View>
  );
};
```

---

### 3. DeliveryDetailScreen.js
**Purpose:** Order details and status update

**Features:**
- Customer info card
- Product list
- Map with customer location
- Status stepper
- Action buttons:
  - "Bắt đầu giao hàng" (if PROCESSING)
  - "Xác nhận đã giao" (if SHIPPED)
  - "Báo cáo vấn đề"
- Photo upload
- Signature capture (optional)

**API Endpoints:**
```
GET /orders/:id
PUT /orders/:id/status
POST /orders/:id/delivery-proof (photo upload)
```

**Code Structure:**
```javascript
const DeliveryDetailScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [location, setLocation] = useState(null);

  const handleStartDelivery = async () => {
    // Update to SHIPPED
    await ordersAPI.updateStatus(order.id, 'SHIPPED');
    // Record GPS
  };

  const handleCompleteDelivery = async () => {
    // Update to DELIVERED
    // Upload proof photo
  };

  return (
    <ScrollView>
      {/* Customer Info */}
      {/* Map */}
      {/* Products */}
      {/* Actions */}
    </ScrollView>
  );
};
```

---

### 4. DeliveryMapScreen.js
**Purpose:** Navigation to customer

**Features:**
- Google Maps integration
- Route from current location to customer
- Distance & ETA
- Call customer button
- Navigate button (open Google Maps)

---

## 🔧 BACKEND UPDATES NEEDED

### 1. User Role
Add "DELIVERY_STAFF" role to schema:
```prisma
enum Role {
  ADMIN
  TDV
  DELIVERY_STAFF  // New
  MANAGER
}
```

### 2. Order Assignment
Add deliveryStaffId to Order model:
```prisma
model Order {
  // ...existing fields
  deliveryStaffId String?
  deliveryStaff   User?   @relation(fields: [deliveryStaffId], references: [id])
  deliveryStartTime DateTime?
  deliveryEndTime   DateTime?
  deliveryProofPhoto String?
  deliveryNotes   String?
}
```

### 3. API Endpoints

**a. GET /orders - Add deliveryStaffId filter**
```javascript
// routes/orders.js
router.get('/', auth, async (req, res) => {
  const { deliveryStaffId, status } = req.query;
  
  const where = {};
  if (deliveryStaffId) where.deliveryStaffId = deliveryStaffId;
  if (status) where.status = { in: status.split(',') };
  
  const orders = await prisma.order.findMany({ where });
  res.json(orders);
});
```

**b. PUT /orders/:id/delivery-start**
```javascript
router.put('/:id/delivery-start', auth, async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: 'SHIPPED',
      deliveryStartTime: new Date(),
      deliveryStaffId: req.user.id
    }
  });
  res.json(order);
});
```

**c. PUT /orders/:id/delivery-complete**
```javascript
router.put('/:id/delivery-complete', auth, async (req, res) => {
  const { photo, notes, signature } = req.body;
  
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: 'DELIVERED',
      deliveryEndTime: new Date(),
      deliveryProofPhoto: photo,
      deliveryNotes: notes
    }
  });
  res.json(order);
});
```

---

## 📦 NPM PACKAGES NEEDED

```json
{
  "dependencies": {
    "react-native-maps": "^1.7.1",
    "react-native-geolocation-service": "^5.3.1",
    "react-native-image-picker": "^5.6.0",
    "react-native-signature-canvas": "^4.7.0" // optional
  }
}
```

---

## 🎨 UI/UX DESIGN GUIDELINES

### Color Scheme
- Primary: `#FF6B00` (Orange - delivery theme)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Yellow)
- Error: `#dc2626` (Red)

### Order Card Design
```
┌─────────────────────────────────────┐
│ 🚚 #DH001234         [Đang giao] │
│                                     │
│ 👤 Nhà thuốc ABC                   │
│ 📍 123 Nguyễn Văn Linh... (2.3km) │
│ 💰 1,250,000đ                      │
│                                     │
│ [Xem chi tiết →]                   │
└─────────────────────────────────────┘
```

### Status Badge Colors
- **PROCESSING** (Chuẩn bị): Blue
- **SHIPPED** (Đang giao): Orange  
- **DELIVERED** (Đã giao): Green
- **CANCELLED**: Red

---

## 🚀 IMPLEMENTATION STEPS

### Phase 1: Backend (2 hours)
1. [ ] Update Prisma schema
2. [ ] Run migration
3. [ ] Add delivery endpoints
4. [ ] Test with Postman

### Phase 2: Mobile Screens (4 hours)
1. [ ] DeliveryLoginScreen
2. [ ] DeliveryListScreen
3. [ ] DeliveryDetailScreen
4. [ ] DeliveryMapScreen

### Phase 3: Integration (2 hours)
1. [ ] Connect screens to API
2. [ ] Add navigation
3. [ ] GPS integration
4. [ ] Photo upload

### Phase 4: Testing (1 hour)
1. [ ] End-to-end flow test
2. [ ] Edge cases
3. [ ] Performance check

**Total Time:** ~9 hours (~1 working day)

---

## 📱 NAVIGATION SETUP

Update `App.js` or create separate `DeliveryApp.js`:

```javascript
// DeliveryApp.js
import DeliveryLoginScreen from './src/screens/DeliveryLoginScreen';
import DeliveryListScreen from './src/screens/DeliveryListScreen';
import DeliveryDetailScreen from './src/screens/DeliveryDetailScreen';
import DeliveryMapScreen from './src/screens/DeliveryMapScreen';

const Stack = createNativeStackNavigator();

const DeliveryApp = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="DeliveryList" component={DeliveryListScreen} />
          <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
          <Stack.Screen name="DeliveryMap" component={DeliveryMapScreen} />
        </>
      ) : (
        <Stack.Screen name="DeliveryLogin" component={DeliveryLoginScreen} />
      )}
    </Stack.Navigator>
  );
};
```

---

## 🔒 SECURITY CONSIDERATIONS

1. **Auth Check:** Verify user.role === 'DELIVERY_STAFF'
2. **Order Access:** Chỉ xem đơn được assign
3. **GPS Tracking:** Store GPS logs for audit
4. **Photo Upload:** Compress before upload
5. **Token Refresh:** Handle expired sessions

---

## 📊 METRICS TO TRACK

- Delivery completion rate
- Average delivery time
- Distance traveled
- Customer satisfaction (optional rating)

---

## 🎯 NEXT STEPS

1. **Approve this plan**
2. **I'll implement all screens**
3. **Update backend APIs**
4. **Test end-to-end**
5. **Deploy**

Ready to proceed? 🚀
