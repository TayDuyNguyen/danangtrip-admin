/**
 * Admin Blog List — core (06a)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BlogListPage, blogListCopy as copy } from '../pages/admin/BlogListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockBlogPost,
  mockBlogsApi,
  resetMockBlogs,
  setBlogDeleteFailForId,
  setBlogListEmpty,
  setBlogListFail,
  setBlogStatusFailForId,
} from '../fixtures/api/blogs.mock';
import {
  bulkArchiveBlogId,
  bulkDraftBlogIds,
  deletableBlogId,
  expectedBlogStats,
  mockBlogCategories,
  mockBlogSearchKeyword,
  primaryBlogRow,
  statusChangeBlogId,
} from '../fixtures/data/blog-list.data';

test.describe('Admin Blog List @P1', () => {
  let listPage: BlogListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_BLOGLIST_001 */
  test('TC_AD_BLOGLIST_001 renders heading stats filters and table', async () => {
    await expect(listPage.heading).toBeVisible();
    await expect(listPage.subtitle).toBeVisible();
    await expect(listPage.statsGrid).toBeVisible();
    await expect(listPage.searchInput).toBeVisible();
    await expect(listPage.table).toBeVisible();
    await expect(listPage.addButton).toBeVisible();
    await expect(listPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_BLOGLIST_002 */
  test('TC_AD_BLOGLIST_002 shows stats cards from API', async () => {
    await expect(listPage.statValue(copy.statsTotal)).toHaveText(String(expectedBlogStats.total));
    await expect(listPage.statValue(copy.statsPublished)).toHaveText(String(expectedBlogStats.published));
    await expect(listPage.statValue(copy.statsDraft)).toHaveText(String(expectedBlogStats.draft));
    await expect(listPage.statValue(copy.statsArchived)).toHaveText(String(expectedBlogStats.archived));
  });

  /** TC_AD_BLOGLIST_003 — data display integrity */
  test('TC_AD_BLOGLIST_003 displays title excerpt author category and views', async () => {
    const row = listPage.rowByTitle(primaryBlogRow.title);
    await expect(row).toBeVisible();
    await expect(row).toContainText(primaryBlogRow.excerpt!);
    await expect(row).toContainText('Admin DaNangTrip');
    await expect(row).toContainText('Ẩm thực');
    await expect(row).toContainText('8,420');
  });

  /** TC_AD_BLOGLIST_014 */
  test('TC_AD_BLOGLIST_014 searches by title with debounce', async () => {
    await listPage.search(mockBlogSearchKeyword);
    await expect(listPage.tableRows).toHaveCount(1);
    await expect(listPage.rowByTitle(primaryBlogRow.title)).toBeVisible();
  });

  /** TC_AD_BLOGLIST_015 */
  test('TC_AD_BLOGLIST_015 search works on Enter', async ({ adminPage }) => {
    await listPage.searchInput.fill(mockBlogSearchKeyword);
    const listReq = listPage.waitForListResponse();
    await listPage.searchInput.press('Enter');
    await listReq;
    await expect(listPage.rowByTitle(primaryBlogRow.title)).toBeVisible();
  });

  /** TC_AD_BLOGLIST_018 */
  test('TC_AD_BLOGLIST_018 filters by category Kinh nghiệm', async () => {
    await listPage.selectCategoryFilter(mockBlogCategories[0]!.name);
    await expect(listPage.rowByTitle('Bí quyết đi Bà Nà Hills một ngày')).toBeVisible();
    await expect(listPage.rowByTitle(primaryBlogRow.title)).toHaveCount(0);
  });

  /** TC_AD_BLOGLIST_019 */
  test('TC_AD_BLOGLIST_019 filters by draft status', async () => {
    await listPage.selectStatusFilter(copy.statusDraft);
    await expect(listPage.rowByTitle('Lịch trình 3 ngày 2 đêm tại Đà Nẵng')).toBeVisible();
    await expect(listPage.rowByTitle(primaryBlogRow.title)).toHaveCount(0);
  });

  /** TC_AD_BLOGLIST_020 */
  test('TC_AD_BLOGLIST_020 filters by published status', async () => {
    await listPage.selectStatusFilter(copy.statusPublished);
    await expect(listPage.rowByTitle(primaryBlogRow.title)).toBeVisible();
    await expect(listPage.rowByTitle('Lịch trình 3 ngày 2 đêm tại Đà Nẵng')).toHaveCount(0);
  });

  /** TC_AD_BLOGLIST_021 */
  test('TC_AD_BLOGLIST_021 filters by archived status', async () => {
    await listPage.selectStatusFilter(copy.statusArchived);
    await expect(listPage.rowByTitle('Top homestay view biển Sơn Trà')).toBeVisible();
    await expect(listPage.rowByTitle(primaryBlogRow.title)).toHaveCount(0);
  });

  /** TC_AD_BLOGLIST_024 */
  test('TC_AD_BLOGLIST_024 resets filters', async () => {
    await listPage.search(mockBlogSearchKeyword);
    await expect(listPage.tableRows).toHaveCount(1);
    await listPage.resetFilters();
    await expect(listPage.searchInput).toHaveValue('');
    await expect(listPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_BLOGLIST_025 */
  test('TC_AD_BLOGLIST_025 shows active filter chips when filtering', async () => {
    await listPage.search(mockBlogSearchKeyword);
    await expect(listPage.activeFiltersRow).toBeVisible();
    await expect(listPage.activeFiltersRow).toContainText(mockBlogSearchKeyword);
    await listPage.selectStatusFilter(copy.statusPublished);
    await expect(listPage.activeFiltersRow).toContainText(/Đã xuất bản|Published/i);
  });

  /** TC_AD_BLOGLIST_029 */
  test('TC_AD_BLOGLIST_029 sorts by created_at descending then ascending', async ({ adminPage }) => {
    await expect(listPage.tableRows.first()).toContainText(primaryBlogRow.title);

    const ascReq = adminPage.waitForResponse(
      (res) => res.url().includes('sort=created_at') && res.url().includes('order=asc')
    );
    await listPage.sortHeader(copy.colCreated).click();
    await ascReq;
    await expect(adminPage).toHaveURL(/sort=created_at/);
    await expect(adminPage).toHaveURL(/order=asc/);

    const descReq = adminPage.waitForResponse(
      (res) => res.url().includes('sort=created_at') && res.url().includes('order=desc')
    );
    await listPage.sortHeader(copy.colCreated).click();
    await descReq;
    await expect(listPage.tableRows.first()).toContainText(primaryBlogRow.title);
  });

  /** TC_AD_BLOGLIST_032 */
  test('TC_AD_BLOGLIST_032 paginates to page 2', async ({ adminPage }) => {
    const page2Req = adminPage.waitForResponse(
      (res) => res.url().includes('page=2') && res.url().includes('/admin/blog-posts')
    );
    await listPage.goToPage(2);
    await page2Req;
    await expect(listPage.rowByTitle('Bài viết test xóa automation')).toBeVisible();
  });

  /** TC_AD_BLOGLIST_033 */
  test('TC_AD_BLOGLIST_033 changes per page to 20', async ({ adminPage }) => {
    const limitReq = adminPage.waitForResponse((res) => res.url().includes('per_page=20'));
    await listPage.changeLimit(20);
    await limitReq;
    await expect(listPage.tableRows).toHaveCount(16);
  });

  /** TC_AD_BLOGLIST_035 */
  test('TC_AD_BLOGLIST_035 refresh refetches list', async () => {
    const refreshReq = listPage.waitForListResponse();
    await listPage.refreshButton.click();
    await refreshReq;
    await expect(listPage.rowByTitle(primaryBlogRow.title)).toBeVisible();
  });

  /** TC_AD_BLOGLIST_036 */
  test('TC_AD_BLOGLIST_036 view button navigates to detail', async ({ adminPage }) => {
    await listPage.viewButtonInRow(listPage.rowByTitle(primaryBlogRow.title)).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/${primaryBlogRow.id}`));
  });

  /** TC_AD_BLOGLIST_037 */
  test('TC_AD_BLOGLIST_037 edit button navigates to edit', async ({ adminPage }) => {
    await listPage.editButtonInRow(listPage.rowByTitle(primaryBlogRow.title)).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${primaryBlogRow.id}`));
  });

  /** TC_AD_BLOGLIST_038 */
  test('TC_AD_BLOGLIST_038 clicking title navigates to detail', async ({ adminPage }) => {
    await listPage.titleLinkInRow(listPage.rowByTitle(primaryBlogRow.title)).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/${primaryBlogRow.id}`));
  });

  /** TC_AD_BLOGLIST_004 */
  test('TC_AD_BLOGLIST_004 add button navigates to create', async ({ adminPage }) => {
    await listPage.addButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/create/);
  });

  /** TC_AD_BLOGLIST_028 */
  test('TC_AD_BLOGLIST_028 sorts by view count descending then ascending', async ({ adminPage }) => {
    const descReq = adminPage.waitForResponse((res) => res.url().includes('sort=view_count') && res.url().includes('order=desc'));
    await listPage.sortHeader(copy.colViews).click();
    await descReq;
    await expect(listPage.tableRows.first()).toContainText('8,420');

    const ascReq = adminPage.waitForResponse((res) => res.url().includes('sort=view_count') && res.url().includes('order=asc'));
    await listPage.sortHeader(copy.colViews).click();
    await ascReq;
  });
});

test.describe('Admin Blog List — delete @P1', () => {
  /** TC_AD_BLOGLIST_046 */
  test('TC_AD_BLOGLIST_046 deletes post after confirm', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Bài viết test xóa');

    const row = listPage.rowByTitle('Bài viết test xóa automation');
    const deleteReq = listPage.waitForDelete(deletableBlogId);
    await listPage.deleteButtonInRow(row).click();
    await expect(listPage.deleteDialog).toBeVisible();
    await listPage.confirmDeleteDialog();
    await deleteReq;
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    expect(getMockBlogPost(deletableBlogId)).toBeUndefined();
  });

  /** TC_AD_BLOGLIST_048 */
  test('TC_AD_BLOGLIST_048 dismisses delete dialog without API', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes(`/admin/blog-posts/${deletableBlogId}`)) {
        deleteCalled = true;
      }
    });
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Bài viết test xóa');
    await listPage.deleteButtonInRow(listPage.rowByTitle('Bài viết test xóa automation')).click();
    await listPage.cancelDeleteDialog();
    expect(deleteCalled).toBe(false);
    expect(getMockBlogPost(deletableBlogId)).toBeDefined();
  });

  /** TC_AD_BLOGLIST_050 */
  test('TC_AD_BLOGLIST_050 shows error toast when delete fails', async ({ adminPage }) => {
    resetMockBlogs();
    setBlogDeleteFailForId(deletableBlogId);
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Bài viết test xóa');
    await listPage.deleteButtonInRow(listPage.rowByTitle('Bài viết test xóa automation')).click();
    const deleteFailReq = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/blog-posts/${deletableBlogId}`) &&
        res.status() === 500
    );
    await listPage.confirmDeleteDialog();
    await deleteFailReq;
    await expect(adminPage.getByText(copy.networkError)).toBeVisible({ timeout: 15_000 });
    expect(getMockBlogPost(deletableBlogId)).toBeDefined();
  });
});

