require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./src/config/db');
const { initializeAllReminders } = require('./src/services/reminders.service');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();

  // Initialize reminders for users with reminders enabled
  if (process.env.ENABLE_REMINDERS === 'true') {
    await initializeAllReminders();
  }

  const server = http.createServer(app);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
    console.log(`Features enabled:
      - AI Suggestions: ${
        process.env.ENABLE_AI_SUGGESTIONS !== 'false' ? 'YES' : 'NO'
      }
      - Reminders: ${process.env.ENABLE_REMINDERS !== 'false' ? 'YES' : 'NO'}
      - Cloud Sync: ${process.env.ENABLE_CLOUD_SYNC !== 'false' ? 'YES' : 'NO'}
    `);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
