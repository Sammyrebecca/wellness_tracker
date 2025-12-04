const Entry = require('../models/Entry');
const { rangeDaysInclusive, addDaysUTC, startOfDayUTC } = require('../utils/date');
const { computeStreaks } = require('./streak.service');

async function aggregateWindow(userId, start, end) {
  const match = { userId, date: { $gte: start, $lte: end } };
  const [agg] = await Entry.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        avgMood: { $avg: '$mood' },
        avgSleep: { $avg: '$sleep' },
        avgWater: { $avg: '$water' },
        totalSteps: { $sum: '$steps' }
      }
    }
  ]);
  return {
    averages: {
      mood: agg ? Number(agg.avgMood.toFixed(2)) : 0,
      sleep: agg ? Number(agg.avgSleep.toFixed(2)) : 0,
      water: agg ? Number(agg.avgWater.toFixed(2)) : 0
    },
    totalSteps: agg ? agg.totalSteps : 0
  };
}

async function getStats(userId, window = 7) {
  window = [7, 14, 30].includes(Number(window)) ? Number(window) : 7;
  const today = startOfDayUTC(new Date());
  const { start: curStart, end: curEnd } = rangeDaysInclusive(today, window);
  const { start: prevStart, end: prevEnd } = { start: addDaysUTC(curStart, -window), end: addDaysUTC(curEnd, -window) };

  const [current, previous, streak] = await Promise.all([
    aggregateWindow(userId, curStart, curEnd),
    aggregateWindow(userId, prevStart, prevEnd),
    computeStreaks(userId)
  ]);

  const trend = {
    moodDelta: Number((current.averages.mood - previous.averages.mood).toFixed(2)),
    sleepDelta: Number((current.averages.sleep - previous.averages.sleep).toFixed(2)),
    stepsDelta: current.totalSteps - previous.totalSteps,
    waterDelta: Number((current.averages.water - previous.averages.water).toFixed(2))
  };

  return { ...current, streak, trend };
}

module.exports = { getStats };
