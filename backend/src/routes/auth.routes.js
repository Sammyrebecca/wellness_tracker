const express = require('express');
const router = express.Router();
const { handleRegister, handleLogin, handleLogout } = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimit');

router.post('/register', authLimiter, handleRegister);
router.post('/login', authLimiter, handleLogin);
router.post('/logout', handleLogout);

module.exports = router;

