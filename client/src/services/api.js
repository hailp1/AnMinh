// API Service for An Minh Business System
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token || '';
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Có lỗi xảy ra');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Pharmacies API
export const pharmaciesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/pharmacies${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/pharmacies/${id}`),
  create: (data) => apiCall('/pharmacies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/pharmacies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Products API
export const productsAPI = {
  getGroups: () => apiCall('/products/groups'),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/orders${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/orders/${id}`),
  create: (data) => apiCall('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiCall(`/orders/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ status }) 
  }),
};

// Auth API
export const authAPI = {
  login: (phone, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  }),
  register: (data) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getProfile: () => apiCall('/users/profile'),
  updateProfile: (data) => apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Revenue Stats API
export const revenueAPI = {
  getStats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/revenue${query ? `?${query}` : ''}`);
  },
};

export default {
  pharmacies: pharmaciesAPI,
  products: productsAPI,
  orders: ordersAPI,
  auth: authAPI,
  revenue: revenueAPI,
};

