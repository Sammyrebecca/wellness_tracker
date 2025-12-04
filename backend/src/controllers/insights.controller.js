const Joi = require('joi');
const { generateAISuggestions } = require('../services/ai.service');

const querySchema = Joi.object({
  window: Joi.number().valid(7, 14, 30).optional(),
  useAI: Joi.boolean().optional()
});

async function insights(req, res, next) {
  try {
    const { value, error } = querySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      error.isJoi = true;
      throw error;
    }

    const useAI = value.useAI !== false; // Default to AI suggestions
    const result = await generateAISuggestions(req.user.id, value.window || 14);

    return res.json({
      tips: result,
      aiGenerated: useAI,
      window: value.window || 14
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { insights };
