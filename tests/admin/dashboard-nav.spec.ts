/**

 * Admin Dashboard — navigation, notifications, search, layout

 */

import { test, expect } from '../fixtures/auth.fixture';

import { DashboardPage, dashboardCopy } from '../pages/admin/DashboardPage';

import {

  mockDashboardApi,

  resetMockDashboard,

  setDashboardNotificationsFail,
  setDashboardGlobalSearchEmpty,

} from '../fixtures/api/dashboard.mock';

import { mockGlobalSearchTourHit } from '../fixtures/data/dashboard.data';



test.describe('Admin Dashboard — Navigation @P1', () => {

  let dash: DashboardPage;



  test.beforeEach(async ({ adminPage }) => {

    resetMockDashboard();

    await mockDashboardApi(adminPage);

    dash = new DashboardPage(adminPage);

    await dash.goto();

  });



  /** TC_AD_DASH_058 */

  test('TC_AD_DASH_058 highlights dashboard link as active', async () => {

    await expect(dash.sidebarDashboardLink).toHaveClass(/bg-\[#14b8a6\]/);

  });



  /** TC_AD_DASH_060 */

  test('TC_AD_DASH_060 navigates locations submenu routes', async ({ adminPage }) => {

    await dash.openSubmenu(dashboardCopy.sidebarLocations);

    await dash.sidebarLink(dashboardCopy.sidebarLocationList).click();

    await expect(adminPage).toHaveURL(/\/admin\/locations$/);

    await dash.goto();

    await dash.openSubmenu(dashboardCopy.sidebarLocations);

    await dash.sidebarLink(dashboardCopy.sidebarLocationCategories).click();

    await expect(adminPage).toHaveURL(/\/admin\/location-categories/);

  });



  /** TC_AD_DASH_062 */

  test('TC_AD_DASH_062 navigates to payments and ratings', async ({ adminPage }) => {

    await dash.sidebarLink(dashboardCopy.sidebarPayments).click();

    await expect(adminPage).toHaveURL(/\/admin\/payments/);

    await dash.goto();

    await dash.sidebarLink(dashboardCopy.sidebarRatings).click();

    await expect(adminPage).toHaveURL(/\/admin\/ratings/);

  });



  /** TC_AD_DASH_063 */

  test('TC_AD_DASH_063 navigates reports submenu routes', async ({ adminPage }) => {

    await dash.openSubmenu(dashboardCopy.sidebarReports);

    const reportLinks = [

      { link: dashboardCopy.sidebarReportsRatings, url: /\/admin\/reports\/ratings/ },

      { link: dashboardCopy.sidebarReportsBookings, url: /\/admin\/reports\/bookings/ },

      { link: dashboardCopy.sidebarReportsRevenue, url: /\/admin\/reports\/revenue/ },

      { link: dashboardCopy.sidebarReportsLocations, url: /\/admin\/reports\/locations/ },

      { link: dashboardCopy.sidebarReportsUsers, url: /\/admin\/reports\/users/ },

    ];

    for (const item of reportLinks) {

      await dash.goto();

      await dash.openSubmenu(dashboardCopy.sidebarReports);

      await dash.sidebarLink(item.link).click();

      await expect(adminPage).toHaveURL(item.url);

    }

  });



  /** TC_AD_DASH_064 */

  test('TC_AD_DASH_064 navigates remaining sidebar routes', async ({ adminPage }) => {

    const cases = [

      { menu: dashboardCopy.sidebarBlog, link: dashboardCopy.sidebarBlogPosts, url: /\/admin\/blog-posts/ },

      { link: dashboardCopy.sidebarUsers, url: /\/admin\/users/ },

      { link: dashboardCopy.sidebarNotifications, url: /\/admin\/notifications/ },

      { link: dashboardCopy.sidebarContacts, url: /\/admin\/contacts/ },

      { link: dashboardCopy.sidebarChatbot, url: /\/admin\/chatbot/ },

      { link: dashboardCopy.sidebarSettings, url: /\/admin\/settings/ },

      { link: dashboardCopy.sidebarPromotions, url: /\/admin\/promotions/ },

      { link: dashboardCopy.sidebarLanding, url: /\/admin\/landing-pages/ },

    ] as const;



    for (const item of cases) {

      await dash.goto();

      if ('menu' in item && item.menu) {

        await dash.openSubmenu(item.menu);

      }

      await dash.sidebarLink(item.link).click();

      await expect(adminPage).toHaveURL(item.url);

    }

  });



  /** TC_AD_DASH_066 */

  test('TC_AD_DASH_066 logs out to login page', async ({ adminPage }) => {

    await dash.logoutButton.click();

    await expect(adminPage).toHaveURL(/\/login/, { timeout: 15_000 });

  });

});



test.describe('Admin Dashboard — Notifications extended @P1', () => {

  let dash: DashboardPage;



  test.beforeEach(async ({ adminPage }) => {

    resetMockDashboard();

    await mockDashboardApi(adminPage);

    dash = new DashboardPage(adminPage);

    await dash.goto();

  });



  /** TC_AD_DASH_071 */

  test('TC_AD_DASH_071 notification ratings navigates with is_new filter', async ({ adminPage }) => {

    await dash.notificationBellButton.click();

    await dash.notificationItem('ratings').click();

    await expect(adminPage).toHaveURL(/\/admin\/ratings\?is_new=1/);

  });



  /** TC_AD_DASH_072 */

  test('TC_AD_DASH_072 opens notification management page', async ({ adminPage }) => {

    await dash.notificationBellButton.click();

    await dash.notificationOpenManagementButton.click();

    await expect(adminPage).toHaveURL(/\/admin\/notifications/);

  });



  /** TC_AD_DASH_073 */

  test('TC_AD_DASH_073 closes notification popover via X escape and outside click', async ({ adminPage }) => {

    await dash.notificationBellButton.click();

    await expect(dash.notificationPopover).toBeVisible();

    await dash.notificationCloseButton.click();

    await expect(dash.notificationPopover).toHaveCount(0);



    await dash.notificationBellButton.click();

    await adminPage.keyboard.press('Escape');

    await expect(dash.notificationPopover).toHaveCount(0);



    await dash.notificationBellButton.click();

    await adminPage.locator('main').click({ position: { x: 10, y: 10 } });

    await expect(dash.notificationPopover).toHaveCount(0);

  });



  /** TC_AD_DASH_074 */

  test('TC_AD_DASH_074 keeps bell usable when notification-counts API fails', async () => {

    setDashboardNotificationsFail(true);

    await dash.page.reload();

    await dash.waitForLoaded();

    await dash.notificationBellButton.click();

    await expect(dash.notificationPopover).toBeVisible();

  });

});



test.describe('Admin Dashboard — Global search @P2', () => {

  let dash: DashboardPage;



  test.beforeEach(async ({ adminPage }) => {

    resetMockDashboard();

    await mockDashboardApi(adminPage);

    dash = new DashboardPage(adminPage);

    await dash.goto();

  });



  /** TC_AD_DASH_076 */

  test('TC_AD_DASH_076 shows grouped search results for keyword', async ({ adminPage }) => {

    await dash.globalSearchInput.fill('ba na');

    await adminPage.waitForResponse((res) => res.url().includes('/admin/tours') && res.url().includes('search='));

    await adminPage.waitForTimeout(400);

    await expect(dash.globalSearchPanel).toContainText(mockGlobalSearchTourHit.name);

    await expect(dash.globalSearchPanel.getByText('Tour', { exact: true })).toBeVisible();

  });



  /** TC_AD_DASH_077 */

  test('TC_AD_DASH_077 navigates when selecting a search result', async ({ adminPage }) => {

    await dash.globalSearchInput.fill('ba na');

    await adminPage.waitForResponse((res) => res.url().includes('/admin/tours') && res.url().includes('search='));

    await adminPage.waitForTimeout(400);

    await dash.globalSearchPanel.getByText(mockGlobalSearchTourHit.name).click();

    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/99/);

  });



  /** TC_AD_DASH_078 */

  test('TC_AD_DASH_078 focuses search input with slash shortcut', async () => {

    await dash.page.locator('main').click();

    await dash.page.keyboard.press('/');

    await expect(dash.globalSearchInput).toBeFocused();

  });



  /** TC_AD_DASH_079 */

  test('TC_AD_DASH_079 shows no-results message for empty search', async () => {

    setDashboardGlobalSearchEmpty(true);

    await dash.globalSearchInput.fill('xyz');

    await expect(dash.globalSearchPanel).toContainText(/Không tìm thấy kết quả/i);

  });



  /** TC_AD_DASH_080 */

  test('TC_AD_DASH_080 navigates with arrow keys and enter', async ({ adminPage }) => {

    await dash.globalSearchInput.fill('ba na');

    await adminPage.waitForResponse((res) => res.url().includes('/admin/tours') && res.url().includes('search='));

    await adminPage.waitForTimeout(400);

    await expect(dash.globalSearchPanel.getByText(mockGlobalSearchTourHit.name)).toBeVisible();

    await dash.globalSearchInput.press('ArrowDown');

    await dash.globalSearchInput.press('Enter');

    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/99/);

  });

});



