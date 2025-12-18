const DB_NAME = 'AnMinhDMS_DB';
const DB_VERSION = 1;

// Simple wrapper for IndexedDB
const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('IndexedDB error: ' + event.target.errorCode);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Master Data Stores
        if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('customers')) db.createObjectStore('customers', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('promotions')) db.createObjectStore('promotions', { keyPath: 'id' });

        // Transaction Stores
        if (!db.objectStoreNames.contains('pending_visits')) db.createObjectStore('pending_visits', { keyPath: 'id', autoIncrement: true });
        if (!db.objectStoreNames.contains('pending_orders')) db.createObjectStore('pending_orders', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => resolve(event.target.result);
});

export const OfflineService = {
    // --- Master Data Sync ---
    async saveMasterData(type, data) {
        const db = await dbPromise;
        const tx = db.transaction(type, 'readwrite');
        const store = tx.objectStore(type);

        // Clear old data
        await new Promise((resolve) => {
            const clearReq = store.clear();
            clearReq.onsuccess = resolve;
        });

        // Add new data
        data.forEach(item => store.put(item));

        return new Promise((resolve) => {
            tx.oncomplete = () => resolve(true);
        });
    },

    async getMasterData(type) {
        const db = await dbPromise;
        const tx = db.transaction(type, 'readonly');
        const store = tx.objectStore(type);
        return new Promise((resolve) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
        });
    },

    // --- Transaction Queue ---
    async queueVisit(visitData) {
        const db = await dbPromise;
        const tx = db.transaction('pending_visits', 'readwrite');
        const store = tx.objectStore('pending_visits');
        store.add({ ...visitData, timestamp: Date.now(), status: 'PENDING' });
    },

    async queueOrder(orderData) {
        const db = await dbPromise;
        const tx = db.transaction('pending_orders', 'readwrite');
        const store = tx.objectStore('pending_orders');
        store.add({ ...orderData, timestamp: Date.now(), status: 'PENDING' });
    },

    async getPendingCount() {
        const db = await dbPromise;
        const tx1 = db.transaction('pending_visits', 'readonly').objectStore('pending_visits').count();
        const tx2 = db.transaction('pending_orders', 'readonly').objectStore('pending_orders').count();

        const [visits, orders] = await Promise.all([
            new Promise(r => tx1.onsuccess = () => r(tx1.result)),
            new Promise(r => tx2.onsuccess = () => r(tx2.result))
        ]);

        return { visits, orders };
    }
};
