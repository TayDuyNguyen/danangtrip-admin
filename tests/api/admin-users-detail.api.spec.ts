import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';

let adminToken = '';
let targetUserId = 0;
let apiAvailable = false;

test.beforeAll(async ({ request }) => {
  try {
    const loginRes = await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: { email: testEnv.adminEmail, password: testEnv.adminPassword },
    });
    if (!loginRes.ok()) return;
    const body = await loginRes.json();
    adminToken = body.data?.token ?? body.token ?? '';

    const listRes = await request.get(`${testEnv.apiBaseUrl}/admin/users?role=user&per_page=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!listRes.ok()) return;
    const listBody = await listRes.json();
    const row = listBody.data?.data?.[0] ?? listBody.data?.[0];
    targetUserId = row?.id ?? 0;
    apiAvailable = !!adminToken && !!targetUserId;
  } catch {
    apiAvailable = false;
  }
});

const authHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  Accept: 'application/json',
});

test.describe('GET /admin/users/:id @P1', () => {
  test('API_UDET_001 rejects unauthenticated detail request', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users/1`);
    expect(res.status()).toBe(401);
  });

  test('API_UDET_002 returns user detail for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users/${targetUserId}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const user = body.data?.user ?? body.data;
    expect(user?.id ?? user?.email).toBeTruthy();
  });
});

test.describe('PATCH /admin/users/:id/status @P1', () => {
  test('API_UDET_003 rejects unauthenticated status update', async ({ request }) => {
    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/users/1/status`, {
      data: { status: 'banned' },
    });
    expect(res.status()).toBe(401);
  });
});
