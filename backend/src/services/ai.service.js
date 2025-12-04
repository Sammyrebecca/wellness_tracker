const openai = require('../config/openai');
const { getStats } = require('./stats.service');
const User = require('../models/User');

/**
 * Generate personalized AI-based micro-suggestions using OpenAI
 * Falls back to rule-based suggestions if API is unavailable
 */
async function generateAISuggestions(userId, window = 14) {
  try {
    const [stats, user] = await Promise.all([
      getStats(userId, window),
      User.findById(userId)
    ]);

    if (!process.env.OPENAI_API_KEY || !openai) {
      // Fallback to rule-based suggestions
      return generateRuleBasedSuggestions(stats, user, window);
    }

    const prefs = user?.preferences || {};
    const prompt = buildSuggestionPrompt(stats, user, window, prefs);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a supportive wellness coach providing personalized, actionable micro-suggestions. Keep responses brief (1-2 sentences), specific, and encouraging. Format as a JSON array of strings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    // Parse response - expect JSON array
    const content = response.choices[0]?.message?.content || '';
    const suggestions = JSON.parse(content);

    return Array.isArray(suggestions)
      ? suggestions
      : generateRuleBasedSuggestions(stats, user, window);
  } catch (error) {
    console.error('Error generating AI suggestions:', error.message);
    // Gracefully fallback to rule-based suggestions
    const stats = await getStats(userId, window);
    const user = await User.findById(userId);
    return generateRuleBasedSuggestions(stats, user, window);
  }
}

/**
 * Build a detailed prompt for AI suggestions based on user data
 */
function buildSuggestionPrompt(stats, user, window, prefs) {
  const stepGoal = prefs.stepGoal || 10000;
  const waterGoal = prefs.waterGoal || 3;
  const sleepGoal = prefs.sleepGoal || 7;

  const stepPercentage = Math.round(
    (stats.totalSteps / window / stepGoal) * 100
  );
  const waterPercentage = Math.round((stats.averages.water / waterGoal) * 100);
  const sleepPercentage = Math.round((stats.averages.sleep / sleepGoal) * 100);

  return `
    User wellness data (${window} days):
    - Average mood: ${stats.averages.mood}/5 (trend: ${
    stats.trend.moodDelta >= 0 ? 'improving' : 'declining'
  })
    - Average sleep: ${
      stats.averages.sleep
    }h (goal: ${sleepGoal}h, ${sleepPercentage}%)
    - Average steps: ${Math.round(
      stats.totalSteps / window
    )} (goal: ${stepGoal}, ${stepPercentage}%)
    - Average water: ${
      stats.averages.water
    }L (goal: ${waterGoal}L, ${waterPercentage}%)
    - Current streak: ${stats.streak?.current || 0} days
    - Focus area: ${prefs.focusArea || 'overall wellness'}

    Provide 3-4 personalized, actionable micro-suggestions (1-2 sentences each) to improve the user's weakest areas. Return as JSON array of strings.
  `;
}

/**
 * Rule-based fallback suggestions (used when OpenAI API is unavailable)
 */
function generateRuleBasedSuggestions(stats, user, window) {
  const tips = [];
  const prefs = user?.preferences || {};
  const stepGoal = prefs.stepGoal || 10000;
  const waterGoal = prefs.waterGoal || 3;
  const sleepGoal = prefs.sleepGoal || 7;

  // Rule 1: Sleep optimization
  if (stats.averages.sleep < sleepGoal - 1) {
    tips.push(
      'Sleep boost: Aim for ' +
        sleepGoal +
        'h by keeping a consistent bedtime. Try the 10-3-2-1-0 rule: no caffeine 10h before, no food/wine 3h before, no work 2h before, no screens 1h before, and zero times hitting snooze.'
    );
  } else if (stats.averages.sleep >= sleepGoal) {
    tips.push(
      "Excellent sleep consistency—you're crushing it! Consider a gentle morning routine to maintain this momentum."
    );
  }

  // Rule 2: Steps and movement
  const avgStepsPerDay = Math.round(stats.totalSteps / Math.max(1, window));
  if (avgStepsPerDay < stepGoal * 0.5) {
    tips.push(
      'Movement matters: Add a 10-15 min walk after lunch or dinner. Even small walks compound to big health wins.'
    );
  } else if (avgStepsPerDay < stepGoal) {
    tips.push(
      "Almost there: You're at " +
        avgStepsPerDay.toLocaleString() +
        ' steps/day. Try a 5-min staircase burst or parking further away to hit ' +
        stepGoal.toLocaleString() +
        '.'
    );
  } else {
    tips.push(
      "Fantastic step count! You're exceeding your goal—keep up this active lifestyle."
    );
  }

  // Rule 3: Hydration
  if (stats.averages.water < waterGoal * 0.7) {
    tips.push(
      'Hydration hack: Keep a 500ml bottle visible and refill at meals. Aim for ' +
        waterGoal +
        'L by evening.'
    );
  } else if (stats.averages.water < waterGoal) {
    tips.push(
      "Almost hydrated: You're at " +
        stats.averages.water.toFixed(1) +
        'L—add one more glass to hit your ' +
        waterGoal +
        'L goal.'
    );
  }

  // Rule 4: Mood trend
  if (stats.trend.moodDelta < -0.5) {
    tips.push(
      'Mood dip detected: Pair light movement with outdoor time or connect with a friend. Small actions boost wellbeing.'
    );
  } else if (stats.trend.moodDelta > 0.5) {
    tips.push(
      'Your mood is trending up—great work! Share your wins to stay motivated.'
    );
  }

  // Rule 5: Streak and consistency
  if ((stats.streak?.current || 0) < 3) {
    tips.push(
      'Build your streak: Just ' +
        (3 - (stats.streak?.current || 0)) +
        ' more check-ins to a 3-day win. Set a daily reminder.'
    );
  } else if ((stats.streak?.current || 0) >= 7) {
    tips.push(
      'Amazing streak of ' +
        stats.streak.current +
        " days—you're unstoppable! Keep the momentum."
    );
  }

  // Reorder by focus area
  if (prefs.focusArea) {
    const idx = tips.findIndex((t) =>
      t.toLowerCase().includes(prefs.focusArea)
    );
    if (idx > 0) {
      const [t] = tips.splice(idx, 1);
      tips.unshift(t);
    }
  }

  return tips.slice(0, 4); // Return top 4 suggestions
}

module.exports = {
  generateAISuggestions,
  generateRuleBasedSuggestions
};
