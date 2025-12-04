const express = require('express');
const router = express.Router();
const {
  scheduleReminder,
  cancelReminder,
  getScheduledReminders
} = require('../services/reminders.service');

// Update reminder settings
router.put('/', async(req, res, next) => {
  try {
    const { reminderTime, remindersEnabled } = req.body;
    if (!reminderTime && remindersEnabled === undefined) {
      return res.status(400).json({ error: 'Missing reminder configuration' });
    }

    if (remindersEnabled === false) {
      cancelReminder(req.user.id);
      return res.json({ message: 'Reminders disabled' });
    }

    const result = await scheduleReminder(req.user.id);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get reminder status
router.get('/status', async(req, res, next) => {
  try {
    const scheduled = getScheduledReminders();
    const isScheduled = scheduled.includes(req.user.id.toString());
    res.json({ scheduled: isScheduled, allScheduled: scheduled.length });
  } catch (err) {
    next(err);
  }
});

// Cancel reminders
router.delete('/', async(req, res, next) => {
  try {
    const result = cancelReminder(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
