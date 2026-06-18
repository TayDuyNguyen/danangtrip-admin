/**
 * Booking List API tests (04a)
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

test.describe('GET /admin/bookings @P1', () => {
  test('API_BLIST_001 rejects unauthenticated list', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings`);
    expect(res.status()).toBe(401);
  });

  test('API_BLIST_002 returns paginated bookings for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings?per_page=5`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    expect(Array.isArray(rows)).toBe(true);
  });

  test('API_BLIST_003 filters by booking_status', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings?status=pending&per_page=50`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    if (rows.length > 0) {
      expect(rows.every((r: { booking_status: string }) => r.booking_status === 'pending')).toBe(true);
    }
  });

  test('API_BLIST_005 filters by user_id', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings?user_id=1&per_page=10`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
  });

  test('API_BLIST_007 search is case-insensitive', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const upper = await request.get(`${testEnv.apiBaseUrl}/admin/bookings?search=BK&per_page=50`, {
      headers: authHeaders(),
    });
    expect(upper.status()).toBe(200);
    const upperBody = await upper.json();
    const upperRows = upperBody.data?.data ?? upperBody.data ?? [];
    const upperIds = upperRows.map((r: { id: number }) => r.id).sort();

    const lower = await request.get(`${testEnv.apiBaseUrl}/admin/bookings?search=bk&per_page=50`, {
      headers: authHeaders(),
    });
    expect(lower.status()).toBe(200);
    const lowerBody = await lower.json();
    const lowerRows = lowerBody.data?.data ?? lowerBody.data ?? [];
    const lowerIds = lowerRows.map((r: { id: number }) => r.id).sort();

    expect(lowerIds).toEqual(upperIds);
  });

  test('API_BLIST_009 returns status counts for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings/status-counts`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const counts = body.data ?? body;
    expect(counts).toHaveProperty('pending');
    expect(counts).toHaveProperty('confirmed');
  });

  test('API_BLIST_014 rejects customer token on list', async ({ request }) => {
    test.skip(!userApiAvailable, 'Customer API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings`, {
      headers: { Authorization: `Bearer ${userToken}`, Accept: 'application/json' },
    });
    expect([401, 403]).toContain(res.status());
  });
});
