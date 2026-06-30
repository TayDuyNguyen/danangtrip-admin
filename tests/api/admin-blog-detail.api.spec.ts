/**
 * Admin Blog Detail API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { defaultDetailBlogId } from '../fixtures/data/blog-detail.data';

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

test.describe('GET /admin/blog-posts/:id @P1', () => {
  /** API_BLOGDET_001 */
  test('API_BLOGDET_001 rejects unauthenticated detail request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/blog-posts/${defaultDetailBlogId}`);
    expect(res.status()).toBe(401);
  });

  /** API_BLOGDET_002 */
  test('API_BLOGDET_002 returns blog post detail when authenticated', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/blog-posts/${defaultDetailBlogId}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data?.id ?? body.id).toBeTruthy();
  });
});

test.describe('PATCH /admin/blog-posts/:id/status @P1', () => {
  /** API_BLOGDET_003 */
  test('API_BLOGDET_003 rejects unauthenticated status update', async ({ request }) => {
    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/blog-posts/${defaultDetailBlogId}/status`, {
      data: { status: 'draft' },
    });
    expect(res.status()).toBe(401);
  });
});
