/**
 * Admin Dashboard — Auth @P0
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { mockDashboardApi, resetMockDashboard } from '../fixtures/api/dashboard.mock';

test.describe('Admin Dashboard — Auth @P0', () => {
  /** TC_AD_DASH_007 */
  test('TC_AD_DASH_007 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_DASH_008 */
  test('TC_AD_DASH_008 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockDashboard();
    await mockDashboardApi(page);
    await seedNonAdminSession(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
