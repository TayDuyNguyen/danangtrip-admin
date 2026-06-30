import type { Locator, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';

export const bookingDetailCopy = {
  pageTitle: /Chi tiết Đơn hàng|Booking Details/i,
  sectionCustomer: /Thông tin Khách hàng|Customer Information/i,
  sectionTour: /Chi tiết Tour đã đặt|Booked Tour Details/i,
  sectionPayment: /Thông tin Thanh toán.*Tóm tắt|Payment Info & Summary/i,
  sectionTimeline: /Lịch sử Trạng thái|Status History/i,
  sectionPassengers: /Số lượng Khách tham gia|Passenger Counts/i,
  operationsTitle: /Thao tác xử lý đơn|Booking Operations/i,
  backButton: /Quay lại danh sách|Back to List/i,
  retryButton: /Thử lại|Retry/i,
  invoiceButton: /Xuất hóa đơn|Export Invoice/i,
  confirmBooking: /Xác nhận đơn|Confirm Booking/i,
  confirmPayment: /Xác nhận thanh toán|Confirm Payment/i,
  completeBooking: /Hoàn tất đơn|Complete Booking/i,
  cancelBooking: /Hủy đơn|Cancel Booking/i,
  statusPending: /^Chờ xác nhận$|^Pending$/i,
  statusConfirmed: /^Đã xác nhận$|^Confirmed$/i,
  statusCompleted: /^Hoàn tất$|^Completed$/i,
  statusCancelled: /^Đã hủy$|^Cancelled$/i,
  paymentUnpaid: /^Chưa thanh toán$|^Unpaid$/i,
  paymentSuccess: /^Đã thanh toán$|^Paid$/i,
  addressMissing: /Chưa cung cấp|Not provided/i,
  noNote: /Không có ghi chú nào|No note provided/i,
  departureMissing: /Chưa rõ|Unknown/i,
  terminalCompleted: /đã được hoàn tất|already been completed/i,
  terminalCancelled: /đã bị hủy|already been cancelled/i,
  timelineBooked: /Đã đặt đơn|Status History/i,
  timelineCancelled: /Đã hủy đơn|^Cancelled$/i,
  cancelDialogTitle: /Hủy đơn hàng này|Cancel this booking/i,
  confirmCancel: /Xác nhận hủy|Confirm Cancellation/i,
  confirmPaymentDialog: /Xác nhận thanh toán\?|Confirm Payment\?/i,
  confirmPaymentSubmit: /Xác nhận đã thanh toán|Confirm Paid/i,
  closeDialog: /^Đóng$|^Close$/i,
  confirmSuccess: /Đã xác nhận đơn hàng thành công|Booking confirmed successfully/i,
  completeSuccess: /Đã hoàn tất đơn hàng thành công|Booking completed successfully/i,
  paymentSuccessToast: /Đã xác nhận thanh toán thành công|Payment confirmed successfully/i,
  cancelSuccess: /Đã hủy đơn hàng thành công|Booking cancelled successfully/i,
  updateError: /Có lỗi xảy ra khi cập nhật|An error occurred while updating/i,
  exportSuccess: /Đang tải file Excel|Excel file is downloading|downloading/i,
  exportError: /Có lỗi xảy ra khi xuất|An error occurred while exporting/i,
  reasonRequired: /Vui lòng nhập lý do hủy|Cancellation reason is required/i,
  notFoundTitle: /Không tìm thấy đơn hàng|Booking not found/i,
  loadErrorTitle: /Không tải được chi tiết đơn|Unable to load booking/i,
  completeDialogTitle: /Hoàn tất đơn hàng này|Complete this booking/i,
  completeDialogSubmit: /Xác nhận hoàn tất|Confirm completion/i,
  viewUserProfile: /Xem hồ sơ khách hàng|View customer profile/i,
  viewTourDetail: /Xem chi tiết tour|View tour details/i,
  stickyContextBadge: /Chi tiết|^Detail$/i,
};

const copy = bookingDetailCopy;

export class BookingDetailPage {
  readonly page: Page;
  readonly bookingId: number;

  constructor(page: Page, bookingId: number) {
    this.page = page;
    this.bookingId = bookingId;
  }

  async goto(viewport = { width: 1535, height: 697 }) {
    await this.page.setViewportSize(viewport);
    await this.page.goto(`/admin/bookings/detail/${this.bookingId}`, { waitUntil: 'domcontentloaded' });
  }

  async captureUiScreenshot(tcId: string) {
    await this.page.screenshot({
      path: `reports/ui-screenshots/booking-detail/${tcId}.png`,
      fullPage: false,
    });
  }

  get pageTitle() {
    return this.page.getByRole('heading', { level: 1 }).filter({ hasText: copy.pageTitle });
  }

  get customerSection() {
    return this.page.locator('main').getByRole('heading', { name: copy.sectionCustomer });
  }

  get paymentCard() {
    return this.paymentSection.locator('xpath=ancestor::div[contains(@class,"rounded-3xl")][1]');
  }

  get tourSection() {
    return this.page.getByRole('heading', { name: copy.sectionTour });
  }

  get paymentSection() {
    return this.page.getByRole('heading', { name: copy.sectionPayment });
  }

  get timelineSection() {
    return this.page.getByRole('heading', { name: copy.sectionTimeline });
  }

  get passengersSection() {
    return this.page.getByRole('heading', { name: copy.sectionPassengers });
  }

  get operationsSection() {
    return this.page.locator('main').getByRole('heading', { name: copy.operationsTitle });
  }

  get backButton() {
    return this.page.getByRole('button', { name: copy.backButton }).first();
  }

  /** @deprecated use backButton */
  get backButtons() {
    return this.backButton;
  }

  get retryButton() {
    return this.page.getByRole('button', { name: copy.retryButton });
  }

  get invoiceButton() {
    return this.page.locator('main').getByRole('button', { name: copy.invoiceButton }).first();
  }

  get mobileFooter() {
    return this.page.locator('[data-booking-detail-mobile-footer]');
  }

  get confirmBookingButton() {
    return this.page.getByRole('button', { name: copy.confirmBooking }).first();
  }

  get confirmPaymentButton() {
    return this.page.getByRole('button', { name: copy.confirmPayment }).first();
  }

  get completeBookingButton() {
    return this.page.getByRole('button', { name: copy.completeBooking }).first();
  }

  get cancelBookingButton() {
    return this.page.getByRole('button', { name: copy.cancelBooking }).first();
  }

  get allConfirmBookingButtons() {
    return this.page.getByRole('button', { name: copy.confirmBooking });
  }

  get allCompleteBookingButtons() {
    return this.page.getByRole('button', { name: copy.completeBooking });
  }

  get cancelDialog() {
    return this.page.locator('form').filter({ hasText: copy.cancelDialogTitle });
  }

  get confirmPaymentDialog() {
    return this.page.locator('.relative.w-full.max-w-\\[440px\\]').filter({ hasText: copy.confirmPaymentDialog });
  }

  get loadingSkeletonGrid() {
    return this.page.locator('.grid.grid-cols-1.lg\\:grid-cols-12.gap-8.animate-pulse');
  }

  get errorPanel() {
    return this.page.getByTestId('booking-detail-error');
  }

  get completeDialog() {
    return this.page.locator('.relative.w-full.max-w-\\[440px\\]').filter({ hasText: copy.completeDialogTitle });
  }

  get completeDialogSubmitButton() {
    return this.completeDialog.getByRole('button', { name: copy.completeDialogSubmit });
  }

  async openCompleteDialog() {
    await this.completeBookingButton.click();
    await expect(this.completeDialog).toBeVisible();
  }

  async submitCompleteDialog() {
    await this.completeDialogSubmitButton.click();
  }

  async dismissCompleteDialog() {
    await this.completeDialog.getByRole('button', { name: copy.closeDialog }).click();
  }

  get stickyContextBadge() {
    return this.page.locator('.sticky.top-0 span.rounded-full').filter({ hasText: copy.stickyContextBadge });
  }

  get mainScrollContainer() {
    return this.page.locator('main');
  }

  async scrollMainContent(pixels = 250) {
    await this.mainScrollContainer.evaluate((el, y) => {
      el.scrollTop = y;
    }, pixels);
    await this.page.waitForTimeout(350);
  }

  async waitForLoaded() {
    await expect(this.loadingSkeletonGrid).toHaveCount(0, { timeout: 20_000 });
    await this.page.locator('main').getByRole('heading', { name: copy.sectionTour }).waitFor({
      state: 'attached',
      timeout: 20_000,
    });
  }

  async fillCancelReason(reason: string) {
    await this.page.locator('#booking-cancel-reason').fill(reason);
  }

  get cancelDialogSubmitButton() {
    return this.cancelDialog.getByRole('button', { name: copy.confirmCancel });
  }

  async waitForCancelDialogReady() {
    await expect(this.cancelDialogSubmitButton).toBeEnabled({ timeout: 15_000 });
  }

  async openCancelDialog() {
    await this.cancelBookingButton.click();
    await this.waitForCancelDialogReady();
  }

  async submitCancelDialog() {
    await this.cancelDialogSubmitButton.click();
  }

  async closeCancelDialog() {
    await this.cancelDialog.getByRole('button', { name: copy.closeDialog }).click();
  }

  async confirmPaymentDialogSubmit() {
    await this.confirmPaymentDialog.getByRole('button', { name: copy.confirmPaymentSubmit }).click();
  }

  waitForDetailResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        new RegExp(`/admin/bookings/${this.bookingId}/?$`).test(new URL(res.url()).pathname) &&
        res.status() === 200
    );
  }

  waitForStatusPatch(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/bookings/${this.bookingId}/status`)
    );
  }

  waitForConfirmPayment(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/bookings/${this.bookingId}/confirm-payment`)
    );
  }
}
