/**
 * Admin Location List — core (05a)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { LocationListPage, locationListCopy as copy } from '../pages/admin/LocationListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockLocation,
  mockLocationsApi,
  resetMockLocations,
  setLocationDeleteFailForId,
  setLocationExportFail,
  setLocationFeaturedFailForId,
  setLocationListEmpty,
  setLocationListFail,
  setLocationMutationFail,
} from '../fixtures/api/locations.mock';
import {
  deletableLocationId,
  expectedLocationStats,
  featuredToggleLocationId,
  formatViewsForStats,
  mockLocationCategories,
  mockLocationSearchKeyword,
  primaryLocationRow,
} from '../fixtures/data/locations.data';

test.describe('Admin Location List @P1', () => {
  let listPage: LocationListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_LOCLIST_001 */
  test('TC_AD_LOCLIST_001 renders heading stats filters and table', async () => {
    await expect(listPage.heading).toBeVisible();
    await expect(listPage.subtitle).toBeVisible();
    await expect(listPage.statsGrid).toBeVisible();
    await expect(listPage.searchInput).toBeVisible();
    await expect(listPage.table).toBeVisible();
    await expect(listPage.exportButton).toBeVisible();
    await expect(listPage.addButton).toBeVisible();
    await expect(listPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_LOCLIST_002 */
  test('TC_AD_LOCLIST_002 shows stats cards from API', async () => {
    await expect(listPage.statValue(copy.statsTotal)).toHaveText(String(expectedLocationStats.total));
    await expect(listPage.statValue(copy.statsActive)).toHaveText(String(expectedLocationStats.active));
    await expect(listPage.statValue(copy.statsFeatured)).toHaveText(String(expectedLocationStats.featured));
    await expect(listPage.statValue(copy.statsViews)).toHaveText(
      formatViewsForStats(expectedLocationStats.total_views)
    );
  });

  /** TC_AD_LOCLIST_003 — data display integrity */
  test('TC_AD_LOCLIST_003 displays location name category district status and price', async () => {
    const row = listPage.rowByName(primaryLocationRow.name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(primaryLocationRow.category!.name);
    await expect(row).toContainText(primaryLocationRow.district!);
    await expect(row.getByText(copy.statusActive).first()).toBeVisible();
    await expect(row.getByText(String(primaryLocationRow.avg_rating))).toBeVisible();
    await expect(row.getByText(copy.listPriceFree)).toBeVisible();
  });

  /** TC_AD_LOCLIST_004 */
  test('TC_AD_LOCLIST_004 searches by location name', async () => {
    await listPage.search(mockLocationSearchKeyword);
    await expect(listPage.tableRows).toHaveCount(1);
    await expect(listPage.rowByName(mockLocationSearchKeyword)).toBeVisible();
  });

  /** TC_AD_LOCLIST_005 */
  test('TC_AD_LOCLIST_005 search is case-insensitive', async () => {
    await listPage.search('bán đảo sơn trà');
    await expect(listPage.rowByName(primaryLocationRow.name)).toBeVisible();
    await listPage.searchInput.fill('');
    await listPage.search('BÁN ĐẢO');
    await expect(listPage.rowByName(primaryLocationRow.name)).toBeVisible();
  });

  /** TC_AD_LOCLIST_006 */
  test('TC_AD_LOCLIST_006 filters by category', async () => {
    await listPage.selectCategoryFilter(mockLocationCategories[1]!.name);
    await expect(listPage.rowByName('Chợ Hàn')).toBeVisible();
    await expect(listPage.rowByName(primaryLocationRow.name)).toHaveCount(0);
  });

  /** TC_AD_LOCLIST_007 */
  test('TC_AD_LOCLIST_007 filters by district', async () => {
    await listPage.selectDistrictFilter('Sơn Trà');
    await expect(listPage.rowByName(primaryLocationRow.name)).toBeVisible();
    await expect(listPage.rowByName('Cầu Rồng')).toHaveCount(0);
  });

  /** TC_AD_LOCLIST_008 */
  test('TC_AD_LOCLIST_008 filters by price level', async () => {
    await listPage.selectPriceFilter(copy.priceFree);
    await expect(listPage.rowByName(primaryLocationRow.name)).toBeVisible();
    await expect(listPage.rowByName('Sun World Ba Na Hills')).toHaveCount(0);
  });

  /** TC_AD_LOCLIST_009 */
  test('TC_AD_LOCLIST_009 filters by active status', async () => {
    await listPage.selectStatusFilter(copy.statusActive);
    await expect(listPage.rowByName('Helio Night Market')).toHaveCount(0);
    await expect(listPage.rowByName(primaryLocationRow.name)).toBeVisible();
  });

  /** TC_AD_LOCLIST_010 */
  test('TC_AD_LOCLIST_010 filters by inactive status', async () => {
    await listPage.selectStatusFilter(copy.statusInactive);
    await expect(listPage.rowByName('Helio Night Market')).toBeVisible();
    await expect(listPage.rowByName(primaryLocationRow.name)).toHaveCount(0);
  });

  /** TC_AD_LOCLIST_011 */
  test('TC_AD_LOCLIST_011 resets filters', async () => {
    await listPage.search('Chợ Hàn');
    await expect(listPage.tableRows).toHaveCount(1);
    await listPage.resetFilters();
    await expect(listPage.searchInput).toHaveValue('');
    await expect(listPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_LOCLIST_012 */
  test('TC_AD_LOCLIST_012 paginates to page 2', async ({ adminPage }) => {
    const page2Req = adminPage.waitForResponse((res) => res.url().includes('page=2') && res.url().includes('/admin/locations'));
    await listPage.goToPage(2);
    await page2Req;
    await expect(listPage.rowByName('Làng bích họa Tam Thanh')).toBeVisible();
  });

  /** TC_AD_LOCLIST_013 */
  test('TC_AD_LOCLIST_013 changes per page to 20', async ({ adminPage }) => {
    const limitReq = adminPage.waitForResponse((res) => res.url().includes('per_page=20'));
    await listPage.changeLimit(20);
    await limitReq;
    await expect(listPage.tableRows).toHaveCount(15);
  });

  /** TC_AD_LOCLIST_014 */
  test('TC_AD_LOCLIST_014 refresh refetches list', async ({ adminPage }) => {
    const refreshReq = listPage.waitForListResponse();
    await listPage.refreshButton.click();
    await refreshReq;
    await expect(listPage.rowByName(primaryLocationRow.name)).toBeVisible();
  });

  /** TC_AD_LOCLIST_015 */
  test('TC_AD_LOCLIST_015 view button navigates to detail', async ({ adminPage }) => {
    await listPage.viewButtonInRow(listPage.rowByName(primaryLocationRow.name)).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/locations/detail/${primaryLocationRow.id}`));
  });

  /** TC_AD_LOCLIST_016 */
  test('TC_AD_LOCLIST_016 edit button navigates to edit', async ({ adminPage }) => {
    await listPage.editButtonInRow(listPage.rowByName(primaryLocationRow.name)).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/locations/edit/${primaryLocationRow.id}`));
  });

  /** TC_AD_LOCLIST_017 */
  test('TC_AD_LOCLIST_017 clicking name navigates to detail', async ({ adminPage }) => {
    await listPage.locationNameLinkInRow(listPage.rowByName(primaryLocationRow.name)).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/locations/detail/${primaryLocationRow.id}`));
  });

  /** TC_AD_LOCLIST_018 */
  test('TC_AD_LOCLIST_018 add button navigates to create', async ({ adminPage }) => {
    await listPage.addButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/create/);
  });
});

test.describe('Admin Location List — delete @P1', () => {
  /** TC_AD_LOCLIST_019 */
  test('TC_AD_LOCLIST_019 deletes location after confirm', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Đèo Hải Vân');

    const row = listPage.rowByName('Đèo Hải Vân');
    const deleteReq = listPage.waitForDelete(deletableLocationId);
    await listPage.deleteButtonInRow(row).click();
    await expect(listPage.deleteDialog).toBeVisible();
    await listPage.confirmDeleteDialog();
    await deleteReq;
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    expect(getMockLocation(deletableLocationId)).toBeUndefined();
  });

  /** TC_AD_LOCLIST_020 */
  test('TC_AD_LOCLIST_020 dismisses delete dialog without API', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes(`/admin/locations/${deletableLocationId}`)) {
        deleteCalled = true;
      }
    });
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Đèo Hải Vân');
    await listPage.deleteButtonInRow(listPage.rowByName('Đèo Hải Vân')).click();
    await listPage.cancelDeleteDialog();
    expect(deleteCalled).toBe(false);
    expect(getMockLocation(deletableLocationId)).toBeDefined();
  });

  /** TC_AD_LOCLIST_021 */
  test('TC_AD_LOCLIST_021 shows error toast when delete fails', async ({ adminPage }) => {
    resetMockLocations();
    setLocationDeleteFailForId(deletableLocationId);
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Đèo Hải Vân');
    await listPage.deleteButtonInRow(listPage.rowByName('Đèo Hải Vân')).click();
    await expect(listPage.deleteDialog).toBeVisible();
    const deleteFailReq = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/locations/${deletableLocationId}`) &&
        res.status() === 422
    );
    await listPage.confirmDeleteDialog();
    await deleteFailReq;
    await expect(adminPage.getByText(copy.deleteError)).toBeVisible({ timeout: 15_000 });
    await expect(listPage.deleteDialog).toBeVisible();
    expect(getMockLocation(deletableLocationId)).toBeDefined();
  });
});

test.describe('Admin Location List — featured @P1', () => {
  /** TC_AD_LOCLIST_022 */
  test('TC_AD_LOCLIST_022 toggles featured via PATCH', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();

    const row = listPage.rowByName('Bãi biển Mỹ Khê');
    expect(getMockLocation(featuredToggleLocationId)?.is_featured).toBe(false);
    const patchReq = listPage.waitForFeaturedPatch(featuredToggleLocationId);
    await listPage.featuredToggleInRow(row).click();
    await patchReq;
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    expect(getMockLocation(featuredToggleLocationId)?.is_featured).toBe(true);
  });

  /** TC_AD_LOCLIST_023 */
  test('TC_AD_LOCLIST_023 shows error when featured toggle fails', async ({ adminPage }) => {
    resetMockLocations();
    setLocationFeaturedFailForId(featuredToggleLocationId);
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.featuredToggleInRow(listPage.rowByName('Bãi biển Mỹ Khê')).click();
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
  });
});

