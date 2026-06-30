/**
 * Admin Tour Categories — core (15)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { TourCategoriesPage, tourCategoriesCopy as copy } from '../pages/admin/TourCategoriesPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockTourCategoriesApi,
  resetMockTourCategories,
  setTourCategoryListEmpty,
  setTourCategoryListFail,
} from '../fixtures/api/tour-categories.mock';
import {
  blockedDeleteCategoryRow,
  deletableCategoryRow,
  expectedCategoryStats,
  mockCategorySearchKeyword,
  mockTourCategoryListRows,
  primaryCategoryRow,
  searchableCategoryRow,
} from '../fixtures/data/tour-categories.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Tour Categories @P1', () => {
  let catPage: TourCategoriesPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTourCategories();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockTourCategoriesApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    catPage = new TourCategoriesPage(adminPage);
    await catPage.goto();
    await catPage.waitForGridLoaded();
  });

  /** TC_AD_TOURCAT_001 */
  test('TC_AD_TOURCAT_001 renders grid with name slug icon and tour count', async () => {
    await expect(catPage.heading).toBeVisible();
    await expect(catPage.subtitle).toBeVisible();
    await expect(catPage.statsRow).toBeVisible();
    await expect(catPage.searchInput).toBeVisible();
    await expect(catPage.addButton).toBeVisible();
    await expect(catPage.categoryCards).toHaveCount(mockTourCategoryListRows.length);

    const card = catPage.cardByName(primaryCategoryRow.name);
    await expect(card).toBeVisible();
    await expect(card).toContainText(primaryCategoryRow.slug);
    await expect(card).toContainText(String(primaryCategoryRow.tour_count));
  });

  /** TC_AD_TOURCAT_006 */
  test('TC_AD_TOURCAT_006 shows stats cards from list response', async () => {
    await expect(catPage.statValue(copy.statsTotalTours)).toHaveText(
      String(expectedCategoryStats.totalTours)
    );
    await expect(catPage.statValue(copy.statsActiveCategories)).toHaveText(
      String(expectedCategoryStats.activeCategories)
    );
    await expect(catPage.statValue(copy.statsInactiveCategories)).toHaveText(
      String(expectedCategoryStats.inactiveCategories)
    );
  });

  /** TC_AD_TOURCAT_002 */
  test('TC_AD_TOURCAT_002 validates required name on create', async () => {
    await catPage.openAddDrawer();
    await catPage.submitDrawer();
    await expect(catPage.drawer.getByText(copy.nameRequired)).toBeVisible();
  });

  /** TC_AD_TOURCAT_003 */
  test('TC_AD_TOURCAT_003 creates category with auto slug', async ({ adminPage }) => {
    await catPage.openAddDrawer();
    await catPage.fillCreateForm({
      name: 'Tour Biển Xanh',
      description: 'Tour khám phá biển xanh',
    });
    await expect(catPage.drawer.locator('input[type="text"]').nth(1)).toHaveValue('tour-bien-xanh');
    await catPage.submitDrawer();
    await expect(adminPage.getByText(copy.createSuccess)).toBeVisible({ timeout: 15_000 });
    await expect(catPage.cardByName('Tour Biển Xanh')).toBeVisible();
  });

  /** TC_AD_TOURCAT_004 */
  test('TC_AD_TOURCAT_004 edits category description', async ({ adminPage }) => {
    const updatedDesc = 'Mô tả đã cập nhật cho tour trong ngày';
    await catPage.openEditForName(primaryCategoryRow.name);
    await catPage.descriptionInput.fill(updatedDesc);
    await catPage.submitDrawer();
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await catPage.openEditForName(primaryCategoryRow.name);
    await expect(catPage.descriptionInput).toHaveValue(updatedDesc);
  });

  /** TC_AD_TOURCAT_007 */
  test('TC_AD_TOURCAT_007 filters categories by search keyword', async () => {
    await catPage.search(mockCategorySearchKeyword);
    await expect(catPage.categoryCards).toHaveCount(1);
    await expect(catPage.cardByName(searchableCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_TOURCAT_008 */
  test('TC_AD_TOURCAT_008 filters categories by inactive status', async () => {
    await catPage.selectStatusFilter(copy.statusInactive);
    await expect(catPage.categoryCards).toHaveCount(1);
    await expect(catPage.cardByName(deletableCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_TOURCAT_009 */
  test('TC_AD_TOURCAT_009 toggles status badge on card', async ({ adminPage }) => {
    const card = catPage.cardByName(primaryCategoryRow.name);
    const badge = catPage.statusBadgeInCard(card);
    await expect(badge).toHaveText(copy.statusActive);
    const patchReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/tour-categories/${primaryCategoryRow.id}/status`) &&
        res.request().method() === 'PATCH'
    );
    await badge.click();
    await patchReq;
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await expect(badge).toHaveText(copy.statusInactive);
  });

  /** TC_AD_TOURCAT_010 */
  test('TC_AD_TOURCAT_010 shows empty state when list has no rows', async () => {
    setTourCategoryListEmpty(true);
    const listReq = catPage.waitForListResponse();
    await catPage.search('zzz-no-match');
    await listReq;
    await expect(catPage.page.getByText(copy.emptyTitle)).toBeVisible();
  });

  /** TC_AD_TOURCAT_011 */
  test('TC_AD_TOURCAT_011 shows load error and retries successfully', async ({ adminPage }) => {
    setTourCategoryListFail(true);
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockTourCategoriesApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await adminPage.goto('/admin/tour-categories', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByText(copy.loadErrorTitle)).toBeVisible({ timeout: 20_000 });
    setTourCategoryListFail(false);
    const listReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/tour-categories') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
    await adminPage.getByTestId('tour-category-retry').click();
    await listReq;
    catPage = new TourCategoriesPage(adminPage);
    await catPage.waitForGridLoaded();
    await expect(catPage.categoryCards.first()).toBeVisible();
  });

  /** TC_AD_TOURCAT_012 */
  test('TC_AD_TOURCAT_012 enters reorder mode and cancels', async () => {
    await catPage.enterReorderMode();
    await expect(catPage.reorderingButton).toBeVisible();
    await catPage.cancelReorderMode();
    await expect(catPage.reorderButton).toBeVisible();
  });

  /** TC_AD_TOURCAT_013 */
  test('TC_AD_TOURCAT_013 disables reorder when search is active', async () => {
    await catPage.search(mockCategorySearchKeyword);
    await expect(catPage.reorderButton).toBeDisabled();
  });

  /** TC_AD_TOURCAT_014 */
  test('TC_AD_TOURCAT_014 saves reorder without changing order', async ({ adminPage }) => {
    await catPage.enterReorderMode();
    await catPage.saveReorder();
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await expect(catPage.reorderButton).toBeVisible();
  });

  /** TC_AD_TOURCAT_015 */
  test('TC_AD_TOURCAT_015 cancels delete confirmation dialog', async () => {
    await catPage.openDeleteForName(deletableCategoryRow.name);
    await catPage.cancelDelete();
    await expect(catPage.deleteDialog).toHaveCount(0);
    await expect(catPage.cardByName(deletableCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_TOURCAT_005 / TC_AD_TOURCAT_016 */
  test('TC_AD_TOURCAT_016 deletes category without tours', async ({ adminPage }) => {
    await catPage.openDeleteForName(deletableCategoryRow.name);
    await catPage.confirmDelete();
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    await expect(catPage.cardByName(deletableCategoryRow.name)).toHaveCount(0);
  });

  /** TC_AD_TOURCAT_017 */
  test('TC_AD_TOURCAT_017 disables delete when category has tours', async () => {
    const deleteBtn = catPage.deleteButtonForCategory(blockedDeleteCategoryRow.id);
    await expect(deleteBtn).toBeDisabled();
    await expect(deleteBtn).toHaveAttribute(
      'title',
      new RegExp(String(blockedDeleteCategoryRow.tour_count))
    );
  });

  /** TC_AD_TOURCAT_018 */
  test('TC_AD_TOURCAT_018 closes create drawer on cancel', async () => {
    await catPage.openAddDrawer();
    await catPage.cancelDrawerButton.click();
    await expect(catPage.drawer).toHaveAttribute('aria-hidden', 'true');
  });
  /** TC_AD_TOURCAT_019 */
  test('TC_AD_TOURCAT_019 opens icon browser in create drawer', async () => {
    await catPage.openAddDrawer();
    await catPage.openIconBrowser();
  });
});
