import { expect, type Locator, type Page } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export type ReportRoute =
  | '/admin/reports/revenue'
  | '/admin/reports/bookings'
  | '/admin/reports/locations'
  | '/admin/reports/ratings'
  | '/admin/reports/users';

export const reportsCopy = {
  revenueHeading: /^Báo cáo Doanh thu$|^Revenue Report$/i,
  bookingsHeading: /^Báo cáo Đơn hàng$|^Bookings Report$/i,
  locationsHeading: /^Báo cáo Địa điểm$|^Locations Report$/i,
  ratingsHeading: /^Báo cáo đánh giá$|^Ratings Report$/i,
  usersHeading: /^Báo cáo Người dùng$|^Users Report$/i,
  mockOn:
    /Dữ liệu Giả lập \(On\)|Mock Data \(On\)|Mock Mode: ON|Dữ liệu mẫu: Bật/i,
  mockOff:
    /Dữ liệu Thật \(Off\)|Real Data \(Off\)|Mock Mode: OFF|Dữ liệu mẫu: Tắt/i,
  exportExcel: /Xuất Excel|Export Excel/i,
  applyFilter: /^Áp dụng$|^Apply$/i,
  resetFilter: /^Mặc định$|^Reset$|^Default$/i,
  fromDate: /Từ ngày|From date/i,
  toDate: /Đến ngày|To date/i,
  dateRangeError: /Ngày bắt đầu không thể lớn hơn|Start date cannot be after/i,
  retryBtn: /Thử lại|Try again|Retry/i,
  useMockBtn: /Sử dụng Mock Data|Use Mock Data/i,
  loadFailed: /Không thể tải dữ liệu|Failed to load/i,
  mockSwitchedOn: /Đã chuyển sang chế độ Giả lập|Switched to Mock/i,
  mockSwitchedReal: /Đã chuyển sang chế độ Dữ liệu thật|Switched to Real/i,
  autoMockToast: /Không kết nối được API|Could not connect to API/i,
  exportSuccess: /Xuất báo cáo Excel thành công|Excel export successful/i,
  exportMockSuccess:
    /Đã tải xuống báo cáo CSV giả lập|Mock.*CSV|Xuất báo cáo Excel giả lập/i,
  exportError: /Xuất file Excel thất bại|Failed to export Excel/i,
  totalRevenue: /Tổng doanh thu|TOTAL REVENUE/i,
  trendChart: /Xu hướng doanh thu|Revenue Trend/i,
  topTours: /Top 5 Tour doanh thu cao|Top 5 High-Revenue Tours/i,
  gatewayDonut: /Cơ cấu cổng thanh toán|Gateway Share Breakdown/i,
  tableTitle: /Chi tiết giao dịch|Transaction Details/i,
  bookingsTotal: /Tổng đơn hàng|TOTAL BOOKINGS/i,
  locationsTotal: /Tổng địa điểm|TOTAL LOCATIONS/i,
  ratingsTotal: /Tổng đánh giá|TOTAL RATINGS/i,
  usersNew: /Người dùng mới|New Users/i,
  usersGrowthChart: /Tăng trưởng người dùng mới|Monthly signup growth/i,
  paginationNext: /^Sau$|^Next$/i,
  paginationPrev: /^Trước$|^Previous$/i,
};

const copy = reportsCopy;

export class ReportPage {
  readonly page: Page;
  readonly route: ReportRoute;

  constructor(page: Page, route: ReportRoute) {
    this.page = page;
    this.route = route;
  }

