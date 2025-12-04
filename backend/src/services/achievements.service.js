const Entry = require('../models/Entry');
const { computeStreaks } = require('./streak.service');
const { startOfDayUTC, addDaysUTC } = require('../utils/date');

async function getAchievements(userId) {
  const [streaks, firstEntry, totals, maxStepsDoc, last30] = await Promise.all([
    computeStreaks(userId),
    Entry.findOne({ userId }).sort({ date: 1 }).select('date'),
    Entry.aggregate([
      { $match: { userId } },
      { $group: { _id: null, count: { $sum: 1 }, totalSteps: { $sum: '$steps' }, avgWater: { $avg: '$water' } } }
    ]),
    Entry.findOne({ userId }).sort({ steps: -1 }).select('steps date'),
    (async() => {
      const end = startOfDayUTC(new Date());
      const start = addDaysUTC(end, -29);
      const items = await Entry.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }).select('sleep mood water steps date');
      return items;
    })()
  ]);

  const totalsObj = totals?.[0] || { count: 0, totalSteps: 0, avgWater: 0 };
  const achievements = [];

  achievements.push({ id: 'first-checkin', title: 'First Check-In', desc: 'Logged your first day', earned: totalsObj.count >= 1, meta: firstEntry?.date });
  achievements.push({ id: 'streak-7', title: '7-Day Streak', desc: 'Checked in 7 days in a row', earned: (streaks.longest || 0) >= 7, meta: streaks.longest });
  achievements.push({ id: 'streak-30', title: '30-Day Streak', desc: 'Consistency over a month', earned: (streaks.longest || 0) >= 30, meta: streaks.longest });
  achievements.push({ id: 'steps-10k-day', title: '10k Day', desc: 'Hit 10,000 steps in a day', earned: (maxStepsDoc?.steps || 0) >= 10000, meta: maxStepsDoc?.date });
  achievements.push({ id: 'steps-100k-total', title: '100k Total Steps', desc: 'Reached 100,000 all-time steps', earned: (totalsObj.totalSteps || 0) >= 100000, meta: totalsObj.totalSteps });

  // Sleep consistency: 7 nights with >= sleepGoal (default 7h) over last 30 days
  const sleepGoal = 7; // can be personalized later
  const sleepNights = last30.filter(e => (e.sleep || 0) >= sleepGoal).length;
  achievements.push({ id: 'sleep-7n', title: 'Rested Week', desc: `7 nights of ≥${sleepGoal}h sleep`, earned: sleepNights >= 7, meta: sleepNights });

  // Hydration: avg water >= 2.5L lifetime
  achievements.push({ id: 'hydration-avg', title: 'Hydration Hero', desc: 'Average ≥2.5L water intake', earned: (totalsObj.avgWater || 0) >= 2.5, meta: totalsObj.avgWater });

  return { streaks, totals: totalsObj, achievements };
}

module.exports = { getAchievements };
