/**

 * Admin Dashboard — extended TC (stats, charts, URL, panels, edge)

 */

import { test, expect } from '../fixtures/auth.fixture';

import { DashboardPage, dashboardCopy } from '../pages/admin/DashboardPage';

import {

  mockDashboardApi,

  resetMockDashboard,

  setDashboardAllWidgetsFail,

  setDashboardBookingTrendEmpty,

  setDashboardBookingTrendFail,

  setDashboardBookingsEmpty,

  setDashboardBookingsFail,

  setDashboardEmptyNameBookings,

  setDashboardExportFail,

  setDashboardRevenueEmpty,

  setDashboardRevenueFail,

  setDashboardSearchTrendsEmpty,

  setDashboardSearchTrendsFail,

  setDashboardStatsFail,

  setDashboardStatsLegacyEnvelope,

  setDashboardStatusCountsFail,

  setDashboardTopToursEmpty,

  setDashboardTopToursFail,

  setDashboardUserGrowthEmpty,

  setDashboardUserGrowthFail,

  setDashboardZeroStatusCounts,

} from '../fixtures/api/dashboard.mock';

import {

  formatAmountPattern,

  formatViInt,

  mockBookingRowsEmptyNames,

  mockBookingTrendTotal,

  mockDashboardStats,

  mockOrdersFromStatusTotal,

  mockRevenueSeriesTotal,

  mockSearchTrends,

  mockTopTours,

  mockUserGrowthTotal,

} from '../fixtures/data/dashboard.data';

import { mockAdminUser } from '../fixtures/data/users.data';



