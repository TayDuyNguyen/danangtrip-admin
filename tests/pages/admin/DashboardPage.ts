import { expect, type Locator, type Page } from '@playwright/test';



const copy = {

  welcomeName: /Nguyen Duy Tay|Chào mừng trở lại/i,

  export: /Xuất báo cáo|Export/i,

  refresh: /Làm mới|Refresh/i,

  exportSuccessToast: /Xuất báo cáo thành công|Report exported successfully/i,

  exportFailedToast: /Xuất báo cáo thất bại|Export failed/i,

  revenueToday: /Hôm nay|Today/i,

  revenueWeek: /Tuần này|This Week/i,

  revenueMonth: /Tháng này|This Month/i,

  revenueYear: /Năm nay|This Year/i,

  trend7Days: /7 ngày|7 days/i,

  trend30Days: /30 ngày|30 days/i,

  trend90Days: /90 ngày|90 days/i,

  filterAll: /Tất cả|All$/i,

  filterPending: /Đang chờ|Pending/i,

  filterConfirmed: /Đã xác nhận|Confirmed/i,

  viewAllBookings: /Xem tất cả|View all/i,

  viewAll: /Xem tất cả|View All/i,

  manageOrders: /Quản lý đơn hàng|Manage Orders/i,

  recentOrders: /Đơn hàng gần đây|Recent orders/i,

  topTours: /Top 5 Tour bán chạy|Top 5 Best Selling Tours/i,

  searchTrends: /Xu hướng tìm kiếm|Search Trends/i,

  sidebarDashboard: /Bảng điều khiển|Dashboard/i,

  sidebarTours: /Quản lý Tour|Tours/i,

  sidebarTourList: /Danh sách tour|Tour List/i,

  sidebarTourCategories: /Danh mục tour|Tour Categories/i,

  sidebarTourSchedules: /Lịch khởi hành|Tour Schedules/i,

  sidebarLocations: /Quản lý Địa điểm|Location Management/i,

  sidebarLocationList: /Danh sách Địa điểm|Location List/i,

  sidebarLocationCategories: /Danh mục địa điểm|Location Categories/i,

  sidebarBookings: /Quản lý Đơn hàng|Bookings/i,

  sidebarPayments: /Quản lý Giao dịch|Payments/i,

  sidebarRatings: /Quản lý Đánh giá|Manage Reviews/i,

  sidebarReports: /Báo cáo|Reports/i,

  sidebarReportsRatings: /Báo cáo Đánh giá|Ratings Report/i,

  sidebarReportsBookings: /Báo cáo Đơn hàng|Bookings Report/i,

  sidebarReportsRevenue: /Báo cáo Doanh thu|Revenue Report/i,

  sidebarReportsLocations: /Báo cáo Địa điểm|Locations Report/i,

  sidebarReportsUsers: /Báo cáo Người dùng|Users Report/i,

  sidebarBlog: /Quản lý bài viết|Blog Management/i,

  sidebarBlogPosts: /Danh sách bài viết|Post List/i,

  sidebarBlogCategories: /Danh mục bài viết|Blog Categories/i,

  sidebarUsers: /Người dùng|User Management/i,

  sidebarNotifications: /Thông báo|Notifications/i,

  sidebarContacts: /Liên hệ|Contacts/i,

  sidebarChatbot: /Trợ lý AI|AI Assistant/i,

  sidebarSettings: /Cài đặt|Settings/i,

  sidebarPromotions: /Khuyến mãi|Promotions/i,

  sidebarLanding: /Landing Pages/i,

  logout: /Đăng xuất|Logout/i,

  contactsNotif: /Liên hệ mới|New contacts/i,

  bookingsNotif: /Đơn hàng cần xử lý|Bookings to review/i,

  ratingsNotif: /Đánh giá mới|New ratings/i,

  openManagement: /Mở quản lý|Open Manager/i,

  closeNotif: /Đóng thông báo nhanh|Close quick notifications/i,

  chartRefresh: /Làm mới biểu đồ|Refresh chart/i,

  retry: /Thử lại|Retry/i,

  errorTitle: /Tải dữ liệu thất bại|Failed to load data/i,

  emptyData: /Chưa có dữ liệu|No data yet/i,

  emptyBookings: /Chưa có đơn hàng|No bookings yet/i,

  emptyTours: /Chưa có tour|No tours yet/i,

  notAvailable: /Không có dữ liệu|No data/i,

  dashboardTitle: /Tổng quan hệ thống|System Overview/i,

  dashboardSubtitle: /Chúc một ngày|Wishing you a productive/i,

  controlPanel: /Bảng điều khiển|Control Panel/i,

  profileTab: /Hồ sơ|Profile/i,

  quickSettingsTab: /Cài đặt nhanh|Quick Settings/i,

  saveChanges: /Lưu thay đổi|Save Changes/i,

  fontSmall: /Nhỏ|Small/i,

  fontMedium: /Vừa|Medium/i,

  fontLarge: /Lớn|Large/i,

  footerCopyright: /© 2026 Admin.*Da Nang Trip/i,

  locationBadge: /Địa điểm|Location/i,

  statusCompleted: /Hoàn thành|Completed/i,

  statusConfirmed: /Đã xác nhận|Confirmed/i,

  statusPending: /Đang chờ|Pending/i,

  statusCancelled: /Đã hủy|Cancelled/i,

  userGrowthChart: /Tăng trưởng người dùng|User Growth/i,

  orderStatusChart: /Trạng thái đơn hàng|Order Status/i,

};



