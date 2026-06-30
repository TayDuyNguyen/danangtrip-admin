/**
 * Admin Ratings — auth guard (08)
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { ratingsCopy as copy } from '../pages/admin/RatingsPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockRatingsApi, resetMockRatings } from '../fixtures/api/ratings.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';

test.describe('Admin Ratings — auth @P0', () => {
  /** TC_AD_RAT_040 */
  test('TC_AD_RAT_040 guest is redirected to login', async ({ browser }) => {
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
    await page.goto('/admin/ratings', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_RAT_041 */
  test('TC_AD_RAT_041 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockRatings();
    await mockAdminLayoutApis(page);
    await mockRatingsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/ratings', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_RAT_042 */
  test('TC_AD_RAT_042 admin can access ratings page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockRatings();
    await mockAdminLayoutApis(page);
    await mockRatingsApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/ratings', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: copy.heading })).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
