import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import { connectKafka, disconnectKafka } from '../kafka/client.js';
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import leadRoutes from './routes/lead.routes.js';
import activityRoutes from './routes/activity.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/errorHandler.js';
import { validateConfig } from './config/env.js';

const app = express();
const config = validateConfig();
const PORT = config.PORT;

// Security middleware
app.use(helmet());
app.set('trust proxy', config.TRUST_PROXY ? 1 : false);
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'degraded',
    database: databaseReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
let httpServer;
let shuttingDown = false;
const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\n🔄 Shutting down gracefully...');
  if (httpServer) await new Promise(resolve => httpServer.close(resolve));
  await Promise.allSettled([disconnectKafka(), mongoose.disconnect()]);
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await connectKafka();

    httpServer = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
