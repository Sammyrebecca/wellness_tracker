const express = require('express');
const router = express.Router();
const { stats } = require('../controllers/stats.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, stats);

module.exports = router;

