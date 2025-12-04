const bcrypt = require('bcrypt');
const User = require('../models/User');

async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('Email already registered');
    err.code = 'CONFLICT';
    throw err;
  }
  const user = new User({ name, email, password });
  await user.save();
  return user;
}

async function authenticate({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return user;
}

async function getById(id) {
  return User.findById(id).select('-password');
}

async function updateMe(id, updates) {
  if (updates.password) delete updates.password;
  if (updates.email) delete updates.email;
  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  return user;
}

async function setCurrentStreak(id, streak) {
  await User.findByIdAndUpdate(id, { streak });
}

module.exports = { register, authenticate, getById, updateMe, setCurrentStreak };
