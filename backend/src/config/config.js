const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Financial APIs
  fmpKey: process.env.FMP_API_KEY || '',
  newsApiKey: process.env.NEWS_API_KEY || '',
  geminiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '',

  // Proxy
  proxyHost: process.env.PROXY_HOST,
  proxyPort: process.env.PROXY_PORT,
  proxyUsername: process.env.PROXY_USERNAME,
  proxyPassword: process.env.PROXY_PASSWORD,

  // MongoDB
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/vestro',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'vestro-jwt-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'vestro-refresh-secret-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  refreshExpiry: process.env.REFRESH_EXPIRY || '7d',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Email (Nodemailer)
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'Vestro AI <noreply@vestro.ai>',
};

module.exports = config;
