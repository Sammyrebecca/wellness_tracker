const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Validate that API key is configured
if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('OPENAI_API_KEY not configured. AI features will be limited.');
}

module.exports = openai;
