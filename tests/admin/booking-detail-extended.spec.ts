/**
 * Admin Booking Detail — extended coverage (04b)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BookingDetailPage, bookingDetailCopy as copy } from '../pages/admin/BookingDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockBooking,
  getMockBookingDetail,
  mockBookingsApi,
  resetMockBookings,
  setBookingDetailDelay,
  setBookingInvoiceFail,
  setBookingMutationFail,
} from '../fixtures/api/bookings.mock';
import {
  cancelledBookingDetailId,
  completedBookingDetailId,
  confirmedBookingDetailId,
  edgeBookingDetailId,
  mockBookingDetailMultiPassenger,
  mockBookingDetailPending,
  multiPassengerDetailId,
  primaryBookingDetailId,
} from '../fixtures/data/booking-detail.data';

test.describe('Admin Booking Detail extended @P2', () => {
  /** TC_AD_BDET_004 */
  test('TC_AD_BDET_004 shows skeleton while detail API is delayed', async ({ adminPage }) => {
    resetMockBookings();
    setBookingDetailDelay(1500);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await expect(detailPage.loadingSkeletonGrid).toBeVisible();
    await expect(detailPage.customerSection).toHaveCount(0);
    await detailPage.waitForLoaded();
    await detailPage.captureUiScreenshot('TC_AD_BDET_004');
  });

  /** TC_AD_BDET_010 */
  test('TC_AD_BDET_010 shows address missing fallback', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, edgeBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await expect(adminPage.getByText(copy.addressMissing)).toBeVisible();
    await expect(adminPage.getByText(copy.noNote)).toBeVisible();
  });

  /** TC_AD_BDET_012 */
  test('TC_AD_BDET_012 displays tour thumbnail when available', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const tourName = mockBookingDetailPending.items[0].tour!.name;
    await expect(adminPage.getByRole('img', { name: tourName })).toBeVisible();
  });

  /** TC_AD_BDET_013 */
  test('TC_AD_BDET_013 shows tour thumbnail fallback icon', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, edgeBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await expect(detailPage.tourSection).toBeVisible();
    await expect(adminPage.locator('img[alt="Tour Bà Nà Hills Sunset"]')).toHaveCount(0);
  });

  /** TC_AD_BDET_015 */
  test('TC_AD_BDET_015 shows departure place missing fallback', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, edgeBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const tourSection = adminPage.locator('div').filter({ has: detailPage.tourSection });
    await expect(tourSection.getByText(copy.departureMissing).last()).toBeVisible();
  });

  /** TC_AD_BDET_016 multi */
  test('TC_AD_BDET_016b aggregates passengers across items', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, multiPassengerDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const section = adminPage.locator('div').filter({ has: detailPage.passengersSection });
    await expect(section.getByText('3').first()).toBeVisible();
    await expect(section.getByText('1').first()).toBeVisible();
    await expect(section.getByText('1', { exact: true }).nth(1)).toBeVisible();
  });

  /** TC_AD_BDET_019 */
  test('TC_AD_BDET_019 shows zero discount without NaN', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, edgeBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const paymentCard = detailPage.paymentCard;
    await expect(paymentCard.getByText('- 0 ₫')).toBeVisible();
    await expect(paymentCard.getByText(/^NaN/)).toHaveCount(0);
  });

  /** TC_AD_BDET_021 */
  test('TC_AD_BDET_021 timeline shows confirmed milestone with date', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, confirmedBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const timeline = adminPage.locator('div').filter({ has: detailPage.timelineSection });
    await expect(timeline.getByRole('heading', { level: 4, name: /Đã xác nhận đơn|Confirmed/i })).toBeVisible();
    await expect(timeline.getByText(/10\/06\/2026/).first()).toBeVisible();
  });

  /** TC_AD_BDET_022 */
  test('TC_AD_BDET_022 timeline shows completed milestone for completed booking', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, completedBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const timeline = adminPage.locator('div').filter({ has: detailPage.timelineSection });
    await expect(timeline.getByRole('heading', { level: 4, name: /Đã hoàn tất tour|Completed/i })).toBeVisible();
    await expect(adminPage.getByText(copy.terminalCompleted)).toBeVisible();
  });

  /** TC_AD_BDET_023 */
  test('TC_AD_BDET_023 timeline shows cancelled milestone and reason', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, cancelledBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const timeline = adminPage.locator('div').filter({ has: detailPage.timelineSection });
    await expect(timeline.getByRole('heading', { level: 4, name: copy.timelineCancelled })).toBeVisible();
    await expect(adminPage.getByText('Khách hủy vì lịch trình thay đổi')).toBeVisible();
  });

  /** TC_AD_BDET_034 */
  test('TC_AD_BDET_034 shows error toast when cancel fails', async ({ adminPage }) => {
    resetMockBookings();
    setBookingMutationFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.openCancelDialog();
    await detailPage.fillCancelReason('Khách yêu cầu hủy đơn');
    await detailPage.submitCancelDialog();
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
    expect(getMockBooking(primaryBookingDetailId)?.booking_status).toBe('pending');
  });

  /** TC_AD_BDET_020 */
  test('TC_AD_BDET_020 timeline shows booked milestone', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    const timeline = adminPage.locator('div').filter({ has: detailPage.timelineSection });
    await expect(timeline.getByText(/Đã đặt đơn|Booked/i).first()).toBeVisible();
  });

  /** TC_AD_BDET_028 */
  test('TC_AD_BDET_028 dismisses complete dialog without API', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, confirmedBookingDetailId);
    let patchCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes(`/admin/bookings/${confirmedBookingDetailId}/status`)) {
        patchCalled = true;
      }
    });
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.openCompleteDialog();
    await detailPage.dismissCompleteDialog();
    expect(patchCalled).toBe(false);
    expect(getMockBooking(confirmedBookingDetailId)?.booking_status).toBe('confirmed');
  });

  /** TC_AD_BDET_026 */
  test('TC_AD_BDET_026 shows error toast when confirm fails', async ({ adminPage }) => {
    resetMockBookings();
    setBookingMutationFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.confirmBookingButton.click();
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
  });

  /** TC_AD_BDET_038 */
  test('TC_AD_BDET_038 shows export error when invoice fails', async ({ adminPage }) => {
    resetMockBookings();
    setBookingInvoiceFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.invoiceButton.click();
    await expect(adminPage.getByText(copy.exportError)).toBeVisible();
  });

  /** TC_AD_BDET_053 confirm payment */
  test('TC_AD_BDET_053 confirms payment from detail page', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.confirmPaymentButton.click();
    const patchReq = detailPage.waitForConfirmPayment();
    await detailPage.confirmPaymentDialogSubmit();
    await patchReq;
    await expect(adminPage.getByText(copy.paymentSuccessToast)).toBeVisible();
    expect(getMockBookingDetail(primaryBookingDetailId)?.payment_status).toBe('success');
  });

  /** TC_AD_BDET_014 */
  test('TC_AD_BDET_014 displays schedule code and travel date', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await expect(adminPage.getByText('#10')).toBeVisible();
    await expect(adminPage.getByText(/20\/06\/2026/)).toBeVisible();
  });

  /** TC_AD_BDET_041 — sticky header collapse (supplement) */
  test('TC_AD_BDET_041 collapses sticky header on scroll', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();

    await expect(detailPage.stickyContextBadge).toBeHidden();
    await detailPage.scrollMainContent(250);
    await expect(detailPage.stickyContextBadge).toBeVisible();

    await detailPage.scrollMainContent(0);
    await expect(detailPage.stickyContextBadge).toBeHidden();
  });

  /** TC_AD_BDET_039 */
  test('TC_AD_BDET_039 mobile layout keeps actions usable', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto({ width: 375, height: 812 });
    await detailPage.waitForLoaded();
    await expect(detailPage.mobileFooter).toBeVisible();
    await expect(detailPage.mobileFooter.getByRole('button', { name: copy.confirmBooking })).toBeVisible();
    await expect(detailPage.cancelBookingButton).toBeVisible();
    await detailPage.captureUiScreenshot('TC_AD_BDET_039');
  });

  /** TC_AD_BDET_060 */
  test('TC_AD_BDET_060 renders detail at standard viewport 1535x697', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.captureUiScreenshot('TC_AD_BDET_060');
  });
});

