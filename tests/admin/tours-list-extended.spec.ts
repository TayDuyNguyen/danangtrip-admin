/**
 * Admin Tour List — extended TC from 03a_tour_list.md backlog
 * Run: npm run test:admin:tour-list
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { TourListPage, tourListCopy } from '../pages/admin/TourListPage';
import { DashboardPage, dashboardCopy } from '../pages/admin/DashboardPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  appendMockTours,
  getMockTour,
  mockToursApi,
  resetMockTours,
  setDeleteDelay,
  setDeleteFailForTour,
  setFeaturedFailForTour,
  setTourExportDelay,
  setTourExportFail,
  setTourStatsDelay,
} from '../fixtures/api/tours.mock';
import {
  expectedMockTourStats,
  mockFeaturedTour,
  searchKeyword,
} from '../fixtures/data/tours.data';

test.describe('Admin Tour List — Auth @P0', () => {
  /** TC_AD_TLIST_013 */
  test('TC_AD_TLIST_013 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/tours/list');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_TLIST_014 */
  test('TC_AD_TLIST_014 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockTours();
    await mockToursApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/tours/list');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_TLIST_015 */
  test('TC_AD_TLIST_015 navigates to tour list from sidebar', async ({ adminPage }) => {
    resetMockTours();
    await mockAdminLayoutApis(adminPage);
    await mockToursApi(adminPage);
    const dash = new DashboardPage(adminPage);
    await dash.goto();
    await dash.openSubmenu(dashboardCopy.sidebarTours);
    await dash.sidebarLink(dashboardCopy.sidebarTourList).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
    await expect(adminPage.getByRole('heading', { level: 1, name: tourListCopy.heading })).toBeVisible();
  });
});

test.describe('Admin Tour List — Header & stats @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_016 */
  test('TC_AD_TLIST_016 shows breadcrumb tour management and list', async () => {
    await expect(
      tourListPage.page.getByRole('link', { name: tourListCopy.breadcrumbTours })
    ).toBeVisible();
    await expect(tourListPage.breadcrumbTrail.getByText(tourListCopy.breadcrumbList)).toBeVisible();
  });

  /** TC_AD_TLIST_017 */
  test('TC_AD_TLIST_017 shows four stats card labels', async () => {
    await expect(tourListPage.statsGrid.getByText(tourListCopy.statsTotal)).toBeVisible();
    await expect(tourListPage.statsGrid.getByText(tourListCopy.statsActive)).toBeVisible();
    await expect(tourListPage.statsGrid.getByText(tourListCopy.statsFeatured)).toBeVisible();
    await expect(tourListPage.statsGrid.getByText(tourListCopy.statsSoldOut)).toBeVisible();
  });

  /** TC_AD_TLIST_018 */
  test('TC_AD_TLIST_018 stats values match mock fixture counts', async () => {
    await expect(tourListPage.statValue(tourListCopy.statsTotal)).toHaveText(
      String(expectedMockTourStats.total_tours)
    );
    await expect(tourListPage.statValue(tourListCopy.statsActive)).toHaveText(
      String(expectedMockTourStats.active_tours)
    );
    await expect(tourListPage.statValue(tourListCopy.statsFeatured)).toHaveText(
      String(expectedMockTourStats.featured_tours)
    );
    await expect(tourListPage.statValue(tourListCopy.statsSoldOut)).toHaveText(
      String(expectedMockTourStats.sold_out_tours)
    );
  });
});

test.describe('Admin Tour List — Stats loading @P1', () => {
  /** TC_AD_TLIST_019 */
  test('TC_AD_TLIST_019 shows stats skeleton then values', async ({ adminPage }) => {
    resetMockTours();
    setTourStatsDelay(1500);
    await mockToursApi(adminPage);
    const tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await expect(tourListPage.statCard(tourListCopy.statsTotal).locator('.animate-pulse')).toBeVisible();
    await expect(tourListPage.statValue(tourListCopy.statsTotal)).toHaveText(
      String(expectedMockTourStats.total_tours),
      { timeout: 10_000 }
    );
  });
});

test.describe('Admin Tour List — Stats after mutation @P1', () => {
  /** TC_AD_TLIST_020 */
  test('TC_AD_TLIST_020 refetches stats after deleting a tour', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
    await expect(tourListPage.statValue(tourListCopy.statsTotal)).toHaveText('12');

    await tourListPage.goToPage(2);
    const deleteReq = tourListPage.waitForDelete(12);
    await tourListPage.deleteButtonInRow(tourListPage.rowByTourName('Tour dù lượn')).click();
    await tourListPage.confirmDeleteDialog(false);
    await deleteReq;

    await expect(tourListPage.statValue(tourListCopy.statsTotal)).toHaveText('11', { timeout: 10_000 });
  });
});

