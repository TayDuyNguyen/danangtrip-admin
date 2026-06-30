/**
 * Admin Reports — auth (REP_SEC_023/024)
 */
import { test, expect, seedNonAdminSession, seedAdminSession, seedStaffSession } from '../fixtures/auth.fixture';
import { reportsCopy as copy } from '../pages/admin/ReportPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockReportsApi, resetMockReports } from '../fixtures/api/reports.mock';

test.describe('Admin Reports — auth @P0', () => {
  /** TC_AD_REP_040 — REP_SEC_024 */
  test('TC_AD_REP_040 guest is redirected to login', async ({ browser }) => {
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
    await page.goto('/admin/reports/revenue', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.revenueHeading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_REP_041 — REP_SEC_023 */
  test('TC_AD_REP_041 staff user is redirected to dashboard', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockReports();
    await mockAdminLayoutApis(page);
    await mockReportsApi(page);
    await mockAuthRefreshApi(page);
    await seedStaffSession(page);
    await page.goto('/admin/reports/revenue', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_REP_041b — end-user role cannot access reports */
  test('TC_AD_REP_041b non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockReports();
    await mockAdminLayoutApis(page);
    await mockReportsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/reports/revenue', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_REP_042 */
  test('TC_AD_REP_042 admin can access revenue report', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockReports();
    await mockAdminLayoutApis(page);
    await mockReportsApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/reports/revenue', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: copy.revenueHeading })).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
