const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/auth', require('./auth.routes'));
router.use('/', require('./user.routes'));
router.use('/entries', require('./entry.routes'));
router.use('/stats', require('./stats.routes'));

// Export & other stubs
router.get('/export', (_req, res) => res.status(501).json({ message: 'TODO: Export not implemented' }));

module.exports = router;
