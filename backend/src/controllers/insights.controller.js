const Joi = require('joi');
const { getInsights } = require('../services/insights.service');

const querySchema = Joi.object({
  window: Joi.number().valid(7, 14, 30).optional()
});

async function insights(req, res, next) {
  try {
    const { value, error } = querySchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) { error.isJoi = true; throw error; }
    const result = await getInsights(req.user.id, value.window || 14);
    return res.json(result);
  } catch (err) { next(err); }
}

module.exports = { insights };

