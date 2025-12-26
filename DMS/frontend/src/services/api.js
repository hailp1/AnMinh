// API Service for An Minh Business System
// Sử dụng proxy /api trong development (setupProxy.js sẽ proxy tới localhost:5000)
// Hoặc REACT_APP_API_URL nếu được set trong production
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function to get auth token
const getAuthToken = () => {
  // Token is saved directly in localStorage by Auth flows
  return localStorage.getItem('token') || '';
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  if (!token && !endpoint.includes('/auth/login')) {
    console.warn(`[API] Warning: No token found for request to ${endpoint}`);
  }

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'x-auth-token': token }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');

    // Check if response is JSON
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      // Handle validation errors array
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(e => e.msg || e.message || e).join(', ');
        throw new Error(errorMessages);
      }
      // Handle single error message
      throw new Error(data.error || data.message || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Generic CRUD generator
const createCRUDEndpoints = (resource) => ({
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/${resource}${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/${resource}/${id}`),
  create: (data) => apiCall(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/${resource}/${id}`, { method: 'DELETE' }),
});

// Pharmacies API
export const pharmaciesAPI = {
  ...createCRUDEndpoints('pharmacies'),
  getSummary: () => apiCall('/pharmacies/summary'),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/products${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiCall(`/products/${id}`),
  create: (data) => apiCall('/products/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/products/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/products/admin/products/${id}`, { method: 'DELETE' }),
  getGroups: () => apiCall('/products/groups'),
  createGroup: (data) => apiCall('/products/admin/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateGroup: (id, data) => apiCall(`/products/admin/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGroup: (id) => apiCall(`/products/admin/groups/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: false }) }),
};

// Orders API
export const ordersAPI = {
  ...createCRUDEndpoints('orders'),
  getSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/orders/summary${query ? `?${query}` : ''}`);
  },
  updateStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
};

// Auth API
export const authAPI = {
  login: (employeeCode, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ employeeCode, password }),
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

// Other APIs
export const stationsAPI = createCRUDEndpoints('stations');
export const regionsAPI = createCRUDEndpoints('regions');
export const businessUnitsAPI = createCRUDEndpoints('business-units');
export const territoriesAPI = createCRUDEndpoints('territories');
export const customerAssignmentsAPI = createCRUDEndpoints('customer-assignments');
export const visitPlansAPI = {
  ...createCRUDEndpoints('visit-plans'),
  generate: (data) => apiCall('/visit-plans/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  importRoutes: (data) => apiCall('/visit-plans/import-routes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  checkIn: (data) => apiCall('/visit-plans/check-in', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  checkOut: (data) => apiCall('/visit-plans/check-out', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getCurrentVisit: (userId) => apiCall(`/visit-plans/current/${userId}`)
};
export const promotionsAPI = {
  ...createCRUDEndpoints('promotions'),
  getAvailable: (pharmacyId) => apiCall(`/promotions/available/${pharmacyId}`),
};
export const loyaltyAPI = createCRUDEndpoints('loyalty');
export const customerSegmentsAPI = createCRUDEndpoints('customer-segments');
export const tradeActivitiesAPI = createCRUDEndpoints('trade-activities');
export const kpiAPI = {
  ...createCRUDEndpoints('kpi'),
  getSummary: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/kpi/summary?${query}`);
  }
};
export const approvalsAPI = createCRUDEndpoints('approvals');
export const usersAPI = {
  ...createCRUDEndpoints('users'),
  getAllAdmin: () => apiCall('/users/admin/users'), // Full list for admins
  create: (data) => apiCall('/users/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/users/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/users/admin/users/${id}`, { method: 'DELETE' }),
};

// Messages API
export const messagesAPI = {
  getContacts: () => apiCall('/messages/contacts'),
  getMessages: (userId) => apiCall(`/messages/${userId}`),
  sendMessage: (receiverId, content) => apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content }),
  }),
};

// Permissions API
export const permissionsAPI = {
  getAll: () => apiCall('/permissions'),
  update: (role, permissions) => apiCall('/permissions', {
    method: 'POST',
    body: JSON.stringify({ role, permissions })
  }),
  getMyPermissions: () => apiCall('/permissions/my-permissions')
};

// Routes API
export const routesAPI = {
  ...createCRUDEndpoints('routes'),
  import: (data) => apiCall('/routes/import', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Inventory API
export const inventoryAPI = {
  getWarehouses: () => apiCall('/inventory/warehouses'),
  createWarehouse: (data) => apiCall('/inventory/warehouses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateWarehouse: (id, data) => apiCall(`/inventory/warehouses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getStock: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/inventory/stock?${query}`);
  },
  getBatches: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/inventory/batches?${query}`);
  },
  getTransactions: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/inventory/transactions?${query}`);
  },
  createTransaction: (data) => apiCall('/inventory/transactions', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Reports API
export const reportsAPI = {
  getSales: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/sales?${query}`);
  },
  getVisits: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/visits?${query}`);
  },
  getDashboard: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/dashboard?${query}`);
  },
  getInventory: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/inventory?${query}`);
  },
  exportData: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/export?${query}`);
  },
  getBizReview: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/biz-review?${query}`);
  },
  // New endpoints for BizReview
  getInventorySummary: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/inventory-summary?${query}`);
  },
  getTDVPerformance: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/tdv-performance?${query}`);
  },
  getCompliance: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/reports/compliance?${query}`);
  }
};

// System API
export const systemAPI = {
  getSettings: () => apiCall('/system/settings'),
  updateSettings: (settings) => apiCall('/system/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  })
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/analytics/dashboard?${query}`);
  },
  getReport: (type, params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/analytics/reports/${type}?${query}`);
  }
};

export default {
  pharmacies: pharmaciesAPI,
  products: productsAPI,
  orders: ordersAPI,
  auth: authAPI,
  revenue: revenueAPI,
  stations: stationsAPI,
  regions: regionsAPI,
  businessUnits: businessUnitsAPI,
  territories: territoriesAPI,
  customerAssignments: customerAssignmentsAPI,
  visitPlans: visitPlansAPI,
  promotions: promotionsAPI,
  loyalty: loyaltyAPI,
  customerSegments: customerSegmentsAPI,
  tradeActivities: tradeActivitiesAPI,
  kpi: kpiAPI,
  approvals: approvalsAPI,
  users: usersAPI,
  messages: messagesAPI,
  permissions: permissionsAPI,
  routes: routesAPI,
  routes: routesAPI,
  inventory: inventoryAPI,
  system: systemAPI,
  analytics: analyticsAPI,
};


