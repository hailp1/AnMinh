import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveToLocalStorage, getFromLocalStorage, generateId } from '../utils/mockData';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khởi tạo admin user nếu chưa có
    initializeAdminUser();
    
    // Lấy user từ localStorage
    const savedUser = getFromLocalStorage('currentUser');
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // Khởi tạo admin user mặc định
  const initializeAdminUser = () => {
    const users = getFromLocalStorage('users', []);
    
    // Kiểm tra xem đã có admin chưa
    const adminExists = users.find(u => u.phone === '0938300489' || u.role === 'ADMIN');
    
    if (!adminExists) {
      const adminUser = {
        id: 'admin-001',
        phone: '0938300489',
        password: 'admin',
        name: 'Quản trị viên hệ thống',
        role: 'ADMIN',
        points: 10000,
        tokens: 10000,
        
        // Thông tin admin đầy đủ
        gender: 'Nam',
        vehicleType: 'car',
        vehicleModel: 'VinFast VF8',
        vehicleModelId: 'vf8',
        location: { lat: 10.8231, lng: 106.6297 }, // TP.HCM
        address: 'Thành phố Hồ Chí Minh, Việt Nam',
        
        // Profile hoàn thiện
        profileCompleted: true,
        profileCompletionPercentage: 100,
        
        avatar: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        
        // Quyền admin
        permissions: {
          manageUsers: true,
          manageStations: true,
          viewAnalytics: true,
          systemSettings: true,
          moderateContent: true
        }
      };
      
      users.push(adminUser);
      saveToLocalStorage('users', users);
      
      console.log('✅ Admin user initialized:', {
        phone: '0938300489',
        password: 'admin',
        role: 'ADMIN'
      });
    }
  };

  const checkPhoneExists = async (phone) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Lấy danh sách users từ localStorage
      const users = getFromLocalStorage('users', []);
      const userExists = users.find(u => u.phone === phone);
      
      return { 
        exists: !!userExists,
        user: userExists || null
      };
    } catch (error) {
      return { 
        exists: false,
        user: null
      };
    }
  };

  const login = async (phone, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Lấy danh sách users từ localStorage
      const users = getFromLocalStorage('users', []);
      const user = users.find(u => u.phone === phone);
      
      // Kiểm tra số điện thoại có tồn tại không
      if (!user) {
        return { 
          success: false, 
          message: 'Số điện thoại chưa được đăng ký',
          phoneNotExists: true,
          phone: phone
        };
      }
      
      // Kiểm tra mật khẩu
      if (user.password !== password) {
        return { 
          success: false, 
          message: 'Mật khẩu không đúng' 
        };
      }
      
      // Cập nhật thời gian đăng nhập cuối
      user.lastLogin = new Date().toISOString();
      
      // Lưu user hiện tại
      saveToLocalStorage('currentUser', user);
      setUser(user);
      
      // Redirect dựa trên role
      const redirectPath = user.role === 'ADMIN' ? '/admin' : '/home';
      
      return { success: true, redirect: redirectPath };
    } catch (error) {
      return { 
        success: false, 
        message: 'Đăng nhập thất bại' 
      };
    }
  };

  const register = async (phone, name = '', role = 'USER', additionalInfo = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Lấy danh sách users từ localStorage
      const users = getFromLocalStorage('users', []);
      
      // Kiểm tra SĐT đã tồn tại
      if (users.find(u => u.phone === phone)) {
        return { 
          success: false, 
          message: 'Số điện thoại đã được sử dụng' 
        };
      }
      
      // Tạo user mới với SĐT làm ID chính
      const newUser = {
        id: generateId(),
        phone: phone, // SĐT là user ID chính
        password: additionalInfo.password || phone, // Password từ form hoặc mặc định = SĐT
        name: name || '', // Có thể để trống, bổ sung sau
        role: role?.toUpperCase() || 'USER',
        points: 50, // Tặng 50 điểm khi đăng ký
        tokens: 0, // Token thưởng khi hoàn thiện profile
        
        // Thông tin bổ sung (có thể để trống)
        hub: additionalInfo.hub || '', // Hub phụ trách (cho PHARMACY_REP)
        gender: additionalInfo.gender || '', // Nam/Nữ/Khác
        vehicleType: additionalInfo.vehicleType || '', // Ô tô/Xe máy điện
        vehicleModel: additionalInfo.vehicleModel || '', // Model xe
        vehicleModelId: additionalInfo.vehicleModelId || '', // ID model xe VinFast
        location: additionalInfo.location || null, // Tọa độ hiện tại
        address: additionalInfo.address || '', // Địa chỉ từ tọa độ
        
        // Trạng thái hoàn thiện profile
        profileCompleted: false,
        profileCompletionPercentage: calculateProfileCompletion({
          name, 
          gender: additionalInfo.gender,
          vehicleType: additionalInfo.vehicleType,
          location: additionalInfo.location
        }),
        
        avatar: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Lưu vào danh sách users
      users.push(newUser);
      saveToLocalStorage('users', users);
      
      // Lưu cache SĐT đã đăng ký
      const registeredPhones = getFromLocalStorage('registeredPhones', []);
      if (!registeredPhones.includes(phone)) {
        registeredPhones.push(phone);
        saveToLocalStorage('registeredPhones', registeredPhones);
      }
      
      // Lưu user hiện tại
      saveToLocalStorage('currentUser', newUser);
      setUser(newUser);
      
      return { success: true, redirect: '/home', user: newUser };
    } catch (error) {
      return { 
        success: false, 
        message: 'Đăng ký thất bại' 
      };
    }
  };

  // Tính phần trăm hoàn thiện profile
  const calculateProfileCompletion = (userInfo) => {
    const fields = ['name', 'gender', 'vehicleType', 'location'];
    const completedFields = fields.filter(field => {
      const value = userInfo[field];
      return value && value !== '' && value !== null;
    });
    return Math.round((completedFields.length / fields.length) * 100);
  };

  // Cập nhật profile và tặng token nếu hoàn thiện
  const updateProfile = async (profileData) => {
    if (!user) return { success: false, message: 'Chưa đăng nhập' };

    try {
      const updatedUser = { ...user, ...profileData };
      
      // Tính lại phần trăm hoàn thiện
      const completionPercentage = calculateProfileCompletion(updatedUser);
      updatedUser.profileCompletionPercentage = completionPercentage;
      
      // Nếu hoàn thiện 100% và chưa từng hoàn thiện trước đó
      if (completionPercentage === 100 && !user.profileCompleted) {
        updatedUser.profileCompleted = true;
        updatedUser.tokens += 100; // Tặng 100 token
        updatedUser.points += 50; // Tặng thêm 50 điểm
      }
      
      updateUser(updatedUser);
      
      return { 
        success: true, 
        user: updatedUser,
        tokensEarned: completionPercentage === 100 && !user.profileCompleted ? 100 : 0
      };
    } catch (error) {
      return { success: false, message: 'Cập nhật thất bại' };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    // Cập nhật user hiện tại
    saveToLocalStorage('currentUser', updatedUser);
    setUser(updatedUser);
    
    // Cập nhật trong danh sách users
    const users = getFromLocalStorage('users', []);
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveToLocalStorage('users', users);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    calculateProfileCompletion,
    checkPhoneExists,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};