import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Project Management API & RBAC Tests', () => {
  let adminToken: string;
  let pmToken: string;
  let memberToken: string;
  let createdProjectId: string;

  beforeAll(async () => {
    // 1. Login as Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@projecthub.com', password: 'Password123!' });
    adminToken = adminLogin.body.data.token;

    // 2. Login as PM
    const pmLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pm@projecthub.com', password: 'Password123!' });
    pmToken = pmLogin.body.data.token;

    // 3. Login as Team Member
    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'david@projecthub.com', password: 'Password123!' });
    memberToken = memberLogin.body.data.token;
  });

  it('should allow Project Manager to create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Test Project By PM',
        description: 'Integration test description',
        status: 'PLANNING',
        startDate: new Date().toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project.name).toBe('Test Project By PM');
    createdProjectId = res.body.data.project.id;
  });

  it('should forbid Team Member from creating a project (Role-Based Permissions)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        name: 'Disallowed Project By Member',
        description: 'Should fail with 403',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Forbidden');
  });

  it('should reject project creation when required fields are missing (Validation)', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        // missing required name
        description: 'No name given',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should support pagination and filtering on project listings', async () => {
    const res = await request(app)
      .get('/api/projects?page=1&limit=2&status=ACTIVE')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.projects).toBeInstanceOf(Array);
    expect(res.body.data.projects.length).toBeLessThanOrEqual(2);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(2);
  });

  it('should update project status and details by authorized manager', async () => {
    const res = await request(app)
      .patch(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Test Project Updated',
        status: 'ACTIVE',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project.name).toBe('Test Project Updated');
    expect(res.body.data.project.status).toBe('ACTIVE');
  });

  it('should prevent unauthorized member from viewing or modifying unassigned project', async () => {
    // david@projecthub.com is not a member of project created by PM above
    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
