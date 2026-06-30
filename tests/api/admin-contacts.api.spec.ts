/**
 * Contacts API tests (09)
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

test.describe('GET /admin/contacts @P1', () => {
  test('API_CNT_001 rejects unauthenticated list', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/contacts`);
    expect(res.status()).toBe(401);
  });

  test('API_CNT_002 returns paginated contacts for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/contacts?per_page=5`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    expect(Array.isArray(rows)).toBe(true);
  });

  test('API_CNT_003 filters by status new', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/contacts?status=new&per_page=50`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    if (rows.length > 0) {
      expect(rows.every((r: { status?: string }) => r.status === 'new')).toBe(true);
    }
  });
});
