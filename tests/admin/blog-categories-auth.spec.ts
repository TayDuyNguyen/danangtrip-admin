/**
 * Admin Blog Categories — auth guard (17)
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { blogCategoriesCopy as copy } from '../pages/admin/BlogCategoriesPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockBlogCategoriesApi, resetMockBlogCategories } from '../fixtures/api/blog-categories.mock';

test.describe('Admin Blog Categories — auth @P0', () => {
  /** TC_AD_BLOGCAT_040 */
  test('TC_AD_BLOGCAT_040 guest is redirected to login', async ({ browser }) => {
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
    await page.goto('/admin/blog-categories', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_BLOGCAT_041 */
  test('TC_AD_BLOGCAT_041 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBlogCategories();
    await mockAdminLayoutApis(page);
    await mockBlogCategoriesApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/blog-categories', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_BLOGCAT_042 */
  test('TC_AD_BLOGCAT_042 admin can access blog categories page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBlogCategories();
    await mockAdminLayoutApis(page);
    await mockBlogCategoriesApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/blog-categories', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: copy.heading })).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
