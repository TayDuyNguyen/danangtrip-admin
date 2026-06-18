/**
 * Admin Booking List — extended coverage (04a)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BookingListPage, bookingListCopy as copy } from '../pages/admin/BookingListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockBooking,
  mockBookingsApi,
  resetMockBookings,
  setBookingExportFail,
} from '../fixtures/api/bookings.mock';
import {
  mockBookingFilterScheduleId,
  mockBookingFilterUserId,
} from '../fixtures/data/bookings.data';

test.describe('Admin Booking List extended @P2', () => {
  let listPage: BookingListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    listPage = new BookingListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_BLIST_019 */
  test('TC_AD_BLIST_019 filters by confirmed status', async () => {
    await listPage.selectStatusFilter(copy.statusConfirmed);
    await expect(listPage.tableRows).toHaveCount(3);
    await expect(listPage.rowByCode('BK-2026-0106')).toBeVisible();
  });

  /** TC_AD_BLIST_020 */
  test('TC_AD_BLIST_020 filters by completed status', async () => {
    await listPage.selectStatusFilter(copy.statusCompleted);
    await expect(listPage.tableRows).toHaveCount(3);
    await expect(listPage.rowByCode('BK-2026-0107')).toBeVisible();
  });

  /** TC_AD_BLIST_024 */
  test('TC_AD_BLIST_024 filters by payment pending', async () => {
    await listPage.selectPaymentFilter(copy.paymentPending);
    await expect(listPage.tableRows).toHaveCount(2);
    await expect(listPage.rowByCode('BK-2026-0102')).toBeVisible();
  });

  /** TC_AD_BLIST_025 */
  test('TC_AD_BLIST_025 filters by payment paid', async () => {
    await listPage.selectPaymentFilter(copy.paymentPaid);
    await expect(listPage.tableRows).toHaveCount(5);
  });

  /** TC_AD_BLIST_028 */
  test('TC_AD_BLIST_028 applies date range filter', async () => {
    await listPage.setDateFrom('2026-06-10');
    await listPage.setDateTo('2026-06-12');
    await listPage.applyFilters();
    await expect(listPage.tableRows).toHaveCount(3);
    await expect(listPage.rowByCode('BK-2026-0101')).toBeVisible();
  });

  /** TC_AD_BLIST_035 */
  test('TC_AD_BLIST_035 resets filters after search', async () => {
    await listPage.search('BK-2026-0101');
    await expect(listPage.tableRows).toHaveCount(1);
    await listPage.resetFilters();
    await expect(listPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_BLIST_040 */
  test('TC_AD_BLIST_040 toggles sort by booked date', async () => {
    const listReq = listPage.waitForBookingListResponse();
    await listPage.sortBookedAtButton().click();
    const res = await listReq;
    const url = new URL(res.url());
    expect(url.searchParams.get('sort_by') || url.searchParams.get('sort')).toBe('booked_at');
  });

  /** TC_AD_BLIST_046 */
  test('TC_AD_BLIST_046 changes rows per page', async () => {
    await listPage.changeLimit(20);
    await expect(listPage.tableRows).toHaveCount(12);
  });

  /** TC_AD_BLIST_047 pagination */
  test('TC_AD_BLIST_064 navigates to page 2', async () => {
    await expect(listPage.pageButton(2)).toBeVisible();
    await listPage.goToPage(2);
    await expect(listPage.tableRows).toHaveCount(2);
    await expect(listPage.rowByCode('BK-2026-0112')).toBeVisible();
  });

  /** TC_AD_BLIST_050 */
  test('TC_AD_BLIST_050 refresh button refetches list', async () => {
    const refreshReq = listPage.waitForBookingListResponse();
    await listPage.refreshButton.click();
    await refreshReq;
    await expect(listPage.tableRows.first()).toBeVisible();
  });

  /** TC_AD_BLIST_051 */
  test('TC_AD_BLIST_051 opens with user_id query param', async ({ adminPage }) => {
    await adminPage.goto(`/admin/bookings?user_id=${mockBookingFilterUserId}`);
    await listPage.heading.waitFor({ state: 'visible' });
    await listPage.waitForTableLoaded();
    await expect(listPage.tableRows).toHaveCount(3);
    await expect(listPage.page.getByText(new RegExp(`Người dùng ID.*${mockBookingFilterUserId}`, 'i'))).toBeVisible();
  });

  /** TC_AD_BLIST_052 */
  test('TC_AD_BLIST_052 opens with tour_schedule_id query param', async ({ adminPage }) => {
    await adminPage.goto(`/admin/bookings?tour_schedule_id=${mockBookingFilterScheduleId}`);
    await listPage.heading.waitFor({ state: 'visible' });
    await listPage.waitForTableLoaded();
    await expect(listPage.tableRows).toHaveCount(2);
    await expect(listPage.rowByCode('BK-2026-0101')).toBeVisible();
  });

  /** TC_AD_BLIST_023 */
  test('TC_AD_BLIST_023 opens with status=pending query param', async ({ adminPage }) => {
    await adminPage.goto('/admin/bookings?status=pending');
    await listPage.heading.waitFor({ state: 'visible' });
    await listPage.waitForTableLoaded();
    await expect(listPage.tableRows).toHaveCount(4);
  });

  /** TC_AD_BLIST_057 */
  test('TC_AD_BLIST_057 hides confirm button after booking confirmed', async () => {
    const row = listPage.rowByCode('BK-2026-0106');
    await expect(listPage.confirmBookingButtonInRow(row)).toHaveCount(0);
  });

  /** TC_AD_BLIST_062 */
  test('TC_AD_BLIST_062 hides payment button for cancelled booking', async () => {
    const row = listPage.rowByCode('BK-2026-0104');
    await expect(listPage.confirmPaymentButtonInRow(row)).toHaveCount(0);
  });

  /** TC_AD_BLIST_072 */
  test('TC_AD_BLIST_072 closes cancel dialog without API call', async ({ adminPage }) => {
    let patchCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/admin/bookings/103/status')) {
        patchCalled = true;
      }
    });
    const row = listPage.rowByCode('BK-2026-0103');
    await listPage.cancelBookingButtonInRow(row).click();
    await listPage.closeCancelDialog();
    await expect(listPage.cancelDialog).toHaveCount(0);
    expect(patchCalled).toBe(false);
    expect(getMockBooking(103)?.booking_status).toBe('confirmed');
  });

  /** TC_AD_BLIST_065 */
  test('TC_AD_BLIST_065 closes confirm payment dialog without API', async ({ adminPage }) => {
    let patchCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/admin/bookings/101/confirm-payment')) {
        patchCalled = true;
      }
    });
    const row = listPage.rowByCode('BK-2026-0101');
    await listPage.confirmPaymentButtonInRow(row).click();
    await listPage.closeConfirmPaymentDialog();
    expect(patchCalled).toBe(false);
  });

  /** TC_AD_BLIST_004 */
  test('TC_AD_BLIST_004 export excel triggers download', async ({ adminPage }) => {
    const downloadPromise = adminPage.waitForEvent('download');
    await listPage.exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    await expect(adminPage.getByText(copy.exportSuccess)).toBeVisible();
  });

  /** TC_AD_BLIST_076 */
  test('TC_AD_BLIST_076 shows export error toast', async ({ adminPage }) => {
    resetMockBookings();
    setBookingExportFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    listPage = new BookingListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.exportButton.click();
    await expect(adminPage.getByText(/Có lỗi xảy ra khi xuất|An error occurred while exporting/i)).toBeVisible();
  });
});
