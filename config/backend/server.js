import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import pppRoutes from './routes/pppRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import db from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.coingecko.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'ACT COIN Backend API',
    database: db.isDemoMode() ? 'demo' : 'postgresql'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'ACT COIN API',
    version: '1.0.0',
    description: 'PPP-based cryptocurrency platform API',
    mode: db.isDemoMode() ? 'DEMO' : 'PRODUCTION',
    endpoints: {
      auth: '/api/auth',
      ppp: '/api/ppp',
      transactions: '/api/transactions'
    },
    documentation: '/api/docs'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/ppp', pppRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await db.initDatabase();
    console.log(`📦 Database mode: ${db.isDemoMode() ? 'DEMO (in-memory)' : 'PostgreSQL'}`);
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🪙  ACT COIN Backend API                                ║
║   ─────────────────────────────────────────               ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║   Database: ${db.isDemoMode() ? 'DEMO' : 'PostgreSQL'}                                ║
║                                                           ║
║   Endpoints:                                              ║
║   • Health:       GET  /health                            ║
║   • API Info:     GET  /api                               ║
║   • Auth:         POST /api/auth/*                        ║
║   • PPP Data:     GET  /api/ppp/*                         ║
║   • Transactions: GET/POST /api/transactions/*            ║
║                                                           ║
║   Status: 🟢 Operational                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
