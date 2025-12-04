const rateLimit = require('express-rate-limit');
const { getEnv } = require('../config/env');

const { rateLimitWindowMs, rateLimitMax } = getEnv();

const authLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter };
