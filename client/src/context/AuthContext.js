import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    // Auto login from localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (employeeCode, password) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeCode, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check content-type
      const contentType = response.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));

        return {
          success: false,
          message: 'Backend không phản hồi đúng định dạng. Vui lòng kiểm tra backend đang chạy.',
          backendDown: true
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Sai mã nhân viên hoặc mật khẩu',
          backendDown: false
        };
      }

      // Save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);

      // ✅ FIX: Redirect to correct route
      const redirectPath = data.user.role === 'ADMIN' ? '/admin/dashboard' : '/home';

      return { success: true, redirect: redirectPath };

    } catch (error) {
      console.error('Login error:', error);

      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timeout. Backend không phản hồi trong 30 giây.',
          backendDown: true
        };
      }

      if (error.message.includes('Failed to fetch') ||
        error.message.includes('network') ||
        error.message.includes('ECONNREFUSED')) {
        return {
          success: false,
          message: 'Không thể kết nối đến backend. Vui lòng kiểm tra backend đang chạy trên port 5000.',
          backendDown: true
        };
      }

      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi đăng nhập',
        backendDown: false
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};