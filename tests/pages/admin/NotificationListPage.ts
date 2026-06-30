import { expect, type Locator, type Page } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';
import { getLastNotificationListQuery } from '../../fixtures/api/notifications.mock';

export const notificationListCopy = {
  heading: /Danh sách Thông báo|Notification List/i,
  subtitle: /Quản lý thông báo|Manage system notifications/i,
  sendAction: /Gửi thông báo|Send Notification/i,
  searchPlaceholder: /Tìm theo tiêu đề|Search title/i,
  allTypes: /Tất cả loại|All Types/i,
  allStatuses: /Tất cả trạng thái|All Statuses/i,
  resetFilters: /^Đặt lại$|^Reset$/i,
  emptyTitle: /Không có thông báo nào|No notifications found/i,
  deleteConfirm: /^Xóa$|^Delete$/i,
  deleteCancel: /^Hủy$|^Cancel$/i,
  deleteDialogTitle: /Xóa thông báo này|Delete this notification/i,
  bulkDeleteDialogTitle: /Xóa các thông báo đã chọn|Delete selected notifications/i,
  deleteSuccess: /Xóa thông báo thành công|Notification deleted|deleted successfully/i,
  bulkDelete: /Xóa các mục đã chọn|Delete Selected/i,
  bulkDeleteSuccess: /Xóa các thông báo đã chọn|deleted selected|Selected notifications deleted/i,
  statsTotal: /TỔNG THÔNG BÁO|TOTAL NOTIFICATIONS/i,
  colRecipient: /Người nhận|Recipient/i,
  colContent: /Nội dung|Content/i,
  colType: /Loại|Type/i,
  colTime: /Thời gian|Time/i,
  colRead: /Đã đọc|Read/i,
  statusUnread: /Chưa đọc|Unread/i,
  typeSystem: /HỆ THỐNG|SYSTEM/i,
  typePromotion: /KHUYẾN MÃI|PROMOTION/i,
};

const copy = notificationListCopy;

export class NotificationListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/notifications', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login') || this.page.url().includes('/dashboard')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/notifications', { waitUntil: 'domcontentloaded' });
    }
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForTableLoaded() {
    await this.tableBodyRows.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get subtitle() {
    return this.page.getByText(copy.subtitle).first();
  }

  get sendButton() {
    return this.page.getByRole('button', { name: copy.sendAction });
  }

  get searchInput() {
    return this.page.getByTestId('notification-search-input');
  }

  get filterPanel() {
    return this.page.getByTestId('notification-filter-panel');
  }

  get statsGrid() {
    return this.page.locator('.grid').filter({ hasText: copy.statsTotal }).first();
  }

  get tableBodyRows() {
    return this.page.locator('main tbody tr').filter({ has: this.page.locator('td') });
  }

  get emptyState() {
    return this.page.getByText(copy.emptyTitle);
  }

  get resetFiltersButton() {
    return this.page.getByTestId('notification-reset-filters');
  }

  private async openFilterSelect(index: number) {
    await this.filterPanel.scrollIntoViewIfNeeded();
    await this.filterPanel.locator('div[class*="-control"]').nth(index).click();
  }

  async selectTypeFilter(option: RegExp) {
    await this.openFilterSelect(0);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(400);
  }

  async selectReadFilter(option: RegExp) {
    await this.openFilterSelect(1);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(400);
  }

  rowByTitle(title: string) {
    return this.page.locator('main tbody tr').filter({ hasText: title });
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await expect
      .poll(() => new URL(this.page.url()).searchParams.get('q'))
      .toBe(keyword);
    await expect
      .poll(() => getLastNotificationListQuery().search)
      .toBe(keyword);
  }

  async goToPage(pageNumber: number) {
    const listReq = this.page.waitForResponse(
      (res) =>
        res.url().includes('/admin/notifications') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
    await this.page.getByRole('button', { name: String(pageNumber), exact: true }).click();
    await listReq;
  }

  deleteButtonInRow(title: string) {
    return this.rowByTitle(title).locator('td').last().getByRole('button');
  }

  get bulkDeleteDialog() {
    return this.page.getByTestId('notification-bulk-delete-dialog');
  }

  get deleteDialog() {
    return this.page.getByTestId('notification-delete-dialog');
  }

  async confirmDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.deleteConfirm }).click();
  }

  async cancelDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.deleteCancel }).click();
  }

  checkboxInRow(title: string) {
    return this.rowByTitle(title).locator('input[type="checkbox"]').first();
  }

  get headerCheckbox() {
    return this.page.locator('thead input[type="checkbox"]').first();
  }

  get paginationNext() {
    return this.page
      .locator('.border-t')
      .last()
      .getByRole('button')
      .filter({ has: this.page.locator('svg') })
      .last();
  }

  async expectToast(pattern: RegExp) {
    await expect(this.page.getByText(pattern).first()).toBeVisible({ timeout: 15_000 });
  }
}

export default NotificationListPage;
