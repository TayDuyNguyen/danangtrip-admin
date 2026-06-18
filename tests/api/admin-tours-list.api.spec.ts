/**
 * Admin Tours List API tests — Playwright APIRequestContext
 * Run: npm run test:admin:tour-list (includes this file)
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

const userAuthHeaders = () => ({
  Authorization: `Bearer ${userToken}`,
  Accept: 'application/json',
});

test.describe('GET /admin/tours @P1', () => {
  test('API_TLIST_001 rejects unauthenticated list request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours`);
    expect(res.status()).toBe(401);
  });

  test('API_TLIST_002 returns tour list for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours?per_page=1`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data;
    expect(Array.isArray(rows)).toBeTruthy();
  });

  test('API_TLIST_003 filters by search parameter', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours?search=Ba%20Na`, {
      headers: authHeaders(),
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const rows: Array<{ name: string }> = body.data?.data ?? [];
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.name.toLowerCase()).toMatch(/ba|bà/);
    }
  });

  test('API_TLIST_019 search is case-insensitive', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const baseline = await request.get(`${testEnv.apiBaseUrl}/admin/tours?search=Ba%20Na&per_page=50`, {
      headers: authHeaders(),
    });
    expect(baseline.ok()).toBeTruthy();
    const baselineIds = ((await baseline.json()).data?.data ?? []).map((r: { id: number }) => r.id).sort();

    const lower = await request.get(`${testEnv.apiBaseUrl}/admin/tours?search=ba%20na&per_page=50`, {
      headers: authHeaders(),
    });
    expect(lower.ok()).toBeTruthy();
    const lowerIds = ((await lower.json()).data?.data ?? []).map((r: { id: number }) => r.id).sort();

    expect(lowerIds).toEqual(baselineIds);
  });

  test('API_TLIST_004 filters by tour_category_id', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours?tour_category_id=1&per_page=50`, {
      headers: authHeaders(),
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const rows: Array<{ tour_category_id: number }> = body.data?.data ?? [];
    for (const row of rows) {
      expect(row.tour_category_id).toBe(1);
    }
  });

  test('API_TLIST_005 filters by status active and inactive', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const activeRes = await request.get(`${testEnv.apiBaseUrl}/admin/tours?status=active&per_page=50`, {
      headers: authHeaders(),
    });
    expect(activeRes.ok()).toBeTruthy();
    const activeBody = await activeRes.json();
    for (const row of activeBody.data?.data ?? []) {
      expect(row.status).toBe('active');
    }

    const inactiveRes = await request.get(`${testEnv.apiBaseUrl}/admin/tours?status=inactive&per_page=50`, {
      headers: authHeaders(),
    });
    expect(inactiveRes.ok()).toBeTruthy();
    const inactiveBody = await inactiveRes.json();
    for (const row of inactiveBody.data?.data ?? []) {
      expect(row.status).toBe('inactive');
    }
  });

  test('API_TLIST_006 filters by booking_availability', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const openRes = await request.get(`${testEnv.apiBaseUrl}/admin/tours?booking_availability=open&per_page=50`, {
      headers: authHeaders(),
    });
    expect(openRes.ok()).toBeTruthy();
    for (const row of (await openRes.json()).data?.data ?? []) {
      expect(row.booking_availability).toBe('open');
    }

    const soldRes = await request.get(`${testEnv.apiBaseUrl}/admin/tours?booking_availability=sold_out&per_page=50`, {
      headers: authHeaders(),
    });
    expect(soldRes.ok()).toBeTruthy();
    for (const row of (await soldRes.json()).data?.data ?? []) {
      expect(row.booking_availability).toBe('sold_out');
    }
  });

  test('API_TLIST_007 filters by featured hot and normal combo', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const featuredRes = await request.get(`${testEnv.apiBaseUrl}/admin/tours?is_featured=1&per_page=50`, {
      headers: authHeaders(),
    });
    expect(featuredRes.ok()).toBeTruthy();
    for (const row of (await featuredRes.json()).data?.data ?? []) {
      expect(row.is_featured).toBeTruthy();
    }

    const hotRes = await request.get(`${testEnv.apiBaseUrl}/admin/tours?is_hot=1&per_page=50`, {
      headers: authHeaders(),
    });
    expect(hotRes.ok()).toBeTruthy();
    for (const row of (await hotRes.json()).data?.data ?? []) {
      expect(row.is_hot).toBeTruthy();
    }

    const normalRes = await request.get(
      `${testEnv.apiBaseUrl}/admin/tours?is_featured=0&is_hot=0&per_page=50`,
      { headers: authHeaders() }
    );
    expect(normalRes.ok()).toBeTruthy();
    for (const row of (await normalRes.json()).data?.data ?? []) {
      expect(row.is_featured).toBeFalsy();
      expect(row.is_hot).toBeFalsy();
    }
  });

  test('API_TLIST_008 returns pagination metadata', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours?page=1&per_page=5`, {
      headers: authHeaders(),
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data).toHaveProperty('total');
    expect(body.data).toHaveProperty('current_page');
    expect(body.data).toHaveProperty('per_page');
    expect(body.data).toHaveProperty('last_page');
    expect(Array.isArray(body.data.data)).toBeTruthy();
  });

  test('API_TLIST_009 accepts sort_by and sort_order', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tours?sort_by=name&sort_order=asc&per_page=5`,
      { headers: authHeaders() }
    );
    expect(res.ok()).toBeTruthy();
    const rows: Array<{ name: string }> = (await res.json()).data?.data ?? [];
    if (rows.length >= 2) {
      expect(rows[0]!.name.localeCompare(rows[1]!.name)).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('Tour mutations auth @P1', () => {
  test('API_TLIST_010 PATCH status rejects unauthenticated', async ({ request }) => {
    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/tours/1/status`, {
      data: { status: 'inactive' },
    });
    expect(res.status()).toBe(401);
  });

  test('API_TLIST_011 PATCH featured and hot reject unauthenticated', async ({ request }) => {
    const featuredRes = await request.patch(`${testEnv.apiBaseUrl}/admin/tours/1/featured`, {
      data: { is_featured: true },
    });
    expect(featuredRes.status()).toBe(401);

    const hotRes = await request.patch(`${testEnv.apiBaseUrl}/admin/tours/1/hot`, {
      data: { is_hot: true },
    });
    expect(hotRes.status()).toBe(401);
  });

  test('API_TLIST_012 DELETE rejects unauthenticated', async ({ request }) => {
    const res = await request.delete(`${testEnv.apiBaseUrl}/admin/tours/99999`);
    expect(res.status()).toBe(401);
  });

  test('API_TLIST_013 GET export rejects unauthenticated', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours/export`);
    expect(res.status()).toBe(401);
  });
});

test.describe('Tour dependencies @P1', () => {
  test('API_TLIST_014 GET tour-categories returns array', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/tour-categories`, {
      headers: authHeaders(),
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const rows = body.data?.data ?? body.data;
    expect(Array.isArray(rows)).toBeTruthy();
  });
});

test.describe('Tour mutations errors @P2', () => {
  test('API_TLIST_015 PATCH status on missing tour returns 404', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/tours/999999/status`, {
      headers: authHeaders(),
      data: { status: 'inactive' },
    });
    expect([404, 422]).toContain(res.status());
  });

  test('API_TLIST_016 DELETE missing tour returns 404', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.delete(`${testEnv.apiBaseUrl}/admin/tours/999999`, {
      headers: authHeaders(),
    });
    expect([404, 422]).toContain(res.status());
  });

  test('API_TLIST_017 rejects non-admin token on list', async ({ request }) => {
    test.skip(!userApiAvailable, 'User API login not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours`, {
      headers: userAuthHeaders(),
    });
    expect([401, 403]).toContain(res.status());
  });
});

test.describe('GET /admin/tours/export @P1', () => {
  test('API_TLIST_018 export with filter returns xlsx', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours/export?status=active`, {
      headers: { ...authHeaders(), Accept: '*/*' },
    });
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).toMatch(/spreadsheet|excel|octet-stream/i);
  });
});
