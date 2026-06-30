/**
 * Admin Booking Detail — auth guard (04b)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { bookingDetailCopy as copy } from '../pages/admin/BookingDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockBookingsApi, resetMockBookings } from '../fixtures/api/bookings.mock';
import { primaryBookingDetailId } from '../fixtures/data/booking-detail.data';

test.describe('Admin Booking Detail — auth @P0', () => {
  /** TC_AD_BDET_001 — ADMIN_BOOKING_DETAIL_001 */
  test('TC_AD_BDET_001 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/bookings/detail/${primaryBookingDetailId}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.sectionCustomer })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_BDET_002 — ADMIN_BOOKING_DETAIL_002 */
  test('TC_AD_BDET_002 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBookings();
    await mockAdminLayoutApis(page);
    await mockBookingsApi(page);
    await seedNonAdminSession(page);
    await page.goto(`/admin/bookings/detail/${primaryBookingDetailId}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
