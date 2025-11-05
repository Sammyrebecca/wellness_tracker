require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Entry = require('../models/Entry');
const { startOfDayUTC, addDaysUTC } = require('../utils/date');

async function main() {
  await connectDB();
  await User.deleteMany({});
  await Entry.deleteMany({});

  const user = new User({ name: 'Demo User', email: 'demo@example.com', password: 'password' });
  await user.save();

  const today = startOfDayUTC(new Date());
  const entries = [];
  for (let i = 0; i < 30; i++) {
    const d = addDaysUTC(today, -i);
    // realistic-ish values
    const mood = 3 + Math.round((Math.random() - 0.5) * 2);
    const sleep = Math.max(0, Math.min(24, 6 + Math.random() * 2));
    const steps = Math.floor(5000 + Math.random() * 6000);
    const water = Math.max(0, Math.min(15, 1.5 + Math.random() * 1.5));
    entries.push({ userId: user._id, date: d, mood, sleep: Number(sleep.toFixed(1)), steps, water: Number(water.toFixed(1)), notes: '' });
  }
  await Entry.insertMany(entries);
  // eslint-disable-next-line no-console
  console.log('Seeded demo user and 30 entries. Login with demo@example.com / password');
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
