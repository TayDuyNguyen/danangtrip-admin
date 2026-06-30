/**
 * Admin Payment List — core (13a)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { PaymentListPage, paymentListCopy as copy } from '../pages/admin/PaymentListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  getLastListQuery,
  mockPaymentsApi,
  resetMockPayments,
  setPaymentExportFail,
  setPaymentListDelay,
  setPaymentListEmpty,
} from '../fixtures/api/payments.mock';
import {
  expectedPage1Stats,
  failedPayment,
  mockBookingSearchKeyword,
  mockPaymentSearchKeyword,
  orphanSuccessPayment,
  partialPayment,
  pendingRefundPayment,
  primarySuccessPayment,
  vnpaySuccessPayment,
} from '../fixtures/data/payments.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Payment List @P1', () => {
  let payPage: PaymentListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockPayments();
    await adminPage.unroute('**/api/v1/**');
    await adminPage.unroute('**/api/v1/admin/payments**');
    await adminPage.unroute('**/api/v1/auth/**');
    await mockAdminLayoutApis(adminPage);
    await mockPaymentsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    payPage = new PaymentListPage(adminPage);
    await payPage.goto();
    await payPage.waitForTableLoaded();
  });

  /** TC_AD_PAY_001 */
  test('TC_AD_PAY_001 renders heading stats filters and table columns', async () => {
    await expect(payPage.heading).toBeVisible();
    await expect(payPage.subtitle).toBeVisible();
    await expect(payPage.statsGrid).toBeVisible();
    await expect(payPage.searchInput).toBeVisible();
    await expect(payPage.exportButton).toBeVisible();
    await expect(payPage.page.getByRole('columnheader', { name: copy.colTransaction })).toBeVisible();
    await expect(payPage.page.getByRole('columnheader', { name: copy.colBooking })).toBeVisible();
    await expect(payPage.tableBodyRows.first()).toBeVisible();
  });

  /** TC_AD_PAY_006 — data display integrity */
  test('TC_AD_PAY_006 displays transaction customer amount and gateway from API', async () => {
    const row = payPage.rowByTransactionCode(primarySuccessPayment.transaction_code);
    await expect(row).toBeVisible();
    await expect(row).toContainText(primarySuccessPayment.transaction_code);
    await expect(row).toContainText('Tran Thu Ha');
    await expect(row).toContainText('hatran@gmail.com');
    await expect(row).toContainText('BK-2026-001');
    await expect(row).toContainText('SePay');
    await expect(row.getByText(copy.statusSuccess)).toBeVisible();
  });

  /** TC_AD_PAY_002 */
  test('TC_AD_PAY_002 filters list by transaction code search', async () => {
    await payPage.search(mockPaymentSearchKeyword);
    await expect(payPage.rowByTransactionCode(primarySuccessPayment.transaction_code)).toBeVisible();
    await expect(payPage.rowByTransactionCode(vnpaySuccessPayment.transaction_code)).toHaveCount(0);
    expect(getLastListQuery().search).toBe(mockPaymentSearchKeyword);
  });

  /** TC_AD_PAY_013 — search by booking code */
  test('TC_AD_PAY_013 filters list by booking code search', async () => {
    await payPage.search(mockBookingSearchKeyword);
    await expect(payPage.rowByTransactionCode(vnpaySuccessPayment.transaction_code)).toBeVisible();
    expect(getLastListQuery().search).toBe(mockBookingSearchKeyword);
  });

  /** TC_AD_PAY_003 — doc PayOS mapped to SePay */
  test('TC_AD_PAY_003 filters by sepay gateway', async () => {
    await payPage.selectGatewayFilter(copy.gatewaySepay);
    await expect(payPage.rowByTransactionCode(primarySuccessPayment.transaction_code)).toBeVisible();
    await expect(payPage.rowByTransactionCode(vnpaySuccessPayment.transaction_code)).toHaveCount(0);
    expect(getLastListQuery().payment_gateway).toBe('sepay');
  });

  /** TC_AD_PAY_004 */
  test('TC_AD_PAY_004 filters by success status', async () => {
    await payPage.selectStatusFilter(copy.statusSuccess);
    await expect(payPage.rowByTransactionCode(primarySuccessPayment.transaction_code)).toBeVisible();
    expect(getLastListQuery().payment_status).toBe('success');
  });

  /** TC_AD_PAY_005 */
  test('TC_AD_PAY_005 navigates to payment detail from row action', async ({ adminPage }) => {
    await payPage.clickDetailOnRow(primarySuccessPayment.transaction_code);
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/payments/detail/${primarySuccessPayment.id}`)
    );
  });

  /** TC_AD_PAY_007 */
  test('TC_AD_PAY_007 shows dash for orphan payment without booking', async () => {
    await payPage.search(orphanSuccessPayment.transaction_code);
    const row = payPage.rowByTransactionCode(orphanSuccessPayment.transaction_code);
    await expect(row).toBeVisible();
    await expect(row.locator('td').nth(1)).toContainText('—');
  });

  /** TC_AD_PAY_008 */
  test('TC_AD_PAY_008 shows partially paid status and short amount', async () => {
    await payPage.search(partialPayment.transaction_code);
    const row = payPage.rowByTransactionCode(partialPayment.transaction_code);
    await expect(row.getByText(copy.statusPartial)).toBeVisible();
    await expect(row).toContainText(/Còn thiếu|Short/i);
  });

  /** TC_AD_PAY_009 */
  test('TC_AD_PAY_009 filters by pending refund status', async () => {
    await payPage.selectRefundFilter(copy.refundPending);
    await expect(payPage.rowByTransactionCode(pendingRefundPayment.transaction_code)).toBeVisible();
    await expect(payPage.rowByTransactionCode(primarySuccessPayment.transaction_code)).toHaveCount(0);
    expect(getLastListQuery().refund_status).toBe('pending');
  });

  /** TC_AD_PAY_011 */
  test('TC_AD_PAY_011 resets filters after reset button click', async () => {
    await payPage.selectStatusFilter(copy.statusFailed);
    await payPage.waitForTableLoaded();
    expect(getLastListQuery().payment_status).toBe('failed');
    await expect(payPage.rowByTransactionCode(primarySuccessPayment.transaction_code)).toHaveCount(0);
    await expect(payPage.resetFiltersButton).toBeVisible();
    await payPage.resetFiltersButton.click();
    await expect(payPage.resetFiltersButton).toHaveCount(0);
    await payPage.waitForTableLoaded();
    await expect(payPage.rowByTransactionCode(failedPayment.transaction_code)).toBeVisible();
    await expect(payPage.rowByTransactionCode(primarySuccessPayment.transaction_code)).toBeVisible();
  });

  /** TC_AD_PAY_014 */
  test('TC_AD_PAY_014 shows empty state when no rows match', async () => {
    resetMockPayments();
    setPaymentListEmpty(true);
    await payPage.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(payPage.emptyState).toBeVisible({ timeout: 15_000 });
  });

  /** TC_AD_PAY_015 */
  test('TC_AD_PAY_015 shows loading spinner while list API is delayed', async () => {
    resetMockPayments();
    setPaymentListDelay(1500);
    await payPage.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(payPage.page.locator('.animate-spin, [class*="loading"]').first()).toBeVisible();
    await payPage.waitForTableLoaded();
  });

  /** TC_AD_PAY_017 */
  test('TC_AD_PAY_017 paginates to second page', async () => {
    await payPage.page.getByRole('button', { name: '2', exact: true }).click();
    await payPage.waitForTableLoaded();
    expect(getLastListQuery().page).toBe('2');
  });

  /** TC_AD_PAY_021 */
  test('TC_AD_PAY_021 exports payments report successfully', async ({ adminPage }) => {
    const exportReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/payments/export') && res.status() === 200
    );
    await payPage.exportButton.click();
    await exportReq;
    await payPage.expectToast(copy.exportSuccess);
  });

  /** TC_AD_PAY_022 */
  test('TC_AD_PAY_022 shows toast when export API fails', async () => {
    setPaymentExportFail(true);
    await payPage.exportButton.click();
    await payPage.expectToast(copy.exportError);
  });

  /** TC_AD_PAY_025 */
  test('TC_AD_PAY_025 navigates to booking detail from booking link', async ({ adminPage }) => {
    await payPage.search(primarySuccessPayment.booking!.booking_code);
    await payPage.rowByTransactionCode(primarySuccessPayment.transaction_code)
      .getByRole('link', { name: primarySuccessPayment.booking!.booking_code })
      .click();
    await expect(adminPage).toHaveURL(/\/admin\/bookings\/detail\/101/);
  });

  /** TC_AD_PAY_026 */
  test('TC_AD_PAY_026 shows stats computed from current page rows', async () => {
    await expect(payPage.statCardValue(copy.statsSuccess)).toHaveText(
      String(expectedPage1Stats.successCount)
    );
  });

  /** TC_AD_PAY_023 */
  test('TC_AD_PAY_023 admin opens refund dialog from list row', async () => {
    await payPage.refundButtonInRow(primarySuccessPayment.transaction_code).click();
    await expect(
      payPage.page.getByRole('heading', { name: /Xác nhận Hoàn tiền|Confirm Refund/i })
    ).toBeVisible();
  });
});

test.describe('Admin Payment List — staff refund @P1', () => {
  test('TC_AD_PAY_024 staff sees disabled refund button on list', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockPayments();
    await mockAdminLayoutApis(page);
    await mockPaymentsApi(page);
    await mockAuthRefreshApi(page);
    const { seedStaffSession } = await import('../fixtures/auth.fixture');
    await seedStaffSession(page);
    const payPage = new PaymentListPage(page);
    await payPage.goto();
    await payPage.waitForTableLoaded();
    await expect(payPage.refundButtonInRow(primarySuccessPayment.transaction_code)).toBeDisabled();
    await context.close();
  });
});
