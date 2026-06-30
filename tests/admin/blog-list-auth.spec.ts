/**
 * Admin Blog List — auth guard (06a)
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { blogListCopy as copy } from '../pages/admin/BlogListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockBlogsApi, resetMockBlogs } from '../fixtures/api/blogs.mock';

test.describe('Admin Blog List — auth @P0', () => {
  /** TC_AD_BLOGLIST_065 */
  test('TC_AD_BLOGLIST_065 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/blog-posts', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_BLOGLIST_066 */
  test('TC_AD_BLOGLIST_066 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBlogs();
    await mockAdminLayoutApis(page);
    await mockBlogsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/blog-posts', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_BLOGLIST_067 */
  test('TC_AD_BLOGLIST_067 legacy /admin/blog redirects to blog-posts', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBlogs();
    await mockAdminLayoutApis(page);
    await mockBlogsApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/blog', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/blog-posts/, { timeout: 15_000 });
    await context.close();
  });
});
