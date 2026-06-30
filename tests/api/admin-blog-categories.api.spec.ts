/**
 * Blog Categories API tests (17)
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';

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

test.describe('GET /admin/blog-categories @P1', () => {
  test('API_BLOGCAT_001 rejects unauthenticated list', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/blog-categories`);
    expect(res.status()).toBe(401);
  });

  test('API_BLOGCAT_002 returns categories for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/blog-categories`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data ?? body;
    expect(Array.isArray(rows)).toBe(true);
  });

  test('API_BLOGCAT_003 create category validates auth', async ({ request }) => {
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/blog-categories`, {
      data: { name: 'Test Category', slug: 'test-category' },
    });
    expect(res.status()).toBe(401);
  });
});