test.describe('Admin Dashboard — Layout @P2', () => {

  let dash: DashboardPage;



  test.beforeEach(async ({ adminPage }) => {

    resetMockDashboard();

    await mockDashboardApi(adminPage);

    dash = new DashboardPage(adminPage);

    await dash.goto();

  });



  /** TC_AD_DASH_081 */

  test('TC_AD_DASH_081 switches language labels on dashboard', async () => {

    await dash.selectLanguage('en');

    await expect(dash.exportButton).toHaveText(/Export/i);

    await dash.selectLanguage('vi');

    await expect(dash.exportButton).toHaveText(/Xuất báo cáo/i);

  });



  /** TC_AD_DASH_082 */

  test('TC_AD_DASH_082 opens control panel drawer', async () => {

    await dash.controlPanelFab.click();

    await expect(dash.rightSidebarDrawer).toBeVisible();

    await expect(dash.rightSidebarDrawer.getByRole('heading', { name: dashboardCopy.controlPanel })).toBeVisible();

  });



  /** TC_AD_DASH_083 */

  test('TC_AD_DASH_083 switches profile and quick settings tabs', async () => {

    await dash.controlPanelFab.click();

    await dash.rightSidebarDrawer.getByRole('button', { name: dashboardCopy.quickSettingsTab }).click();

    await expect(dash.rightSidebarDrawer.getByRole('button', { name: dashboardCopy.fontMedium })).toBeVisible();

    await dash.rightSidebarDrawer.getByRole('button', { name: dashboardCopy.profileTab }).click();

    await expect(dash.rightSidebarDrawer.getByText(/@|admin/i).first()).toBeVisible();

  });



  /** TC_AD_DASH_084 */

  test('TC_AD_DASH_084 saves font size preference from control panel', async ({ adminPage }) => {

    await dash.controlPanelFab.click();

    await dash.rightSidebarDrawer.getByRole('button', { name: dashboardCopy.quickSettingsTab }).click();

    await dash.rightSidebarDrawer.getByRole('button', { name: dashboardCopy.fontLarge }).click();

    await dash.rightSidebarDrawer.getByRole('button', { name: dashboardCopy.saveChanges }).click();

    const fontSize = await adminPage.evaluate(() => localStorage.getItem('danangtrip_admin_preferences'));

    expect(fontSize).toContain('large');

  });



  /** TC_AD_DASH_085 */

  test('TC_AD_DASH_085 shows footer copyright', async () => {

    await expect(dash.footer).toContainText(dashboardCopy.footerCopyright);

  });



  /** TC_AD_DASH_092 */

  test('TC_AD_DASH_092 recent orders table has horizontal min-width on mobile', async ({ adminPage }) => {

    await adminPage.setViewportSize({ width: 375, height: 812 });

    await dash.goto();

    const minWidth = await dash.recentOrdersTable.evaluate((el) => getComputedStyle(el).minWidth);

    expect(minWidth).toBe('980px');

  });

});