export class DashboardPage {

  readonly page: Page;



  constructor(page: Page) {

    this.page = page;

  }



  async goto(query = '') {

    await this.page.goto(`/dashboard${query}`, { waitUntil: 'domcontentloaded' });

    await this.waitForLoaded();

  }



  async gotoWithoutWait(query = '') {

    await this.page.goto(`/dashboard${query}`, { waitUntil: 'domcontentloaded' });

  }



  async waitForLoaded() {

    await this.page.locator('[data-testid="dashboard-stat-revenue"]').waitFor({ state: 'visible', timeout: 25_000 });

    await this.recentOrdersCard.waitFor({ state: 'visible', timeout: 25_000 });

  }



  async waitForShell() {

    await this.welcomeHeading.waitFor({ state: 'visible', timeout: 25_000 });

  }



  get welcomeHeading() {

    return this.page.getByRole('heading', { level: 1 }).filter({ hasText: copy.welcomeName });

  }



  get dashboardRoot() {

    return this.page.locator('[aria-label]').filter({ has: this.page.getByRole('heading', { level: 1 }) }).first();

  }



  get exportButton() {

    return this.page.getByRole('button', { name: copy.export });

  }



  get refreshButton() {

    return this.exportButton.locator('xpath=following-sibling::button[1]');

  }



  statCard(id: string): Locator {

    return this.page.locator(`[data-testid="dashboard-stat-${id}"]`);

  }



  get revenueChartCard() {

    return this.page.locator('[data-testid="revenue-chart-card"]');

  }



  get bookingTrendChartCard() {

    return this.page.locator('[data-testid="booking-trend-chart-card"]');

  }



  get userGrowthChartCard() {

    return this.page.locator('[data-testid="user-growth-chart-card"]');

  }



  get orderStatusChartCard() {

    return this.page.locator('[data-testid="order-status-chart-card"]');

  }



  chartRefreshButton(card: Locator) {

    return card.getByRole('button', { name: copy.chartRefresh });

  }



  get recentOrdersCard() {

    return this.page.locator('[data-testid="recent-orders-card"]');

  }



  get recentOrdersTable() {

    return this.page.locator('[data-testid="recent-orders-table"]');

  }



  recentOrderRows() {

    return this.page.locator('[data-testid="recent-order-row"]');

  }



  rowByBookingCode(code: string) {

    return this.recentOrderRows().filter({ hasText: code });

  }



  statusFilter(name: RegExp) {

    return this.recentOrdersCard.getByRole('button', { name });

  }



  get paginationPrev() {

    return this.recentOrdersCard.locator('.border-t.border-slate-100').locator('button').first();

  }



  get globalSearchPanel() {

    return this.page.locator('[id$="-results"]');

  }



