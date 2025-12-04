const { verifyToken } = require('../services/token.service');
const { errorResponse } = require('../utils/responses');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    return errorResponse(res, 401, 'UNAUTHORIZED', 'Missing or invalid Authorization header');
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch (_e) {
    return errorResponse(res, 401, 'UNAUTHORIZED', 'Invalid token');
  }
}

module.exports = { auth };
