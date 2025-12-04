const cron = require('node-cron');
const User = require('../models/User');
const Entry = require('../models/Entry');

const scheduledJobs = new Map();

/**
 * Schedule a reminder for a user based on their preference
 */
async function scheduleReminder(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.preferences?.remindersEnabled) {
      return null;
    }

    const reminderTime = user.preferences?.reminderTime || '09:00';
    const [hours, minutes] = reminderTime.split(':').map(Number);

    // Remove existing job if any
    if (scheduledJobs.has(userId.toString())) {
      const job = scheduledJobs.get(userId.toString());
      job.stop();
      scheduledJobs.delete(userId.toString());
    }

    // Schedule new job: runs at specified time every day
    const cronExpression = `${minutes} ${hours} * * *`;
    const job = cron.schedule(
      cronExpression,
      async function sendReminder(userId) {
        await sendReminder(userId);
      }
    );

    scheduledJobs.set(userId.toString(), job);
    return { scheduled: true, time: reminderTime };
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return null;
  }
}

/**
 * Send a reminder to the user (or log it for manual delivery)
 * In a production system, this would integrate with email/SMS/push notification service
 */
async function sendReminder(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if user has already checked in today
    const existingEntry = await Entry.findOne({
      userId,
      date: today
    });

    if (existingEntry) {
      // User already checked in today
      return { status: 'already_checked_in' };
    }

    // Create reminder notification object
    const reminder = {
      userId,
      timestamp: new Date(),
      message:
        'Time for your daily wellness check-in! How are you feeling today?',
      type: 'daily_checkin',
      read: false
    };

    // TODO: Implement actual notification delivery
    // Options:
    // 1. Email: Send via SMTP (nodemailer)
    // 2. SMS: Send via Twilio
    // 3. Push: Send via Firebase Cloud Messaging
    // 4. In-app: Store in database and show on login

    console.log(`📬 Reminder sent to user ${userId} at ${reminder.timestamp}`);
    return reminder;
  } catch (error) {
    console.error('Error sending reminder:', error);
    return null;
  }
}

/**
 * Cancel a scheduled reminder
 */
function cancelReminder(userId) {
  const userIdStr = userId.toString();
  if (scheduledJobs.has(userIdStr)) {
    const job = scheduledJobs.get(userIdStr);
    job.stop();
    scheduledJobs.delete(userIdStr);
    return { cancelled: true };
  }
  return { cancelled: false };
}

/**
 * Initialize reminders for all active users on server startup
 */
async function initializeAllReminders() {
  try {
    const users = await User.find({ 'preferences.remindersEnabled': true });
    let scheduled = 0;

    for (const user of users) {
      const result = await scheduleReminder(user._id);
      if (result?.scheduled) scheduled++;
    }

    console.log(`Initialized ${scheduled} reminders for active users`);
    return scheduled;
  } catch (error) {
    console.error('Error initializing reminders:', error);
    return 0;
  }
}

/**
 * Get all scheduled reminders (for debugging/admin)
 */
function getScheduledReminders() {
  return Array.from(scheduledJobs.keys());
}

module.exports = {
  scheduleReminder,
  sendReminder,
  cancelReminder,
  initializeAllReminders,
  getScheduledReminders
};
