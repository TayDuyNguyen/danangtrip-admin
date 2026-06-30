/**
 * Admin Blog Edit — auth guard (06c)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { blogEditCopy as copy } from '../pages/admin/BlogEditPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockBlogsApi, resetMockBlogs } from '../fixtures/api/blogs.mock';
import { defaultEditBlogId } from '../fixtures/data/blog-edit.data';

test.describe('Admin Blog Edit — auth @P0', () => {
  /** TC_AD_BLOGEDIT_025 */
  test('TC_AD_BLOGEDIT_025 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/blog-posts/edit/${defaultEditBlogId}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_BLOGEDIT_026 */
  test('TC_AD_BLOGEDIT_026 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBlogs();
    await mockAdminLayoutApis(page);
    await mockBlogsApi(page);
    await seedNonAdminSession(page);
    await page.goto(`/admin/blog-posts/edit/${defaultEditBlogId}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
