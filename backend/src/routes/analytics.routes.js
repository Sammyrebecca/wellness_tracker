const express = require('express');
const router = express.Router();
const { correlation } = require('../controllers/analytics.controller');
const { auth } = require('../middlewares/auth');

router.get('/correlation', auth, correlation);

module.exports = router;