test.describe('Admin Tour List — Filters @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_021 */
  test('TC_AD_TLIST_021 filters inactive status tours', async () => {
    await tourListPage.selectStatusFilter(tourListCopy.statusInactiveOption);
    await expect(tourListPage.rowByTourName('Tour Bán đảo Sơn Trà')).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Mỹ Sơn thánh địa')).toBeVisible();
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toHaveCount(0);
  });

  /** TC_AD_TLIST_022 */
  test('TC_AD_TLIST_022 filters mountain category tours', async () => {
    await tourListPage.selectCategoryFilter(/Mountain/i);
    await expect(tourListPage.rowByTourName('Tour Sơn Trà linh thiện')).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Huế 1 ngày')).toBeVisible();
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toHaveCount(0);
  });

  /** TC_AD_TLIST_023 */
  test('TC_AD_TLIST_023 filters open booking availability', async () => {
    await tourListPage.selectBookingFilter(tourListCopy.bookingOpen);
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Bán đảo Sơn Trà')).toHaveCount(0);
  });

  /** TC_AD_TLIST_024 */
  test('TC_AD_TLIST_024 filters sold out booking availability', async () => {
    await tourListPage.selectBookingFilter(tourListCopy.bookingSoldOut);
    await expect(tourListPage.rowByTourName('Tour Bán đảo Sơn Trà')).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Lăng Bác')).toBeVisible();
    await expect(tourListPage.tableRows).toHaveCount(2);
  });

  /** TC_AD_TLIST_025 */
  test('TC_AD_TLIST_025 filters featured type', async () => {
    await tourListPage.selectTypeFilter(tourListCopy.typeFeatured);
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Đà Nẵng về đêm')).toBeVisible();
    await expect(tourListPage.tableRows).toHaveCount(2);
  });

  /** TC_AD_TLIST_026 */
  test('TC_AD_TLIST_026 filters hot type', async () => {
    await tourListPage.selectTypeFilter(tourListCopy.typeHot);
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Cù Lao Chàm')).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Quảng Nam')).toBeVisible();
  });

  /** TC_AD_TLIST_027 */
  test('TC_AD_TLIST_027 filters normal type without featured or hot', async () => {
    await tourListPage.selectTypeFilter(tourListCopy.typeNormal);
    await expect(tourListPage.rowByTourName('Tour Hội An cổ kính')).toBeVisible();
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toHaveCount(0);
    await expect(tourListPage.rowByTourName('Tour Cù Lao Chàm')).toHaveCount(0);
  });

  /** TC_AD_TLIST_028 */
  test('TC_AD_TLIST_028 combines category status and type filters', async () => {
    await tourListPage.selectCategoryFilter(/Mountain/i);
    await tourListPage.selectStatusFilter(tourListCopy.statusActiveOption);
    await tourListPage.selectTypeFilter(tourListCopy.typeNormal);
    await expect(tourListPage.rowByTourName('Tour Sơn Trà linh thiện')).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Huế 1 ngày')).toBeVisible();
    await expect(tourListPage.tableRows).toHaveCount(2);
  });

  /** TC_AD_TLIST_029 */
  test('TC_AD_TLIST_029 shows empty state when search has no results', async () => {
    await tourListPage.search('xyznotfound');
    await expect(tourListPage.page.getByText(tourListCopy.noData)).toBeVisible();
    await expect(tourListPage.page.getByText(tourListCopy.noDataSub)).toBeVisible();
  });

  /** TC_AD_TLIST_030 */
  test('TC_AD_TLIST_030 reset button clears filters and shows all rows', async () => {
    await tourListPage.search(searchKeyword);
    await expect(tourListPage.resetFilterButton).toBeVisible();
    await tourListPage.resetFilterButton.click();
    await expect(tourListPage.tableRows).toHaveCount(10);
    await tourListPage.changeLimit(20);
    await expect(tourListPage.tableRows).toHaveCount(12);
  });

  /** TC_AD_TLIST_031 */
  test('TC_AD_TLIST_031 active filter tags and remove tag', async () => {
    await tourListPage.selectCategoryFilter(/Mountain/i);
    await expect(tourListPage.page.getByText(tourListCopy.activeFilters)).toBeVisible();
    const tag = tourListPage.filterPanel
      .locator('div.rounded-full')
      .filter({ hasText: /Mountain|Danh mục|Category/i });
    await tag.locator('button').click();
    await tourListPage.changeLimit(20);
    await expect(tourListPage.tableRows).toHaveCount(12);
  });

  /** TC_AD_TLIST_032 */
  test('TC_AD_TLIST_032 search debounce limits list API calls', async ({ adminPage }) => {
    let listCalls = 0;
    adminPage.on('request', (req) => {
      if (req.method() !== 'GET') return;
      const url = new URL(req.url());
      if (!/\/admin\/tours\/?$/.test(url.pathname)) return;
      if (url.pathname.includes('/export')) return;
      if (url.searchParams.get('per_page') === '1' && !url.searchParams.get('page')) return;
      listCalls += 1;
    });
    await tourListPage.typeSearchFast('Ba Na');
    expect(listCalls).toBeLessThanOrEqual(3);
  });

  /** TC_AD_TLIST_033 */
  test('TC_AD_TLIST_033 changing filter resets page to 1', async ({ adminPage }) => {
    await tourListPage.goToPage(2);
    await expect(tourListPage.rowByTourName('Tour Quảng Nam')).toBeVisible();
    const page1Req = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/tours') && res.url().includes('page=1') && !res.url().includes('page=2')
    );
    await tourListPage.selectStatusFilter(tourListCopy.statusActiveOption);
    await page1Req;
    await expect(tourListPage.pageButton(1)).toHaveAttribute('aria-current', 'page');
  });

  /** TC_AD_TLIST_034 */
  test('TC_AD_TLIST_034 category dropdown is searchable', async () => {
    await tourListPage.searchCategoryDropdown('City');
    await expect(tourListPage.page.getByRole('option', { name: /City Tour/i })).toBeVisible();
    await tourListPage.page.getByRole('option', { name: /City Tour/i }).click();
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
    await expect(tourListPage.rowByTourName('Tour Huế 1 ngày')).toHaveCount(0);
  });
});

