/**
 * Admin Booking List — mapped from 04a_booking_list.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BookingListPage, bookingListCopy as copy } from '../pages/admin/BookingListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockBooking,
  mockBookingsApi,
  resetMockBookings,
  setBookingListEmpty,
} from '../fixtures/api/bookings.mock';
import {
  amountPatternFor,
  expectedBookingListStats,
  expectedBookingListTotal,
  mockBookingFilterScheduleId,
  mockBookingFilterUserId,
  mockBookingSearchCode,
  mockBookingSearchCustomer,
  mockBookingSearchTour,
  primaryBookingRow,
} from '../fixtures/data/bookings.data';

test.describe('Admin Booking List @P1', () => {
  let listPage: BookingListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    listPage = new BookingListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_BLIST_001 */
  test('TC_AD_BLIST_001 renders heading stats filters and table', async () => {
    await expect(listPage.heading).toBeVisible();
    await expect(listPage.subtitle).toBeVisible();
    await expect(listPage.statsGrid).toBeVisible();
    await expect(listPage.searchInput).toBeVisible();
    await expect(listPage.table).toBeVisible();
    await expect(listPage.exportButton).toBeVisible();
    await expect(listPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_BLIST_002 */
  test('TC_AD_BLIST_002 shows stats cards from API', async () => {
    await expect(listPage.statValue(copy.statsTotal)).toHaveText(String(expectedBookingListTotal));
    await expect(listPage.statValue(copy.statsPending)).toHaveText(String(expectedBookingListStats.pending));
    await expect(listPage.statValue(copy.statsConfirmed)).toHaveText(String(expectedBookingListStats.confirmed));
    await expect(listPage.statValue(copy.statsCompleted)).toHaveText(String(expectedBookingListStats.completed));
    await expect(listPage.statValue(copy.statsCancelled)).toHaveText(String(expectedBookingListStats.cancelled));
  });

  /** TC_AD_BLIST_003 — data display integrity */
  test('TC_AD_BLIST_003 displays booking code customer tour and amount', async () => {
    const row = listPage.rowByCode(primaryBookingRow.booking_code);
    await expect(row).toBeVisible();
    await expect(row).toContainText(primaryBookingRow.customer_name);
    await expect(row).toContainText(primaryBookingRow.tour_name);
    await expect(row.getByText(amountPatternFor(primaryBookingRow.total_amount))).toBeVisible();
    await expect(row.getByText(copy.statusPending).first()).toBeVisible();
  });

  /** TC_AD_BLIST_011 */
  test('TC_AD_BLIST_011 searches by booking code', async () => {
    await listPage.search(mockBookingSearchCode);
    await expect(listPage.tableRows).toHaveCount(1);
    await expect(listPage.rowByCode(mockBookingSearchCode)).toBeVisible();
  });

  /** TC_AD_BLIST_012 */
  test('TC_AD_BLIST_012 searches by customer name', async () => {
    await listPage.search(mockBookingSearchCustomer);
    await expect(listPage.tableRows).toHaveCount(1);
    await expect(listPage.rowByCode(mockBookingSearchCode)).toBeVisible();
  });

  /** TC_AD_BLIST_014 */
  test('TC_AD_BLIST_014 searches by tour name', async () => {
    await listPage.search(primaryBookingRow.tour_name);
    await expect(listPage.rowByCode(primaryBookingRow.booking_code)).toBeVisible();
    await expect(listPage.tableRows.filter({ hasText: /BK-/ })).toHaveCount(2);
  });

  /** TC_AD_BLIST_015 */
  test('TC_AD_BLIST_015 search is case-insensitive', async () => {
    await listPage.search('bk-2026-0101');
    await expect(listPage.rowByCode(mockBookingSearchCode)).toBeVisible();
    await listPage.searchInput.fill('');
    await listPage.submitSearchWithEnter('BK-2026-0101');
    await expect(listPage.rowByCode(mockBookingSearchCode)).toBeVisible();
  });

  /** TC_AD_BLIST_018 */
  test('TC_AD_BLIST_018 filters by pending status', async () => {
    await listPage.selectStatusFilter(copy.statusPending);
    await expect(listPage.tableRows).toHaveCount(expectedBookingListStats.pending);
    await expect(listPage.rowByCode('BK-2026-0102')).toBeVisible();
    await expect(listPage.rowByCode('BK-2026-0107')).toHaveCount(0);
  });

  /** TC_AD_BLIST_047 */
  test('TC_AD_BLIST_047 view button navigates to booking detail', async ({ adminPage }) => {
    const row = listPage.rowByCode(primaryBookingRow.booking_code);
    await listPage.viewButtonInRow(row).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/bookings/detail/${primaryBookingRow.id}`));
  });

  /** TC_AD_BLIST_049 */
  test('TC_AD_BLIST_049 confirms pending booking', async ({ adminPage }) => {
    const row = listPage.rowByCode('BK-2026-0101');
    const patchReq = listPage.waitForBookingStatusPatch(101);
    await listPage.confirmBookingButtonInRow(row).click();
    await patchReq;
    await expect(adminPage.getByText(copy.confirmSuccess)).toBeVisible();
    expect(getMockBooking(101)?.booking_status).toBe('confirmed');
  });

  /** TC_AD_BLIST_053 */
  test('TC_AD_BLIST_053 opens confirm payment dialog', async () => {
    const row = listPage.rowByCode('BK-2026-0101');
    await listPage.confirmPaymentButtonInRow(row).click();
    await expect(listPage.confirmPaymentDialog).toBeVisible();
    await expect(listPage.confirmPaymentDialog.getByText('BK-2026-0101')).toBeVisible();
  });

  /** TC_AD_BLIST_054 */
  test('TC_AD_BLIST_054 confirms payment updates booking', async ({ adminPage }) => {
    const row = listPage.rowByCode('BK-2026-0101');
    await listPage.confirmPaymentButtonInRow(row).click();
    const patchReq = listPage.waitForBookingConfirmPayment(101);
    await listPage.confirmPaymentDialogSubmit();
    await patchReq;
    await expect(adminPage.getByText(copy.paymentSuccess)).toBeVisible();
    expect(getMockBooking(101)?.payment_status).toBe('success');
  });

  /** TC_AD_BLIST_058 */
  test('TC_AD_BLIST_058 opens cancel dialog for confirmed booking', async () => {
    const row = listPage.rowByCode('BK-2026-0103');
    await listPage.cancelBookingButtonInRow(row).click();
    await expect(listPage.cancelDialog).toBeVisible();
    await expect(listPage.cancelDialog.getByText('BK-2026-0103')).toBeVisible();
  });

  /** TC_AD_BLIST_069 */
  test('TC_AD_BLIST_069 requires cancel reason before submit', async () => {
    const row = listPage.rowByCode('BK-2026-0103');
    await listPage.cancelBookingButtonInRow(row).click();
    await listPage.submitCancelDialog();
    await expect(listPage.cancelDialog.getByText(copy.reasonRequired)).toBeVisible();
  });

  /** TC_AD_BLIST_071 */
  test('TC_AD_BLIST_071 cancels booking with valid reason', async ({ adminPage }) => {
    const row = listPage.rowByCode('BK-2026-0103');
    await listPage.cancelBookingButtonInRow(row).click();
    await listPage.fillCancelReason('Khách hàng yêu cầu hủy đơn');
    const patchReq = listPage.waitForBookingStatusPatch(103);
    await listPage.submitCancelDialog();
    await patchReq;
    await expect(adminPage.getByText(copy.cancelSuccess)).toBeVisible();
    expect(getMockBooking(103)?.booking_status).toBe('cancelled');
  });
});

test.describe('Admin Booking List — empty @P1', () => {
  test('TC_AD_BLIST_068 shows empty state when no bookings', async ({ adminPage }) => {
    resetMockBookings();
    setBookingListEmpty(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const listPage = new BookingListPage(adminPage);
    await listPage.goto();
    await expect(listPage.page.getByText(copy.emptyTitle)).toBeVisible({ timeout: 15_000 });
    await expect(listPage.page.getByText(copy.emptySubtitle)).toBeVisible();
    await expect(listPage.tableRows.filter({ hasText: /BK-/ })).toHaveCount(0);
  });
});
