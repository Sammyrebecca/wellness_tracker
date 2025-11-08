const express = require('express');
const router = express.Router();
const { achievements } = require('../controllers/achievements.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, achievements);

module.exports = router;

