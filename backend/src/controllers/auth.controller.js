const Joi = require('joi');
const { register, authenticate } = require('../services/user.service');
const { signToken } = require('../services/token.service');
const { errorResponse } = require('../utils/responses');

const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

async function handleRegister(req, res, next) {
  try {
    const { value, error } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) { error.isJoi = true; throw error; }
    const user = await register(value);
    const token = signToken(user);
    return res.status(201).json({ token, user: user.toJSON() });
  } catch (err) { next(err); }
}

async function handleLogin(req, res, next) {
  try {
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) { error.isJoi = true; throw error; }
    const user = await authenticate(value);
    if (!user) return errorResponse(res, 401, 'UNAUTHORIZED', 'Invalid credentials');
    const token = signToken(user);
    return res.json({ token, user: user.toJSON() });
  } catch (err) { next(err); }
}

async function handleLogout(_req, res) {
  // Stateless logout; client discards token. Placeholder for blacklist hook.
  return res.status(204).send();
}

module.exports = { handleRegister, handleLogin, handleLogout };

