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
  setBookingInvoiceFail,
  setBookingMutationFail,
} from '../fixtures/api/bookings.mock';
import {
  confirmedBookingDetailId,
  edgeBookingDetailId,
  mockBookingDetailMultiPassenger,
  multiPassengerDetailId,
  primaryBookingDetailId,
} from '../fixtures/data/booking-detail.data';

test.describe('Admin Booking Detail extended @P2', () => {
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
  test('TC_AD_BDET_028 dismisses complete browser confirm without API', async ({ adminPage }) => {
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
    adminPage.on('dialog', (dialog) => dialog.dismiss());
    await detailPage.goto();
    await detailPage.waitForLoaded();
    await detailPage.completeBookingButton.click();
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

  /** TC_AD_BDET_027 */
  test('TC_AD_BDET_027 collapses sticky header on scroll', async ({ adminPage }) => {
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
});
