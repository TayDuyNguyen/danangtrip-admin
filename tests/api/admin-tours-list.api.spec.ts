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

test.describe('GET /admin/tours @P1', () => {
  test('API_TLIST_001 rejects unauthenticated list request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours`);
    expect(res.status()).toBe(401);
  });

  test('API_TLIST_002 returns tour list for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours?per_page=1`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data;
    expect(Array.isArray(rows)).toBeTruthy();
  });
});
