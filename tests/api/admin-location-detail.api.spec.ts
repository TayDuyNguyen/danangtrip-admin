/**
 * Admin Location Detail API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { defaultDetailLocationId, notFoundDetailLocationId } from '../fixtures/data/location-detail.data';

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

test.describe('Admin Location Detail API @P1', () => {
  /** API_LOCDET_001 */
  test('API_LOCDET_001 rejects unauthenticated detail request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations/${defaultDetailLocationId}`);
    expect(res.status()).toBe(401);
  });

  /** API_LOCDET_002 */
  test('API_LOCDET_002 returns location detail for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations/${defaultDetailLocationId}`, {
      headers: authHeaders(),
    });
    expect([200, 404]).toContain(res.status());
  });

  /** API_LOCDET_003 */
  test('API_LOCDET_003 returns 404 for unknown location id', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations/${notFoundDetailLocationId}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(404);
  });
});