test.describe('Admin Booking Detail — lifecycle @P1', () => {
  test.describe.configure({ mode: 'serial' });

  /** TC_AD_BDET_040 */
  test('TC_AD_BDET_040 pending to confirmed to completed lifecycle', async ({ adminPage }) => {
    resetMockBookings();
    await mockAdminLayoutApis(adminPage);
    await mockBookingsApi(adminPage);
    const detailPage = new BookingDetailPage(adminPage, primaryBookingDetailId);
    await detailPage.goto();
    await detailPage.waitForLoaded();

    await expect(detailPage.confirmBookingButton).toBeVisible();
    const confirmReq = detailPage.waitForStatusPatch();
    await detailPage.confirmBookingButton.click();
    await confirmReq;
    await expect(adminPage.getByText(copy.confirmSuccess)).toBeVisible();
    await expect(detailPage.completeBookingButton).toBeVisible({ timeout: 10_000 });
    await expect(detailPage.allConfirmBookingButtons).toHaveCount(0);

    const completeReq = detailPage.waitForStatusPatch();
    await detailPage.openCompleteDialog();
    await detailPage.submitCompleteDialog();
    await completeReq;
    await expect(adminPage.getByText(copy.completeSuccess)).toBeVisible();
    await expect(adminPage.getByText(copy.terminalCompleted)).toBeVisible({ timeout: 10_000 });
    expect(getMockBooking(primaryBookingDetailId)?.booking_status).toBe('completed');
    await detailPage.captureUiScreenshot('TC_AD_BDET_040');
  });
});
