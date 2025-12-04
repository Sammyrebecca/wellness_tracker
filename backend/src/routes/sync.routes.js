const express = require('express');
const router = express.Router();
const {
  registerDevice,
  getSyncedDevices,
  removeDevice,
  syncUserData,
  getSyncStatus,
  exportUserData
} = require('../services/sync.service');

// Register a device for cloud sync
router.post('/devices', async(req, res, next) => {
  try {
    const { deviceName, platform } = req.body;
    const result = await registerDevice(req.user.id, { deviceName, platform });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Get all synced devices
router.get('/devices', async(req, res, next) => {
  try {
    const devices = await getSyncedDevices(req.user.id);
    res.json({ devices });
  } catch (err) {
    next(err);
  }
});

// Remove a device
router.delete('/devices/:deviceId', async(req, res, next) => {
  try {
    const result = await removeDevice(req.user.id, req.params.deviceId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Sync user data
router.get('/data', async(req, res, next) => {
  try {
    const { lastSync } = req.query;
    const data = await syncUserData(req.user.id, lastSync);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get sync status
router.get('/status', async(req, res, next) => {
  try {
    const status = await getSyncStatus(req.user.id);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

// Export user data (JSON or CSV)
router.get('/export', async(req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const result = await exportUserData(req.user.id, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.filename}"`
      );
      res.send(result.data);
    } else {
      res.json(result);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
