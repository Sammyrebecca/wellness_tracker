const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

function getEnv() {
  const cfg = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '10', 10)
  };

  const missing = REQUIRED_VARS.filter((k) => !cfg[k === 'MONGO_URI' ? 'mongoUri' : k === 'JWT_SECRET' ? 'jwtSecret' : k]);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(`Warning: Missing required env vars: ${missing.join(', ')}`);
  }
  return cfg;
}

module.exports = { getEnv };
