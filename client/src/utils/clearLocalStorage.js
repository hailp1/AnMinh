// Utility to clear all localStorage data
export const clearAllLocalStorage = () => {
  // List of all localStorage keys used in the app
  const keysToRemove = [
    'users',
    'nearbyUsers',
    'adminCustomers',
    'adminSettings',
    'currentUser',
    'savedLoginInfo',
    'token',
    'user',
    'orders',
    'products',
    'stations',
    'pharmacies',
    'customers'
  ];

  // Remove specific keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Remove all chat messages (chat_*)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chat_')) {
      localStorage.removeItem(key);
    }
  }

  console.log('✅ Đã xóa tất cả dữ liệu localStorage');
};

// Clear and reload page
export const resetApp = () => {
  clearAllLocalStorage();
  window.location.reload();
};

