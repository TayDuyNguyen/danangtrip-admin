/**
 * Location Categories API tests (16)
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

test.describe('GET /admin/categories @P1', () => {
  test('API_LOCCAT_001 rejects unauthenticated list', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/categories`);
    expect(res.status()).toBe(401);
  });

  test('API_LOCCAT_002 returns categories for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/categories?all=true&with_stats=true`,
      { headers: authHeaders() }
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const payload = body.data ?? body;
    const rows = payload?.categories?.data ?? payload?.data ?? payload;
    expect(Array.isArray(rows)).toBe(true);
  });

  test('API_LOCCAT_003 filters by status', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/categories?status=active&all=true`,
      { headers: authHeaders() }
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    const payload = body.data ?? body;
    const rows = payload?.categories?.data ?? payload?.data ?? [];
    if (rows.length > 0) {
      expect(rows.every((r: { status: string }) => r.status === 'active')).toBe(true);
    }
  });
});
