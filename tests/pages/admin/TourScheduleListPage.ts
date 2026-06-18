import type { Locator, Page, Response } from '@playwright/test';

export const tourScheduleListCopy = {
  heading: /^Lịch khởi hành$|^Departure schedules$/i,
  subtitle: /Quản lý toàn bộ lịch khởi hành của các tour|Manage all departure schedules across tours/i,
  statsTotal: /Tổng lịch|TOTAL SCHEDULES/i,
  statsAvailable: /Đang hoạt động|Active/i,
  statsFull: /Hết chỗ|Sold out/i,
  statsCancelled: /Đã hủy|CANCELLED/i,
  searchPlaceholder: /Tìm theo tên tour|Search by tour name/i,
  filterButton: /^Lọc$|^Filter$/i,
  resetButton: /^Đặt lại$|^Reset$/i,
  tableTitle: /Danh sách lịch trình|Schedule list/i,
  noDataTitle: /Không có lịch khởi hành|No schedules found/i,
  noDataSubtitle: /Thử thay đổi bộ lọc|Try changing filters/i,
  fetchError: /Không tải được dữ liệu|Could not load data/i,
  retryButton: /Thử lại|Try again|Retry/i,
  statusAvailable: /Đang hoạt động|^Active$/i,
  statusCancelled: /Đã hủy|^Cancelled$/i,
  bookingOpen: /Còn chỗ|^Open$/i,
  bookingSoldOut: /Hết chỗ|Sold out/i,
  bulkActivate: /^Kích hoạt lịch$|^Activate schedules$/i,
  bulkCancel: /Hủy lịch|Cancel schedule/i,
  deleteDialogTitle: /Xóa lịch khởi hành này|Delete this schedule/i,
  deleteConfirm: /^Xóa lịch$|^Delete schedule$/i,
  cancelDialog: /^Hủy$|^Cancel$/i,
  priceFollowsTour: /Theo tour|Follows tour/i,
  breadcrumbTours: /Quản lý Tour|Tour Management/i,
  breadcrumbSchedules: /Lịch khởi hành|Departure schedules/i,
  addScheduleTitle: /Thêm lịch|Add schedule/i,
  editTitle: /Chỉnh sửa|Edit/i,
  removeTitle: /^Xóa$|^Remove$|^Delete$/i,
  allTours: /Tất cả tour|All tours/i,
  allStatus: /^Tất cả$|^All$/i,
};

const copy = tourScheduleListCopy;

