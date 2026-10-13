import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Task Management & Collaboration API Tests', () => {
  let adminToken: string;
  let pmToken: string;
  let memberToken: string;
  let memberId: string;
  let projectId: string;
  let createdTaskId: string;

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
      .send({ email: 'member@projecthub.com', password: 'Password123!' });
    memberToken = memberLogin.body.data.token;
    memberId = memberLogin.body.data.user.id;

    // Get an existing project
    const projRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`);
    projectId = projRes.body.data.projects[0].id;
  });

  it('should validate required fields when creating a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        // missing title and projectId
        description: 'Missing required title',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should successfully create a task with assigned team member', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Build automated end-to-end test suites',
        description: 'Implement Vitest and Supertest coverage',
        projectId,
        assignedToId: memberId,
        priority: 'HIGH',
        status: 'TODO',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.title).toBe('Build automated end-to-end test suites');
    expect(res.body.data.task.status).toBe('TODO');
    expect(res.body.data.task.assignedToId).toBe(memberId);
    createdTaskId = res.body.data.task.id;
  });

  it('should allow assignee to update task status (e.g. to IN_PROGRESS)', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        status: 'IN_PROGRESS',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.status).toBe('IN_PROGRESS');
  });

  it('should allow team member to add a comment on their task', async () => {
    const res = await request(app)
      .post(`/api/tasks/${createdTaskId}/comments`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        content: 'Working on unit tests now, all core endpoints tested.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comment.content).toContain('Working on unit tests');
    expect(res.body.data.comment.author.email).toBe('member@projecthub.com');
  });

  it('should filter tasks by status, priority, and support pagination', async () => {
    const res = await request(app)
      .get('/api/tasks?status=IN_PROGRESS&page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tasks).toBeInstanceOf(Array);
    expect(res.body.data.pagination).toBeDefined();
    for (const t of res.body.data.tasks) {
      expect(t.status).toBe('IN_PROGRESS');
    }
  });

  it('should search tasks by title keyword', async () => {
    const res = await request(app)
      .get('/api/tasks?search=test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('should return aggregated dashboard statistics from database', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.projects.total).toBeGreaterThan(0);
    expect(res.body.data.tasks.total).toBeGreaterThan(0);
    expect(res.body.data.tasks.byStatus).toBeDefined();
    expect(res.body.data.tasks.byStatus.IN_PROGRESS).toBeGreaterThanOrEqual(1);
    expect(res.body.data.projects.completionPercentage).toBeDefined();
    expect(res.body.data.recentActivities).toBeInstanceOf(Array);
  });
});
