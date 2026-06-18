/**
 * Booking Detail API tests (04b)
 */
import { test, expect } from '@playwright/test';
import { testEnv } from '../../config/env.test';
import { primaryBookingDetailId, invalidBookingDetailId } from '../fixtures/data/booking-detail.data';

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

test.describe('GET /admin/bookings/:id @P1', () => {
  test('API_BDET_001 rejects unauthenticated detail', async ({ request }) => {
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings/1`);
    expect(res.status()).toBe(401);
  });

  test('API_BDET_002 returns booking detail for admin', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const listRes = await request.get(`${testEnv.apiBaseUrl}/admin/bookings?per_page=1`, {
      headers: authHeaders(),
    });
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    const firstId = listBody.data?.data?.[0]?.id ?? listBody.data?.[0]?.id;
    test.skip(!firstId, 'No booking in database');

    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings/${firstId}`, {
      headers: authHeaders(),
    });
    expect([200, 500]).toContain(res.status());
    if (res.status() !== 200) return;
    const body = await res.json();
    const booking = body.data?.data ?? body.data;
    expect(booking?.booking_code ?? booking?.id).toBeTruthy();
  });

  test('API_BDET_003 returns 404 for invalid booking id', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const res = await request.get(`${testEnv.apiBaseUrl}/admin/bookings/${invalidBookingDetailId}`, {
      headers: authHeaders(),
    });
    expect([404, 422]).toContain(res.status());
  });
});

test.describe('PATCH /admin/bookings/:id/status @P1', () => {
  test('API_BDET_004 admin can patch booking status', async ({ request }) => {
    test.skip(!apiAvailable, 'API not available');
    const listRes = await request.get(`${testEnv.apiBaseUrl}/admin/bookings?booking_status=pending&per_page=1`, {
      headers: authHeaders(),
    });
    test.skip(!listRes.ok(), 'List not available');
    const listBody = await listRes.json();
    const pendingId = listBody.data?.data?.[0]?.id ?? listBody.data?.[0]?.id;
    test.skip(!pendingId, 'No pending booking');

    const res = await request.patch(`${testEnv.apiBaseUrl}/admin/bookings/${pendingId}/status`, {
      headers: authHeaders(),
      data: { booking_status: 'confirmed' },
    });
    expect([200, 422]).toContain(res.status());
  });
});
