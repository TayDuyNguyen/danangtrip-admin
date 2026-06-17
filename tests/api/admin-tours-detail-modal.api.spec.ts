/**
 * Tour Detail Modal — schedules API smoke (03d)
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

test.describe('GET /admin/tour-schedules (modal preview) @P2', () => {
  test('API_TMOD_001 rejects unauthenticated schedules list', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?tour_id=1`);
    expect(res.status()).toBe(401);
  });

  test('API_TMOD_002 returns schedules for tour_id with admin token', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?tour_id=1&per_page=5`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    expect(Array.isArray(rows)).toBe(true);
  });
});