export class TourScheduleListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(query = '') {
    const suffix = query ? (query.startsWith('?') ? query : `?${query}`) : '';
    await this.page.goto(`/admin/tours/schedules${suffix}`, { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForTableLoaded() {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get subtitle() {
    return this.page.getByText(copy.subtitle);
  }

  get statsGrid() {
    return this.page.locator('.grid').filter({ hasText: copy.statsTotal }).first();
  }

  statValue(label: RegExp) {
    return this.statsGrid
      .getByText(label)
      .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]')
      .locator('p.text-2xl');
  }

  get filterPanel() {
    return this.page.locator('.bg-white.p-5.rounded-2xl').filter({ has: this.searchInput }).first();
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get filterButton() {
    return this.filterPanel.getByRole('button', { name: copy.filterButton });
  }

  get resetFilterButton() {
    return this.filterPanel.getByRole('button', { name: copy.resetButton });
  }

  get calendarPanel() {
    return this.page.locator('.bg-white.border').filter({ hasText: /Tháng|Month/i }).first();
  }

  get calendarNextMonthButton() {
    return this.calendarPanel.locator('button').filter({ has: this.page.locator('svg') }).last();
  }

  get calendarPrevMonthButton() {
    return this.calendarPanel.locator('.flex.items-center.gap-1\\.5 button').first();
  }

  get calendarResetDateButton() {
    return this.calendarPanel.getByRole('button', { name: copy.resetButton });
  }

  calendarDayCell(day: number) {
    return this.calendarPanel
      .locator('.grid.grid-cols-7')
      .nth(1)
      .locator('div.min-h-\\[90px\\]')
      .filter({ has: this.page.getByText(String(day), { exact: true }) });
  }

  get tableCard() {
    return this.page.locator('.bg-white.border').filter({ has: this.table }).first();
  }

  get table() {
    return this.page.locator('table');
  }

  get tableRows() {
    return this.table.locator('tbody tr').filter({ has: this.page.locator('td input[type="checkbox"]') });
  }

  get selectAllCheckbox() {
    return this.table.locator('thead input[type="checkbox"]');
  }

  rowByTourName(name: string): Locator {
    return this.tableRows.filter({ hasText: name });
  }

  rowCheckbox(row: Locator): Locator {
    return row.locator('input[type="checkbox"]');
  }

  sortStartDateButton() {
    return this.table.locator('thead button').filter({ hasText: /Ngày KH|Start/i });
  }

  get bulkToolbar() {
    return this.tableCard.locator('.animate-in');
  }

  get bulkActivateButton() {
    return this.bulkToolbar.getByRole('button', { name: copy.bulkActivate });
  }

  get bulkCancelButton() {
    return this.bulkToolbar.getByRole('button', { name: /Hủy lịch|Cancel schedule/i });
  }

  get perPageSelect() {
    return this.tableCard.locator('div[class*="-control"]').last();
  }

  get prevPageButton() {
    return this.tableCard.locator('.border-t button').first();
  }

  get nextPageButton() {
    return this.tableCard.locator('.border-t .flex.items-center.gap-1\\.5 button').last();
  }

  pageButton(pageNum: number): Locator {
    return this.tableCard.getByRole('button', { name: String(pageNum), exact: true });
  }

  get retryButton() {
    return this.page
      .locator('.bg-white.border.rounded-2xl.p-10')
      .filter({ has: this.page.getByRole('heading', { name: copy.fetchError }) })
      .getByRole('button', { name: copy.retryButton });
  }

  addButtonInRow(row: Locator): Locator {
    return row.locator('button[aria-label*="Thêm"], button[title*="Thêm"], button[aria-label*="Add"], button[title*="Add"]').first();
  }

  editButtonInRow(row: Locator): Locator {
    return row.locator('button[aria-label*="Chỉnh sửa"], button[title*="Chỉnh sửa"], button[aria-label*="Edit"], button[title*="Edit"]').first();
  }

  viewButtonInRow(row: Locator): Locator {
    return row
      .locator(
        'button[aria-label*="Xem chi tiết"], button[title*="Xem chi tiết"], button[aria-label*="View schedule"], button[title*="View schedule"]'
      )
      .first();
  }

  deleteButtonInRow(row: Locator): Locator {
    return row.locator('button[aria-label*="Xóa"], button[title*="Xóa"], button[aria-label*="Remove"], button[title*="Remove"], button[aria-label*="Delete"], button[title*="Delete"]').first();
  }

  tourNameButton(name: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`Lọc theo tour này.*${name}|Filter by this tour.*${name}`, 'i') });
  }

  get deleteDialogPanel() {
    return this.page.locator('[role="dialog"]');
  }

  get breadcrumbTrail() {
    return this.page.locator('.text-xs.font-black.text-slate-400.uppercase').first();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(450);
  }

  async clickFilterControl(label: RegExp) {
    await this.filterPanel
      .getByText(label)
      .locator('xpath=ancestor::div[contains(@class,"-control")]')
      .first()
      .click();
  }

  async selectTourFilter(tourName: RegExp | string) {
    await this.clickFilterControl(copy.allTours);
    await this.page.getByRole('option', { name: tourName }).click();
    await this.page.waitForTimeout(400);
  }

  async selectStatusFilter(option: RegExp) {
    await this.clickFilterControl(copy.allStatus);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(400);
  }

  async setDateFrom(value: string) {
    await this.filterPanel.locator('input[type="date"]').first().fill(value);
  }

  async setDateTo(value: string) {
    await this.filterPanel.locator('input[type="date"]').nth(1).fill(value);
  }

  async applyDateFilter() {
    await this.filterButton.click();
    await this.page.waitForTimeout(400);
  }

  async resetFilters() {
    await this.resetFilterButton.click();
    await this.page.waitForTimeout(400);
  }

  async changeLimit(count: number) {
    await this.tableCard.getByText(/\d+\s*\/\s*(trang|page)/i).first().click();
    await this.page.getByRole('option', { name: new RegExp(String(count)) }).click();
    await this.page.waitForTimeout(300);
  }

  async goToPage(pageNum: number) {
    await this.pageButton(pageNum).click();
    await this.page.waitForTimeout(300);
  }

  async confirmDeleteDialog() {
    await this.deleteDialogPanel.getByRole('button', { name: copy.deleteConfirm }).click();
  }

  async cancelDeleteDialog() {
    await this.deleteDialogPanel.getByRole('button', { name: copy.cancelDialog }).click();
  }

  waitForScheduleListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/admin/tour-schedules') &&
        !res.url().includes('status-counts') &&
        res.status() === 200
    );
  }

  waitForScheduleDelete(scheduleId: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/tour-schedules/${scheduleId}`)
    );
  }

  waitForScheduleStatusPatch(scheduleId: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/tour-schedules/${scheduleId}/status`)
    );
  }
}
