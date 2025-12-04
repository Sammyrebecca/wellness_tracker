const cors = require('cors');
const { getEnv } = require('./env');

const { corsOrigins } = getEnv();

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (corsOrigins.length === 0) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

const corsMiddleware = cors(corsOptions);

module.exports = { corsMiddleware };
