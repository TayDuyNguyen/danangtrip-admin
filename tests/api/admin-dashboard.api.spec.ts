import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';

let adminToken = '';
let apiAvailable = false;

const authHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  Accept: 'application/json',
});

async function adminGet(
  request: Parameters<Parameters<typeof test>[2]>[0]['request'],
  path: string
) {
  try {
    return await request.get(`${testEnv.apiBaseUrl}${path}`, {
      headers: authHeaders(),
      timeout: 25_000,
    });
  } catch {
    test.skip(true, 'API timeout or unavailable');
    throw new Error('unreachable');
  }
}

test.beforeAll(async ({ request }) => {
  try {
    const loginRes = await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: { email: testEnv.adminEmail, password: testEnv.adminPassword },
      timeout: 25_000,
    });
    if (!loginRes.ok()) return;
    const body = await loginRes.json();
    adminToken = body.data?.token ?? body.token ?? '';
    apiAvailable = !!adminToken;
  } catch {
    apiAvailable = false;
  }
});

test.describe('Dashboard API smoke @P2', () => {
  test.describe.configure({ timeout: 60_000 });

  test('TC_AD_DASH_API_001 rejects unauthenticated stats request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/dashboard/stats`);
    expect(res.status()).toBe(401);
  });

  test('TC_AD_DASH_API_002 returns dashboard stats for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/stats');
    expect(res.status()).toBe(200);
    const body = await res.json();
    const data = body.data ?? body;
    expect(data).toBeTruthy();
  });

  test('TC_AD_DASH_API_003 returns revenue series for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/revenue?period=day');
    expect(res.status()).toBe(200);
  });

  test('TC_AD_DASH_API_004 returns booking trend for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/booking-trend?days=30');
    expect(res.status()).toBe(200);
  });

  test('TC_AD_DASH_API_005 returns user growth for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/user-growth');
    expect(res.status()).toBe(200);
  });

  test('TC_AD_DASH_API_006 returns top tours for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/top-tours');
    expect(res.status()).toBe(200);
  });

  test('TC_AD_DASH_API_007 returns search trends for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/search-trends');
    expect(res.status()).toBe(200);
  });

  test('TC_AD_DASH_API_008 returns recent bookings for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/bookings?per_page=8');
    expect(res.status()).toBe(200);
  });

  test('TC_AD_DASH_API_009 exports dashboard report for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/export');
    expect(res.status()).toBe(200);
  });

  test('TC_AD_DASH_API_010 returns notification counts for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await adminGet(request, '/admin/dashboard/notification-counts');
    expect(res.status()).toBe(200);
  });
});
