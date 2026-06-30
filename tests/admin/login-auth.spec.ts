/**
 * Admin Login — auth redirect (12)
 */
import { test, expect, seedAdminSession } from '../fixtures/auth.fixture';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockDashboardApi, resetMockDashboard } from '../fixtures/api/dashboard.mock';
import { loginCopy as copy } from '../pages/admin/LoginPage';

test.describe('Admin Login — PublicRoute @P0', () => {
  /** TC_AD_LOGIN_010 */
  test('TC_AD_LOGIN_010 logged-in admin visiting login redirects to dashboard', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockDashboard();
    await mockDashboardApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page.getByText(copy.title).first()).toHaveCount(0);
    await context.close();
  });
});
