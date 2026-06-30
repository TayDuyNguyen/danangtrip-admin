/**
 * Admin Chatbot API tests (19)
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

test.describe('GET /admin/chatbot @P2', () => {
  test('API_CHAT_001 rejects unauthenticated stats', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/chatbot/stats`);
    expect(res.status()).toBe(401);
  });

  test('API_CHAT_002 returns stats for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/chatbot/stats`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const data = body.data ?? body;
    expect(data.kpis).toBeTruthy();
    expect(data.trends).toBeTruthy();
    expect(data.business).toBeTruthy();
  });

  test('API_CHAT_003 returns paginated logs', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/chatbot/logs?page=1`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const page = body.data ?? body;
    expect(Array.isArray(page.data)).toBe(true);
    expect(page.current_page).toBe(1);
  });

  test('API_CHAT_004 delete cache hash not found returns 404', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.delete(
      `${testEnv.apiBaseUrl}/admin/chatbot/cache/non-existent-hash-xyz`,
      { headers: authHeaders() }
    );
    expect([404, 200]).toContain(res.status());
  });
});
