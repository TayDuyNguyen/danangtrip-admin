/**
 * Admin Users API tests — Playwright APIRequestContext
 * Run: npx playwright test tests/api/admin-users.api.spec.ts
 *
 * Requires real API at PLAYWRIGHT_API_URL with seeded admin credentials.
 * Skips automatically when API is unreachable.
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { errorEnvelope, successEnvelope } from '../../helpers/apiResponse';

let adminToken = '';
let apiAvailable = false;

test.beforeAll(async ({ request }) => {
  try {
    const loginRes = await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: {
        email: testEnv.adminEmail,
        password: testEnv.adminPassword,
      },
    });
    if (!loginRes.ok()) return;
    const body = await loginRes.json();
    adminToken = body.data?.token ?? body.token ?? '';
    apiAvailable = !!adminToken;
  } catch {
    apiAvailable = false;
  }
});

test.beforeEach(async () => {
  test.skip(!apiAvailable, 'API not available — start danangtrip-api and seed database');
});

const authHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  Accept: 'application/json',
});

test.describe('GET /admin/users @P1', () => {
  test('returns paginated user list with stats', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.code).toBe(200);
    expect(Array.isArray(body.data?.data)).toBeTruthy();
    expect(body.data).toHaveProperty('total');
  });

  test('filters by q parameter', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users?q=admin@`, {
      headers: authHeaders(),
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    for (const row of body.data.data) {
      expect(`${row.email}${row.full_name}${row.username}`.toLowerCase()).toContain('admin');
    }
  });

  test('filters by role=user', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users?role=user`, {
      headers: authHeaders(),
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    for (const row of body.data.data) {
      expect(row.role).toBe('user');
    }
  });

  test('rejects invalid role filter', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users?role=staff`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBeGreaterThanOrEqual(422);
  });

  test('rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users`);
    expect(res.status()).toBe(401);
  });
});

test.describe('PATCH /admin/users/{id}/status @P0', () => {
  test('updates status active -> banned -> active', async ({ request }) => {
    const listRes = await request.get(`${testEnv.apiBaseUrl}/admin/users?role=user&per_page=1`, {
      headers: authHeaders(),
    });
    const listBody = await listRes.json();
    const target = listBody.data?.data?.[0];
    test.skip(!target, 'No user row available');

    const banRes = await request.patch(`${testEnv.apiBaseUrl}/admin/users/${target.id}/status`, {
      headers: authHeaders(),
      data: { status: 'banned' },
    });
    expect(banRes.ok()).toBeTruthy();

    const activeRes = await request.patch(`${testEnv.apiBaseUrl}/admin/users/${target.id}/status`, {
      headers: authHeaders(),
      data: { status: 'active' },
    });
    expect(activeRes.ok()).toBeTruthy();
  });

  test('rejects invalid status value', async ({ request }) => {
    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/users/2/status`, {
      headers: authHeaders(),
      data: { status: 'invalid' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(422);
  });

  test('rejects non-existent user id', async ({ request }) => {
    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/users/999999/status`, {
      headers: authHeaders(),
      data: { status: 'banned' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(404);
  });
});

test.describe('GET /admin/users/export @P1', () => {
  test('API_ULIST_009 rejects unauthenticated export', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users/export`);
    expect(res.status()).toBe(401);
  });

  test('API_ULIST_010 export with role filter returns xlsx', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users/export?role=user`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).toMatch(/spreadsheet|excel|octet-stream/i);
  });
});

test.describe('API envelope sanity', () => {
  test('error envelope shape', async () => {
    const payload = errorEnvelope('Validation failed', 422);
    expect(payload.code).toBe(422);
    expect(payload.data).toBeNull();
  });

  test('success envelope shape', async () => {
    const payload = successEnvelope({ ok: true });
    expect(payload.code).toBe(200);
    expect(payload.data).toEqual({ ok: true });
  });
});
