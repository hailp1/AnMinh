import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from 'dotenv';
config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
import authRoutes from './routes/auth.js';
import stationsRoutes from './routes/stations.js';
import usersRoutes from './routes/users.js';

app.use('/api/auth', authRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5000;

// Export app for Vercel
export default app;

// Only listen if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
  });
}