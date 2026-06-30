/**
 * Admin Blog Edit API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { defaultEditBlogId, buildValidApiUpdatePayload } from '../fixtures/data/blog-edit.data';

let adminToken = '';
let apiAvailable = false;

test.beforeAll(async ({ request }) => {
  try {
    const loginRes = await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: { email: testEnv.adminEmail, password: testEnv.adminPassword },
    });
    if (!loginRes.ok()) return;
    const body = await loginRes.json();
    adminToken = body.data?.token ?? body.token ?? '';
    apiAvailable = !!adminToken;
  } catch {
    apiAvailable = false;
  }
});

const authHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  Accept: 'application/json',
});

test.describe('PUT /admin/blog-posts/:id @P1', () => {
  /** API_BLOGEDIT_001 */
  test('API_BLOGEDIT_001 rejects unauthenticated update request', async ({ request }) => {
    const res = await request.put(`${testEnv.apiBaseUrl}/admin/blog-posts/${defaultEditBlogId}`, {
      data: buildValidApiUpdatePayload(),
    });
    expect(res.status()).toBe(401);
  });

  /** API_BLOGEDIT_002 */
  test('API_BLOGEDIT_002 updates blog post with valid payload', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.put(`${testEnv.apiBaseUrl}/admin/blog-posts/${defaultEditBlogId}`, {
      headers: authHeaders(),
      data: buildValidApiUpdatePayload(),
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.data?.id ?? body.id).toBeTruthy();
  });

  /** API_BLOGEDIT_003 */
  test('API_BLOGEDIT_003 rejects invalid update payload', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.put(`${testEnv.apiBaseUrl}/admin/blog-posts/${defaultEditBlogId}`, {
      headers: authHeaders(),
      data: { title: '' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(422);
  });
});

test.describe('GET /admin/blog-posts/:id @P1', () => {
  /** API_BLOGEDIT_004 */
  test('API_BLOGEDIT_004 rejects unauthenticated detail request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/blog-posts/${defaultEditBlogId}`);
    expect(res.status()).toBe(401);
  });
});
