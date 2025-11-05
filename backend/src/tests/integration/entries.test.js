const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();
const app = require('../../../app');
const { connectDB } = require('../../config/db');
const User = require('../../models/User');
const Entry = require('../../models/Entry');

describe('Entries and stats', () => {
  let token;
  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await Entry.deleteMany({});
    const reg = await request(app).post('/api/auth/register').send({ name: 'User', email: 'e@example.com', password: 'secret1' });
    token = reg.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('creates single entry per day and computes stats', async () => {
    const body = { date: new Date().toISOString(), mood: 4, sleep: 7.5, steps: 8000, water: 2.2 };
    const r1 = await request(app).post('/api/entries').set('Authorization', `Bearer ${token}`).send(body);
    expect(r1.status).toBe(201);

    const r2 = await request(app).post('/api/entries').set('Authorization', `Bearer ${token}`).send(body);
    expect(r2.status).toBe(409);

    const stats = await request(app).get('/api/stats?window=7').set('Authorization', `Bearer ${token}`);
    expect(stats.status).toBe(200);
    expect(stats.body.averages).toBeTruthy();
  });
});

