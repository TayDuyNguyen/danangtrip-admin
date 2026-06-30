/**
 * Admin Website Settings — auth guard (11)
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { settingsCopy as copy } from '../pages/admin/SettingsPage';
import { mockSettingsApi, resetMockSettings } from '../fixtures/api/settings.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';

test.describe('Admin Website Settings — auth @P0', () => {
  /** TC_AD_SET_040 */
  test('TC_AD_SET_040 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const page = await context.newPage();
    await mockSettingsApi(page);
    await page.route('**/api/v1/auth/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthenticated' }),
      });
    });
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_SET_041 */
  test('TC_AD_SET_041 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockSettings();
    await mockSettingsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_SET_042 */
  test('TC_AD_SET_042 admin can access settings page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockSettings();
    await mockSettingsApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('main').getByRole('heading', { level: 1, name: copy.heading })
    ).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