test.describe('Admin Tour List — Table display @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_035 */
  test('TC_AD_TLIST_035 formats price with currency and per person', async () => {
    const row = tourListPage.rowByTourName(mockFeaturedTour.name);
    await expect(row.getByText(/850[.,\s]000/)).toBeVisible();
    await expect(row.getByText(tourListCopy.perPerson)).toBeVisible();
  });

  /** TC_AD_TLIST_036 */
  test('TC_AD_TLIST_036 shows placeholder when tour has no thumbnail', async () => {
    const row = tourListPage.rowByTourName('Tour Tam Kỳ');
    await expect(row.locator('img')).toHaveCount(0);
    await expect(row.locator('svg').first()).toBeVisible();
  });

  /** TC_AD_TLIST_037 */
  test('TC_AD_TLIST_037 shows no schedule label when schedules_count is zero', async () => {
    await expect(tourListPage.rowByTourName('Tour Tam Kỳ').getByText(tourListCopy.noSchedule)).toBeVisible();
  });

  /** TC_AD_TLIST_038 */
  test('TC_AD_TLIST_038 shows active and inactive status badges', async () => {
    await expect(
      tourListPage.rowByTourName(mockFeaturedTour.name).getByText(/Đang hoạt động|ĐANG HOẠT ĐỘNG|Active/i)
    ).toBeVisible();
    await tourListPage.selectStatusFilter(tourListCopy.statusInactiveOption);
    await expect(
      tourListPage.rowByTourName('Tour Bán đảo Sơn Trà').getByText(/Tạm ẩn|TẠM ẨN|Inactive|Hidden/i)
    ).toBeVisible();
  });

  /** TC_AD_TLIST_039 */
  test('TC_AD_TLIST_039 shows booking availability badges', async () => {
    await expect(
      tourListPage.rowByTourName(mockFeaturedTour.name).getByText(tourListCopy.bookingOpen)
    ).toBeVisible();
    await tourListPage.selectBookingFilter(tourListCopy.bookingSoldOut);
    await expect(
      tourListPage.rowByTourName('Tour Lăng Bác').getByText(tourListCopy.bookingSoldOut)
    ).toBeVisible();
  });

  /** TC_AD_TLIST_040 */
  test('TC_AD_TLIST_040 shows featured hot and normal row tags', async () => {
    const featuredRow = tourListPage.rowByTourName(mockFeaturedTour.name);
    await expect(featuredRow.locator('span').filter({ hasText: /^Nổi bật$|^Featured$/i })).toBeVisible();
    await expect(featuredRow.locator('span').filter({ hasText: tourListCopy.typeHot })).toBeVisible();
    await expect(
      tourListPage.rowByTourName('Tour Hội An cổ kính').locator('span').filter({ hasText: /^Thường$|^Normal$/i })
    ).toBeVisible();
  });

  /** TC_AD_TLIST_041 */
  test('TC_AD_TLIST_041 displays tour slug under name', async () => {
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name).getByText('ba-na-hills')).toBeVisible();
  });

  /** TC_AD_TLIST_042 */
  test('TC_AD_TLIST_042 row number starts at 11 on page 2', async () => {
    await tourListPage.goToPage(2);
    const row = tourListPage.rowByTourName('Tour Quảng Nam');
    await expect(tourListPage.rowStt(row)).toHaveText('11');
  });

  /** TC_AD_TLIST_043 */
  test('TC_AD_TLIST_043 highlights selected row', async () => {
    const row = tourListPage.rowByTourName(mockFeaturedTour.name);
    await tourListPage.rowCheckbox(row).check();
    await expect(row).toHaveClass(/bg-\[#dff7f4\]/);
  });

  /** TC_AD_TLIST_044 */
  test('TC_AD_TLIST_044 displays zero price correctly', async () => {
    await tourListPage.goToPage(2);
    await expect(tourListPage.rowByTourName('Tour dù lượn').getByText(/^0/)).toBeVisible();
  });
});

