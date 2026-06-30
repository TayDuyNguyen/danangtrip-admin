/**
 * Admin Blog Categories — core (17)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BlogCategoriesPage, blogCategoriesCopy as copy } from '../pages/admin/BlogCategoriesPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockBlogCategoriesApi,
  resetMockBlogCategories,
  setBlogCategoryListEmpty,
  setBlogCategoryListFail,
} from '../fixtures/api/blog-categories.mock';
import {
  blockedDeleteBlogCategoryRow,
  deletableBlogCategoryRow,
  expectedBlogCategoryStats,
  mockBlogCategoryListRows,
  mockBlogCategorySearchKeyword,
  primaryBlogCategoryRow,
  searchableBlogCategoryRow,
} from '../fixtures/data/blog-categories.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Blog Categories @P1', () => {
  let catPage: BlogCategoriesPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBlogCategories();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockBlogCategoriesApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    catPage = new BlogCategoriesPage(adminPage);
    await catPage.goto();
    await catPage.waitForListLoaded();
  });

  /** TC_AD_BLOGCAT_001 */
  test('TC_AD_BLOGCAT_001 renders cards with name slug description and post count', async () => {
    await expect(catPage.heading).toBeVisible();
    await expect(catPage.subtitle).toBeVisible();
    await expect(catPage.statsRow).toBeVisible();
    await expect(catPage.searchInput).toBeVisible();
    await expect(catPage.addHeaderButton).toBeVisible();
    await expect(catPage.categoryCards).toHaveCount(mockBlogCategoryListRows.length);

    const card = catPage.cardByName(primaryBlogCategoryRow.name);
    await expect(card).toBeVisible();
    await expect(card).toContainText(primaryBlogCategoryRow.slug);
    await expect(card).toContainText(primaryBlogCategoryRow.description!);
    await expect(card).toContainText(String(primaryBlogCategoryRow.posts_count));
  });

  /** TC_AD_BLOGCAT_006 */
  test('TC_AD_BLOGCAT_006 shows stats cards from list response', async () => {
    await expect(catPage.statsScopeNote).toBeVisible();
    await expect(catPage.statValue(copy.statsTotalCategories)).toHaveText(
      String(expectedBlogCategoryStats.totalCategories)
    );
    await expect(catPage.statValue(copy.statsTotalPosts)).toHaveText(
      String(expectedBlogCategoryStats.totalPosts)
    );
  });

  /** TC_AD_BLOGCAT_002 */
  test('TC_AD_BLOGCAT_002 validates required name on create', async () => {
    await catPage.openAddForm();
    await catPage.submitForm();
    await expect(catPage.formPanel.getByText(copy.nameRequired)).toBeVisible();
  });

  /** TC_AD_BLOGCAT_003 */
  test('TC_AD_BLOGCAT_003 creates category with auto slug', async ({ adminPage }) => {
    await catPage.fillCreateForm({
      name: 'Cẩm Nang Ăn Uống',
      description: 'Gợi ý quán ăn và món ngon',
    });
    await expect(catPage.slugInput).toHaveValue('cam-nang-an-uong');
    await catPage.submitForm();
    await expect(adminPage.getByText(copy.createSuccess)).toBeVisible({ timeout: 15_000 });
    await expect(catPage.cardByName('Cẩm Nang Ăn Uống')).toBeVisible();
    await expect(catPage.nameInput).toHaveValue('');
  });

  /** TC_AD_BLOGCAT_004 */
  test('TC_AD_BLOGCAT_004 edits category description', async ({ adminPage }) => {
    const updatedDesc = 'Mô tả kinh nghiệm du lịch đã cập nhật';
    await catPage.openEditForName(primaryBlogCategoryRow.name);
    await catPage.descriptionInput.fill(updatedDesc);
    await catPage.submitForm();
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await expect(catPage.cardByName(primaryBlogCategoryRow.name)).toContainText(updatedDesc);
  });

  /** TC_AD_BLOGCAT_007 */
  test('TC_AD_BLOGCAT_007 filters categories by search keyword', async () => {
    await catPage.search(mockBlogCategorySearchKeyword);
    await expect(catPage.resetSearchButton).toBeVisible();
    await expect(catPage.categoryCards).toHaveCount(1);
    await expect(catPage.cardByName(searchableBlogCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_BLOGCAT_008 */
  test('TC_AD_BLOGCAT_008 shows preview when typing name', async () => {
    await catPage.openAddForm();
    await catPage.nameInput.fill('Preview Danh Mục');
    await expect(catPage.formPanel.getByText('Preview Danh Mục')).toBeVisible();
    await expect(catPage.formPanel.locator('span.uppercase').filter({ hasText: copy.previewLabel })).toBeVisible();
  });

  /** TC_AD_BLOGCAT_009 */
  test('TC_AD_BLOGCAT_009 highlights card when editing', async () => {
    await catPage.openEditForName(primaryBlogCategoryRow.name);
    const card = catPage.cardByName(primaryBlogCategoryRow.name);
    await expect(card).toHaveClass(/ring-4/);
  });

  /** TC_AD_BLOGCAT_010 */
  test('TC_AD_BLOGCAT_010 shows empty state when search has no match', async () => {
    await catPage.search('zzz-no-match');
    await expect(catPage.page.getByText(copy.emptySearchTitle)).toBeVisible();
    await expect(catPage.categoryCards).toHaveCount(0);
  });

  /** TC_AD_BLOGCAT_011 */
  test('TC_AD_BLOGCAT_011 shows load error and retries successfully', async ({ adminPage }) => {
    setBlogCategoryListFail(true);
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockBlogCategoriesApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await adminPage.goto('/admin/blog-categories', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByText(copy.loadErrorTitle)).toBeVisible({ timeout: 20_000 });
    setBlogCategoryListFail(false);
    const listReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/blog-categories') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
    await adminPage.getByRole('button', { name: copy.retryButton }).click();
    await listReq;
    catPage = new BlogCategoriesPage(adminPage);
    await catPage.waitForListLoaded();
    await expect(catPage.categoryCards.first()).toBeVisible();
  });

  /** TC_AD_BLOGCAT_012 */
  test('TC_AD_BLOGCAT_012 enters reorder mode and cancels', async () => {
    await catPage.enterReorderMode();
    await expect(catPage.reorderingButton).toBeVisible();
    await catPage.cancelReorderMode();
    await expect(catPage.reorderButton).toBeVisible();
  });

  /** TC_AD_BLOGCAT_013 */
  test('TC_AD_BLOGCAT_013 disables reorder when search is active', async () => {
    await catPage.search(mockBlogCategorySearchKeyword);
    await expect(catPage.reorderButton).toBeDisabled();
  });

  /** TC_AD_BLOGCAT_014 */
  test('TC_AD_BLOGCAT_014 saves reorder without changing order', async ({ adminPage }) => {
    await catPage.enterReorderMode();
    await catPage.saveReorder();
    await expect(adminPage.getByText(copy.reorderSuccess)).toBeVisible();
    await expect(catPage.reorderButton).toBeVisible();
  });

  /** TC_AD_BLOGCAT_015 */
  test('TC_AD_BLOGCAT_015 cancels delete confirmation dialog', async () => {
    await catPage.openDeleteForName(deletableBlogCategoryRow.name);
    await catPage.cancelDelete();
    await expect(catPage.deleteDialog).toHaveCount(0);
    await expect(catPage.cardByName(deletableBlogCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_BLOGCAT_016 */
  test('TC_AD_BLOGCAT_016 deletes category without posts', async ({ adminPage }) => {
    await catPage.openDeleteForName(deletableBlogCategoryRow.name);
    await catPage.confirmDelete();
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    await expect(catPage.cardByName(deletableBlogCategoryRow.name)).toHaveCount(0);
  });

  /** TC_AD_BLOGCAT_017 */
  test('TC_AD_BLOGCAT_017 blocks delete when category has posts', async () => {
    const deleteBtn = catPage.deleteButtonForId(blockedDeleteBlogCategoryRow.id);
    await expect(deleteBtn).toBeDisabled();
    await expect(deleteBtn).toHaveAttribute('title', copy.deleteBlocked);
    await expect(catPage.cardByName(blockedDeleteBlogCategoryRow.name)).toBeVisible();
    await expect(catPage.postsLinkForId(blockedDeleteBlogCategoryRow.id)).toHaveAttribute(
      'href',
      `/admin/blog-posts?category_id=${blockedDeleteBlogCategoryRow.id}`
    );
  });

  /** TC_AD_BLOGCAT_018 */
  test('TC_AD_BLOGCAT_018 resets inline form on cancel', async () => {
    await catPage.openEditForName(primaryBlogCategoryRow.name);
    await catPage.cancelFormButton.click();
    await expect(catPage.formPanel.getByText(copy.addFormTitle)).toBeVisible();
    await expect(catPage.nameInput).toHaveValue('');
  });
});
