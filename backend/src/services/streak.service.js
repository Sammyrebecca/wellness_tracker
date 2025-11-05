const Entry = require('../models/Entry');
const { startOfDayUTC, addDaysUTC } = require('../utils/date');
const { setCurrentStreak } = require('./user.service');

function isSameDayUTC(a, b) {
  return startOfDayUTC(a).getTime() === startOfDayUTC(b).getTime();
}

async function computeStreaks(userId) {
  const entries = await Entry.find({ userId }).sort({ date: 1 }).select('date');
  if (entries.length === 0) return { current: 0, longest: 0 };

  // Longest streak across all
  let longest = 1;
  let currentRun = 1;
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1].date;
    const cur = entries[i].date;
    const expected = addDaysUTC(prev, 1);
    if (isSameDayUTC(cur, expected)) {
      currentRun += 1;
      if (currentRun > longest) longest = currentRun;
    } else {
      currentRun = 1;
    }
  }

  // Current streak up to today
  let current = 0;
  const today = startOfDayUTC(new Date());
  const set = new Set(entries.map((e) => startOfDayUTC(e.date).getTime()));
  for (let d = today; ; d = addDaysUTC(d, -1)) {
    if (set.has(d.getTime())) {
      current += 1;
    } else {
      break;
    }
  }
  return { current, longest };
}

async function recomputeStreaks(userId) {
  const res = await computeStreaks(userId);
  await setCurrentStreak(userId, res.current);
  return res;
}

module.exports = { computeStreaks, recomputeStreaks };

