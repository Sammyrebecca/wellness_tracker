const Joi = require('joi');
const { getStats } = require('../services/stats.service');

const querySchema = Joi.object({
  window: Joi.number().valid(7, 14, 30).optional()
});

async function stats(req, res, next) {
  try {
    const { value, error } = querySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) { error.isJoi = true; throw error; }
    const result = await getStats(req.user.id, value.window || 7);
    return res.json(result);
  } catch (err) { next(err); }
}

module.exports = { stats };
