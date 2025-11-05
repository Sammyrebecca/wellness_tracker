const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();
const app = require('../../../app');
const { connectDB } = require('../../config/db');
const User = require('../../models/User');

describe('Auth flow', () => {
  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('registers and logs in', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'T', email: 't@example.com', password: 'secret1' });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();

    const login = await request(app).post('/api/auth/login').send({ email: 't@example.com', password: 'secret1' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});

