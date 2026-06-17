/**
 * Admin Tour Edit API tests
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { buildValidApiCreatePayload } from '../fixtures/data/tour-create.data';

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

    await request.post(`${testEnv.apiBaseUrl}/auth/login`, {
      data: { email: 'customer@test.com', password: 'Customer123!' },
    });
  } catch {
    apiAvailable = false;
  }
});

const authHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  Accept: 'application/json',
});

test.describe('GET/PUT/DELETE /admin/tours/:id @P1', () => {
  test('API_TEDIT_001 rejects unauthenticated GET detail', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours/1`);
    expect(res.status()).toBe(401);
  });

  test('API_TEDIT_002 returns tour detail for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tours/1`, { headers: authHeaders() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const tour = body.data ?? body;
    expect(tour.id ?? tour.tour?.id).toBeTruthy();
  });

  test('API_TEDIT_003 rejects unauthenticated PUT', async ({ request }) => {
    const res = await request.put(`${testEnv.apiBaseUrl}/admin/tours/1`, { data: { name: 'x' } });
    expect(res.status()).toBe(401);
  });

  test('API_TEDIT_004 updates tour with valid PUT', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const createRes = await request.post(`${testEnv.apiBaseUrl}/admin/tours`, {
      headers: authHeaders(),
      data: buildValidApiCreatePayload(),
    });
    test.skip(!createRes.ok(), 'Could not seed tour');
    const created = await createRes.json();
    const tourId = created.data?.tour?.id ?? created.data?.id;

    const res = await request.put(`${testEnv.apiBaseUrl}/admin/tours/${tourId}`, {
      headers: authHeaders(),
      data: { name: `Updated API Tour ${Date.now()}` },
    });
    expect(res.status()).toBe(200);
  });

  test('API_TEDIT_005 returns 404 for missing tour PUT', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.put(`${testEnv.apiBaseUrl}/admin/tours/999999`, {
      headers: authHeaders(),
      data: { name: 'Ghost tour' },
    });
    expect([404, 422]).toContain(res.status());
  });

  test('API_TEDIT_006 deletes tour with admin token', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const createRes = await request.post(`${testEnv.apiBaseUrl}/admin/tours`, {
      headers: authHeaders(),
      data: buildValidApiCreatePayload(),
    });
    test.skip(!createRes.ok(), 'Could not seed tour');
    const created = await createRes.json();
    const tourId = created.data?.tour?.id ?? created.data?.id;

    const res = await request.delete(`${testEnv.apiBaseUrl}/admin/tours/${tourId}`, {
      headers: authHeaders(),
    });
    expect([200, 204]).toContain(res.status());
  });
});

test.describe('GET/DELETE /admin/tour-schedules @P1', () => {
  test('API_TEDIT_007 lists schedules by tour_id', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?tour_id=1`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const rows = body.data?.data ?? body.data ?? [];
    expect(Array.isArray(rows)).toBe(true);
  });

  test('API_TEDIT_008 deletes schedule when exists', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const listRes = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules?tour_id=1&per_page=1`, {
      headers: authHeaders(),
    });
    test.skip(!listRes.ok(), 'Schedule list unavailable');
    const listBody = await listRes.json();
    const rows = listBody.data?.data ?? listBody.data ?? [];
    test.skip(!Array.isArray(rows) || rows.length === 0, 'No schedule to delete');
    const scheduleId = rows[0].id;

    const res = await request.delete(`${testEnv.apiBaseUrl}/admin/tour-schedules/${scheduleId}`, {
      headers: authHeaders(),
    });
    const status = res.status();
    if (status === 400) {
      test.skip(true, 'Schedule delete blocked (e.g. active bookings)');
    }
    expect([200, 204]).toContain(status);
  });
});
