const { errorResponse } = require('../utils/responses');

function notFoundHandler(_req, res, _next) {
  return errorResponse(res, 404, 'NOT_FOUND', 'Route not found');
}

function errorHandler(err, _req, res, _next) {
  if (res.headersSent) return;

  if (err.isJoi) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Validation failed', err.details?.map((d) => d.message));
  }

  // Mongo duplicate key
  if (err && err.code === 11000) {
    return errorResponse(res, 409, 'CONFLICT', 'Resource already exists');
  }

  const map = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422
  };

  if (err && err.code && map[err.code]) {
    return errorResponse(res, map[err.code], err.code, err.message || 'Error');
  }

  // eslint-disable-next-line no-console
  if (process.env.NODE_ENV !== 'test') console.error(err);
  return errorResponse(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
}

module.exports = { errorHandler, notFoundHandler };
