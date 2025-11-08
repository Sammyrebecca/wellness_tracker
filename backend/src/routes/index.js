const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', require('./auth.routes'));
router.use('/', require('./user.routes'));
router.use('/entries', require('./entry.routes'));
router.use('/stats', require('./stats.routes'));
router.use('/insights', require('./insights.routes'));

// Export
router.use('/export', require('./export.routes'));

module.exports = router;
