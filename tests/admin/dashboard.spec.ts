/**
 * Admin Dashboard — mapped from 01_dashboard.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { DashboardPage, dashboardCopy } from '../pages/admin/DashboardPage';
import { mockDashboardApi, resetMockDashboard } from '../fixtures/api/dashboard.mock';
import {
  formatAmountPattern,
  formatViInt,
  mockBookingRows,
  mockBookingRowsPage2,
  mockBookingStatusCounts,
  mockDashboardStats,
  mockNotificationCounts,
  mockOrdersFromStatusTotal,
  mockSearchTrends,
  mockTopTours,
} from '../fixtures/data/dashboard.data';
import { mockAdminUser } from '../fixtures/data/users.data';

test.describe('Admin Dashboard @P1', () => {
  let dash: DashboardPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDashboard();
    await mockDashboardApi(adminPage);
    dash = new DashboardPage(adminPage);
    await dash.goto();
  });

  /** TC_AD_DASH_009 */
  test('TC_AD_DASH_009 shows welcome heading with admin name', async () => {
    await expect(dash.welcomeHeading).toBeVisible();
    await expect(dash.welcomeHeading).toContainText(mockAdminUser.full_name);
  });

  /** TC_AD_DASH_011 */
  test('TC_AD_DASH_011 exports system report successfully', async ({ adminPage }) => {
    const exportReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/dashboard/export') && res.status() === 200
    );
    await dash.exportButton.click();
    const res = await exportReq;
    expect(res.status()).toBe(200);
    await expect(adminPage.getByText(dashboardCopy.exportSuccessToast)).toBeVisible();
  });

  /** TC_AD_DASH_013 */
  test('TC_AD_DASH_013 global refresh reloads dashboard widgets', async ({ adminPage }) => {
    const statsReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/dashboard/stats') && res.request().method() === 'GET'
    );
    await dash.refreshButton.click();
    await statsReq;
    await expect(dash.statCard('revenue')).toBeVisible();
  });

  /** TC_AD_DASH_015 */
  test('TC_AD_DASH_015 renders six stats cards', async () => {
    for (const id of ['revenue', 'orders', 'users', 'tours-sold', 'pending-orders', 'new-contacts']) {
      await expect(dash.statCard(id)).toBeVisible();
    }
  });

  /** TC_AD_DASH_016 */
  test('TC_AD_DASH_016 displays revenue stat from mock data', async () => {
    await expect(dash.statCard('revenue')).toContainText(formatAmountPattern(mockDashboardStats.total_revenue));
    await expect(dash.statCard('revenue')).toContainText(`${mockDashboardStats.revenue_trend}%`);
  });

  /** TC_AD_DASH_017 */
  test('TC_AD_DASH_017 displays orders total from booking status counts', async () => {
    await expect(dash.statCard('orders')).toContainText(formatViInt(mockOrdersFromStatusTotal));
  });

  /** TC_AD_DASH_018 */
  test('TC_AD_DASH_018 displays users and tours sold with trend badges', async () => {
    await expect(dash.statCard('users')).toContainText(formatAmountPattern(mockDashboardStats.total_users));
    await expect(dash.statCard('users')).toContainText(`${mockDashboardStats.user_trend}%`);
    await expect(dash.statCard('tours-sold')).toContainText(formatAmountPattern(mockDashboardStats.total_tours_sold));
    await expect(dash.statCard('tours-sold')).toContainText(`${mockDashboardStats.tours_sold_trend}%`);
  });

  /** TC_AD_DASH_019 */
  test('TC_AD_DASH_019 displays pending orders and new contacts counts', async () => {
    await expect(dash.statCard('pending-orders')).toContainText(formatViInt(mockBookingStatusCounts.pending));
    await expect(dash.statCard('new-contacts')).toContainText(formatViInt(mockDashboardStats.new_contacts));
  });

  /** TC_AD_DASH_023 */
  test('TC_AD_DASH_023 changes revenue chart period and syncs URL', async ({ adminPage }) => {
    const revenueReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/dashboard/revenue') && res.url().includes('period=week')
    );
    await dash.revenuePeriodButton(dashboardCopy.revenueWeek).click();
    await revenueReq;
    await expect(adminPage).toHaveURL(/revenue_period=week/);
    await expect(dash.revenueChartCard).toBeVisible();
  });

  /** TC_AD_DASH_028 */
  test('TC_AD_DASH_028 changes booking trend days and syncs URL', async ({ adminPage }) => {
    const trendReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/dashboard/booking-trend') && res.url().includes('days=7')
    );
    await dash.bookingTrendPeriodButton(dashboardCopy.trend7Days).click();
    await trendReq;
    await expect(adminPage).toHaveURL(/trend_days=7/);
  });

  /** TC_AD_DASH_037 */
  test('TC_AD_DASH_037 displays search trends keyword and count', async () => {
    const panel = dash.searchTrendsCard;
    await expect(panel.getByText(mockSearchTrends.keywords[0].query, { exact: true })).toBeVisible();
    await expect(panel.getByText(formatViInt(mockSearchTrends.keywords[0].count))).toBeVisible();
  });

  /** TC_AD_DASH_038 */
  test('TC_AD_DASH_038 displays clicked search query from mock', async () => {
    await expect(dash.page.getByText(mockSearchTrends.clicked_queries[0].query, { exact: false })).toBeVisible();
  });

  /** TC_AD_DASH_043 */
  test('TC_AD_DASH_043 displays top tours table with mock titles', async () => {
    await expect(dash.topTourRow(mockTopTours[0].name)).toBeVisible();
    await expect(dash.topTourRow(mockTopTours[1].name)).toBeVisible();
  });

  /** TC_AD_DASH_045 */
  test('TC_AD_DASH_045 navigates to tour edit from top tours row', async ({ adminPage }) => {
    await dash.topTourRow(mockTopTours[0].name).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/1/);
  });

  /** TC_AD_DASH_048 */
  test('TC_AD_DASH_048 displays recent orders with booking codes', async () => {
    await expect(dash.recentOrdersTable).toBeVisible();
    await expect(dash.rowByBookingCode(mockBookingRows[0].booking_code)).toBeVisible();
    await expect(dash.rowByBookingCode(mockBookingRows[1].booking_code)).toBeVisible();
  });

  /** TC_AD_DASH_049 */
  test('TC_AD_DASH_049 displays customer and tour names in recent orders', async () => {
    const row = dash.rowByBookingCode(mockBookingRows[0].booking_code);
    await expect(row).toContainText(mockBookingRows[0].customer_name);
    await expect(row).toContainText(mockBookingRows[0].tour_name);
    await expect(row).toContainText(formatAmountPattern(mockBookingRows[0].total_amount));
  });

  /** TC_AD_DASH_051 */
  test('TC_AD_DASH_051 filters recent orders by pending status', async ({ adminPage }) => {
    const bookingsReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/bookings') && res.url().includes('booking_status=pending')
    );
    await dash.statusFilter(dashboardCopy.filterPending).click();
    await bookingsReq;
    await expect(adminPage).toHaveURL(/status=pending/);
    await expect(dash.rowByBookingCode('BK-2026-0101')).toBeVisible();
    await expect(dash.rowByBookingCode('BK-2026-0102')).toHaveCount(0);
  });

  /** TC_AD_DASH_053 */
  test('TC_AD_DASH_053 paginates recent orders table', async ({ adminPage }) => {
    await expect(dash.recentOrderRows()).toHaveCount(8);
    const page2Req = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/bookings') && res.url().includes('page=2')
    );
    await dash.clickPaginationPage(2);
    await page2Req;
    await expect(adminPage).toHaveURL(/page=2/);
    await expect(dash.rowByBookingCode(mockBookingRowsPage2[0].booking_code)).toBeVisible();
  });

  /** TC_AD_DASH_054 */
  test('TC_AD_DASH_054 navigates to booking detail from recent order row', async ({ adminPage }) => {
    await dash.rowByBookingCode(mockBookingRows[0].booking_code).click();
    await expect(adminPage).toHaveURL(/\/admin\/bookings\/detail\/101/);
  });

  /** TC_AD_DASH_055 */
  test('TC_AD_DASH_055 view all link navigates to bookings list', async ({ adminPage }) => {
    await dash.recentOrdersCard.getByRole('button', { name: dashboardCopy.viewAllBookings }).first().click();
    await expect(adminPage).toHaveURL(/\/admin\/bookings/);
  });

  /** TC_AD_DASH_059 */
  test('TC_AD_DASH_059 navigates via tours submenu to tour list', async ({ adminPage }) => {
    await dash.sidebarMenuButton(dashboardCopy.sidebarTours).click();
    await dash.sidebarLink(dashboardCopy.sidebarTourList).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  /** TC_AD_DASH_061 */
  test('TC_AD_DASH_061 navigates to bookings from sidebar', async ({ adminPage }) => {
    await dash.sidebarLink(dashboardCopy.sidebarBookings).click();
    await expect(adminPage).toHaveURL(/\/admin\/bookings/);
  });

  /** TC_AD_DASH_065 */
  test('TC_AD_DASH_065 collapses and expands sidebar', async () => {
    await expect(dash.sidebarAside).toHaveClass(/w-72/);
    await dash.sidebarCollapseToggle.click();
    await expect(dash.sidebarAside).toHaveClass(/w-20/);
    await dash.sidebarCollapseToggle.click();
    await expect(dash.sidebarAside).toHaveClass(/w-72/);
  });

  /** TC_AD_DASH_067 */
  test('TC_AD_DASH_067 opens notification bell popover', async () => {
    await dash.notificationBellButton.click();
    await expect(dash.notificationPopover).toBeVisible();
    await expect(dash.notificationItem('contacts')).toBeVisible();
    await expect(dash.notificationItem('contacts')).toContainText(dashboardCopy.contactsNotif);
  });

  /** TC_AD_DASH_068 */
  test('TC_AD_DASH_068 shows notification unread badge from mock', async () => {
    await expect(dash.notificationBellButton).toContainText(String(mockNotificationCounts.total_unread));
  });

  /** TC_AD_DASH_069 */
  test('TC_AD_DASH_069 notification contacts item navigates with filter', async ({ adminPage }) => {
    await dash.notificationBellButton.click();
    await dash.notificationItem('contacts').click();
    await expect(adminPage).toHaveURL(/\/admin\/contacts\?status=new/);
  });

  /** TC_AD_DASH_070 */
  test('TC_AD_DASH_070 notification bookings item navigates with pending filter', async ({ adminPage }) => {
    await dash.notificationBellButton.click();
    await dash.notificationItem('bookings').click();
    await expect(adminPage).toHaveURL(/\/admin\/bookings\?status=pending/);
  });
});
