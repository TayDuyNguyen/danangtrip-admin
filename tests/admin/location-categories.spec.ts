/**
 * Admin Location Categories — core (16)
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  LocationCategoriesPage,
  locationCategoriesCopy as copy,
} from '../pages/admin/LocationCategoriesPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockLocationCategoriesApi,
  resetMockLocationCategories,
  setLocationCategoryListEmpty,
  setLocationCategoryListFail,
} from '../fixtures/api/location-categories.mock';
import {
  blockedDeleteLocationCategoryRow,
  deletableLocationCategoryRow,
  expectedLocationCategoryStats,
  mockLocationCategoryListRows,
  mockLocationCategorySearchKeyword,
  primaryLocationCategoryRow,
  searchableLocationCategoryRow,
} from '../fixtures/data/location-categories.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Location Categories @P1', () => {
  let catPage: LocationCategoriesPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockLocationCategories();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockLocationCategoriesApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    catPage = new LocationCategoriesPage(adminPage);
    await catPage.goto();
    await catPage.waitForGridLoaded();
  });

  /** TC_AD_LOCCAT_001 */
  test('TC_AD_LOCCAT_001 renders grid with name slug and locations count', async () => {
    await expect(catPage.heading).toBeVisible();
    await expect(catPage.subtitle).toBeVisible();
    await expect(catPage.statsRow).toBeVisible();
    await expect(catPage.searchInput).toBeVisible();
    await expect(catPage.addButton).toBeVisible();
    await expect(catPage.categoryCards).toHaveCount(mockLocationCategoryListRows.length);

    const card = catPage.cardByName(primaryLocationCategoryRow.name);
    await expect(card).toBeVisible();
    await expect(card).toContainText(primaryLocationCategoryRow.slug);
    await expect(card).toContainText(String(primaryLocationCategoryRow.locations_count));
  });

  /** TC_AD_LOCCAT_006 */
  test('TC_AD_LOCCAT_006 shows stats cards from list response', async () => {
    await expect(catPage.statValue(copy.statsTotal)).toHaveText(
      String(expectedLocationCategoryStats.total)
    );
    await expect(catPage.statValue(copy.statsActive)).toHaveText(
      String(expectedLocationCategoryStats.active)
    );
    await expect(catPage.statValue(copy.statsInactive)).toHaveText(
      String(expectedLocationCategoryStats.inactive)
    );
  });

  /** TC_AD_LOCCAT_002 */
  test('TC_AD_LOCCAT_002 validates required name on create', async () => {
    await catPage.openAddDrawer();
    await catPage.submitDrawer();
    await expect(catPage.drawer.getByText(copy.nameRequired)).toBeVisible();
  });

  /** TC_AD_LOCCAT_003 */
  test('TC_AD_LOCCAT_003 creates category with auto slug', async ({ adminPage }) => {
    await catPage.openAddDrawer();
    await catPage.fillCreateForm({
      name: 'Khu Vui Chơi',
      description: 'Công viên và khu vui chơi giải trí',
    });
    await expect(catPage.slugInput).toHaveValue('khu-vui-choi');
    await catPage.submitDrawer();
    await expect(adminPage.getByText(copy.createSuccess)).toBeVisible({ timeout: 15_000 });
    await expect(catPage.cardByName('Khu Vui Chơi')).toBeVisible();
  });

  /** TC_AD_LOCCAT_004 */
  test('TC_AD_LOCCAT_004 edits category description', async ({ adminPage }) => {
    const updatedDesc = 'Mô tả ẩm thực đã cập nhật';
    await catPage.openEditForName(primaryLocationCategoryRow.name);
    await catPage.descriptionInput.fill(updatedDesc);
    await catPage.submitDrawer();
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await catPage.openEditForName(primaryLocationCategoryRow.name);
    await expect(catPage.descriptionInput).toHaveValue(updatedDesc);
  });

  /** TC_AD_LOCCAT_007 */
  test('TC_AD_LOCCAT_007 filters categories by search keyword', async () => {
    await catPage.search(mockLocationCategorySearchKeyword);
    await expect(catPage.categoryCards).toHaveCount(1);
    await expect(catPage.cardByName(searchableLocationCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_LOCCAT_008 */
  test('TC_AD_LOCCAT_008 filters categories by inactive status', async () => {
    await catPage.selectStatusFilter(copy.statusInactive);
    await expect(catPage.categoryCards).toHaveCount(1);
    await expect(catPage.cardByName(deletableLocationCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_LOCCAT_009 */
  test('TC_AD_LOCCAT_009 toggles status badge on card', async ({ adminPage }) => {
    const card = catPage.cardByName(primaryLocationCategoryRow.name);
    const badge = catPage.statusBadgeInCard(card);
    await expect(badge).toHaveText(copy.statusActive);
    const patchReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/categories/${primaryLocationCategoryRow.id}/status`) &&
        res.request().method() === 'PATCH'
    );
    await badge.click();
    await patchReq;
    await expect(adminPage.getByText(copy.statusUpdateSuccess)).toBeVisible();
    await expect(badge).toHaveText(copy.statusInactive);
  });

  /** TC_AD_LOCCAT_010 */
  test('TC_AD_LOCCAT_010 shows empty state when list has no rows', async () => {
    setLocationCategoryListEmpty(true);
    const listReq = catPage.waitForListResponse();
    await catPage.search('zzz-no-match');
    await listReq;
    await expect(catPage.page.getByTestId('location-category-empty')).toBeVisible();
    await expect(catPage.page.getByText(copy.emptyTitle)).toBeVisible();
  });

  /** TC_AD_LOCCAT_011 */
  test('TC_AD_LOCCAT_011 shows load error and retries successfully', async ({ adminPage }) => {
    setLocationCategoryListFail(true);
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockLocationCategoriesApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await adminPage.goto('/admin/location-categories', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByText(copy.loadErrorTitle)).toBeVisible({ timeout: 20_000 });
    setLocationCategoryListFail(false);
    const listReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/categories') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
    await adminPage.getByTestId('location-category-retry').click();
    await listReq;
    catPage = new LocationCategoriesPage(adminPage);
    await catPage.waitForGridLoaded();
    await expect(catPage.categoryCards.first()).toBeVisible();
  });

  /** TC_AD_LOCCAT_012 */
  test('TC_AD_LOCCAT_012 enters reorder mode and cancels', async () => {
    await catPage.enterReorderMode();
    await expect(catPage.reorderingButton).toBeVisible();
    await catPage.cancelReorderMode();
    await expect(catPage.reorderButton).toBeVisible();
  });

  /** TC_AD_LOCCAT_013 */
  test('TC_AD_LOCCAT_013 disables reorder when search is active', async () => {
    await catPage.search(mockLocationCategorySearchKeyword);
    await expect(catPage.reorderButton).toBeDisabled();
  });

  /** TC_AD_LOCCAT_014 */
  test('TC_AD_LOCCAT_014 saves reorder without changing order', async ({ adminPage }) => {
    await catPage.enterReorderMode();
    await catPage.saveReorder();
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await expect(catPage.reorderButton).toBeVisible();
  });

  /** TC_AD_LOCCAT_015 */
  test('TC_AD_LOCCAT_015 cancels delete confirmation dialog', async () => {
    await catPage.openDeleteForName(deletableLocationCategoryRow.name);
    await catPage.cancelDelete();
    await expect(catPage.deleteDialog).toHaveCount(0);
    await expect(catPage.cardByName(deletableLocationCategoryRow.name)).toBeVisible();
  });

  /** TC_AD_LOCCAT_016 */
  test('TC_AD_LOCCAT_016 deletes category without locations', async ({ adminPage }) => {
    await catPage.openDeleteForName(deletableLocationCategoryRow.name);
    await catPage.confirmDelete();
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    await expect(catPage.cardByName(deletableLocationCategoryRow.name)).toHaveCount(0);
  });

  /** TC_AD_LOCCAT_017 */
  test('TC_AD_LOCCAT_017 disables delete when category has locations', async () => {
    const deleteBtn = catPage.deleteButtonForCategory(blockedDeleteLocationCategoryRow.id);
    await expect(deleteBtn).toBeDisabled();
    await expect(deleteBtn).toHaveAttribute(
      'title',
      new RegExp(String(blockedDeleteLocationCategoryRow.locations_count))
    );
  });

  /** TC_AD_LOCCAT_018 */
  test('TC_AD_LOCCAT_018 closes create drawer on cancel', async () => {
    await catPage.openAddDrawer();
    await catPage.cancelDrawerButton.click();
    await expect(catPage.drawer).toHaveAttribute('aria-hidden', 'true');
  });

  /** TC_AD_LOCCAT_019 */
  test('TC_AD_LOCCAT_019 opens icon browser in create drawer', async () => {
    await catPage.openAddDrawer();
    await catPage.openIconBrowser();
  });
});
