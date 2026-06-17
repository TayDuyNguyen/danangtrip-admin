/**

 * GET/PATCH/DELETE /admin/users/:id detail sub-resources API tests

 */

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



test.describe('GET/PATCH/DELETE sub-resources @P1', () => {

  test('API_UDET_004 rejects unauthenticated bookings and returns 200 when authenticated', async ({

    request,

  }) => {

    const unauth = await request.get(`${testEnv.apiBaseUrl}/admin/users/1/bookings`);

    expect(unauth.status()).toBe(401);



    test.skip(!apiAvailable, 'API not available');

    const res = await request.get(

      `${testEnv.apiBaseUrl}/admin/users/${targetUserId}/bookings?per_page=5`,

      { headers: authHeaders() }

    );

    expect(res.status()).toBe(200);

  });



  test('API_UDET_005 rejects unauthenticated ratings and returns 200 when authenticated', async ({

    request,

  }) => {

    const unauth = await request.get(`${testEnv.apiBaseUrl}/admin/users/1/ratings`);

    expect(unauth.status()).toBe(401);



    test.skip(!apiAvailable, 'API not available');

    const res = await request.get(

      `${testEnv.apiBaseUrl}/admin/users/${targetUserId}/ratings?per_page=3`,

      { headers: authHeaders() }

    );

    expect(res.status()).toBe(200);

  });



  test('API_UDET_006 rejects unauthenticated delete and deletes disposable user', async ({

    request,

  }) => {

    const unauth = await request.delete(`${testEnv.apiBaseUrl}/admin/users/1`);

    expect(unauth.status()).toBe(401);



    test.skip(!apiAvailable, 'API not available');

    const suffix = Date.now();

    const createRes = await request.post(`${testEnv.apiBaseUrl}/admin/users`, {

      headers: authHeaders(),

      data: {

        full_name: 'API Detail Delete Target',

        username: `api_udet_del_${suffix}`,

        email: `api_udet_del_${suffix}@test.com`,

        password: 'TestPass123!',

        password_confirmation: 'TestPass123!',

        role: 'user',

        status: 'active',

      },

    });

    test.skip(!createRes.ok(), 'Could not create disposable user');

    const createBody = await createRes.json();

    const createdId = createBody.data?.user?.id ?? createBody.data?.id;



    const deleteRes = await request.delete(`${testEnv.apiBaseUrl}/admin/users/${createdId}`, {

      headers: authHeaders(),

    });

    expect(deleteRes.status()).toBe(200);

  });



  test('API_UDET_007 patches user role successfully', async ({ request }) => {

    test.skip(!apiAvailable, 'API not available');

    const detailRes = await request.get(`${testEnv.apiBaseUrl}/admin/users/${targetUserId}`, {

      headers: authHeaders(),

    });

    const detailBody = await detailRes.json();

    const currentRole = detailBody.data?.role ?? detailBody.data?.user?.role ?? 'user';

    const nextRole = currentRole === 'admin' ? 'user' : 'admin';



    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/users/${targetUserId}/role`, {

      headers: authHeaders(),

      data: { role: nextRole },

    });

    expect(res.status()).toBe(200);



    await request.patch(`${testEnv.apiBaseUrl}/admin/users/${targetUserId}/role`, {

      headers: authHeaders(),

      data: { role: currentRole },

    });

  });



  test('API_UDET_008 returns 404 or 422 for missing user detail', async ({ request }) => {

    test.skip(!apiAvailable, 'API not available');

    const res = await request.get(`${testEnv.apiBaseUrl}/admin/users/999999999`, {

      headers: authHeaders(),

    });

    expect([404, 422]).toContain(res.status());

  });

});

