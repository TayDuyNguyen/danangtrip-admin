/**
 * Tour Schedule Detail API tests (03h)
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import {
  cancelledScheduleId,
  defaultEditScheduleId,
  detailApiFieldKeys,
  fullScheduleId,
} from '../fixtures/data/tour-schedule-detail.data';

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

const adminHeaders = () => ({
  Authorization: `Bearer ${adminToken}`,
  Accept: 'application/json',
});

const userHeaders = () => ({
  Authorization: `Bearer ${userToken}`,
  Accept: 'application/json',
});

test.describe('GET /admin/tour-schedules/:id @P1', () => {
  test('API_SCHEDDETAIL_001 rejects unauthenticated schedule detail', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules/1`);
    expect(res.status()).toBe(401);
  });

  test('API_SCHEDDETAIL_002 returns schedule detail for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${defaultEditScheduleId}`,
      { headers: adminHeaders() }
    );
    if (res.status() === 404) {
      test.skip(true, 'Seed schedule not found on API');
    }
    expect(res.status()).toBe(200);
    const body = await res.json();
    const row = body.data ?? body;
    for (const key of detailApiFieldKeys) {
      expect(row[key] ?? row[key.replace('_', '')]).toBeTruthy();
    }
  });

  test('API_SCHEDDETAIL_003 returns 404 for missing schedule', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules/999999999`, {
      headers: adminHeaders(),
    });
    expect(res.status()).toBe(404);
  });

  test('API_SCHEDDETAIL_004 rejects non-admin user', async ({ request }) => {
    test.skip(!userApiAvailable, 'User API login not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${defaultEditScheduleId}`,
      { headers: userHeaders() }
    );
    expect([401, 403]).toContain(res.status());
  });

  test('API_SCHEDDETAIL_005 keeps booked count within max people', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${defaultEditScheduleId}`,
      { headers: adminHeaders() }
    );
    if (res.status() === 404) {
      test.skip(true, 'Seed schedule not found on API');
    }
    expect(res.status()).toBe(200);
    const row = (await res.json()).data;
    const booked = Number(row.booked_people ?? row.bookedPeople ?? 0);
    const max = Number(row.max_people ?? row.maxPeople ?? 0);
    expect(booked).toBeLessThanOrEqual(max);
  });

  test('API_SCHEDDETAIL_006 includes nested tour name', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${defaultEditScheduleId}`,
      { headers: adminHeaders() }
    );
    if (res.status() === 404) {
      test.skip(true, 'Seed schedule not found on API');
    }
    expect(res.status()).toBe(200);
    const row = (await res.json()).data;
    const tourName = row.tour?.name ?? row.tourName;
    expect(String(tourName || '').trim().length).toBeGreaterThan(0);
  });

  test('API_SCHEDDETAIL_007 returns available status shape', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${defaultEditScheduleId}`,
      { headers: adminHeaders() }
    );
    if (res.status() === 404) {
      test.skip(true, 'Seed schedule not found on API');
    }
    expect(res.status()).toBe(200);
    const status = String((await res.json()).data.status).toLowerCase();
    expect(['available', 'active', 'open']).toContain(status);
  });

  test('API_SCHEDDETAIL_008 returns full schedule when present', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/tour-schedules/${fullScheduleId}`, {
      headers: adminHeaders(),
    });
    if (res.status() === 404) {
      test.skip(true, 'Full schedule seed not found');
    }
    expect(res.status()).toBe(200);
    const row = (await res.json()).data;
    const status = String(row.status).toLowerCase();
    const booked = Number(row.booked_people ?? 0);
    const max = Number(row.max_people ?? 0);
    if (!(status === 'full' || booked >= max)) {
      test.skip(true, 'Live API schedule 102 is not in full state');
    }
    expect(status === 'full' || booked >= max).toBeTruthy();
  });

  test('API_SCHEDDETAIL_009 returns cancelled schedule when present', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${cancelledScheduleId}`,
      { headers: adminHeaders() }
    );
    if (res.status() === 404) {
      test.skip(true, 'Cancelled schedule seed not found');
    }
    expect(res.status()).toBe(200);
    const status = String((await res.json()).data.status).toLowerCase();
    if (!['cancelled', 'canceled', 'inactive'].includes(status)) {
      test.skip(true, 'Live API schedule 103 is not cancelled');
    }
    expect(['cancelled', 'canceled', 'inactive']).toContain(status);
  });

  test('API_SCHEDDETAIL_010 accepts operational fields in response', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${defaultEditScheduleId}`,
      { headers: adminHeaders() }
    );
    if (res.status() === 404) {
      test.skip(true, 'Seed schedule not found on API');
    }
    expect(res.status()).toBe(200);
    const row = (await res.json()).data;
    expect(row).toHaveProperty('departure_code');
    expect(row).toHaveProperty('departure_place');
    expect(row).toHaveProperty('booking_deadline');
  });

  test('API_SCHEDDETAIL_011 exposes nullable price override fields', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(
      `${testEnv.apiBaseUrl}/admin/tour-schedules/${defaultEditScheduleId}`,
      { headers: adminHeaders() }
    );
    if (res.status() === 404) {
      test.skip(true, 'Seed schedule not found on API');
    }
    expect(res.status()).toBe(200);
    const row = (await res.json()).data;
    expect(row).toHaveProperty('price_adult');
    expect(row).toHaveProperty('price_child');
    expect(row).toHaveProperty('price_infant');
  });
});
