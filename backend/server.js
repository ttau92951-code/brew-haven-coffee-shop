import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { pingRedis } from './config/redis.js';
import { seedDatabase } from './data/store.js';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// CORS configuration
// -----------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin, tooling and server-to-server calls
  if (allowedOrigins.includes(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return /\.vercel\.app$/.test(origin) || /\.netlify\.app$/.test(origin);
}

app.use(
  cors({
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin))
  })
);

// Uploaded images are sent as base64 data URLs, so the body limit is generous.
app.use(express.json({ limit: '2mb' }));

// -----------------------------
// System endpoints
// -----------------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Brew Haven API',
    version: '1.0.0'
  });
});

app.get('/api/health', async (req, res) => {
  const timestamp = new Date().toISOString();

  try {
    await pingRedis();

    res.json({
      success: true,
      message: 'Brew Haven API is healthy',
      database: 'connected',
      timestamp
    });
  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(503).json({
      success: false,
      message: 'API is running but the database is unavailable',
      database: 'disconnected',
      timestamp
    });
  }
});

// -----------------------------
// Feature routes
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/settings', settingsRoutes);

// -----------------------------
// Error handling
// -----------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// -----------------------------
// Start-up
// -----------------------------
async function start() {
  try {
    await pingRedis();
    console.log('Connected to the Upstash Redis database.');
    await seedDatabase();
  } catch (error) {
    console.error('Warning: could not reach Redis at start-up:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Brew Haven server running at http://localhost:${PORT}`);
  });
}

start();

export default app;
