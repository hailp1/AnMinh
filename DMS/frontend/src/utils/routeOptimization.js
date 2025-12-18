/**
 * Route Optimization Utilities
 * Implements Nearest Neighbor algorithm for TSP (Traveling Salesman Problem)
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Optimize route using Nearest Neighbor algorithm
 * @param {Array} customers - Array of customer objects with latitude and longitude
 * @param {Object} startPoint - Optional starting point {latitude, longitude}
 * @returns {Object} Optimized route with customers array and total distance
 */
export const optimizeRoute = (customers, startPoint = null) => {
    if (!customers || customers.length === 0) {
        return { customers: [], totalDistance: 0 };
    }

    if (customers.length === 1) {
        return { customers, totalDistance: 0 };
    }

    // Filter out customers without coordinates
    const validCustomers = customers.filter(c => c.latitude && c.longitude);

    if (validCustomers.length === 0) {
        return { customers: [], totalDistance: 0 };
    }

    // Start from the first customer or provided start point
    let currentPoint = startPoint || {
        latitude: validCustomers[0].latitude,
        longitude: validCustomers[0].longitude
    };

    const optimized = [];
    const remaining = [...validCustomers];
    let totalDistance = 0;

    // Nearest Neighbor Algorithm
    while (remaining.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = Infinity;

        // Find nearest unvisited customer
        remaining.forEach((customer, index) => {
            const distance = calculateDistance(
                currentPoint.latitude,
                currentPoint.longitude,
                customer.latitude,
                customer.longitude
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });

        // Add nearest customer to optimized route
        const nearest = remaining.splice(nearestIndex, 1)[0];
        optimized.push(nearest);
        totalDistance += nearestDistance;

        // Update current point
        currentPoint = {
            latitude: nearest.latitude,
            longitude: nearest.longitude
        };
    }

    return {
        customers: optimized,
        totalDistance: Math.round(totalDistance * 100) / 100 // Round to 2 decimal places
    };
};

/**
 * Calculate total distance for a given route
 * @param {Array} customers - Ordered array of customers
 * @returns {number} Total distance in kilometers
 */
export const calculateTotalDistance = (customers) => {
    if (!customers || customers.length < 2) return 0;

    let total = 0;
    for (let i = 0; i < customers.length - 1; i++) {
        const c1 = customers[i];
        const c2 = customers[i + 1];

        if (c1.latitude && c1.longitude && c2.latitude && c2.longitude) {
            total += calculateDistance(
                c1.latitude,
                c1.longitude,
                c2.latitude,
                c2.longitude
            );
        }
    }

    return Math.round(total * 100) / 100;
};

/**
 * Group customers by tier (A/B/C) for prioritization
 * @param {Array} customers - Array of customers
 * @returns {Object} Grouped customers {A: [], B: [], C: []}
 */
export const groupByTier = (customers) => {
    return customers.reduce((acc, customer) => {
        const tier = customer.tier || 'C';
        if (!acc[tier]) acc[tier] = [];
        acc[tier].push(customer);
        return acc;
    }, { A: [], B: [], C: [] });
};

/**
 * Optimize route with tier priority (A customers first, then B, then C)
 * @param {Array} customers - Array of customers
 * @param {Object} startPoint - Optional starting point
 * @returns {Object} Optimized route
 */
export const optimizeRouteWithPriority = (customers, startPoint = null) => {
    const grouped = groupByTier(customers);

    let allOptimized = [];
    let totalDistance = 0;
    let currentStart = startPoint;

    // Optimize each tier separately
    ['A', 'B', 'C'].forEach(tier => {
        if (grouped[tier].length > 0) {
            const result = optimizeRoute(grouped[tier], currentStart);
            allOptimized = [...allOptimized, ...result.customers];
            totalDistance += result.totalDistance;

            // Update start point for next tier
            if (result.customers.length > 0) {
                const lastCustomer = result.customers[result.customers.length - 1];
                currentStart = {
                    latitude: lastCustomer.latitude,
                    longitude: lastCustomer.longitude
                };
            }
        }
    });

    return {
        customers: allOptimized,
        totalDistance: Math.round(totalDistance * 100) / 100
    };
};