test.describe('Admin Blog List — status @P1', () => {
  /** TC_AD_BLOGLIST_041 */
  test('TC_AD_BLOGLIST_041 changes row status to published via dropdown', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Lịch trình 3 ngày');

    const row = listPage.rowByTitle('Lịch trình 3 ngày 2 đêm tại Đà Nẵng');
    expect(getMockBlogPost(statusChangeBlogId)?.status).toBe('draft');
    const patchReq = listPage.waitForStatusPatch(statusChangeBlogId);
    await listPage.changeRowStatus(row, copy.statusPublished);
    await patchReq;
    await expect(adminPage.getByText(copy.statusSuccess)).toBeVisible();
    expect(getMockBlogPost(statusChangeBlogId)?.status).toBe('published');
  });

  /** TC_AD_BLOGLIST_045 */
  test('TC_AD_BLOGLIST_045 shows error toast when status change fails', async ({ adminPage }) => {
    resetMockBlogs();
    setBlogStatusFailForId(statusChangeBlogId);
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Lịch trình 3 ngày');
    await listPage.changeRowStatus(
      listPage.rowByTitle('Lịch trình 3 ngày 2 đêm tại Đà Nẵng'),
      copy.statusPublished
    );
    await expect(adminPage.getByText(copy.networkError)).toBeVisible();
  });
});