test.describe('Admin Tour List — Selection & bulk @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_045 */
  test('TC_AD_TLIST_045 select all shows bulk toolbar with count', async () => {
    await tourListPage.selectAllOnPage();
    await expect(tourListPage.bulkSelectedLabel).toContainText('10');
    await expect(tourListPage.bulkActivateButton).toBeVisible();
  });

  /** TC_AD_TLIST_046 */
  test('TC_AD_TLIST_046 keeps selection toolbar when changing page', async () => {
    await tourListPage.selectAllOnPage();
    await tourListPage.goToPage(2);
    await expect(tourListPage.bulkSelectedLabel).toBeVisible();
    await expect(tourListPage.bulkActivateButton).toBeVisible();
  });

  /** TC_AD_TLIST_047 */
  test('TC_AD_TLIST_047 clears selection when filter changes', async () => {
    await tourListPage.selectRowsByName(mockFeaturedTour.name);
    await expect(tourListPage.bulkSelectedLabel).toBeVisible();
    await tourListPage.selectStatusFilter(tourListCopy.statusActiveOption);
    await expect(tourListPage.bulkSelectedLabel).toHaveCount(0);
  });

  /** TC_AD_TLIST_048 */
  test('TC_AD_TLIST_048 bulk deactivates multiple tours with toast', async ({ adminPage }) => {
    await tourListPage.selectRowsByName(mockFeaturedTour.name, 'Tour Hội An cổ kính');
    const p1 = tourListPage.waitForStatusPatch(1);
    const p2 = tourListPage.waitForStatusPatch(2);
    await tourListPage.bulkDeactivateButton.click();
    await Promise.all([p1, p2]);
    expect(getMockTour(1)?.status).toBe('inactive');
    expect(getMockTour(2)?.status).toBe('inactive');
    await expect(adminPage.getByText(/thành công|success/i).first()).toBeVisible();
  });

  /** TC_AD_TLIST_049 */
  test('TC_AD_TLIST_049 hides bulk toolbar when all rows unchecked', async () => {
    const row = tourListPage.rowByTourName(mockFeaturedTour.name);
    await tourListPage.rowCheckbox(row).check();
    await expect(tourListPage.bulkSelectedLabel).toBeVisible();
    await tourListPage.rowCheckbox(row).uncheck();
    await expect(tourListPage.bulkSelectedLabel).toHaveCount(0);
  });

  /** TC_AD_TLIST_050 */
  test('TC_AD_TLIST_050 cancelling bulk delete keeps tours', async () => {
    await tourListPage.selectRowsByName('Tour Hội An cổ kính');
    await tourListPage.bulkDeleteButton.click();
    await expect(tourListPage.page.getByRole('heading', { name: tourListCopy.bulkDeleteDialogTitle })).toBeVisible();
    await tourListPage.cancelDeleteDialog();
    expect(getMockTour(2)).toBeDefined();
    await expect(tourListPage.rowByTourName('Tour Hội An cổ kính')).toBeVisible();
  });

  /** TC_AD_TLIST_051 */
  test('TC_AD_TLIST_051 cancelling single delete does not call API', async ({ adminPage }) => {
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/tours/2')) deleteCalled = true;
    });
    await tourListPage.deleteButtonInRow(tourListPage.rowByTourName('Tour Hội An cổ kính')).click();
    await tourListPage.cancelDeleteDialog();
    expect(deleteCalled).toBe(false);
    await expect(tourListPage.rowByTourName('Tour Hội An cổ kính')).toBeVisible();
  });
});

