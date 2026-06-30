import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const ratingsCopy = {
  heading: /Quản lý đánh giá|Ratings Management/i,
  subtitle: /Danh sách theo dõi|Track, hide and delete/i,
  exportButton: /Xuất báo cáo Excel|Export Excel Report/i,
  searchPlaceholder: /Tìm theo tên khách hàng|Search by customer name/i,
  resetFilter: /Đặt lại bộ lọc|Reset filters/i,
  typeTour: /Tour du lịch|^Tour$/i,
  typeLocation: /Địa điểm|^Location$/i,
  statusNew: /^Mới$|^New$/i,
  statusViewed: /Đã xem|Viewed/i,
  statusHidden: /Đã ẩn|Hidden/i,
  statsTotal: /Tổng đánh giá|Total ratings?/i,
  statsNew: /^Mới$|^New$/i,
  statsViewed: /Đã xem|Viewed/i,
  statsHidden: /Đã ẩn|Hidden/i,
  emptyTitle: /Không tìm thấy đánh giá|No reviews found/i,
  markViewed: /Đã xem|Mark viewed/i,
  hideButton: /^Ẩn$|^Hide$/i,
  hideBulk: /Ẩn đã chọn|Hide selected/i,
  confirmHide: /Xác nhận ẩn|Confirm hide/i,
  rejectDialogTitle: /Xác nhận Từ chối|Confirm Rejection|Reject in bulk/i,
  deleteDialogTitle: /Xóa đánh giá này|Delete this review/i,
  bulkDeleteTitle: /Xóa hàng loạt|Bulk delete/i,
  cancelButton: /^Hủy bỏ$|^Cancel$/i,
  deleteButton: /^Xóa$|^Delete$/i,
  markViewedSuccess: /Đã đánh dấu đánh giá là đã xem|Marked as viewed/i,
  hideSuccess: /Đã ẩn đánh giá thành công|Hidden successfully/i,
  deleteSuccess: /Đã xóa đánh giá vĩnh viễn|deleted permanently/i,
  deleteBulkSuccess: /Đã xóa vĩnh viễn thành công|Successfully deleted/i,
  resetSuccess: /Đã lập lại bộ lọc|Đã thiết lập lại bộ lọc|Filters have been reset/i,
  exportSuccess: /Xuất báo cáo Excel thành công|Excel report exported/i,
  exportFailed: /Xuất file Excel thất bại|Exporting Excel file failed/i,
  reasonRequired: /Lý do từ chối là bắt buộc|Rejection reason is required/i,
  markViewedError: /Mark viewed failed|đánh dấu đã xem thất bại|Có lỗi xảy ra khi đánh dấu/i,
  hideError: /Reject failed|Có lỗi xảy ra khi ẩn|ẩn đánh giá thất bại/i,
  deleteError: /Delete failed|Có lỗi xảy ra khi xóa đánh giá/i,
};

const copy = ratingsCopy;

