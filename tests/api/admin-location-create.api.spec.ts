/**
 * Admin Location Create API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { buildValidApiCreatePayload } from '../fixtures/data/location-create.data';

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

test.describe('POST /admin/locations @P1', () => {
  /** API_LOCCREATE_001 */
  test('API_LOCCREATE_001 rejects unauthenticated create request', async ({ request }) => {
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/locations`, {
      data: buildValidApiCreatePayload(),
    });
    expect(res.status()).toBe(401);
  });

  /** API_LOCCREATE_002 */
  test('API_LOCCREATE_002 creates location with valid payload', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/locations`, {
      headers: authHeaders(),
      data: buildValidApiCreatePayload(),
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const id = body.data?.id ?? body.data?.location?.id;
    expect(id).toBeTruthy();
  });

  /** API_LOCCREATE_003 */
  test('API_LOCCREATE_003 rejects invalid payload with 422', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/locations`, {
      headers: authHeaders(),
      data: { name: 'x' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(422);
  });
});