test.describe.serial('Admin Tour List — Toggle featured/hot @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_053 */
  test('TC_AD_TLIST_053 toggles featured off for featured tour', async () => {
    const row = tourListPage.rowByTourName(mockFeaturedTour.name);
    await expect(tourListPage.featuredSwitchInRow(row)).toBeChecked();
    await Promise.all([
      tourListPage.waitForFeaturedPatch(1),
      tourListPage.featuredSwitchInRow(row).click(),
    ]);
    expect(getMockTour(1)?.is_featured).toBe(false);
  });

  /** TC_AD_TLIST_054 */
  test('TC_AD_TLIST_054 toggles hot off', async () => {
    const row = tourListPage.rowByTourName(mockFeaturedTour.name);
    await Promise.all([tourListPage.waitForHotPatch(1), tourListPage.hotSwitchInRow(row).click()]);
    expect(getMockTour(1)?.is_hot).toBe(false);
  });

  /** TC_AD_TLIST_055 */
  test('TC_AD_TLIST_055 rolls back featured toggle on API error', async ({ adminPage }) => {
    setFeaturedFailForTour(1);
    const row = tourListPage.rowByTourName(mockFeaturedTour.name);
    await tourListPage.featuredSwitchInRow(row).click();
    await expect(tourListPage.featuredSwitchInRow(row)).toBeChecked();
    await expect(adminPage.getByText(/lỗi|error|featured/i).first()).toBeVisible({ timeout: 5000 });
    expect(getMockTour(1)?.is_featured).toBe(true);
  });
});

test.describe('Admin Tour List — Pagination & refresh @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_057 */
  test('TC_AD_TLIST_057 disables prev on page 1 and next on last page', async () => {
    await expect(tourListPage.prevPageButton).toBeDisabled();
    await tourListPage.goToPage(2);
    await expect(tourListPage.nextPageButton).toBeDisabled();
  });

  /** TC_AD_TLIST_058 */
  test('TC_AD_TLIST_058 navigates with prev and next buttons', async () => {
    await tourListPage.nextPageButton.click();
    await expect(tourListPage.rowByTourName('Tour Quảng Nam')).toBeVisible();
    await tourListPage.prevPageButton.click();
    await expect(tourListPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
  });

  /** TC_AD_TLIST_059 */
  test('TC_AD_TLIST_059 shows pagination ellipsis for many pages', async ({ adminPage }) => {
    resetMockTours();
    appendMockTours(23);
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
    await expect(tourListPage.paginationBar.getByText('...')).toBeVisible();
  });

  /** TC_AD_TLIST_060 */
  test('TC_AD_TLIST_060 changes limit to 50', async ({ adminPage }) => {
    const limitReq = adminPage.waitForResponse((res) => res.url().includes('per_page=50'));
    await tourListPage.changeLimit(50);
    await limitReq;
    await expect(tourListPage.tableRows).toHaveCount(12);
  });

  /** TC_AD_TLIST_061 */
  test('TC_AD_TLIST_061 refresh button refetches list', async ({ adminPage }) => {
    const refreshReq = adminPage.waitForResponse((res) => {
      if (res.request().method() !== 'GET') return false;
      const url = new URL(res.url());
      if (!/\/admin\/tours\/?$/.test(url.pathname)) return false;
      if (url.searchParams.get('per_page') === '1') return false;
      return true;
    });
    await tourListPage.refreshButton.click();
    await refreshReq;
  });
});

