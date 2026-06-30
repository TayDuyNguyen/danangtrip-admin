/**
 * Admin Location Categories — auth guard (16)
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { locationCategoriesCopy as copy } from '../pages/admin/LocationCategoriesPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  mockLocationCategoriesApi,
  resetMockLocationCategories,
} from '../fixtures/api/location-categories.mock';

test.describe('Admin Location Categories — auth @P0', () => {
  /** TC_AD_LOCCAT_040 */
  test('TC_AD_LOCCAT_040 guest is redirected to login', async ({ browser }) => {
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
    await page.goto('/admin/location-categories', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_LOCCAT_041 */
  test('TC_AD_LOCCAT_041 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockLocationCategories();
    await mockAdminLayoutApis(page);
    await mockLocationCategoriesApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/location-categories', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_LOCCAT_042 */
  test('TC_AD_LOCCAT_042 admin can access location categories page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockLocationCategories();
    await mockAdminLayoutApis(page);
    await mockLocationCategoriesApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/location-categories', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: copy.heading })).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
