/**
 * TC_AD_ULIST_020 — Banned user login blocked at API layer
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { mockCustomerUser } from '../fixtures/data/users.data';

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

test.describe('Banned user login @P0', () => {
  test('TC_AD_ULIST_020 live API rejects login after ban', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');

    const targetId = mockCustomerUser.id;
    const banRes = await request.patch(`${testEnv.apiBaseUrl}/admin/users/${targetId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
      data: { status: 'banned' },
    });
    expect(banRes.ok()).toBeTruthy();

    const loginRes = await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: { email: mockCustomerUser.email, password: 'password' },
    });
    expect(loginRes.status()).toBe(403);

    await request.patch(`${testEnv.apiBaseUrl}/admin/users/${targetId}/status`, {
      headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' },
      data: { status: 'active' },
    });
  });
});