test.describe('Admin Tour List — Export @P1', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_063 */
  test('TC_AD_TLIST_063 export includes active status filter in request', async ({ adminPage }) => {
    await tourListPage.selectStatusFilter(tourListCopy.statusActiveOption);
    const exportReq = adminPage.waitForRequest(
      (req) => req.method() === 'GET' && req.url().includes('/admin/tours/export') && req.url().includes('status=active')
    );
    await tourListPage.exportButton.click();
    await exportReq;
  });

  /** TC_AD_TLIST_064 */
  test('TC_AD_TLIST_064 disables export button while pending', async () => {
    setTourExportDelay(2000);
    await tourListPage.exportButton.click();
    await expect(tourListPage.exportButton).toBeDisabled();
  });

  /** TC_AD_TLIST_065 */
  test('TC_AD_TLIST_065 shows error toast when export API fails', async ({ adminPage }) => {
    setTourExportFail(true);
    await tourListPage.exportButton.click();
    await expect(adminPage.getByText(/lỗi|error|export|xuất/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe.serial('Admin Tour List — Delete dialog UX @P2', () => {
  let tourListPage: TourListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
  });

  /** TC_AD_TLIST_067 */
  test('TC_AD_TLIST_067 single delete dialog shows tour name', async () => {
    await tourListPage.deleteButtonInRow(tourListPage.rowByTourName('Tour Hội An cổ kính')).click();
    await expect(
      tourListPage.page.getByRole('heading', { name: tourListCopy.deleteDialogTitle }).locator('xpath=ancestor::div[contains(@id,"headlessui")]').getByText('Tour Hội An cổ kính')
    ).toBeVisible();
    await tourListPage.cancelDeleteDialog();
  });

  /** TC_AD_TLIST_068 */
  test('TC_AD_TLIST_068 bulk delete dialog shows count', async () => {
    await tourListPage.selectRowsByName('Tour Hội An cổ kính', 'Tour Sơn Trà linh thiện');
    await tourListPage.bulkDeleteButton.click();
    await expect(
      tourListPage.page
        .getByRole('heading', { name: tourListCopy.bulkDeleteDialogTitle })
        .locator('xpath=ancestor::div[contains(@id,"headlessui")]')
        .getByText(/2|hai/i)
    ).toBeVisible();
    await tourListPage.cancelDeleteDialog();
  });

  /** TC_AD_TLIST_069 */
  test('TC_AD_TLIST_069 disables confirm button while delete is pending', async () => {
    setDeleteDelay(2000);
    await tourListPage.goToPage(2);
    await tourListPage.deleteButtonInRow(tourListPage.rowByTourName('Tour Quảng Nam')).click();
    const confirmBtn = tourListPage.page.getByRole('button', { name: tourListCopy.confirmDelete });
    await confirmBtn.click({ noWaitAfter: true });
    await expect(tourListPage.page.getByRole('button', { name: /Deleting|Đang xóa/i })).toBeVisible({
      timeout: 3000,
    });
  });

  /** TC_AD_TLIST_070 */
  test('TC_AD_TLIST_070 keeps tour in list when delete API fails', async ({ adminPage }) => {
    setDeleteFailForTour(12);
    await tourListPage.goToPage(2);
    await tourListPage.deleteButtonInRow(tourListPage.rowByTourName('Tour dù lượn')).click();
    await tourListPage.confirmDeleteDialog(false);
    await expect(adminPage.getByText(/lỗi|error|delete|xóa/i).first()).toBeVisible({ timeout: 5000 });
    await expect(tourListPage.rowByTourName('Tour dù lượn')).toBeVisible();
    expect(getMockTour(12)).toBeDefined();
  });
});

test.describe('Admin Tour List — View modal smoke @P1', () => {
  /** TC_AD_TLIST_071 */
  test('TC_AD_TLIST_071 view button opens detail modal panel', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const tourListPage = new TourListPage(adminPage);
    await tourListPage.goto();
    await tourListPage.waitForTableLoaded();
    await tourListPage.openViewModal(mockFeaturedTour.name);
    await expect(tourListPage.detailModalPanel).toBeVisible();
    await tourListPage.closeDetailModal();
  });
});

test.describe('Admin Tour List — i18n @P2', () => {
  /** TC_AD_TLIST_072 */
  test('TC_AD_TLIST_072 shows English labels when locale is EN', async ({ adminPage }) => {
    resetMockTours();
    await mockAdminLayoutApis(adminPage);
    await mockToursApi(adminPage);
    const dash = new DashboardPage(adminPage);
    await dash.goto();
    await dash.selectLanguage('en');
    await adminPage.goto('/admin/tours/list');
    await expect(adminPage.getByRole('heading', { level: 1, name: /^Tour List$/ })).toBeVisible();
    await expect(adminPage.getByPlaceholder(/Search by tour name/i)).toBeVisible();
    await expect(adminPage.getByText(/All categories/i).first()).toBeVisible();
  });
});
