/**
 * Admin Payment Detail — auth (13b)
 */
import { test, expect, seedAdminSession, seedNonAdminSession } from '../fixtures/auth.fixture';
import { PaymentDetailPage, paymentDetailCopy as copy } from '../pages/admin/PaymentDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockPaymentsApi, resetMockPayments } from '../fixtures/api/payments.mock';
import { primarySuccessPayment } from '../fixtures/data/payments.data';

test.describe('Admin Payment Detail — auth @P0', () => {
  /** TC_AD_PAYDETAIL_040 */
  test('TC_AD_PAYDETAIL_040 guest is redirected to login from detail URL', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const page = await context.newPage();
    await mockAdminLayoutApis(page);
    await page.route('**/api/v1/auth/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthenticated' }),
      });
    });
    await page.goto(`/admin/payments/detail/${primarySuccessPayment.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByText(copy.notFound)).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_PAYDETAIL_041 */
  test('TC_AD_PAYDETAIL_041 non-admin user is redirected to login from detail URL', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockPayments();
    await mockAdminLayoutApis(page);
    await mockPaymentsApi(page);
    await seedNonAdminSession(page);
    await page.goto(`/admin/payments/detail/${primarySuccessPayment.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_PAYDETAIL_042 */
  test('TC_AD_PAYDETAIL_042 admin can access payment detail', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockPayments();
    await mockAdminLayoutApis(page);
    await mockPaymentsApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    const detailPage = new PaymentDetailPage(page);
    await detailPage.goto(primarySuccessPayment.id);
    await detailPage.waitForLoaded();
    await expect(detailPage.transactionHeading).toContainText(primarySuccessPayment.transaction_code);
    await context.close();
  });
});
