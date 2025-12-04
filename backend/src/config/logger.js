const { randomUUID } = require('node:crypto');

const logger = {
  requestId: (req, _res, next) => {
    req.id = randomUUID();
    next();
  }
};

module.exports = { logger };