test.describe('Admin Location List — bulk & empty @P1', () => {
  /** TC_AD_LOCLIST_024 */
  test('TC_AD_LOCLIST_024 selects row and shows bulk toolbar', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Công viên APEC');
    await listPage.selectRowsByName('Công viên APEC');
    await expect(listPage.bulkSelectedLabel).toBeVisible();
    await expect(listPage.bulkActivateButton).toBeVisible();
    await expect(listPage.bulkDeactivateButton).toBeVisible();
    await expect(listPage.bulkDeleteButton).toBeVisible();
  });

  /** TC_AD_LOCLIST_025 */
  test('TC_AD_LOCLIST_025 bulk activates inactive locations', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Công viên APEC');
    await listPage.selectRowsByName('Công viên APEC');
    const statusReq = listPage.waitForStatusPatch(112);
    await listPage.bulkActivateButton.click();
    await statusReq;
    await expect(adminPage.getByText(copy.bulkUpdateSuccess)).toBeVisible();
    expect(getMockLocation(112)?.status).toBe('active');
  });

  /** TC_AD_LOCLIST_026 */
  test('TC_AD_LOCLIST_026 bulk deactivates selected locations', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.selectRowsByName('Bãi biển Mỹ Khê');
    const statusReq = listPage.waitForStatusPatch(featuredToggleLocationId);
    await listPage.bulkDeactivateButton.click();
    await statusReq;
    expect(getMockLocation(featuredToggleLocationId)?.status).toBe('inactive');
  });

  /** TC_AD_LOCLIST_027 */
  test('TC_AD_LOCLIST_027 bulk deletes selected locations after confirm', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Hồ Hòa Trung');
    await listPage.selectRowsByName('Hồ Hòa Trung');
    await listPage.bulkDeleteButton.click();
    await expect(listPage.deleteDialog).toBeVisible();
    await expect(listPage.deleteDialog.getByText(copy.bulkDeleteDialogTitle)).toBeVisible();
    const deleteReq = listPage.waitForDelete(113);
    await listPage.confirmDeleteDialog();
    await deleteReq;
    await expect(adminPage.getByText(copy.bulkDeleteSuccess)).toBeVisible();
    expect(getMockLocation(113)).toBeUndefined();
  });

  /** TC_AD_LOCLIST_027b */
  test('TC_AD_LOCLIST_027b dismisses bulk delete dialog without API', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/locations/113')) {
        deleteCalled = true;
      }
    });
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search('Hồ Hòa Trung');
    await listPage.selectRowsByName('Hồ Hòa Trung');
    await listPage.bulkDeleteButton.click();
    await expect(listPage.deleteDialog).toBeVisible();
    await listPage.cancelDeleteDialog();
    expect(deleteCalled).toBe(false);
    expect(getMockLocation(113)).toBeDefined();
  });

  /** TC_AD_LOCLIST_028 */
  test('TC_AD_LOCLIST_028 shows empty state when list is empty', async ({ adminPage }) => {
    resetMockLocations();
    setLocationListEmpty(true);
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await expect(listPage.emptyTitle).toBeVisible({ timeout: 15_000 });
    await expect(listPage.tableRows).toHaveCount(0);
    await expect(listPage.rowByName(primaryLocationRow.name)).toHaveCount(0);
  });

  /** TC_AD_LOCLIST_029 */
  test('TC_AD_LOCLIST_029 select all checks every row on page', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.selectAllOnPage();
    await expect(listPage.bulkSelectedLabel).toContainText('10');
  });
});

test.describe('Admin Location List — improvements @P1', () => {
  /** TC_AD_LOCLIST_032 */
  test('TC_AD_LOCLIST_032 export excel triggers download', async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    const downloadPromise = adminPage.waitForEvent('download');
    await listPage.exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    await expect(adminPage.getByText(copy.exportSuccess)).toBeVisible();
  });

  /** TC_AD_LOCLIST_033 */
  test('TC_AD_LOCLIST_033 shows export error toast', async ({ adminPage }) => {
    resetMockLocations();
    setLocationExportFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.exportButton.click();
    await expect(adminPage.getByText(copy.exportError)).toBeVisible();
  });

  /** TC_AD_LOCLIST_034 */
  test('TC_AD_LOCLIST_034 shows list error state with retry', async ({ adminPage }) => {
    resetMockLocations();
    setLocationListFail(true);
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await expect(listPage.listErrorPanel).toBeVisible({ timeout: 15_000 });
    await expect(listPage.retryListButton).toBeVisible();
    await expect(adminPage.getByText(copy.listLoadError)).toBeVisible();
    setLocationListFail(false);
    const listReq = listPage.waitForListResponse();
    await listPage.retryListButton.click();
    await listReq;
    await listPage.waitForTableLoaded();
  });
});