test.describe('Admin Blog List — bulk & empty @P1', () => {
  /** TC_AD_BLOGLIST_051 */
  test('TC_AD_BLOGLIST_051 selects row and shows bulk toolbar', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Draft bulk');
    await listPage.selectRowsByTitle('Draft bulk publish A');
    await expect(listPage.bulkSelectedLabel).toBeVisible();
    await expect(listPage.bulkPublishButton).toBeVisible();
    await expect(listPage.bulkArchiveButton).toBeVisible();
    await expect(listPage.bulkDeleteButton).toBeVisible();
  });

  /** TC_AD_BLOGLIST_054 */
  test('TC_AD_BLOGLIST_054 bulk publishes draft posts', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Draft bulk');
    await listPage.selectRowsByTitle('Draft bulk publish A', 'Draft bulk publish B');
    const patchReq = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/blog-posts/${bulkDraftBlogIds[0]}/status`)
    );
    await listPage.bulkPublishButton.click();
    await patchReq;
    await expect(adminPage.getByText(copy.bulkStatusSuccess)).toBeVisible();
    expect(getMockBlogPost(bulkDraftBlogIds[0]!)?.status).toBe('published');
  });

  /** TC_AD_BLOGLIST_055 */
  test('TC_AD_BLOGLIST_055 bulk archives published posts', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search(mockBlogSearchKeyword);
    await listPage.selectRowsByTitle(primaryBlogRow.title);
    const patchReq = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/blog-posts/${bulkArchiveBlogId}/status`)
    );
    await listPage.bulkArchiveButton.click();
    await patchReq;
    await expect(adminPage.getByText(copy.bulkStatusSuccess)).toBeVisible();
    expect(getMockBlogPost(bulkArchiveBlogId)?.status).toBe('archived');
  });

  /** TC_AD_BLOGLIST_058 */
  test('TC_AD_BLOGLIST_058 shows partial error toast when bulk publish partially fails', async ({ adminPage }) => {
    resetMockBlogs();
    setBlogStatusFailForId(bulkDraftBlogIds[1]!);
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Draft bulk');
    await listPage.selectRowsByTitle('Draft bulk publish A', 'Draft bulk publish B');
    await listPage.bulkPublishButton.click();
    await expect(adminPage.getByText(copy.bulkPartialError)).toBeVisible({ timeout: 15_000 });
    expect(getMockBlogPost(bulkDraftBlogIds[0]!)?.status).toBe('published');
    expect(getMockBlogPost(bulkDraftBlogIds[1]!)?.status).toBe('draft');
  });

  /** TC_AD_BLOGLIST_056 */
  test('TC_AD_BLOGLIST_056 bulk delete after confirm dialog', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Draft bulk');
    await listPage.selectRowsByTitle('Draft bulk publish A');
    await listPage.bulkDeleteButton.click();
    await expect(listPage.deleteDialog).toBeVisible();
    const deleteReq = listPage.waitForDelete(bulkDraftBlogIds[0]!);
    await listPage.confirmDeleteDialog();
    await deleteReq;
    await expect(adminPage.getByText(copy.bulkDeleteSuccess)).toBeVisible();
    expect(getMockBlogPost(bulkDraftBlogIds[0]!)).toBeUndefined();
  });

  /** TC_AD_BLOGLIST_057 */
  test('TC_AD_BLOGLIST_057 cancels bulk delete without API', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/blog-posts/')) {
        deleteCalled = true;
      }
    });
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Draft bulk');
    await listPage.selectRowsByTitle('Draft bulk publish A');
    await listPage.bulkDeleteButton.click();
    await listPage.cancelDeleteDialog();
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_BLOGLIST_052 */
  test('TC_AD_BLOGLIST_052 select all on page', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.selectAllOnPage();
    await expect(listPage.bulkSelectedLabel).toContainText('10');
  });

  /** TC_AD_BLOGLIST_060 */
  test('TC_AD_BLOGLIST_060 shows empty state when list is empty', async ({ adminPage }) => {
    resetMockBlogs();
    setBlogListEmpty(true);
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await expect(adminPage.getByText(copy.emptyTitle)).toBeVisible();
    await expect(adminPage.getByText(copy.emptySubtitle)).toBeVisible();
  });

  /** TC_AD_BLOGLIST_061 */
  test('TC_AD_BLOGLIST_061 shows scheduled badge for future published post', async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Bài viết lên lịch');
    const row = listPage.rowByTitle('Bài viết lên lịch automation');
    await expect(row).toBeVisible();
    await expect(row.getByText(copy.scheduledBadge)).toBeVisible();
  });

  /** TC_AD_BLOGLIST_062 */
  test('TC_AD_BLOGLIST_062 shows list error state with retry when list API fails', async ({ adminPage }) => {
    resetMockBlogs();
    setBlogListFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await expect(listPage.listErrorPanel).toBeVisible({ timeout: 15_000 });
    await expect(listPage.retryListButton).toBeVisible();
    await expect(adminPage.getByText(copy.listLoadError)).toBeVisible();
    await expect(listPage.statsGrid).toHaveCount(0);
    setBlogListFail(false);
    const listReq = listPage.waitForListResponse();
    await listPage.retryListButton.click();
    await listReq;
    await listPage.waitForTableLoaded();
  });
});
