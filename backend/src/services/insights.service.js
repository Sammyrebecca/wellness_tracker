const { getStats } = require('./stats.service');
const User = require('../models/User');

async function getInsights(userId, window = 14) {
  const w = [7, 14, 30].includes(Number(window)) ? Number(window) : 14;
  const [stats, user] = await Promise.all([
    getStats(userId, w),
    User.findById(userId)
  ]);

  const tips = [];
  const prefs = user?.preferences || {};
  const stepGoal = prefs.stepGoal || 10000;
  const waterGoal = prefs.waterGoal || 3;
  const sleepGoal = prefs.sleepGoal || 7;

  if (stats.averages.sleep < sleepGoal) {
    tips.push(`Aim for ${sleepGoal}h sleep: keep a consistent bedtime and reduce screens 1h before bed.`);
  } else {
    tips.push('Great sleep consistency—consider a gentle morning routine to maintain momentum.');
  }

  const avgStepsPerDay = Math.round((stats.totalSteps / Math.max(1, w)));
  if (avgStepsPerDay < stepGoal) {
    tips.push(`Add a 10–15 min walk after meals to approach your ${stepGoal.toLocaleString()} steps/day goal.`);
  }

  if (stats.averages.water < waterGoal) {
    tips.push(`Hydration boost: carry a bottle and target ${(waterGoal).toFixed(1)}L across your day.`);
  }

  if (stats.trend.moodDelta < 0) {
    tips.push('Mood dipped vs prior period; pair light movement with short outdoor breaks.');
  }

  if ((stats.streak?.current || 0) < 3) {
    if (prefs.reminderTime) {
      tips.push(`Stick with your ${prefs.reminderTime} reminder—consistency builds streaks.`);
    } else {
      tips.push('Set a daily reminder time in Settings to build your streak.');
    }
  }

  // Focus area prioritization
  if (prefs.focusArea) {
    const idx = tips.findIndex(t => t.toLowerCase().includes(prefs.focusArea));
    if (idx > 0) {
      const [t] = tips.splice(idx, 1);
      tips.unshift(t);
    }
  }

  return { window: w, tips };
}

module.exports = { getInsights };
