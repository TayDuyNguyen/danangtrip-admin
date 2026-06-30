/**
 * Admin Blog Create API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { buildValidApiCreatePayload } from '../fixtures/data/blog-create.data';

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

test.describe('POST /admin/blog-posts @P1', () => {
  /** API_BLOGCREATE_001 */
  test('API_BLOGCREATE_001 rejects unauthenticated create request', async ({ request }) => {
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/blog-posts`, {
      data: buildValidApiCreatePayload(),
    });
    expect(res.status()).toBe(401);
  });

  /** API_BLOGCREATE_002 */
  test('API_BLOGCREATE_002 creates blog post with valid payload', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/blog-posts`, {
      headers: authHeaders(),
      data: buildValidApiCreatePayload(),
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    const id = body.data?.id;
    expect(id).toBeTruthy();
  });

  /** API_BLOGCREATE_003 */
  test('API_BLOGCREATE_003 rejects invalid payload', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/blog-posts`, {
      headers: authHeaders(),
      data: { title: 'x' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(422);
  });
});
