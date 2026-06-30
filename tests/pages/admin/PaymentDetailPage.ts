import { expect, type Page } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';
import { paymentListCopy as listCopy } from './PaymentListPage';

export const paymentDetailCopy = {
  notFoundTitle: /Không tìm thấy giao dịch|Payment not found/i,
  notFound: /Không tìm thấy giao dịch|Payment not found|không tồn tại hoặc đã bị xóa|does not exist or has been removed/i,
  loadErrorTitle: /Không tải được chi tiết giao dịch|Unable to load payment/i,
  loadErrorDesc: /tạm thời không khả dụng|temporarily unavailable/i,
  retryButton: /^Thử lại$|^Retry$/i,
  backToList: /Quay lại danh sách|Back to list/i,
  breadcrumbPayments: /^Giao dịch$|^Payments$/i,
  sectionPayment: /Thông tin Thanh toán|Payment Information/i,
  sectionBooking: /Đơn đặt & Khách hàng|Booking & Customer/i,
  sectionTimeline: /Lịch sử Trạng thái|Status Timeline/i,
  orphanWarning: /không đính kèm thông tin đơn hàng|not linked to any booking/i,
  labelPaidAt: /Thời gian thanh toán|Paid At/i,
  labelCreatedAt: /Thời gian khởi tạo|Created At/i,
  labelRefundedAt: /Thời gian hoàn tiền|Refunded At/i,
  labelRefundReason: /Lý do hoàn tiền|Refund Reason/i,
  timelineCreated: /Yêu cầu thanh toán được tạo|Payment request created/i,
  timelineSuccess: /Thanh toán thành công|Payment succeeded/i,
  timelineFailed: /Thanh toán thất bại|Payment failed/i,
  timelineRefunded: /Hoàn tiền thành công|Refunded successfully/i,
  refundDialogTitle: /Xác nhận Hoàn tiền|Confirm Refund/i,
  refundConfirm: /Xác nhận hoàn tiền|Confirm Refund/i,
  refundCancel: /^Hủy bỏ$|^Cancel$/i,
  refundReasonRequired: /Lý do hoàn tiền là bắt buộc|Refund reason is required/i,
  refundReasonMin: /ít nhất 10|at least 10/i,
  refundError: /error.*refund|lỗi.*hoàn/i,
  refundStaffHint: listCopy.refundStaffTooltip,
  statusSuccess: listCopy.statusSuccess,
  statusPending: listCopy.statusPending,
  statusFailed: listCopy.statusFailed,
  statusRefunded: listCopy.statusRefunded,
  statusPartial: listCopy.statusPartial,
  gatewaySepay: listCopy.gatewaySepay,
  gatewayVnpay: listCopy.gatewayVnpay,
  vietQrText: /VietQR|Quét mã VietQR/i,
  loading: /Đang tải dữ liệu|Loading/i,
};

const copy = paymentDetailCopy;

export class PaymentDetailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(id: number | string) {
    await this.page.goto(`/admin/payments/detail/${id}`, { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login') || this.page.url().includes('/dashboard')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto(`/admin/payments/detail/${id}`, { waitUntil: 'domcontentloaded' });
    }
  }

  async waitForLoaded() {
    await expect(this.transactionHeading).toBeVisible({ timeout: 20_000 });
  }

  get transactionHeading() {
    return this.page.locator('main h1').filter({ hasText: /PAY-/ }).first();
  }

  get refundHeaderButton() {
    return this.page.getByRole('button', { name: listCopy.refundAction });
  }

  get backToListButton() {
    return this.page.getByRole('button', { name: copy.backToList });
  }

  get breadcrumbPaymentsLink() {
    return this.page.getByRole('main').getByRole('link', { name: copy.breadcrumbPayments });
  }

  get refundDialog() {
    return this.page.locator('.fixed.inset-0').filter({ has: this.page.getByRole('heading', { name: copy.refundDialogTitle }) });
  }

  get refundReasonField() {
    return this.page.getByPlaceholder(/Lý do hoàn tiền|refund reason/i);
  }

  get refundBackdrop() {
    return this.refundDialog.locator('.absolute.inset-0').first();
  }

  statusBadge(status: RegExp) {
    return this.transactionHeading.locator('..').getByText(status);
  }

  async openRefundDialog() {
    await this.refundHeaderButton.click();
    await expect(this.page.getByRole('heading', { name: copy.refundDialogTitle })).toBeVisible();
  }

  async closeRefundDialogViaCancel() {
    await this.refundDialog.getByRole('button', { name: copy.refundCancel }).click();
  }

  async closeRefundDialogViaBackdrop() {
    await this.refundBackdrop.click({ position: { x: 5, y: 5 } });
  }

  async submitRefundForm(data: {
    reason: string;
    bankCode: string;
    accountNo: string;
    accountName: string;
    transferReference: string;
  }) {
    await this.refundReasonField.fill(data.reason);
    const bankCode = this.page.getByPlaceholder(/Mã ngân hàng|bank code/i);
    if (await bankCode.isVisible()) {
      await bankCode.fill(data.bankCode);
      await this.page.getByPlaceholder(/Số tài khoản|account number/i).fill(data.accountNo);
      await this.page
        .getByPlaceholder(/Tên chủ tài khoản|account holder|account name/i)
        .fill(data.accountName);
    }
    await this.page
      .getByPlaceholder(/mã giao dịch sau khi chuyển|transfer reference|successful payment/i)
      .fill(data.transferReference);
    const refundReq = this.page.waitForResponse(
      (res) => res.url().includes('/refund') && res.request().method() === 'POST'
    );
    await this.page.getByRole('button', { name: copy.refundConfirm }).click();
    return refundReq;
  }

  async clickRefundSubmitOnly() {
    await this.page.getByRole('button', { name: copy.refundConfirm }).click();
  }

  async expectToast(pattern: RegExp) {
    await expect(this.page.locator('[data-sonner-toast]').getByText(pattern).first()).toBeVisible({
      timeout: 15_000,
    });
  }
}

export default PaymentDetailPage;
