// Tạo 100 trạm sạc ở TP.HCM với tọa độ thật
const generateHCMStations = () => {
  const stations = [];
  const hcmDistricts = [
    // Quận 1
    { name: 'Quận 1', lat: 10.7769, lng: 106.7009, count: 15 },
    // Quận 3  
    { name: 'Quận 3', lat: 10.7756, lng: 106.6878, count: 8 },
    // Quận 5
    { name: 'Quận 5', lat: 10.7594, lng: 106.6672, count: 6 },
    // Quận 7
    { name: 'Quận 7', lat: 10.7378, lng: 106.7197, count: 10 },
    // Quận 10
    { name: 'Quận 10', lat: 10.7722, lng: 106.6681, count: 5 },
    // Bình Thạnh
    { name: 'Bình Thạnh', lat: 10.8014, lng: 106.7108, count: 12 },
    // Tân Bình
    { name: 'Tân Bình', lat: 10.8008, lng: 106.6525, count: 8 },
    // Phú Nhuận
    { name: 'Phú Nhuận', lat: 10.7981, lng: 106.6831, count: 6 },
    // Gò Vấp
    { name: 'Gò Vấp', lat: 10.8376, lng: 106.6717, count: 7 },
    // Thủ Đức
    { name: 'Thủ Đức', lat: 10.8525, lng: 106.7717, count: 15 },
    // Bình Tân
    { name: 'Bình Tân', lat: 10.7394, lng: 106.6181, count: 8 }
  ];

  const stationNames = [
    'Vincom', 'Lotte Mart', 'Big C', 'Coopmart', 'Saigon Centre', 'Diamond Plaza',
    'Parkson', 'Takashimaya', 'Landmark 81', 'Bitexco', 'Vinhomes', 'Masteri',
    'The Manor', 'Sunrise City', 'Estella Heights', 'Gateway', 'Crescent Mall',
    'Aeon Mall', 'SC VivoCity', 'Gigamall', 'Nowzone', 'Sense City', 'Vincom Mega Mall',
    'Saigon Pearl', 'Times Square', 'Golden Dragon', 'Nguyen Kim', 'Metro', 'Maximark',
    'Emart', 'Lotte Cinema', 'CGV', 'Galaxy Cinema', 'BHD Star', 'Cinestar',
    'Highlands Coffee', 'Starbucks', 'The Coffee House', 'Phuc Long', 'Trung Nguyen',
    'Circle K', '7-Eleven', 'FamilyMart', 'B\'s Mart', 'VinMart', 'Co.opFood',
    'Petrolimex', 'Shell', 'Caltex', 'Total', 'Esso', 'Mobil', 'Chevron'
  ];

  const chargerTypeOptions = [
    ['Type A', 'Fast Charge'],
    ['Type B', 'Super Fast'], 
    ['Type A', 'Type C'],
    ['Type B', 'Fast Charge'],
    ['Type A', 'Type B', 'Fast Charge'],
    ['Type C', 'Super Fast'],
    ['Type A', 'Type B', 'Type C'],
    ['Fast Charge', 'Super Fast']
  ];

  const amenitiesOptions = [
    ['WiFi', 'Parking', 'Cafe'],
    ['WiFi', 'Shopping Mall', 'Food Court'],
    ['WiFi', 'Parking', 'Security', 'Air Conditioning'],
    ['WiFi', 'Parking', 'Restaurant'],
    ['WiFi', 'Parking', 'Shopping Mall', 'Cinema'],
    ['WiFi', 'ATM', 'Convenience Store'],
    ['WiFi', 'Parking', 'Gas Station'],
    ['WiFi', 'Security', 'CCTV'],
    ['WiFi', 'Parking', 'Toilet', 'Vending Machine'],
    ['WiFi', 'Parking', 'Pharmacy', 'Supermarket']
  ];

  let stationId = 1;

  hcmDistricts.forEach(district => {
    for (let i = 0; i < district.count; i++) {
      // Tạo tọa độ ngẫu nhiên xung quanh trung tâm quận (bán kính ~2km)
      const latOffset = (Math.random() - 0.5) * 0.02; // ~1km
      const lngOffset = (Math.random() - 0.5) * 0.02; // ~1km
      
      const randomName = stationNames[Math.floor(Math.random() * stationNames.length)];
      const randomChargerTypes = chargerTypeOptions[Math.floor(Math.random() * chargerTypeOptions.length)];
      const randomAmenities = amenitiesOptions[Math.floor(Math.random() * amenitiesOptions.length)];
      
      // Tạo pricing dựa trên charger types
      const pricing = randomChargerTypes.map(type => ({
        chargerType: type,
        pricePerHour: Math.floor(Math.random() * 20000) + 15000 // 15k-35k
      }));

      // Random promotions (30% chance)
      const promotions = Math.random() < 0.3 ? [{
        title: ['Giảm giá cuối tuần', 'Happy Hour', 'Khuyến mãi tháng', 'Ưu đãi đặc biệt'][Math.floor(Math.random() * 4)],
        description: ['Áp dụng thứ 7, chủ nhật', 'Giảm giá từ 14:00-16:00', 'Chỉ trong tháng này', 'Cho khách hàng thân thiết'][Math.floor(Math.random() * 4)],
        discount: Math.floor(Math.random() * 25) + 10, // 10-35%
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true
      }] : [];

      // Random vehicle support
      const vehicleSupport = Math.random();
      let supportedVehicles;
      if (vehicleSupport < 0.3) {
        supportedVehicles = ['motorbike']; // Chỉ xe máy
      } else if (vehicleSupport < 0.6) {
        supportedVehicles = ['car']; // Chỉ ô tô
      } else {
        supportedVehicles = ['car', 'motorbike']; // Cả hai
      }

      const station = {
        id: stationId.toString(),
        name: `Trạm Sạc ${randomName} ${district.name}`,
        address: `${Math.floor(Math.random() * 500) + 1} Đường ${['Nguyễn Huệ', 'Lê Lợi', 'Hai Bà Trưng', 'Võ Văn Tần', 'Cách Mạng Tháng 8', 'Lý Tự Trọng', 'Pasteur', 'Đồng Khởi', 'Nguyễn Thị Minh Khai', 'Điện Biên Phủ'][Math.floor(Math.random() * 10)]}, ${district.name}, TP.HCM`,
        latitude: district.lat + latOffset,
        longitude: district.lng + lngOffset,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
        totalRatings: Math.floor(Math.random() * 300) + 20,
        chargerTypes: randomChargerTypes,
        supportedVehicles: supportedVehicles,
        pricing: pricing,
        amenities: randomAmenities,
        images: [`station${stationId}.jpg`],
        isVerified: Math.random() < 0.8, // 80% verified
        status: 'ACTIVE',
        operatingHours: Math.random() < 0.2 ? 
          { open: '00:00', close: '23:59', is24Hours: true } : 
          { 
            open: ['06:00', '07:00', '08:00'][Math.floor(Math.random() * 3)], 
            close: ['21:00', '22:00', '23:00'][Math.floor(Math.random() * 3)], 
            is24Hours: false 
          },
        promotions: promotions,
        owner: {
          name: ['Nguyễn Văn', 'Trần Thị', 'Lê Văn', 'Phạm Thị', 'Hoàng Văn', 'Vũ Thị'][Math.floor(Math.random() * 6)] + ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`
        }
      };

      stations.push(station);
      stationId++;
    }
  });

  return stations;
};

export const mockStations = generateHCMStations();

export const mockReviews = [
  {
    id: '1',
    stationId: '1',
    user: { name: 'Minh Tuấn', avatar: null },
    rating: 5,
    comment: 'Trạm sạc rất tốt, sạc nhanh và giá cả hợp lý. Nhân viên thân thiện.',
    images: [],
    createdAt: new Date('2024-10-25')
  },
  {
    id: '2',
    stationId: '1',
    user: { name: 'Thu Hà', avatar: null },
    rating: 4,
    comment: 'Vị trí thuận tiện, có chỗ đậu xe. Chỉ có điều đôi khi hơi đông.',
    images: [],
    createdAt: new Date('2024-10-20')
  },
  {
    id: '3',
    stationId: '2',
    user: { name: 'Đức Anh', avatar: null },
    rating: 4,
    comment: 'Trong Vincom nên rất tiện, có thể mua sắm trong lúc chờ sạc.',
    images: [],
    createdAt: new Date('2024-10-18')
  }
];

// Utility functions - Haversine formula để tính khoảng cách chính xác
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Bán kính Trái Đất tính bằng mét
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Khoảng cách tính bằng mét
};

export const getStationsNearby = (lat, lng, radius = 5000) => {
  const nearbyStations = mockStations.filter(station => {
    const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
    return distance <= radius;
  }).sort((a, b) => {
    const distA = calculateDistance(lat, lng, a.latitude, a.longitude);
    const distB = calculateDistance(lat, lng, b.latitude, b.longitude);
    return distA - distB;
  });

  // If no stations found in radius, return closest 5 stations
  if (nearbyStations.length === 0) {
    return mockStations.sort((a, b) => {
      const distA = calculateDistance(lat, lng, a.latitude, a.longitude);
      const distB = calculateDistance(lat, lng, b.latitude, b.longitude);
      return distA - distB;
    }).slice(0, 5);
  }

  return nearbyStations;
};

export const getStationById = (id) => {
  return mockStations.find(station => station.id === id);
};

export const getReviewsByStationId = (stationId) => {
  return mockReviews.filter(review => review.stationId === stationId);
};

// LocalStorage helpers
export const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Mock data cho nearby users
const generateNearbyUsers = () => {
  const users = [];
  const userNames = [
    'Minh Anh', 'Hoàng Nam', 'Thu Hà', 'Đức Thành', 'Lan Phương',
    'Quốc Bảo', 'Hương Giang', 'Văn Tú', 'Thị Nga', 'Công Phúc',
    'Mai Linh', 'Xuân Tùng', 'Bích Ngọc', 'Hải Đăng', 'Thanh Tâm',
    'Việt Anh', 'Phương Thảo', 'Duy Khánh', 'Ngọc Ánh', 'Trung Hiếu'
  ];

  const avatars = [
    '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧',
    '👨‍⚕️', '👩‍⚕️', '👨‍🍳', '👩‍🍳', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀',
    '👨‍🏫', '👩‍🏫', '👨‍🌾', '👩‍🌾'
  ];

  const vehicles = ['🚗', '🏍️', '🚙', '🚕'];
  const statuses = ['Đang sạc', 'Tìm trạm', 'Online', 'Nghỉ ngơi'];

  // Tạo 50 users gần TP.HCM
  for (let i = 0; i < 50; i++) {
    const baseLatHCM = 10.7769;
    const baseLngHCM = 106.7009;
    
    // Random trong bán kính 20km
    const randomLat = baseLatHCM + (Math.random() - 0.5) * 0.3;
    const randomLng = baseLngHCM + (Math.random() - 0.5) * 0.3;

    users.push({
      id: `user_${i + 1}`,
      name: userNames[i % userNames.length],
      avatar: avatars[i % avatars.length],
      vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      latitude: randomLat,
      longitude: randomLng,
      distance: Math.floor(Math.random() * 20000) + 500, // 0.5-20km
      lastSeen: new Date(Date.now() - Math.random() * 3600000), // Trong 1h qua
      isOnline: Math.random() > 0.3, // 70% online
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
      totalTrips: Math.floor(Math.random() * 200) + 10,
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 3600000), // Trong 1 năm qua
      bio: [
        'Yêu thích xe điện 🔋',
        'Thường xuyên đi công tác',
        'Sạc xe mỗi ngày',
        'Newbie cần hỗ trợ',
        'Chia sẻ kinh nghiệm sạc xe',
        'Tìm bạn đồng hành',
        'Chuyên gia về EV',
        'Thích khám phá địa điểm mới'
      ][Math.floor(Math.random() * 8)]
    });
  }

  return users;
};

// Lưu users vào localStorage nếu chưa có
export const initializeNearbyUsers = () => {
  const existingUsers = getFromLocalStorage('nearbyUsers', null);
  if (!existingUsers) {
    const users = generateNearbyUsers();
    saveToLocalStorage('nearbyUsers', users);
    return users;
  }
  return existingUsers;
};

// Initialize Pharmacy Reps from JSON file
export const initializePharmacyReps = async () => {
  try {
    const pharmacyRepsData = await import('../data/pharmacyReps.json');
    const reps = pharmacyRepsData.pharmacyReps || pharmacyRepsData.default?.pharmacyReps || [];
    
    // Lưu vào localStorage
    const existingUsers = getFromLocalStorage('users', []);
    const existingRepIds = existingUsers.map(u => u.id);
    
    // Thêm reps vào users nếu chưa có
    reps.forEach(rep => {
      if (!existingRepIds.includes(rep.id)) {
        existingUsers.push({
          ...rep,
          password: rep.phone, // Default password = phone
          location: rep.latitude && rep.longitude ? { lat: rep.latitude, lng: rep.longitude } : null
        });
      }
    });
    
    saveToLocalStorage('users', existingUsers);
    return reps;
  } catch (error) {
    console.error('Error loading pharmacy reps:', error);
    return [];
  }
};

// Get Pharmacy Reps by hub
export const getPharmacyRepsByHub = (hub) => {
  const users = getFromLocalStorage('users', []);
  return users.filter(u => 
    u.role === 'PHARMACY_REP' && 
    u.hub === hub &&
    (u.latitude && u.longitude)
  );
};

// Lấy users gần vị trí hiện tại
export const getNearbyUsers = (userLat, userLng, radiusInMeters = 10000) => {
  const users = getFromLocalStorage('nearbyUsers', []);
  
  return users
    .map(user => ({
      ...user,
      distance: calculateDistance(userLat, userLng, user.latitude, user.longitude)
    }))
    .filter(user => user.distance <= radiusInMeters)
    .sort((a, b) => a.distance - b.distance);
};

// Lấy user theo ID
export const getUserById = (userId) => {
  const users = getFromLocalStorage('nearbyUsers', []);
  return users.find(user => user.id === userId);
};

// Mock chat messages
export const getChatMessages = (userId) => {
  const messages = getFromLocalStorage(`chat_${userId}`, []);
  return messages;
};

export const sendChatMessage = (userId, message, fromCurrentUser = true) => {
  const messages = getChatMessages(userId);
  const newMessage = {
    id: generateId(),
    text: message,
    fromCurrentUser,
    timestamp: new Date(),
    read: false
  };
  
  messages.push(newMessage);
  saveToLocalStorage(`chat_${userId}`, messages);
  
  // Simulate auto reply (30% chance)
  if (fromCurrentUser && Math.random() < 0.3) {
    setTimeout(() => {
      const autoReplies = [
        'Chào bạn! 👋',
        'Cảm ơn bạn đã nhắn tin',
        'Mình đang ở trạm sạc gần đây',
        'Bạn có cần hỗ trợ gì không?',
        'Trạm này sạc khá nhanh đấy',
        'Mình sẽ chia sẻ vị trí cho bạn',
        'Hẹn gặp lại bạn! 😊'
      ];
      
      const autoReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      sendChatMessage(userId, autoReply, false);
    }, 2000 + Math.random() * 3000); // 2-5s delay
  }
  
  return newMessage;
};