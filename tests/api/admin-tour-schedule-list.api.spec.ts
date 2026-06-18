/**
 * Tour Schedule List API tests (03e)
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';

let adminToken = '';
let userToken = '';
let apiAvailable = false;
let userApiAvailable = false;

test.beforeAll(async ({ request }) => {
  try {
    const loginRes = await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: { email: testEnv.adminEmail, password: testEnv.adminPassword },
    });
    if (!loginRes.ok()) return;
    const body = await loginRes.json();
    adminToken = body.data?.token ?? body.token ?? '';
    apiAvailable = !!adminToken;

    const userLoginRes = await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: { email: 'customer@test.com', password: 'Customer123!' },
    });
    if (userLoginRes.ok()) {
      const userBody = await userLoginRes.json();
      userToken = userBody.data?.token ?? userBody.token ?? '';
      userApiAvailable = !!userToken;
    }
  } catch {
    apiAvailable = false;
    userApiAvailable = false;
  }
});

const authHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  Accept: 'application/json',
});

test.describe('GET /admin/tour-schedules @P1', () => {
  test('API_SCHEDLIST_001 rejects unauthenticated list', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules`);
    expect(res.status()).toBe(401);
  });

  test('API_SCHEDLIST_002 returns paginated schedules for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?per_page=5`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    expect(Array.isArray(rows)).toBe(true);
  });

  test('API_SCHEDLIST_003 filters by tour_id', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?tour_id=1&per_page=10`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    if (rows.length > 0) {
      expect(rows.every((r: { tour_id: number }) => r.tour_id === 1)).toBe(true);
    }
  });

  test('API_SCHEDLIST_007 search q is case-insensitive on tour name', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const baseline = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?q=Ba%20Na&per_page=50`, {
      headers: authHeaders(),
    });
    expect(baseline.status()).toBe(200);
    const baselineBody = await baseline.json();
    const baselineRows = baselineBody.data?.data ?? baselineBody.data ?? [];
    const baselineIds = baselineRows.map((r: { id: number }) => r.id).sort();

    const lower = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?q=ba%20na&per_page=50`, {
      headers: authHeaders(),
    });
    expect(lower.status()).toBe(200);
    const lowerBody = await lower.json();
    const lowerIds = ((lowerBody.data?.data ?? lowerBody.data ?? []) as { id: number }[])
      .map((r) => r.id)
      .sort();

    expect(lowerIds).toEqual(baselineIds);
  });
});

test.describe('GET /admin/tour-schedules/status-counts @P2', () => {
  test('API_SCHEDLIST_004 rejects unauthenticated stats', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules/status-counts`);
    expect(res.status()).toBe(401);
  });

  test('API_SCHEDLIST_005 returns schedule stats for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules/status-counts`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const stats = body.data ?? body;
    expect(stats).toHaveProperty('total_schedules');
  });
});

test.describe('Authorization @P2', () => {
  test('API_SCHEDLIST_006 rejects customer token on schedules list', async ({ request }) => {
    test.skip(!userApiAvailable, 'Customer API login not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules`, {
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect([401, 403]).toContain(res.status());
  });
});
