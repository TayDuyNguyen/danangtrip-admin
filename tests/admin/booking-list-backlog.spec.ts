/**
 * Admin Booking List — backlog TCs from 04a audit (2026-06-15)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BookingListPage, bookingListCopy as copy } from '../pages/admin/BookingListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  mockBookingsApi,
  resetMockBookings,
  setBookingListFail,
  setBookingMutationFail,
} from '../fixtures/api/bookings.mock';
import {
  expectedBookingListStats,
  mockBookingFilterScheduleId,
  primaryBookingRow,
} from '../fixtures/data/bookings.data';

test.describe('Admin Booking List backlog @P2', () => {
  let listPage: BookingListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    listPage = new BookingListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_BLIST_021 */
  test('TC_AD_BLIST_021 filters by cancelled status', async () => {
    await listPage.selectStatusFilter(copy.statusCancelled);
    await expect(listPage.tableRows).toHaveCount(expectedBookingListStats.cancelled);
    await expect(listPage.rowByCode('BK-2026-0104')).toBeVisible();
  });

  /** TC_AD_BLIST_026 */
  test('TC_AD_BLIST_026 filters by refunded payment', async () => {
    await listPage.selectPaymentFilter(copy.paymentRefunded);
    await expect(listPage.tableRows).toHaveCount(1);
    await expect(listPage.rowByCode('BK-2026-0104')).toBeVisible();
  });

  /** TC_AD_BLIST_036 */
  test('TC_AD_BLIST_036 clears status chip without full reset', async () => {
    await listPage.selectStatusFilter(copy.statusPending);
    await expect(listPage.tableRows).toHaveCount(expectedBookingListStats.pending);
    await listPage.clearFilterChip('status');
    await expect(listPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_BLIST_041 */
  test('TC_AD_BLIST_041 sorts by total amount column', async () => {
    const listReq = listPage.waitForBookingListResponse();
    await listPage.sortAmountButton().click();
    const res = await listReq;
    const url = new URL(res.url());
    const sortBy = url.searchParams.get('sort_by') || url.searchParams.get('sort');
    expect(sortBy).toBe('total_amount');
  });

  /** TC_AD_BLIST_003b */
  test('TC_AD_BLIST_003b displays booked and departure dates in row', async () => {
    const row = listPage.rowByCode(primaryBookingRow.booking_code);
    await expect(row).toContainText(/12\/06\/2026|06\/12\/2026/);
    await expect(row).toContainText(/20\/06\/2026|06\/20\/2026/);
  });

  /** TC_AD_BLIST_002b */
  test('TC_AD_BLIST_002b shows completed stats card', async () => {
    await expect(listPage.statValue(copy.statsCompleted)).toHaveText(String(expectedBookingListStats.completed));
  });

  /** TC_AD_BLIST_053b */
  test('TC_AD_BLIST_053b deep link payment_status=success filters paid bookings', async ({ adminPage }) => {
    await adminPage.goto('/admin/bookings?payment_status=success');
    await listPage.heading.waitFor({ state: 'visible' });
    await listPage.waitForTableLoaded();
    await expect(listPage.tableRows).toHaveCount(5);
    await expect(listPage.rowByCode('BK-2026-0103')).toBeVisible();
  });

  /** TC_AD_BLIST_052b */
  test('TC_AD_BLIST_052b keeps tour_schedule_id when changing status filter', async ({ adminPage }) => {
    await adminPage.goto(`/admin/bookings?tour_schedule_id=${mockBookingFilterScheduleId}`);
    await listPage.heading.waitFor({ state: 'visible' });
    await listPage.waitForTableLoaded();
    await listPage.selectStatusFilter(copy.statusPending);
    await expect(adminPage).toHaveURL(new RegExp(`tour_schedule_id=${mockBookingFilterScheduleId}`));
    await expect(listPage.tableRows).toHaveCount(2);
  });

  /** TC_AD_BLIST_063 */
  test('TC_AD_BLIST_063 hides cancel button for cancelled booking', async () => {
    const row = listPage.rowByCode('BK-2026-0104');
    await expect(listPage.cancelBookingButtonInRow(row)).toHaveCount(0);
  });

  /** TC_AD_BLIST_077 */
  test('TC_AD_BLIST_077 shows list error state with retry', async ({ adminPage }) => {
    resetMockBookings();
    setBookingListFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    listPage = new BookingListPage(adminPage);
    await listPage.goto();
    await expect(listPage.listErrorPanel).toBeVisible({ timeout: 15_000 });
    await expect(listPage.retryListButton).toBeVisible();
    setBookingListFail(false);
    const listReq = listPage.waitForBookingListResponse();
    await listPage.retryListButton.click();
    await listReq;
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_BLIST_078 */
  test('TC_AD_BLIST_078 shows error toast when confirm booking fails', async ({ adminPage }) => {
    setBookingMutationFail(true);
    const row = listPage.rowByCode('BK-2026-0101');
    await listPage.confirmBookingButtonInRow(row).click();
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
  });
});
