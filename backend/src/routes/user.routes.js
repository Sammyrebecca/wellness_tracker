const express = require('express');
const router = express.Router();
const { me, updateProfile, deleteAccount } = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth');

router.get('/me', auth, me);
router.put('/me', auth, updateProfile);
router.delete('/me', auth, deleteAccount); // 501 for now

module.exports = router;