  async goto(query = '') {
    const path = query ? `${this.route}?${query}` : this.route;
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForContentLoaded() {
    if (this.route === '/admin/reports/users') {
      await this.page.locator('#users-filter-year').waitFor({ state: 'visible', timeout: 20_000 });
      return;
    }
    const dateFilter = this.page.locator('input[type="date"]').first();
    if (await dateFilter.count()) {
      await dateFilter.waitFor({ state: 'visible', timeout: 20_000 });
      return;
    }
    await this.applyButton.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    const name =
      this.route === '/admin/reports/revenue'
        ? copy.revenueHeading
        : this.route === '/admin/reports/bookings'
          ? copy.bookingsHeading
          : this.route === '/admin/reports/locations'
            ? copy.locationsHeading
            : this.route === '/admin/reports/ratings'
              ? copy.ratingsHeading
              : copy.usersHeading;
    return this.page.getByRole('heading', { level: 1, name });
  }

  get filterBar() {
    return this.page.locator('input[type="date"]').first().locator('xpath=ancestor::div[contains(@class,"rounded")]').first();
  }

  get fromDateInput() {
    return this.page.locator('input[type="date"]').nth(0);
  }

  get toDateInput() {
    return this.page.locator('input[type="date"]').nth(1);
  }

  get applyButton() {
    return this.page.getByRole('button', { name: copy.applyFilter });
  }

  get resetButton() {
    return this.page.getByRole('button', { name: copy.resetFilter });
  }

  private mockToggleTestId() {
    const segment = this.route.split('/').pop() ?? 'revenue';
    return `${segment}-report-mock-toggle`;
  }

  get mockToggleButton() {
    return this.page.getByTestId(this.mockToggleTestId()).or(
      this.page.locator('button').filter({ hasText: copy.mockOff }).or(
        this.page.locator('button').filter({ hasText: copy.mockOn })
      )
    );
  }

  get errorPanel() {
    return this.page.getByTestId('revenue-report-error-panel');
  }

  get retryButton() {
    return this.page.getByTestId('revenue-report-retry-btn').or(
      this.page.getByRole('button', { name: copy.retryBtn })
    );
  }

  get useMockButton() {
    return this.page.getByTestId('revenue-report-use-mock-btn').or(
      this.page.getByRole('button', { name: copy.useMockBtn })
    );
  }

  get exportButton() {
    return this.page.getByTestId('revenue-report-export-btn').or(
      this.page.getByRole('button', { name: copy.exportExcel })
    );
  }

  get statsRegion() {
    return this.page.locator('.grid').filter({ has: this.page.getByText(copy.totalRevenue) }).first();
  }

  get reportTable() {
    return this.page.locator('table').first();
  }

  get nextPageButton() {
    return this.page.getByRole('button', { name: copy.paginationNext });
  }

  get prevPageButton() {
    return this.page.getByRole('button', { name: copy.paginationPrev });
  }

  async enableMockMode() {
    const testId = this.mockToggleTestId();
    const onBtn = this.page.getByTestId(testId).filter({ hasText: copy.mockOn });
    if (await onBtn.isVisible().catch(() => false)) return;
    const offBtn = this.page.getByTestId(testId).filter({ hasText: copy.mockOff });
    if (await offBtn.isVisible().catch(() => false)) {
      await offBtn.click();
    } else {
      const fallbackOff = this.page.locator('button').filter({ hasText: copy.mockOff });
      await fallbackOff.click();
    }
    await expect(
      this.page.getByTestId(testId).filter({ hasText: copy.mockOn }).or(
        this.page.locator('button').filter({ hasText: copy.mockOn })
      )
    ).toBeVisible({ timeout: 15_000 });
  }

  async disableMockMode() {
    const testId = this.mockToggleTestId();
    const offBtn = this.page.getByTestId(testId).filter({ hasText: copy.mockOff });
    if (await offBtn.isVisible().catch(() => false)) return;
    const onBtn = this.page.getByTestId(testId).filter({ hasText: copy.mockOn });
    if (await onBtn.isVisible().catch(() => false)) {
      await onBtn.click();
    } else {
      const fallbackOn = this.page.locator('button').filter({ hasText: copy.mockOn });
      await fallbackOn.click();
    }
    await expect(
      this.page.getByTestId(testId).filter({ hasText: copy.mockOff }).or(
        this.page.locator('button').filter({ hasText: copy.mockOff })
      )
    ).toBeVisible({ timeout: 15_000 });
  }

  async applyDateRange(from: string, to: string) {
    await this.fromDateInput.fill(from);
    await this.toDateInput.fill(to);
    await this.applyButton.click();
  }

  async expectToast(pattern: RegExp) {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: pattern }).first()
    ).toBeVisible({ timeout: 15_000 });
  }
}

export default ReportPage;
