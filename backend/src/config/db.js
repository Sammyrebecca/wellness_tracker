const mongoose = require('mongoose');
const { getEnv } = require('./env');

async function connectDB() {
  const { mongoUri, nodeEnv } = getEnv();
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: nodeEnv !== 'production'
  });
}

module.exports = { connectDB };
