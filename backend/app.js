require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const { connectDB } = require('./src/config/db');
const { getRedisClient } = require('./src/config/redis');
const {
  apiLimiter, authLimiter, researchLimiter, simulatorLimiter, chatLimiter, searchLimiter,
} = require('./src/middleware/ratelimit.middleware');

// Routes — existing
const researchRoutes = require('./src/routes/research.routes');
const searchRoutes = require('./src/routes/search.routes');

// Routes — new Phase 1
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const portfolioRoutes = require('./src/routes/portfolio.routes');
const watchlistRoutes = require('./src/routes/watchlist.routes');
const historyRoutes = require('./src/routes/history.routes');
const reportsRoutes = require('./src/routes/reports.routes');
const chatRoutes = require('./src/routes/chat.routes');
const simulatorRoutes = require('./src/routes/simulator.routes');
const notificationsRoutes = require('./src/routes/notifications.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');

const config = require('./src/config/config');

const app = express();

// ─── Trust proxy (Render / any reverse proxy) ────────────────────────────────
// Required so express-rate-limit can read the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

// ─── Connect MongoDB ──────────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Handled by frontend
}));

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://[::1]:5173',
  config.frontendUrl,
  config.clientUrl,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Performance Middleware ───────────────────────────────────────────────────
app.use(compression());

// ─── Logging ─────────────────────────────────────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else if (config.nodeEnv !== 'test') {
  // Production: compact single-line log — method, url, status, response time
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Sanitization (XSS + NoSQL Injection) ────────────────────────────────────
app.use(mongoSanitize()); // Prevents NoSQL injection via query operators
app.use(xss());           // Strips XSS payloads from request bodies

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    version: '2.0.0',
  });
});

// ─── Global rate limit ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Existing Routes (preserved as-is) ───────────────────────────────────────
app.use('/api/research', researchLimiter, researchRoutes);
app.use('/api/search', searchLimiter, searchRoutes);

// ─── New Phase 1 Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/simulator', simulatorLimiter, simulatorRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (config.nodeEnv === 'development') {
    console.error(err);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`✓ Vestro AI 2.0 server running on port ${PORT} [${config.nodeEnv}]`);
  // Initialise Redis lazily (non-blocking)
  getRedisClient();
});
