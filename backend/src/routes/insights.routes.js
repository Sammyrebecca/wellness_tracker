const express = require('express');
const router = express.Router();
const { insights } = require('../controllers/insights.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, insights);

module.exports = router;
