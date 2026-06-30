/**
 * Location List API tests (05a)
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

test.describe('GET /admin/locations @P1', () => {
  test('API_LOCLIST_001 rejects unauthenticated list', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations`);
    expect(res.status()).toBe(401);
  });

  test('API_LOCLIST_002 returns paginated locations for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations?per_page=5`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    expect(Array.isArray(rows)).toBe(true);
  });

  test('API_LOCLIST_003 filters by status', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations?status=active&per_page=50`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    if (rows.length > 0) {
      expect(rows.every((r: { status: string }) => r.status === 'active')).toBe(true);
    }
  });

  test('API_LOCLIST_004 returns location stats', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations/stats`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const stats = body.data ?? body;
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('active');
  });
});