test.describe('Admin Dashboard — Extended @P1', () => {

  let dash: DashboardPage;



  test.beforeEach(async ({ adminPage }) => {

    resetMockDashboard();

    await mockDashboardApi(adminPage);

    dash = new DashboardPage(adminPage);

  });



  /** TC_AD_DASH_010 */

  test('TC_AD_DASH_010 reload keeps admin session on dashboard', async ({ adminPage }) => {

    await dash.goto();

    await adminPage.reload();

    await dash.waitForLoaded();

    await expect(adminPage).toHaveURL(/\/dashboard/);

    await expect(dash.welcomeHeading).toContainText(mockAdminUser.full_name);

  });



  /** TC_AD_DASH_012 */

  test('TC_AD_DASH_012 shows error toast when export fails', async ({ adminPage }) => {

    setDashboardExportFail(true);

    await dash.goto();

    await dash.exportButton.click();

    await expect(adminPage.getByText(dashboardCopy.exportFailedToast)).toBeVisible();

  });



  /** TC_AD_DASH_014 */

  test('TC_AD_DASH_014 shows dashboard subtitle and aria label', async ({ adminPage }) => {

    await dash.goto();

    await expect(adminPage.getByText(dashboardCopy.dashboardSubtitle)).toBeVisible();

    await expect(adminPage.getByLabel(dashboardCopy.dashboardTitle)).toBeVisible();

  });



  /** TC_AD_DASH_020 */

  test('TC_AD_DASH_020 shows error state when stats API fails', async () => {

    setDashboardStatsFail(true);

    await dash.gotoWithoutWait();

    await expect(dash.statCard('revenue')).toContainText(/Error loading dashboard data|Đã xảy ra lỗi/i, { timeout: 15_000 });

  });



  /** TC_AD_DASH_021 */

  test('TC_AD_DASH_021 shows error on orders cards when status-counts fails', async () => {

    setDashboardStatusCountsFail(true);

    await dash.goto();

    await expect(dash.statCard('orders')).toContainText(/Error loading dashboard data|Đã xảy ra lỗi/i);

    await expect(dash.statCard('pending-orders')).toContainText(/Error loading dashboard data|Đã xảy ra lỗi/i);

  });



  /** TC_AD_DASH_022 */

  test('TC_AD_DASH_022 defaults revenue period to day in URL', async ({ adminPage }) => {

    await dash.goto();

    await expect(adminPage).not.toHaveURL(/revenue_period=/);

    await expect(dash.revenuePeriodButton(dashboardCopy.revenueToday)).toHaveClass(/bg-\[#14b8a6\]/);

  });



  /** TC_AD_DASH_024 */

  test('TC_AD_DASH_024 revenue chart badge matches mock series total', async () => {

    await dash.goto();

    await expect(dash.revenueChartCard).toContainText(formatAmountPattern(mockRevenueSeriesTotal));

  });



  /** TC_AD_DASH_025 */

  test('TC_AD_DASH_025 refreshes revenue chart independently', async ({ adminPage }) => {

    await dash.goto();

    const revenueReq = adminPage.waitForResponse(

      (res) => res.url().includes('/admin/dashboard/revenue') && res.request().method() === 'GET'

    );

    await dash.chartRefreshButton(dash.revenueChartCard).click();

    await revenueReq;

  });



  /** TC_AD_DASH_026 */

  test('TC_AD_DASH_026 shows empty state when revenue series is empty', async () => {

    setDashboardRevenueEmpty(true);

    await dash.goto();

    await expect(dash.revenueChartCard.getByText(/No data available|Không có dữ liệu/i)).toBeVisible();

  });



  /** TC_AD_DASH_027 */

  test('TC_AD_DASH_027 retries revenue chart after API error', async ({ adminPage }) => {

    setDashboardRevenueFail(true);

    await dash.gotoWithoutWait();

    await expect(dash.revenueChartCard.getByText(dashboardCopy.errorTitle)).toBeVisible({ timeout: 15_000 });

    setDashboardRevenueFail(false);

    const revenueReq = adminPage.waitForResponse((res) => res.url().includes('/admin/dashboard/revenue'));

    await dash.revenueChartCard.getByRole('button', { name: dashboardCopy.retry }).click();

    await revenueReq;

  });



  /** TC_AD_DASH_028b */

  test('TC_AD_DASH_028b changes booking trend to 30 and 90 days', async ({ adminPage }) => {

    await dash.goto();

    await dash.bookingTrendPeriodButton(dashboardCopy.trend30Days).click();

    await expect(adminPage).toHaveURL(/trend_days=30/);

    await dash.bookingTrendPeriodButton(dashboardCopy.trend90Days).click();

    await expect(adminPage).toHaveURL(/trend_days=90/);

  });



  /** TC_AD_DASH_029 */

  test('TC_AD_DASH_029 shows booking trend subtitle total from mock', async () => {

    await dash.goto();

    await expect(dash.bookingTrendChartCard).toContainText(formatViInt(mockBookingTrendTotal));

  });



  /** TC_AD_DASH_030 */

  test('TC_AD_DASH_030 shows empty booking trend when series is empty', async () => {

    setDashboardBookingTrendEmpty(true);

    await dash.goto();

    await expect(dash.bookingTrendChartCard.getByText(/No data available|Không có dữ liệu/i)).toBeVisible();

  });



  /** TC_AD_DASH_030b */

  test('TC_AD_DASH_030b shows error on booking trend chart', async () => {

    setDashboardBookingTrendFail(true);

    await dash.gotoWithoutWait();

    await expect(dash.bookingTrendChartCard.getByText(dashboardCopy.errorTitle)).toBeVisible({ timeout: 15_000 });

  });



  /** TC_AD_DASH_031 */

  test('TC_AD_DASH_031 renders user growth chart card', async () => {

    await dash.goto();

    await expect(dash.userGrowthChartCard).toBeVisible();

    await expect(dash.userGrowthChartCard.getByRole('heading', { name: dashboardCopy.userGrowthChart })).toBeVisible();

  });



  /** TC_AD_DASH_032 */

  test('TC_AD_DASH_032 user growth badge matches mock total', async () => {

    await dash.goto();

    await expect(dash.userGrowthChartCard).toContainText(formatViInt(mockUserGrowthTotal));

  });



  /** TC_AD_DASH_033 */
  test('TC_AD_DASH_033 shows zero total on user growth when API returns empty stats', async () => {
    setDashboardUserGrowthEmpty(true);
    await dash.goto();
    await expect(dash.userGrowthChartCard).toBeVisible();
    await expect(dash.userGrowthChartCard).toContainText(/Total 0/i);
  });



  /** TC_AD_DASH_033b */

  test('TC_AD_DASH_033b shows error on user growth chart', async () => {

    setDashboardUserGrowthFail(true);

    await dash.gotoWithoutWait();

    await expect(dash.userGrowthChartCard.getByText(dashboardCopy.errorTitle)).toBeVisible({ timeout: 15_000 });

  });



  /** TC_AD_DASH_034 */

  test('TC_AD_DASH_034 order status chart reflects four status counts', async () => {

    await dash.goto();

    const card = dash.orderStatusChartCard;

    await expect(card.getByText(dashboardCopy.statusCompleted)).toBeVisible();

    await expect(card.getByText(dashboardCopy.statusConfirmed)).toBeVisible();

    await expect(card.getByText(dashboardCopy.statusPending)).toBeVisible();

    await expect(card.getByText(dashboardCopy.statusCancelled)).toBeVisible();

  });



  /** TC_AD_DASH_035 */

  test('TC_AD_DASH_035 order status badge equals sum of status counts', async () => {

    await dash.goto();

    await expect(dash.orderStatusChartCard).toContainText(formatViInt(mockOrdersFromStatusTotal));

    await expect(dash.statCard('orders')).toContainText(formatViInt(mockOrdersFromStatusTotal));

  });



  /** TC_AD_DASH_036 */

  test('TC_AD_DASH_036 shows empty order status chart when all counts are zero', async () => {

    setDashboardZeroStatusCounts(true);

    await dash.goto();

    await expect(dash.orderStatusChartCard.getByText(/No data available|Không có dữ liệu/i)).toBeVisible();

  });



  /** TC_AD_DASH_039 */

  test('TC_AD_DASH_039 displays zero-result search keywords', async () => {

    await dash.goto();

    const panel = dash.searchTrendsCard;

    await expect(panel.getByText(mockSearchTrends.zero_result_keywords[0].query, { exact: true })).toBeVisible();

  });



  /** TC_AD_DASH_040 */

  test('TC_AD_DASH_040 displays trending tour and location badges', async () => {

    await dash.goto();

    const panel = dash.searchTrendsCard;

    await expect(panel.getByText(mockSearchTrends.trending_searches[0].name)).toBeVisible();

    await expect(panel.getByText(dashboardCopy.locationBadge)).toBeVisible();

  });



  /** TC_AD_DASH_041 */

  test('TC_AD_DASH_041 shows search trends panel empty state', async () => {

    setDashboardSearchTrendsEmpty(true);

    await dash.goto();

    await expect(dash.searchTrendsCard.getByText(/No search trend|Chưa có|Không có dữ liệu/i)).toBeVisible();

  });



  /** TC_AD_DASH_042 */

  test('TC_AD_DASH_042 view all in search trends navigates to locations', async ({ adminPage }) => {

    await dash.goto();

    await dash.searchTrendsCard.getByRole('link', { name: dashboardCopy.viewAll }).click();

    await expect(adminPage).toHaveURL(/\/admin\/locations/);

  });



  /** TC_AD_DASH_042b */

  test('TC_AD_DASH_042b retries search trends after error', async ({ adminPage }) => {

    setDashboardSearchTrendsFail(true);

    await dash.gotoWithoutWait();

    await expect(dash.searchTrendsCard.getByText(dashboardCopy.errorTitle)).toBeVisible({ timeout: 15_000 });

    setDashboardSearchTrendsFail(false);

    const req = adminPage.waitForResponse((res) => res.url().includes('/admin/dashboard/search-trends'));

    await dash.searchTrendsCard.getByRole('button', { name: dashboardCopy.retry }).click();

    await req;

  });



  /** TC_AD_DASH_046 */

  test('TC_AD_DASH_046 displays top tour revenue and rating', async () => {

    await dash.goto();

    const row = dash.topTourRow(mockTopTours[0].name);

    await expect(row).toContainText(formatAmountPattern(mockTopTours[0].total_revenue));

    await expect(row).toContainText(String(mockTopTours[0].avg_rating));

  });



  /** TC_AD_DASH_047 */

  test('TC_AD_DASH_047 view all in top tours navigates to tour list', async ({ adminPage }) => {

    await dash.goto();

    await dash.topToursCard.getByRole('button', { name: dashboardCopy.viewAll }).click();

    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);

  });



  /** TC_AD_DASH_047b */

  test('TC_AD_DASH_047b shows top tours empty then error states', async () => {

    setDashboardTopToursEmpty(true);

    await dash.goto();

    await expect(dash.topToursCard.getByText(/No tours found|Không tìm thấy tour/i)).toBeVisible();

    setDashboardTopToursEmpty(false);

    setDashboardTopToursFail(true);

    await dash.page.reload();

    await expect(dash.topToursCard.getByText(dashboardCopy.errorTitle)).toBeVisible({ timeout: 15_000 });

  });



  /** TC_AD_DASH_050 */

  test('TC_AD_DASH_050 shows not-available for empty customer and tour', async () => {

    setDashboardEmptyNameBookings(true);

    await dash.goto();

    const row = dash.rowByBookingCode(mockBookingRowsEmptyNames[0].booking_code);

    await expect(row).toContainText(dashboardCopy.notAvailable);

  });



  /** TC_AD_DASH_052 */

  test('TC_AD_DASH_052 resets page to 1 when filtering orders', async ({ adminPage }) => {

    await dash.goto('?page=2');

    await dash.statusFilter(dashboardCopy.filterPending).click();

    await expect(adminPage).toHaveURL(/page=1/);

    await expect(adminPage).toHaveURL(/status=pending/);

  });



  /** TC_AD_DASH_056 */

  test('TC_AD_DASH_056 shows recent orders empty state', async () => {

    setDashboardBookingsEmpty(true);

    await dash.goto();

    await expect(dash.recentOrdersCard.getByText(/No bookings found|Không có đơn hàng/i)).toBeVisible();

  });



  /** TC_AD_DASH_057 */

  test('TC_AD_DASH_057 retries recent orders after API error', async ({ adminPage }) => {

    setDashboardBookingsFail(true);

    await dash.gotoWithoutWait();

    await expect(dash.recentOrdersCard.getByText(dashboardCopy.errorTitle)).toBeVisible({ timeout: 15_000 });

    setDashboardBookingsFail(false);

    const req = adminPage.waitForResponse((res) => res.url().includes('/admin/bookings'));

    await dash.recentOrdersCard.getByRole('button', { name: dashboardCopy.retry }).click();

    await req;

    await expect(dash.recentOrdersTable).toBeVisible();

  });



  /** TC_AD_DASH_086 */

  test('TC_AD_DASH_086 preserves deep-link query params after reload', async ({ adminPage }) => {

    await dash.goto('?revenue_period=week&trend_days=7&page=2&status=pending');

    await adminPage.reload();

    await dash.waitForLoaded();

    await expect(adminPage).toHaveURL(/revenue_period=week/);

    await expect(adminPage).toHaveURL(/trend_days=7/);

    await expect(adminPage).toHaveURL(/page=2/);

    await expect(adminPage).toHaveURL(/status=pending/);

  });



  /** TC_AD_DASH_087 */

  test('TC_AD_DASH_087 falls back invalid revenue_period to day', async ({ adminPage }) => {

    await dash.goto('?revenue_period=invalid');

    await expect(dash.revenuePeriodButton(dashboardCopy.revenueToday)).toHaveClass(/bg-\[#14b8a6\]/);

    await expect(adminPage).toHaveURL(/revenue_period=invalid/);

  });



  /** TC_AD_DASH_088 */

  test('TC_AD_DASH_088 falls back invalid trend_days to 30', async ({ adminPage }) => {

    await dash.goto('?trend_days=99');

    await expect(dash.bookingTrendPeriodButton(dashboardCopy.trend30Days)).toHaveClass(/bg-\[#14b8a6\]/);

    await expect(adminPage).toHaveURL(/trend_days=99/);

  });



  /** TC_AD_DASH_089 */

  test('TC_AD_DASH_089 survives all widget API failures without crash', async () => {

    setDashboardAllWidgetsFail(true);

    await dash.gotoWithoutWait();

    await expect(dash.welcomeHeading).toBeVisible({ timeout: 20_000 });

    await expect(dash.statCard('revenue')).toBeVisible();

    await expect(dash.revenueChartCard.getByText(dashboardCopy.errorTitle).first()).toBeVisible();

  });



  /** TC_AD_DASH_090 */

  test('TC_AD_DASH_090 maps legacy stats envelope to revenue card', async () => {

    setDashboardStatsLegacyEnvelope(true);

    await dash.goto();

    await expect(dash.statCard('revenue')).toContainText(formatAmountPattern(mockDashboardStats.total_revenue));

  });



  /** TC_AD_DASH_091 */

  test('TC_AD_DASH_091 disables pagination prev on first page', async () => {

    await dash.goto();

    await expect(dash.paginationPrev).toBeDisabled();

  });

});