  get topToursCard() {

    return this.page

      .getByRole('heading', { name: copy.topTours })

      .locator('xpath=ancestor::div[contains(@class,"rounded-[32px]")][1]');

  }



  get topToursTable() {

    return this.topToursCard.locator('table');

  }



  topTourRow(name: string) {

    return this.topToursTable.locator('tbody tr').filter({ hasText: name }).first();

  }



  get searchTrendsCard() {

    return this.page

      .getByRole('heading', { name: copy.searchTrends })

      .locator('xpath=ancestor::div[contains(@class,"rounded-[32px]")][1]');

  }



  sidebarNav() {

    return this.page.locator('aside nav');

  }



  sidebarLink(name: RegExp) {

    return this.sidebarNav().getByRole('link', { name });

  }



  sidebarMenuButton(name: RegExp) {

    return this.sidebarNav().getByRole('button', { name });

  }



  get sidebarDashboardLink() {

    return this.sidebarLink(copy.sidebarDashboard);

  }



  get sidebarCollapseToggle() {

    return this.page.locator('aside > button').first();

  }



  get sidebarAside() {

    return this.page.locator('aside').first();

  }



  get logoutButton() {

    return this.sidebarAside.getByRole('button', { name: copy.logout });

  }



  get notificationBellButton() {

    return this.page.getByTestId('notification-bell-button');

  }



  get notificationPopover() {

    return this.page.getByTestId('notification-popover');

  }



  notificationItem(key: 'contacts' | 'bookings' | 'ratings') {

    return this.page.getByTestId(`notification-item-${key}`);

  }



  get notificationCloseButton() {

    return this.notificationPopover.getByRole('button', { name: copy.closeNotif });

  }



  get notificationOpenManagementButton() {

    return this.notificationPopover.getByRole('button', { name: copy.openManagement });

  }



  revenuePeriodButton(label: RegExp) {

    return this.revenueChartCard.getByRole('button', { name: label });

  }



  bookingTrendPeriodButton(label: RegExp) {

    return this.bookingTrendChartCard.getByRole('button', { name: label });

  }



  async clickPaginationPage(pageNum: number) {

    await this.recentOrdersCard.getByRole('button', { name: String(pageNum), exact: true }).click();

  }



  get globalSearchInput() {

    return this.page.locator('input[name="admin-quick-search"]');

  }



  get controlPanelFab() {

    return this.page.getByTitle(copy.controlPanel);

  }



  get rightSidebarDrawer() {

    return this.page.locator('aside.fixed.right-0');

  }



  get footer() {

    return this.page.locator('footer');

  }



  get languageSwitcherButton() {
    return this.page.locator('header').getByRole('button', { name: /English|Tiếng Việt/i });
  }

  get languageMenuHeading() {
    return this.page.getByText(/Chọn ngôn ngữ|Select language/i);
  }

  get languageMenuPanel() {
    return this.page.locator('header div.absolute.right-0');
  }

  async openLanguageMenu() {
    if (await this.languageMenuHeading.isVisible()) return;

    await this.languageSwitcherButton.click();

    if (!(await this.languageMenuHeading.isVisible())) {
      await this.languageSwitcherButton.click();
    }

    await expect(this.languageMenuHeading).toBeVisible();
  }

  languageOption(code: 'vi' | 'en') {
    const label = code === 'vi' ? 'Tiếng Việt' : 'English';
    return this.languageMenuPanel.getByRole('button', { name: label, exact: true });
  }

  async selectLanguage(code: 'vi' | 'en') {
    const label = code === 'vi' ? 'Tiếng Việt' : 'English';
    await this.languageSwitcherButton.click();
    await this.page.evaluate((langLabel) => {
      const panel = document.querySelector('header div.absolute.right-0');
      if (!panel) return;
      const buttons = panel.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.trim() === langLabel) {
          (btn as HTMLButtonElement).click();
          return;
        }
      }
    }, label);
    await this.page.waitForTimeout(100);
  }



  async openSubmenu(menu: RegExp) {

    await this.sidebarMenuButton(menu).click();

  }

}



export { copy as dashboardCopy };


