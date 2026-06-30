/**
 * Admin Blog Detail — auth guard (06d)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { blogDetailCopy as copy } from '../pages/admin/BlogDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockBlogsApi, resetMockBlogs } from '../fixtures/api/blogs.mock';
import { defaultDetailBlogId } from '../fixtures/data/blog-detail.data';

test.describe('Admin Blog Detail — auth @P0', () => {
  /** TC_AD_BLOGDET_001 */
  test('TC_AD_BLOGDET_001 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/blog-posts/${defaultDetailBlogId}`);
    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await expect(page.getByRole('button', { name: copy.editButton })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_BLOGDET_002 */
  test('TC_AD_BLOGDET_002 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockBlogs();
    await mockAdminLayoutApis(page);
    await mockBlogsApi(page);
    await seedNonAdminSession(page);
    await page.goto(`/admin/blog-posts/${defaultDetailBlogId}`);
    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await context.close();
  });
});
