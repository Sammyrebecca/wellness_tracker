const { getAchievements } = require('../services/achievements.service');

async function achievements(req, res, next) {
  try {
    const data = await getAchievements(req.user.id);
    return res.json(data);
  } catch (err) { next(err); }
}

module.exports = { achievements };

