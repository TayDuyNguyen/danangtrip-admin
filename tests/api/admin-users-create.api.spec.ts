/**
 * POST /admin/users API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { validCreateUser } from '../fixtures/data/user-create.data';

let adminToken = '';
let adminUsername = '';
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
    adminUsername = body.data?.user?.username ?? body.user?.username ?? '';
    apiAvailable = !!adminToken && !!adminUsername;

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

test.describe('POST /admin/users @P1', () => {
  test('API_UCREATE_001 rejects unauthenticated create', async ({ request }) => {
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      data: validCreateUser,
    });
    expect(res.status()).toBe(401);
  });

  test('API_UCREATE_002 rejects invalid payload (missing fields)', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: authHeaders(),
      data: { email: 'only@test.com' },
    });
    expect(res.status()).toBeGreaterThanOrEqual(422);
  });

  test('API_UCREATE_003 rejects duplicate email', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: authHeaders(),
      data: {
        ...validCreateUser,
        username: `dup_${Date.now()}`,
        email: testEnv.adminEmail,
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors?.email ?? body.data?.errors?.email).toBeTruthy();
  });

  test('API_UCREATE_004 rejects duplicate username', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: authHeaders(),
      data: {
        ...validCreateUser,
        username: adminUsername,
        email: `dup_user_${Date.now()}@test.com`,
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors?.username ?? body.data?.errors?.username).toBeTruthy();
  });

  test('API_UCREATE_005 creates user successfully with 201', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const suffix = Date.now();
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: authHeaders(),
      data: {
        ...validCreateUser,
        username: `api_create_${suffix}`,
        email: `api_create_${suffix}@test.com`,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const createdId = body.data?.user?.id ?? body.data?.id ?? body.user?.id;
    expect(createdId).toBeTruthy();

    if (createdId) {
      await request.delete(`${testEnv.apiBaseUrl}/admin/users/${createdId}`, {
        headers: authHeaders(),
      });
    }
  });

  test('API_UCREATE_006 creates banned admin user', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const suffix = Date.now();
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: authHeaders(),
      data: {
        ...validCreateUser,
        username: `api_banned_admin_${suffix}`,
        email: `api_banned_admin_${suffix}@test.com`,
        role: 'admin',
        status: 'banned',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    const user = body.data?.user ?? body.data;
    expect(user?.role).toBe('admin');
    expect(user?.status).toBe('banned');

    const createdId = user?.id;
    if (createdId) {
      await request.delete(`${testEnv.apiBaseUrl}/admin/users/${createdId}`, {
        headers: authHeaders(),
      });
    }
  });

  test('API_UCREATE_007 rejects non-admin token', async ({ request }) => {
    test.skip(!userApiAvailable, 'Customer API login not available');
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: userAuthHeaders(),
      data: {
        ...validCreateUser,
        username: `forbidden_${Date.now()}`,
        email: `forbidden_${Date.now()}@test.com`,
      },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('API_UCREATE_008 rejects weak password complexity with 422', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const suffix = Date.now();
    const res = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {
      headers: authHeaders(),
      data: {
        ...validCreateUser,
        username: `weak_pw_${suffix}`,
        email: `weak_pw_${suffix}@test.com`,
        password: '12345678',
        password_confirmation: '12345678',
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors?.password ?? body.data?.errors?.password).toBeTruthy();
  });
});
