import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
config();

const app = express();

// Security: enforce presence of strong JWT secret in production
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret === 'your-secret-key-change-in-production') {
    console.error('Security error: JWT_SECRET is missing or too weak. Set a strong secret (>=32 chars).');
    process.exit(1);
  }
}

// Middleware
// CORS whitelist
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3099',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3099',
  'https://sales.ammedtech.com',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser clients
    return allowedOrigins.has(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
}));

// Secure headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Body limit
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static('uploads'));

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
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

const PORT = process.env.PORT || 5000;

// Export app for Vercel
export default app;

// Start server (skip if running on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy trên port ${PORT}`);
  });
}