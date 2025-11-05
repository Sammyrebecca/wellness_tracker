const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

function signToken(user) {
  const { jwtSecret, jwtExpiresIn } = getEnv();
  const payload = { sub: user._id.toString(), email: user.email, name: user.name };
  return jwt.sign(payload, jwtSecret, { algorithm: 'HS256', expiresIn: jwtExpiresIn });
}

function verifyToken(token) {
  const { jwtSecret } = getEnv();
  return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
}

module.exports = { signToken, verifyToken };

