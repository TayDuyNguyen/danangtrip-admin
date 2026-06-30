import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const contactsCopy = {
  heading: /^Liên hệ$|^Contacts$/i,
  subtitle: /Quản lý yêu cầu liên hệ|Manage contact requests/i,
  exportButton: /Xuất Excel|Export Excel/i,
  searchPlaceholder: /Tìm liên hệ|Search contacts/i,
  tabAll: /^Tất cả$|^All$/i,
  tabNew: /^Mới$|^New$/i,
  tabRead: /Đã đọc|^Read$/i,
  tabReplied: /Đã trả lời|^Replied$/i,
  listEmpty: /Không có yêu cầu liên hệ|No contact requests/i,
  emptyDetailTitle: /Chọn một liên hệ|Select a contact/i,
  emptyDetailSubtitle: /Danh sách liên hệ ở bên trái|contact list is on the left/i,
  networkError: /Có lỗi xảy ra|An error occurred/i,
  listLoadFailed: /Không tải được danh sách liên hệ|Failed to load contact list/i,
  listLoadFailedDesc: /Dữ liệu liên hệ tạm thời|Contact data is temporarily unavailable/i,
  statsLoadFailed: /Không tải được thống kê liên hệ|Failed to load contact statistics/i,
  detailLoadFailed: /Không tải được chi tiết liên hệ|Failed to load contact details/i,
  detailLoadFailedDesc: /Không thể hiển thị nội dung|Unable to display this contact/i,
  retryButton: /Thử lại|^Retry$|^Try again$/i,
  replySection: /Trả lời|^Reply$/i,
  sendReply: /Gửi trả lời|Send Reply/i,
  replyPlaceholder: /Nhập nội dung trả lời|Type your reply/i,
  replyRequired: /Vui lòng nhập nội dung|Please enter a reply/i,
  repliedTitle: /Nội dung đã trả lời|Replied Content/i,
  repliedSuccessEmail: /Email đã được gửi|Email has been sent/i,
  deleteButton: /Xóa liên hệ|Delete Contact/i,
  deleteModalTitle: /Xóa liên hệ này|Delete this contact/i,
  deleteConfirm: /^Xóa$|^Delete$/i,
  cancelButton: /^Hủy$|^Cancel$/i,
  replySuccess: /Đã gửi trả lời|Reply sent successfully/i,
  deleteSuccess: /Đã xóa liên hệ|Contact deleted successfully/i,
  exportSuccess: /Xuất Excel thành công|Excel exported successfully/i,
};

const copy = contactsCopy;

export class ContactsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(query = '') {
    const path = query ? `/admin/contacts?${query}` : '/admin/contacts';
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForListLoaded() {
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.goto();
    }
    await this.listItems.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  waitForListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/contacts') &&
        !res.url().includes('/export') &&
        !res.url().match(/\/contacts\/\d+/) &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
  }

  waitForDetailResponse(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.url().includes(`/api/v1/admin/contacts/${id}`) &&
        !res.url().includes('/reply') &&
        res.request().method() === 'GET'
    );
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get exportButton() {
    return this.page.getByRole('button', { name: copy.exportButton });
  }

  get statsRow() {
    return this.page
      .locator('.grid.grid-cols-1')
      .filter({ has: this.page.getByText(/TOTAL CONTACTS|TỔNG LIÊN HỆ/i) })
      .first();
  }

  statValue(label: RegExp) {
    return this.statsRow
      .locator('span.text-3xl')
      .filter({
        has: this.page.locator(`xpath=ancestor::div[contains(@class,"rounded-3xl")]`),
      })
      .first();
  }

  statCard(label: RegExp) {
    return this.statsRow
      .locator('div.rounded-3xl')
      .filter({ has: this.page.locator('span.uppercase').filter({ hasText: label }) });
  }

  get leftPanel() {
    return this.page.locator('.w-\\[380px\\]').first();
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get listRefreshButton() {
    return this.leftPanel.locator('button[title*="Làm mới"], button[title*="Refresh"]').first();
  }

  get listErrorPanel() {
    return this.page.getByTestId('contact-list-error');
  }

  get statsErrorPanel() {
    return this.page.getByTestId('contact-stats-error');
  }

  get detailErrorPanel() {
    return this.detailPanel.getByTestId('contact-detail-error');
  }

  retryButton(scope: 'list' | 'stats' | 'detail' = 'list') {
    const panel =
      scope === 'stats'
        ? this.statsErrorPanel
        : scope === 'detail'
          ? this.detailErrorPanel
          : this.listErrorPanel;
    return panel.getByRole('button', { name: copy.retryButton });
  }

  get listItems() {
    return this.leftPanel.locator('.flex-1.overflow-y-auto > div.cursor-pointer');
  }

  get detailPanel() {
    return this.page.locator('.flex-1.min-w-0.h-full.overflow-hidden').first();
  }

  get paginationFooter() {
    return this.leftPanel.locator('.border-t').last();
  }

  get nextPageButton() {
    return this.paginationFooter.locator('button').last();
  }

  get prevPageButton() {
    return this.paginationFooter.locator('button').first();
  }

  get deleteDialog() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.deleteModalTitle });
  }

  get replyTextarea() {
    return this.detailPanel.locator('textarea');
  }

  listItemByName(name: string): Locator {
    return this.listItems.filter({ hasText: name });
  }

  listDeleteButton(contactId: number): Locator {
    return this.page.getByTestId(`contact-list-delete-${contactId}`);
  }

  tab(name: RegExp) {
    return this.leftPanel.getByRole('button', { name });
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(450);
  }

  async selectContact(name: string) {
    const detailReq = this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/contacts/') &&
        !res.url().includes('/reply') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
    await this.listItemByName(name).click();
    await detailReq;
    await this.detailPanel.getByRole('heading', { level: 4, name }).waitFor({ state: 'visible' });
  }

  async expectToast(pattern: RegExp) {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: pattern }).first()
    ).toBeVisible({ timeout: 15_000 });
  }

  async submitReply(text: string) {
    await this.replyTextarea.fill(text);
    await this.detailPanel.getByRole('button', { name: copy.sendReply }).click();
  }

  async openDeleteDialog() {
    await this.detailPanel.getByRole('button', { name: copy.deleteButton }).click();
    await expect(this.deleteDialog).toBeVisible();
  }

  async confirmDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.deleteConfirm }).click();
  }

  async cancelDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.cancelButton }).click();
  }

  async goToNextPage() {
    const listReq = this.waitForListResponse();
    await this.nextPageButton.click();
    await listReq;
  }

  async goToPrevPage() {
    const listReq = this.waitForListResponse();
    await this.prevPageButton.click();
    await listReq;
  }
}

export default ContactsPage;
