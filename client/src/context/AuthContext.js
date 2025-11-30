import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (employeeCode, password) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeCode, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Đăng nhập thất bại',
          backendDown: false
        };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);

      const redirectPath = data.user.role === 'ADMIN' ? '/admin/dashboard' : '/home';
      return { success: true, redirect: redirectPath };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, message: 'Yêu cầu đăng nhập bị hết thời gian. Vui lòng thử lại.', backendDown: false };
      }
      console.error('Login error:', error);
      return { success: false, message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ quản trị viên.', backendDown: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login-simple';
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};