export class RatingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/ratings', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/ratings', { waitUntil: 'domcontentloaded' });
    }
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForTableLoaded() {
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.goto();
    }
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  waitForListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/ratings') &&
        !res.url().includes('/export') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get exportHeaderButton() {
    return this.page.getByRole('button', { name: copy.exportButton }).first();
  }

  get statsGrid() {
    return this.page.locator('.grid').filter({ hasText: copy.statsTotal }).first();
  }

  statValue(label: RegExp) {
    return this.statsGrid
      .locator('h3.text-2xl')
      .filter({ has: this.page.locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")]') })
      .first();
  }

  statCard(label: RegExp) {
    return this.statsGrid
      .locator('div.rounded-\\[23px\\]')
      .filter({ has: this.page.locator('p.text-xs').filter({ hasText: label }) });
  }

  get filterPanel() {
    return this.page.locator('.bg-white\\/80').filter({ has: this.searchInput }).first();
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get resetFilterButton() {
    return this.filterPanel.getByRole('button', { name: copy.resetFilter });
  }

  get tableCard() {
    return this.page.locator('.group\\/card').first();
  }

  get table() {
    return this.page.locator('table');
  }

  get tableRows() {
    return this.table.locator('tbody tr').filter({
      has: this.page.locator('input[type="checkbox"]'),
    });
  }

  get selectAllCheckbox() {
    return this.table.locator('thead input[type="checkbox"]');
  }

  get paginationBar() {
    return this.tableCard.locator('.border-t').last();
  }

  get rejectDialog() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.confirmHide });
  }

  get deleteDialog() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.deleteDialogTitle });
  }

  get bulkDeleteDialog() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.bulkDeleteTitle });
  }

  get selectedCountBadge() {
    return this.tableCard.locator('span.uppercase.tracking-wider').filter({
      hasText: /Đã chọn|Selected/i,
    });
  }

  rowByUserName(name: string): Locator {
    return this.tableRows.filter({ hasText: name });
  }

  checkboxInRow(row: Locator): Locator {
    return row.locator('input[type="checkbox"]').first();
  }

  markViewedInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.markViewed });
  }

  hideButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.hideButton });
  }

  deleteButtonInRow(row: Locator): Locator {
    return row
      .getByRole('button', { name: /Delete permanently|Xóa vĩnh viễn/i })
      .first();
  }

  private filterSelectControl(index: number) {
    return this.filterPanel.locator('[class*="-control"]').nth(index);
  }

  async selectFilterOption(controlIndex: number, option: RegExp) {
    await this.filterSelectControl(controlIndex).click();
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(500);
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(450);
  }

  async resetFilters() {
    await this.resetFilterButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.resetFilterButton.click();
    await this.page.waitForTimeout(400);
  }

  async expectToast(pattern: RegExp) {
    await expect(
      this.page.locator('[data-sonner-toast]').filter({ hasText: pattern }).first()
    ).toBeVisible({ timeout: 15_000 });
  }

  async selectRow(row: Locator) {
    await this.checkboxInRow(row).check();
  }

  async selectAllOnPage() {
    await this.selectAllCheckbox.check();
  }

  async unselectAllOnPage() {
    await this.selectAllCheckbox.uncheck();
  }

  get rejectReasonInput() {
    return this.rejectDialog.locator('textarea');
  }

  async submitRejectDialog() {
    await this.rejectDialog.getByRole('button', { name: copy.confirmHide }).click();
  }

  async cancelRejectDialog() {
    await this.rejectDialog.getByRole('button', { name: copy.cancelButton }).click();
  }

  async confirmDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.deleteButton }).click();
  }

  async cancelDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.cancelButton }).click();
  }

  async confirmBulkDelete() {
    await this.bulkDeleteDialog.getByRole('button', { name: copy.deleteButton }).click();
  }

  async cancelBulkDeleteViaBackdrop() {
    await this.bulkDeleteDialog.locator('.absolute.inset-0').first().click({ position: { x: 5, y: 5 } });
  }

  get bulkHideButton() {
    return this.tableCard.getByRole('button', { name: copy.hideBulk });
  }

  get bulkDeleteButton() {
    return this.tableCard.getByRole('button', { name: copy.deleteButton });
  }

  async changeLimit(count: number) {
    const listReq = this.waitForListResponse();
    await this.tableCard.locator('[class*="-control"]').first().click();
    await this.page.getByRole('option', { name: new RegExp(`${count}`, 'i') }).click();
    await listReq;
  }

  async goToPage(pageNum: number) {
    const listReq = this.waitForListResponse();
    await this.paginationBar.getByRole('button', { name: String(pageNum), exact: true }).click();
    await listReq;
  }

  async expectRejectDialogClosed() {
    await expect(this.rejectDialog).toHaveCount(0);
  }

  async expectDeleteDialogClosed() {
    await expect(this.deleteDialog).toHaveCount(0);
  }
}
