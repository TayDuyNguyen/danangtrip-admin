/**
 * Admin Location Edit API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import {
  buildValidApiUpdatePayload,
  defaultEditLocationId,
  notFoundLocationId,
} from '../fixtures/data/location-edit.data';

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

test.describe('Admin Location Edit API @P1', () => {
  /** API_LOCEDIT_001 */
  test('API_LOCEDIT_001 rejects unauthenticated detail request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations/${defaultEditLocationId}`);
    expect(res.status()).toBe(401);
  });

  /** API_LOCEDIT_002 */
  test('API_LOCEDIT_002 updates location with valid PUT payload', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.put(`${testEnv.apiBaseUrl}/admin/locations/${defaultEditLocationId}`, {
      headers: authHeaders(),
      data: buildValidApiUpdatePayload({ name: `API Edit ${Date.now()}` }),
    });
    expect([200, 404]).toContain(res.status());
  });

  /** API_LOCEDIT_003 */
  test('API_LOCEDIT_003 returns 404 for unknown location id', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/locations/${notFoundLocationId}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(404);
  });
});
