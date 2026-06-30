/**
 * Admin Payment Detail — core (13b)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { PaymentDetailPage, paymentDetailCopy as copy } from '../pages/admin/PaymentDetailPage';
import { paymentListCopy } from '../pages/admin/PaymentListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  getLastRefundBody,
  mockPaymentsApi,
  resetMockPayments,
  setPaymentDetailDelay,
  setPaymentDetailFailForId,
  setPaymentDetailNotFoundForId,
  setPaymentRefundDelay,
  setPaymentRefundFailForId,
} from '../fixtures/api/payments.mock';
import {
  failedPayment,
  orphanSuccessPayment,
  partialPayment,
  paymentWithAvatar,
  pendingPayment,
  primarySuccessPayment,
  refundedNoReasonPayment,
  refundedPayment,
  refundFormValid,
  refundRequestWithBankPayment,
  successNoPaidAtPayment,
  vnpaySuccessPayment,
  zeroAmountPayment,
} from '../fixtures/data/payments.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Payment Detail @P1', () => {
  let detailPage: PaymentDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockPayments();
    await adminPage.unroute('**/api/v1/**');
    await adminPage.unroute('**/api/v1/admin/payments**');
    await adminPage.unroute('**/api/v1/auth/**');
    await mockAdminLayoutApis(adminPage);
    await mockPaymentsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    detailPage = new PaymentDetailPage(adminPage);
  });

  /** TC_AD_PAYDETAIL_001 */
  test('TC_AD_PAYDETAIL_001 renders payment info booking and timeline', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.transactionHeading).toContainText(primarySuccessPayment.transaction_code);
    await expect(detailPage.page.getByText(copy.sectionPayment)).toBeVisible();
    await expect(detailPage.page.getByText(copy.sectionBooking)).toBeVisible();
    await expect(detailPage.page.getByText(copy.sectionTimeline)).toBeVisible();
    await expect(detailPage.page.getByText('Tran Thu Ha')).toBeVisible();
    await expect(detailPage.page.getByText('Ba Na Hills Full Day')).toBeVisible();
    await expect(detailPage.page.getByText(copy.timelineCreated)).toBeVisible();
    await expect(detailPage.page.getByText(copy.timelineSuccess)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_002 */
  test('TC_AD_PAYDETAIL_002 shows loading state while detail API is delayed', async () => {
    setPaymentDetailDelay(1500);
    await detailPage.goto(primarySuccessPayment.id);
    await expect(detailPage.page.getByText(copy.loading)).toBeVisible();
    await detailPage.waitForLoaded();
  });

  /** TC_AD_PAYDETAIL_003 */
  test('TC_AD_PAYDETAIL_003 shows not found for invalid payment id', async () => {
    setPaymentDetailNotFoundForId(999999);
    await detailPage.goto(999999);
    await expect(
      detailPage.page.getByRole('heading', { name: copy.notFoundTitle })
    ).toBeVisible({ timeout: 15_000 });
    await expect(detailPage.backToListButton).toBeVisible();
    await expect(detailPage.page.getByRole('button', { name: copy.retryButton })).toHaveCount(0);
  });

  /** TC_AD_PAYDETAIL_004 */
  test('TC_AD_PAYDETAIL_004 links booking code to booking detail', async ({ adminPage }) => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.page
      .getByRole('link', { name: primarySuccessPayment.booking!.booking_code })
      .click();
    await expect(adminPage).toHaveURL(/\/admin\/bookings\/detail\/101/);
  });

  /** TC_AD_PAYDETAIL_005 */
  test('TC_AD_PAYDETAIL_005 shows orphan warning without booking block', async () => {
    await detailPage.goto(orphanSuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.orphanWarning)).toBeVisible();
    await expect(detailPage.page.getByText(copy.sectionBooking)).toHaveCount(0);
  });

  /** TC_AD_PAYDETAIL_006 */
  test('TC_AD_PAYDETAIL_006 shows failed timeline for failed payment', async () => {
    await detailPage.goto(failedPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.timelineFailed)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_006b */
  test('TC_AD_PAYDETAIL_006b shows refunded timeline with reason', async () => {
    await detailPage.goto(refundedPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.timelineRefunded)).toBeVisible();
    await expect(
      detailPage.page.getByRole('heading', { name: new RegExp(refundedPayment.refund_reason!) })
    ).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_006c */
  test('TC_AD_PAYDETAIL_006c shows refunded timeline when refund reason is missing', async () => {
    await detailPage.goto(refundedNoReasonPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.timelineRefunded)).toBeVisible();
    await expect(detailPage.page.getByText(copy.labelRefundReason)).toHaveCount(0);
  });

  /** TC_AD_PAYDETAIL_007 */
  test('TC_AD_PAYDETAIL_007 admin submits refund successfully', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    const refundRes = await detailPage.submitRefundForm({
      reason: refundFormValid.refund_reason,
      bankCode: refundFormValid.refund_bank_code,
      accountNo: refundFormValid.refund_account_no,
      accountName: refundFormValid.refund_account_name,
      transferReference: refundFormValid.transfer_reference,
    });
    expect(refundRes.ok()).toBeTruthy();
    expect(getLastRefundBody()?.refund_reason).toBe(refundFormValid.refund_reason);
    await detailPage.expectToast(paymentListCopy.refundSuccess);
  });

  /** TC_AD_PAYDETAIL_011 */
  test('TC_AD_PAYDETAIL_011 back to list navigates to payments list', async ({ adminPage }) => {
    setPaymentDetailNotFoundForId(999999);
    await detailPage.goto(999999);
    await detailPage.backToListButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/payments$/);
  });

  /** TC_AD_PAYDETAIL_009 */
  test('TC_AD_PAYDETAIL_009 shows enabled refund action for admin on success payment', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.refundHeaderButton).toBeEnabled();
  });

  /** TC_AD_PAYDETAIL_012 */
  test('TC_AD_PAYDETAIL_012 breadcrumb payments link navigates to list', async ({ adminPage }) => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.breadcrumbPaymentsLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/payments$/);
  });

  /** TC_AD_PAYDETAIL_013 */
  test('TC_AD_PAYDETAIL_013 displays transaction code and formatted amount', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.transactionHeading).toContainText(primarySuccessPayment.transaction_code);
    await expect(detailPage.page.getByText(copy.sectionPayment).locator('..')).toContainText(
      '2.500.000'
    );
  });

  /** TC_AD_PAYDETAIL_013b */
  test('TC_AD_PAYDETAIL_013b displays zero amount without NaN', async () => {
    await detailPage.goto(zeroAmountPayment.id);
    await detailPage.waitForLoaded();
    const paymentCard = detailPage.page
      .locator('.rounded-3xl')
      .filter({ has: detailPage.page.getByText(copy.sectionPayment) })
      .first();
    const amountCell = paymentCard.locator('span.text-\\[18px\\].font-black');
    await expect(amountCell).toHaveText('0');
  });

  /** TC_AD_PAYDETAIL_014 */
  test('TC_AD_PAYDETAIL_014 displays gateway badge for sepay and vnpay', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.gatewaySepay)).toBeVisible();

    await detailPage.goto(vnpaySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.gatewayVnpay)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_015 */
  test('TC_AD_PAYDETAIL_015 displays created at field', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.labelCreatedAt)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_016 */
  test('TC_AD_PAYDETAIL_016 displays paid at for success payment with paidAt', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.labelPaidAt)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_016b */
  test('TC_AD_PAYDETAIL_016b hides paid at when paidAt is null', async () => {
    await detailPage.goto(successNoPaidAtPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByText(copy.labelPaidAt)).toHaveCount(0);
    await expect(detailPage.page.getByText(copy.timelineSuccess)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_023 */
  test('TC_AD_PAYDETAIL_023 partial payment shows partial badge and created-only timeline', async () => {
    await detailPage.goto(partialPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.statusBadge(copy.statusPartial)).toBeVisible();
    await expect(detailPage.page.getByText(copy.timelineCreated)).toBeVisible();
    await expect(detailPage.page.getByText(copy.timelineSuccess)).toHaveCount(0);
  });

  /** TC_AD_PAYDETAIL_024 */
  test('TC_AD_PAYDETAIL_024 pending payment shows pending badge and created-only timeline', async () => {
    await detailPage.goto(pendingPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.statusBadge(copy.statusPending)).toBeVisible();
    await expect(detailPage.page.getByText(copy.timelineCreated)).toBeVisible();
    await expect(detailPage.page.getByText(copy.timelineSuccess)).toHaveCount(0);
  });

  /** TC_AD_PAYDETAIL_017 */
  test('TC_AD_PAYDETAIL_017 shows customer avatar image when provided', async () => {
    await detailPage.goto(paymentWithAvatar.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.page.getByRole('img', { name: 'Avatar User' })).toBeVisible();
    await expect(detailPage.page.getByRole('img', { name: 'Avatar Tour' })).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_025 */
  test('TC_AD_PAYDETAIL_025 hides refund action for failed pending and refunded payments', async () => {
    for (const payment of [failedPayment, pendingPayment, refundedPayment]) {
      await detailPage.goto(payment.id);
      await detailPage.waitForLoaded();
      await expect(detailPage.refundHeaderButton).toHaveCount(0);
    }
  });

  /** TC_AD_PAYDETAIL_030 */
  test('TC_AD_PAYDETAIL_030 shows load error UI with retry when detail API returns 500', async () => {
    setPaymentDetailFailForId(primarySuccessPayment.id);
    await detailPage.goto(primarySuccessPayment.id);
    await expect(
      detailPage.page.getByRole('heading', { name: copy.loadErrorTitle })
    ).toBeVisible({ timeout: 15_000 });
    await expect(detailPage.page.getByText(copy.loadErrorDesc)).toBeVisible();
    await expect(detailPage.page.getByRole('button', { name: copy.retryButton })).toBeVisible();
    await expect(detailPage.backToListButton).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_010 */
  test('TC_AD_PAYDETAIL_010 blocks refund submit when reason is empty', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await detailPage.clickRefundSubmitOnly();
    await expect(detailPage.page.getByText(copy.refundReasonRequired)).toBeVisible();
    await expect(detailPage.refundDialog).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_010b */
  test('TC_AD_PAYDETAIL_010b blocks refund submit when reason is shorter than 10 chars', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await detailPage.refundReasonField.fill('short');
    await detailPage.clickRefundSubmitOnly();
    await expect(detailPage.page.getByText(copy.refundReasonMin)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_019 */
  test('TC_AD_PAYDETAIL_019 cancel button closes refund dialog without API call', async ({
    adminPage,
  }) => {
    let refundPosts = 0;
    adminPage.on('request', (req) => {
      if (req.url().includes('/refund') && req.method() === 'POST') refundPosts += 1;
    });
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await detailPage.closeRefundDialogViaCancel();
    await expect(detailPage.refundDialog).toHaveCount(0);
    expect(refundPosts).toBe(0);
  });

  /** TC_AD_PAYDETAIL_020 */
  test('TC_AD_PAYDETAIL_020 backdrop click closes refund dialog', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await detailPage.closeRefundDialogViaBackdrop();
    await expect(detailPage.refundDialog).toHaveCount(0);
  });

  /** TC_AD_PAYDETAIL_021 */
  test('TC_AD_PAYDETAIL_021 shows bank detail inputs when refund request has no bank info', async () => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await expect(detailPage.page.getByPlaceholder(/Mã ngân hàng|bank code/i)).toBeVisible();
    await expect(detailPage.page.getByPlaceholder(/Số tài khoản|account number/i)).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_022 */
  test('TC_AD_PAYDETAIL_022 shows VietQR block when refund request includes bank info', async () => {
    await detailPage.goto(refundRequestWithBankPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await expect(detailPage.page.getByText(copy.vietQrText)).toBeVisible();
    await expect(detailPage.page.getByRole('img', { name: /VietQR/i })).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_031 */
  test('TC_AD_PAYDETAIL_031 shows error toast when refund API fails', async () => {
    setPaymentRefundFailForId(primarySuccessPayment.id);
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await detailPage.submitRefundForm({
      reason: refundFormValid.refund_reason,
      bankCode: refundFormValid.refund_bank_code,
      accountNo: refundFormValid.refund_account_no,
      accountName: refundFormValid.refund_account_name,
      transferReference: refundFormValid.transfer_reference,
    });
    await detailPage.expectToast(copy.refundError);
    await expect(detailPage.refundDialog).toBeVisible();
  });

  /** TC_AD_PAYDETAIL_032 */
  test('TC_AD_PAYDETAIL_032 disables confirm button while refund is submitting', async () => {
    setPaymentRefundDelay(1500);
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await detailPage.refundReasonField.fill(refundFormValid.refund_reason);
    await detailPage.page.getByPlaceholder(/Mã ngân hàng|bank code/i).fill(refundFormValid.refund_bank_code);
    await detailPage.page.getByPlaceholder(/Số tài khoản|account number/i).fill(refundFormValid.refund_account_no);
    await detailPage.page
      .getByPlaceholder(/Tên chủ tài khoản|account holder|account name/i)
      .fill(refundFormValid.refund_account_name);
    await detailPage.page
      .getByPlaceholder(/mã giao dịch sau khi chuyển|transfer reference|successful payment/i)
      .fill(refundFormValid.transfer_reference);
    const confirmBtn = detailPage.page.getByRole('button', { name: copy.refundConfirm });
    await confirmBtn.click();
    await expect(confirmBtn).toBeDisabled();
  });

  /** TC_AD_PAYDETAIL_034 */
  test('TC_AD_PAYDETAIL_034 renders status badges for success failed and refunded', async () => {
    const cases: Array<{ id: number; badge: RegExp }> = [
      { id: primarySuccessPayment.id, badge: copy.statusSuccess },
      { id: failedPayment.id, badge: copy.statusFailed },
      { id: refundedPayment.id, badge: copy.statusRefunded },
    ];
    for (const { id, badge } of cases) {
      await detailPage.goto(id);
      await detailPage.waitForLoaded();
      await expect(detailPage.statusBadge(badge)).toBeVisible();
    }
  });

  /** TC_AD_PAYDETAIL_040b */
  test('TC_AD_PAYDETAIL_040b after refund payment shows refunded status and hides refund action', async ({
    adminPage,
  }) => {
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await detailPage.openRefundDialog();
    await detailPage.submitRefundForm({
      reason: refundFormValid.refund_reason,
      bankCode: refundFormValid.refund_bank_code,
      accountNo: refundFormValid.refund_account_no,
      accountName: refundFormValid.refund_account_name,
      transferReference: refundFormValid.transfer_reference,
    });
    await detailPage.expectToast(paymentListCopy.refundSuccess);
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await detailPage.waitForLoaded();
    await expect(detailPage.statusBadge(copy.statusRefunded)).toBeVisible();
    await expect(detailPage.refundHeaderButton).toHaveCount(0);
  });
});

test.describe('Admin Payment Detail — staff refund @P1', () => {
  /** TC_AD_PAYDETAIL_008 */
  test('TC_AD_PAYDETAIL_008 staff sees disabled refund action', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockPayments();
    await mockAdminLayoutApis(page);
    await mockPaymentsApi(page);
    await mockAuthRefreshApi(page);
    const { seedStaffSession } = await import('../fixtures/auth.fixture');
    await seedStaffSession(page);
    const detailPage = new PaymentDetailPage(page);
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.refundHeaderButton).toBeDisabled();
    await expect(page.getByText(copy.refundStaffHint)).toBeVisible();
    await context.close();
  });
});
