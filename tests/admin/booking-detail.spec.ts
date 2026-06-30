/**
 * Admin Booking Detail — mapped from 04b_booking_detail.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BookingDetailPage, bookingDetailCopy as copy } from '../pages/admin/BookingDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockBooking,
  getMockBookingDetail,
  mockBookingsApi,
  resetMockBookings,
  setBookingDetailFail,
  setBookingInvoiceFail,
  setBookingMutationFail,
} from '../fixtures/api/bookings.mock';
import {
  cancelledBookingDetailId,
  completedBookingDetailId,
  confirmedBookingDetailId,
  invalidBookingDetailId,
  mockBookingDetailPending,
  primaryBookingDetailId,
} from '../fixtures/data/booking-detail.data';

test.describe('Admin Booking Detail @P1', () => {
  let detailPage: BookingDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
  });

  /** TC_AD_BDET_003 */
  test('TC_AD_BDET_003 loads booking detail sections', async () => {
    await expect(detailPage.pageTitle).toContainText(mockBookingDetailPending.booking_code);
    await expect(detailPage.customerSection).toBeVisible();
    await expect(detailPage.tourSection).toBeVisible();
    await expect(detailPage.paymentSection).toBeVisible();
    await expect(detailPage.passengersSection).toBeVisible();
    await expect(detailPage.timelineSection).toBeVisible();
    await expect(detailPage.operationsSection).toBeVisible();
    await detailPage.captureUiScreenshot('TC_AD_BDET_003');
  });

  /** TC_AD_BDET_024 */
  test('TC_AD_BDET_024 shows confirm and cancel only for pending booking', async () => {
    await expect(detailPage.confirmBookingButton).toBeVisible();
    await expect(detailPage.cancelBookingButton).toBeVisible();
    await expect(detailPage.allCompleteBookingButtons).toHaveCount(0);
  });

  /** TC_AD_BDET_008 */
  test('TC_AD_BDET_008 shows status badges in header', async ({ adminPage }) => {
    await expect(adminPage.getByText(copy.statusPending).first()).toBeVisible();
    await expect(adminPage.getByText(copy.paymentUnpaid).first()).toBeVisible();
  });

  /** TC_AD_BDET_009 */
  test('TC_AD_BDET_009 displays full customer information', async ({ adminPage }) => {
    const main = adminPage.locator('main');
    await expect(main.getByText(mockBookingDetailPending.customer_name, { exact: true })).toBeVisible();
    await expect(main.getByText(mockBookingDetailPending.customer_email, { exact: true })).toBeVisible();
    await expect(main.getByText(mockBookingDetailPending.customer_phone!)).toBeVisible();
    await expect(main.getByText(mockBookingDetailPending.customer_address!)).toBeVisible();
    await expect(main.getByText(mockBookingDetailPending.customer_note!)).toBeVisible();
  });

  /** TC_AD_BDET_018 */
  test('TC_AD_BDET_018 displays payment summary amounts', async ({ adminPage }) => {
    await expect(adminPage.getByText(/2[.,]450[.,]000/)).toBeVisible();
    await expect(adminPage.getByText(/2[.,]400[.,]000/)).toBeVisible();
  });

  /** TC_AD_BDET_016 */
  test('TC_AD_BDET_016 shows passenger totals', async ({ adminPage }) => {
    const section = adminPage.locator('div').filter({ has: detailPage.passengersSection });
    await expect(section.getByText('2').first()).toBeVisible();
    await expect(section.getByText('1').first()).toBeVisible();
    await expect(section.getByText('0').first()).toBeVisible();
  });

  /** TC_AD_BDET_024 / 025 */
  test('TC_AD_BDET_025 confirms pending booking', async ({ adminPage }) => {
    const patchReq = detailPage.waitForStatusPatch();
    await detailPage.confirmBookingButton.click();
    await patchReq;
    await expect(adminPage.getByText(copy.confirmSuccess)).toBeVisible();
    expect(getMockBooking(primaryBookingDetailId)?.booking_status).toBe('confirmed');
  });

  /** TC_AD_BDET_007 */
  test('TC_AD_BDET_007 back button navigates to booking list', async ({ adminPage }) => {
    await detailPage.backButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/bookings\/?$/);
  });

  /** TC_AD_BDET_031 / 032 */
  test('TC_AD_BDET_032 cancels booking with valid reason', async ({ adminPage }) => {
    await detailPage.openCancelDialog();
    await detailPage.fillCancelReason('Khách yêu cầu hủy đơn');
    const patchReq = detailPage.waitForStatusPatch();
    await detailPage.submitCancelDialog();
    await patchReq;
    await expect(adminPage.getByText(copy.cancelSuccess)).toBeVisible();
    expect(getMockBooking(primaryBookingDetailId)?.booking_status).toBe('cancelled');
  });

  /** TC_AD_BDET_033 */
  test('TC_AD_BDET_033 requires cancel reason before submit', async () => {
    await detailPage.openCancelDialog();
    await detailPage.submitCancelDialog();
    await expect(detailPage.cancelDialog.getByText(copy.reasonRequired)).toBeVisible();
  });

  /** TC_AD_BDET_037 */
  test('TC_AD_BDET_037 downloads invoice pdf', async ({ adminPage }) => {
    const downloadPromise = adminPage.waitForEvent('download');
    await detailPage.invoiceButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});

