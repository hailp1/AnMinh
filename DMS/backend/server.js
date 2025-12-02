import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import logger from './lib/logger.js';
import path from 'path';

// Routes imports
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
import permissionsRoutes from './routes/permissions.js';

config();

const app = express();

// Trust proxy
app.set('trust proxy', true);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS handled by Nginx now
// app.use(cors()); 

// Helmet
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
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
app.use('/api/permissions', permissionsRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'An Minh Business System API', version: '1.0.0' });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Lỗi server', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;