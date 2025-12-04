const express = require('express');
const router = express.Router();
const { exportCSV } = require('../controllers/export.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, exportCSV);

module.exports = router;
