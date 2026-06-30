/**
 * Admin Payment List — auth (13a)
 */
import { test, expect, seedAdminSession, seedNonAdminSession } from '../fixtures/auth.fixture';
import { PaymentListPage, paymentListCopy as copy } from '../pages/admin/PaymentListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockPaymentsApi, resetMockPayments } from '../fixtures/api/payments.mock';

test.describe('Admin Payment List — auth @P0', () => {
  /** TC_AD_PAY_040 */
  test('TC_AD_PAY_040 guest is redirected to login', async ({ browser }) => {
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
    await page.goto('/admin/payments', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_PAY_041 */
  test('TC_AD_PAY_041 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockPayments();
    await mockAdminLayoutApis(page);
    await mockPaymentsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/payments', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_PAY_042 */
  test('TC_AD_PAY_042 admin can access payment list', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockPayments();
    await mockAdminLayoutApis(page);
    await mockPaymentsApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/payments', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: copy.heading })).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
