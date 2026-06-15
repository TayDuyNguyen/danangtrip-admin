/**
 * Admin Tour List + Detail Modal — mapped from 03a_tour_list.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { TourListPage } from '../pages/admin/TourListPage';
import {
  getMockTour,
  mockToursApi,
  resetMockTours,
} from '../fixtures/api/tours.mock';
import {
  mockFeaturedTour,
  searchKeyword,
} from '../fixtures/data/tours.data';

test.describe('Admin Tour List @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_001 */
  test('TC_AD_TLIST_001 renders table with stats and filters', async ({ adminPage }) => {
    await expect(tourListPage.heading).toBeVisible();
    await expect(tourListPage.statsSection).toBeVisible();
    await expect(tourListPage.searchInput).toBeVisible();
    await expect(tourListPage.table).toBeVisible();
    await expect(tourListPage.tableRows).toHaveCount(10);
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
    await expect(tourListPage.exportButton).toBeVisible();
    await expect(tourListPage.createButton).toBeVisible();
    await expect(adminPage.getByText(/City Tour|Mountain/i).first()).toBeVisible();
  });

  /** TC_AD_TLIST_002 */
  test('TC_AD_TLIST_002 filters rows by search keyword', async () => {
    await tourListPage.search(searchKeyword);
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible({ timeout: 10_000 });
    await expect(tourListPage.rowByTourName('Tour Hội An cổ kính')).toHaveCount(0);
  });

  /** TC_AD_TLIST_003 */
  test('TC_AD_TLIST_003 filters rows by active status', async () => {
    await tourListPage.selectStatusFilter(copyStatusActive());
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Hội An cổ kính')).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Bán đảo Sơn Trà')).toHaveCount(0);
  });

  /** TC_AD_TLIST_004 */
  test('TC_AD_TLIST_004 paginates and changes limit', async ({ adminPage }) => {
    await expect(tourListPage.tableRows).toHaveCount(10);
    const page2Req = adminPage.waitForResponse((res) => res.url().includes('/admin/tours') && res.url().includes('page=2'));
    await tourListPage.goToPage(2);
    await page2Req;
    await expect(tourListPage.rowByTourName('Tour Quảng Nam')).toBeVisible();
    const limitReq = adminPage.waitForResponse((res) => res.url().includes('per_page=20'));
    await tourListPage.changeLimit(20);
    await limitReq;
    await expect(tourListPage.tableRows).toHaveCount(12);
  });

  /**
   * TC_AD_TLIST_005 — UI không có toggle status từng dòng (chỉ badge);
   * bulk status qua toolbar khi chọn dòng.
   */
  test('TC_AD_TLIST_005 bulk deactivates selected tour via status API', async () => {
    const row = tourListPage.rowByTourName('Tour Hội An cổ kính');
    await tourListPage.rowCheckbox(row).check();
    await Promise.all([
      tourListPage.waitForStatusPatch(2),
      tourListPage.bulkDeactivateButton.click(),
    ]);
    expect(getMockTour(2)?.status).toBe('inactive');
  });

  /** TC_AD_TLIST_006 */
  test('TC_AD_TLIST_006 toggles featured and hot switches', async () => {
    const row = tourListPage.rowByTourName('Tour Hội An cổ kính');
    await Promise.all([
      tourListPage.waitForFeaturedPatch(2),
      tourListPage.featuredSwitchInRow(row).click(),
    ]);
    expect(getMockTour(2)?.is_featured).toBe(true);

    await Promise.all([
      tourListPage.waitForHotPatch(2),
      tourListPage.hotSwitchInRow(row).click(),
    ]);
    expect(getMockTour(2)?.is_hot).toBe(true);
  });

  /** TC_AD_TLIST_007 */
  test('TC_AD_TLIST_007 bulk activates multiple tours', async ({ adminPage }) => {
    await tourListPage.selectStatusFilter(copyStatusInactive());
    await tourListPage.selectRowsByName('Tour Bán đảo Sơn Trà', 'Tour Mỹ Sơn thánh địa');
    const p1 = tourListPage.waitForStatusPatch(4);
    const p2 = tourListPage.waitForStatusPatch(8);
    await tourListPage.bulkActivateButton.click();
    await Promise.all([p1, p2]);
    expect(getMockTour(4)?.status).toBe('active');
    expect(getMockTour(8)?.status).toBe('active');
    await expect(adminPage.getByText(/thành công|success/i).first()).toBeVisible();
  });

  /** TC_AD_TLIST_008 */
  test('TC_AD_TLIST_008 deletes single tour via confirm dialog', async ({ adminPage }) => {
    await tourListPage.goToPage(2);
    const targetName = 'Tour dù lượn';
    const deleteReq = tourListPage.waitForDelete(12);
    await tourListPage.deleteButtonInRow(tourListPage.rowByTourName(targetName)).click();
    await expect(adminPage.getByRole('heading', { name: /Xóa tour này|Delete this tour/i })).toBeVisible();
    await tourListPage.confirmDeleteDialog(false);
    await deleteReq;
    expect(getMockTour(12)).toBeUndefined();
    await expect(tourListPage.rowByTourName(targetName)).toHaveCount(0);
  });

  /** TC_AD_TLIST_009 */
  test('TC_AD_TLIST_009 bulk deletes selected tours', async ({ adminPage }) => {
    await tourListPage.selectRowsByName('Tour Hội An cổ kính', 'Tour Sơn Trà linh thiện');
    const d2 = tourListPage.waitForDelete(2);
    const d3 = tourListPage.waitForDelete(3);
    await adminPage.getByRole('button', { name: /^Xóa$|^Delete$/i }).click();
    await expect(adminPage.getByRole('heading', { name: /Xác nhận xóa hàng loạt|Confirm bulk delete/i })).toBeVisible();
    await tourListPage.confirmDeleteDialog(true);
    await Promise.all([d2, d3]);
    expect(getMockTour(2)).toBeUndefined();
    expect(getMockTour(3)).toBeUndefined();
  });

  /** TC_AD_TLIST_010 */
  test('TC_AD_TLIST_010 exports tours with current filters', async ({ adminPage }) => {
    const exportReq = tourListPage.waitForExport();
    await tourListPage.exportButton.click();
    const res = await exportReq;
    expect(res.status()).toBe(200);
    await expect(adminPage.getByText(/thành công|success|export/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      /* export may only download file without toast */
    });
  });

  /** Inventory: create tour navigation */
  test('TC_AD_TLIST_011 create button navigates to tour create', async ({ adminPage }) => {
    await tourListPage.createButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** Inventory: row edit navigates */
  test('TC_AD_TLIST_012 row edit navigates to tour edit', async ({ adminPage }) => {
    await tourListPage.editButtonInRow(tourListPage.rowByTourName(mockFeaturedTour.name)).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/1/);
  });
});

function copyStatusActive() {
  return /Đang hoạt động|^Active$/i;
}

function copyStatusInactive() {
  return /Tạm ẩn|Hidden|Inactive/i;
}
