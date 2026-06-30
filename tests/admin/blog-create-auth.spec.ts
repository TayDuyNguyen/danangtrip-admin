/**
 * Admin Blog Create — auth guard (06b)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { blogCreateCopy as copy } from '../pages/admin/BlogCreatePage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockBlogsApi, resetMockBlogs } from '../fixtures/api/blogs.mock';

test.describe('Admin Blog Create — auth @P0', () => {
  /** TC_AD_BLOGCREATE_025 */
  test('TC_AD_BLOGCREATE_025 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/blog-posts/create', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_BLOGCREATE_026 */
  test('TC_AD_BLOGCREATE_026 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBlogs();
    await mockAdminLayoutApis(page);
    await mockBlogsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/blog-posts/create', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
