import AsyncStorage from '@react-native-async-storage/async-storage';

// API Service for An Minh Business System (Mobile)
import { Platform } from 'react-native';

// API Service for An Minh Business System (Mobile)
// Android Emulator uses 10.0.2.2 to access host localhost
// Web uses localhost
const API_BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : 'http://10.0.2.2:5000/api';

// Helper function to get auth token
const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('token');
    } catch (e) {
        console.error('Error reading token', e);
        return null;
    }
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = await getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

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
export const pharmaciesAPI = createCRUDEndpoints('pharmacies');

// Products API
export const productsAPI = {
    ...createCRUDEndpoints('products'),
    getGroups: () => apiCall('/products/groups'),
};

// Orders API
export const ordersAPI = {
    ...createCRUDEndpoints('orders'),
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
export const kpiAPI = createCRUDEndpoints('kpi');
export const approvalsAPI = createCRUDEndpoints('approvals');
export const usersAPI = createCRUDEndpoints('users');

// Messages API
export const messagesAPI = {
    getContacts: () => apiCall('/messages/contacts'),
    getMessages: (userId) => apiCall(`/messages/${userId}`),
    sendMessage: (receiverId, content) => apiCall('/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId, content }),
    }),
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
};