test.describe('Admin Booking Detail — confirmed @P1', () => {
  test('TC_AD_BDET_027 shows complete button for confirmed booking', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, confirmedBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await expect(detailPage.completeBookingButton).toBeVisible();
    await expect(detailPage.allConfirmBookingButtons).toHaveCount(0);
  });

  /** TC_AD_BDET_029 */
  test('TC_AD_BDET_029 completes confirmed booking', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, confirmedBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const patchReq = detailPage.waitForStatusPatch();
    await detailPage.openCompleteDialog();
    await detailPage.submitCompleteDialog();
    await patchReq;
    await expect(adminPage.getByText(copy.completeSuccess)).toBeVisible();
    expect(getMockBooking(confirmedBookingDetailId)?.booking_status).toBe('completed');
  });

  /** TC_AD_BDET_030 */
  test('TC_AD_BDET_030 shows error toast when complete fails', async ({ adminPage }) => {
    resetMockBookings();
    setBookingMutationFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, confirmedBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.openCompleteDialog();
    await detailPage.submitCompleteDialog();
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
    expect(getMockBooking(confirmedBookingDetailId)?.booking_status).toBe('confirmed');
  });
});

test.describe('Admin Booking Detail — terminal states @P1', () => {
  test('TC_AD_BDET_035 completed booking hides action buttons', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, completedBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await expect(adminPage.getByText(copy.terminalCompleted)).toBeVisible();
    await expect(detailPage.allConfirmBookingButtons).toHaveCount(0);
    await expect(detailPage.allCompleteBookingButtons).toHaveCount(0);
    await expect(detailPage.cancelBookingButton).toHaveCount(0);
  });

  test('TC_AD_BDET_036 cancelled booking shows timeline reason', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, cancelledBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await expect(adminPage.getByText(copy.terminalCancelled)).toBeVisible();
    await expect(adminPage.getByText('Khách hủy vì lịch trình thay đổi')).toBeVisible();
    const timeline = adminPage.locator('div').filter({ has: detailPage.timelineSection });
    await expect(timeline.getByRole('heading', { level: 4, name: copy.timelineCancelled })).toBeVisible();
  });
});

test.describe('Admin Booking Detail — error @P1', () => {
  test('TC_AD_BDET_005 shows error state for invalid booking id', async ({ adminPage }) => {
    resetMockBookings();
    setBookingDetailFail(false);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, invalidBookingDetailId);
    await detailPage.goto();
    await expect(detailPage.errorPanel).toBeVisible({ timeout: 15_000 });
    await expect(adminPage.getByText(copy.notFoundTitle)).toBeVisible();
    await expect(detailPage.retryButton).toBeVisible();
  });

  /** TC_AD_BDET_006 */
  test('TC_AD_BDET_006 retries after detail API failure', async ({ adminPage }) => {
    resetMockBookings();
    setBookingDetailFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await expect(detailPage.errorPanel).toBeVisible({ timeout: 15_000 });
    setBookingDetailFail(false);
    const detailReq = detailPage.waitForDetailResponse();
    await detailPage.retryButton.click();
    await detailReq;
    await detailPage.waitForLoaded();
  });
});
