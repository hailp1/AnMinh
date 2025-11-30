import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import logger from './lib/logger.js';

// Catch all errors immediately
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

config();

const app = express();

// Security: enforce presence of strong JWT secret in production
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret === 'your-secret-key-change-in-production') {
    logger.error('Security error: JWT_SECRET is missing or too weak. Set a strong secret (>=32 chars).');
    process.exit(1);
  }
}

// Middleware
const isDevelopment = process.env.NODE_ENV !== 'production';
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3099',
  'http://localhost:3100',
  'http://localhost:3101',
  'http://localhost:2099',
  'http://localhost:2100',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3099',
  'http://127.0.0.1:3100',
  'http://127.0.0.1:3101',
  'http://127.0.0.1:2099',
  'http://127.0.0.1:2100',
  'https://sales.ammedtech.com',
  'https://dms.ammedtech.com',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow ALL localhost origins (any port)
    if (isDevelopment) {
      if (origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://0.0.0.0:')) {
        logger.debug(`CORS allowed (dev): ${origin}`);
        return callback(null, true);
      }
    }

    // Check if origin is in whitelist
    if (allowedOrigins.has(origin)) {
      logger.debug(`CORS allowed (whitelist): ${origin}`);
      return callback(null, true);
    }

    // Log CORS rejection for debugging
    logger.warn(`CORS blocked origin: ${origin}`);
    logger.debug(`   Allowed origins: ${Array.from(allowedOrigins).join(', ')}`);
    logger.debug(`   Development mode: ${isDevelopment}`);

    // Return CORS error
    callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['x-auth-token'],
  optionsSuccessStatus: 200, // Support legacy browsers
  preflightContinue: false, // Let cors handle preflight
}));

// Secure headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "wss://localhost:*"],
    },
  } : false, // Tắt CSP strict trong development để tránh lỗi với DevTools
}));

// Body limit
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static('uploads'));

// Handle .well-known requests (cho Chrome DevTools và các tools khác)
app.get('/.well-known/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Trust proxy (for Cloudflare)
app.set('trust proxy', true);

// Enforce HTTPS when behind proxy (optional via env)
app.use((req, res, next) => {
  if (process.env.ENFORCE_HTTPS === 'true') {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      const host = req.headers.host;
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
  }
  next();
});

// Rate limit - global (basic)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Rate limit - auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Tăng giới hạn trong dev để test
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting nếu là OPTIONS request
    return req.method === 'OPTIONS';
  },
});
app.use('/api/auth', authLimiter);

// Routes
import authRoutes from './routes/auth.js';
import stationsRoutes from './routes/stations.js';
import usersRoutes from './routes/users.js';
import pharmaciesRoutes from './routes/pharmacies.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import regionsRoutes from './routes/regions.js';
import businessUnitsRoutes from './routes/businessUnits.js';
import territoriesRoutes from './routes/territories.js';
import customerAssignmentsRoutes from './routes/customerAssignments.js';
import visitPlansRoutes from './routes/visitPlans.js';
import promotionsRoutes from './routes/promotions.js';
import loyaltyRoutes from './routes/loyalty.js';
import customerSegmentsRoutes from './routes/customerSegments.js';
import tradeActivitiesRoutes from './routes/tradeActivities.js';
import kpiRoutes from './routes/kpi.js';
import approvalsRoutes from './routes/approvals.js';
import revenueRoutes from './routes/revenue.js';
import messagesRoutes from './routes/messages.js';

// Register routes - ĐẢM BẢO routes được register TRƯỚC các middleware khác
logger.info('Registering routes...');

app.use('/api/auth', authRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/business-units', businessUnitsRoutes);
app.use('/api/territories', territoriesRoutes);
app.use('/api/customer-assignments', customerAssignmentsRoutes);
app.use('/api/visit-plans', visitPlansRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/customer-segments', customerSegmentsRoutes);
app.use('/api/trade-activities', tradeActivitiesRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/messages', messagesRoutes);

// Debug: Log all requests AFTER routes are registered
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    logger.debug('Incoming request:', {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      url: req.url,
    });
  }
  next();
});

// API info endpoint - ĐẶT SAU routes để đảm bảo routes được ưu tiên
app.get('/api', (req, res) => {
  res.json({
    message: 'An Minh Business System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stations: '/api/stations',
      users: '/api/users',
      pharmacies: '/api/pharmacies',
      products: '/api/products',
      orders: '/api/orders',
      regions: '/api/regions',
      businessUnits: '/api/business-units',
      territories: '/api/territories',
      customerAssignments: '/api/customer-assignments',
      visitPlans: '/api/visit-plans',
      promotions: '/api/promotions',
      loyalty: '/api/loyalty',
      customerSegments: '/api/customer-segments',
      tradeActivities: '/api/trade-activities',
      kpi: '/api/kpi',
      approvals: '/api/approvals',
      revenue: '/api/revenue',
      messages: '/api/messages'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    status: err.status || 500
  });

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Lỗi server'
    : err.message;

  res.status(err.status || 500).json({
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 - Route not found:', {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    url: req.url,
    headers: {
      origin: req.headers.origin,
      'content-type': req.headers['content-type'],
    }
  });
  res.status(404).json({
    message: 'Route không tìm thấy',
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    url: req.url
  });
});

const PORT = process.env.PORT || 5000;

// Export app for Vercel
export default app;

// Start server (skip if running on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server đang chạy trên port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}`);
    logger.info(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}`);
  });
}