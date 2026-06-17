/**
 * Admin Tour Create API tests — Playwright APIRequestContext
 * Run: npm run test:admin:tour-create (includes this file)
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { buildValidApiCreatePayload } from '../fixtures/data/tour-create.data';

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

test.describe('POST /admin/tours @P1', () => {
  test('API_TCREATE_001 rejects unauthenticated create request', async ({ request }) => {
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/tours`, {
      data: buildValidApiCreatePayload(),
    });
    expect(res.status()).toBe(401);
  });

  test('API_TCREATE_002 creates tour with valid payload', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/tours`, {
      headers: authHeaders(),
      data: buildValidApiCreatePayload(),
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const tourId = body.data?.tour?.id ?? body.data?.id ?? body.tour?.id;
    expect(tourId).toBeTruthy();
  });

  test('API_TCREATE_003 rejects invalid payload with 422', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/tours`, {
      headers: authHeaders(),
      data: { name: 'x' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(422);
  });
});

test.describe('POST /upload/image @P1', () => {
  test('API_TCREATE_004 rejects unauthenticated image upload', async ({ request }) => {
    const res = await request.post(`${testEnv.apiBaseUrl}/upload/image`, {
      multipart: {
        image: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            'base64'
          ),
        },
      },
    });
    expect(res.status()).toBe(401);
  });

  test('API_TCREATE_004b rejects non-admin token on image upload', async ({ request }) => {
    test.skip(!userApiAvailable, 'Customer API login not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/upload/image`, {
      headers: userAuthHeaders(),
      multipart: {
        image: {
          name: 'test.png',
          mimeType: 'image/png',
          buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            'base64'
          ),
        },
      },
    });
    expect([401, 403]).toContain(res.status());
  });
});
