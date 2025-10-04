const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/auth/login', () => {
  it('should login successfully with valid credentials', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Login Tester',
        username: 'logintester',
        email: 'logintester@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'logintester@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'wrong@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(404);
  });
});
