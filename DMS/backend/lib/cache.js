import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis({
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true
});

// Handle Redis connection events
redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
});

redis.on('ready', () => {
    console.log('✅ Redis is ready to accept commands');
});

// Connect to Redis
redis.connect().catch(err => {
    console.error('Failed to connect to Redis:', err);
});

/**
 * Cache wrapper with automatic JSON serialization
 */
export const cache = {
    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {Promise<any|null>} Parsed value or null if not found
     */
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Cache GET error for key "${key}":`, error.message);
            return null;
        }
    },

    /**
     * Set value in cache with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache (will be JSON stringified)
     * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
     */
    async set(key, value, ttl = 300) {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Cache SET error for key "${key}":`, error.message);
            return false;
        }
    },

    /**
     * Delete key from cache
     * @param {string} key - Cache key to delete
     */
    async del(key) {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            console.error(`Cache DEL error for key "${key}":`, error.message);
            return false;
        }
    },

    /**
     * Delete multiple keys matching a pattern
     * @param {string} pattern - Pattern to match (e.g., 'products:*')
     */
    async delPattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            return keys.length;
        } catch (error) {
            console.error(`Cache DEL pattern error for "${pattern}":`, error.message);
            return 0;
        }
    },

    /**
     * Flush entire cache database
     */
    async flush() {
        try {
            await redis.flushdb();
            console.log('✅ Cache flushed successfully');
            return true;
        } catch (error) {
            console.error('Cache FLUSH error:', error.message);
            return false;
        }
    },

    /**
     * Check if key exists
     * @param {string} key - Cache key
     * @returns {Promise<boolean>}
     */
    async exists(key) {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Cache EXISTS error for key "${key}":`, error.message);
            return false;
        }
    },

    /**
     * Get cache statistics
     * @returns {Promise<object>}
     */
    async getStats() {
        try {
            const info = await redis.info('stats');
            const lines = info.split('\r\n');
            const stats = {};

            lines.forEach(line => {
                const [key, value] = line.split(':');
                if (key && value) {
                    stats[key] = value;
                }
            });

            return {
                hits: parseInt(stats.keyspace_hits) || 0,
                misses: parseInt(stats.keyspace_misses) || 0,
                hitRate: stats.keyspace_hits && stats.keyspace_misses
                    ? ((parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses))) * 100).toFixed(2) + '%'
                    : '0%'
            };
        } catch (error) {
            console.error('Cache STATS error:', error.message);
            return { hits: 0, misses: 0, hitRate: '0%' };
        }
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Disconnecting Redis...');
    await redis.quit();
});

process.on('SIGTERM', async () => {
    console.log('Disconnecting Redis...');
    await redis.quit();
});

export default cache;
