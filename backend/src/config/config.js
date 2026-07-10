const config = {
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  fmpKey: process.env.FMP_API_KEY || '',
  newsApiKey: process.env.NEWS_API_KEY || '',
  geminiKey: process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  proxyHost: process.env.PROXY_HOST,
  proxyPort: process.env.PROXY_PORT,
  proxyUsername: process.env.PROXY_USERNAME,
  proxyPassword: process.env.PROXY_PASSWORD,
};

module.exports = config;
