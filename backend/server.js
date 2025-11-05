require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  const server = http.createServer(app);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

