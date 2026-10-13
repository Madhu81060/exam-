import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication API Tests', () => {
  const testUser = {
    name: 'Test Candidate',
    email: `candidate_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  it('should successfully register a new user with default role TEAM_MEMBER', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user.role).toBe('TEAM_MEMBER');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined(); // Security: password never returned
  });

  it('should reject registration if email already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should reject registration with invalid fields (validation error)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A', // too short
        email: 'invalid-email',
        password: '123', // too short
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('should successfully login with valid credentials and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@projecthub.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@projecthub.com');
    expect(res.body.data.user.role).toBe('ADMIN');
  });

  it('should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@projecthub.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should fail login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'does_not_exist@projecthub.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return current user profile via /api/auth/me with valid Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@projecthub.com',
        password: 'Password123!',
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('admin@projecthub.com');
  });

  it('should reject /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
