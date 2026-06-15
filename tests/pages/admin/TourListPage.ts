import type { Locator, Page } from '@playwright/test';

const copy = {
  heading: /^Danh sách Tour$|^Tour List$/i,
  statsTotal: /TỔNG TOUR|TOTAL TOURS/i,
  searchPlaceholder: /Tìm theo tên tour|Search by tour name/i,
  allStatus: /Tất cả trạng thái|All Status/i,
  exportButton: /Xuất Excel|Export Excel/i,
  createButton: /Thêm|Add/i,
  bulkActivate: /^Kích hoạt$|^Activate$/i,
  bulkDeactivate: /^Tạm ẩn$|^Deactivate$/i,
  bulkDelete: /^Xóa$|^Delete$/i,
  deleteDialogTitle: /Xóa tour này|Delete this tour/i,
  confirmDelete: /Xóa tour|Delete Tour/i,
  confirmBulkDelete: /Xóa tất cả|Delete all/i,
  closeModal: /^Đóng$|^Close$/i,
  editModal: /Chỉnh sửa|Edit/i,
  viewAction: /^Xem$|^View$/i,
  editAction: /Chỉnh sửa|Edit/i,
  deleteAction: /^Xóa$|^Remove$|^Delete$/i,
  retrySchedules: /Thử lại|Try again/i,
  statusActiveOption: /Đang hoạt động|^Active$/i,
  statusInactiveOption: /Tạm ẩn|^Inactive$/i,
};

export class TourListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/tours/list', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 20_000 });
  }

  async waitForTableLoaded() {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get statsSection() {
    return this.page.getByText(copy.statsTotal);
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get exportButton() {
    return this.page.getByRole('button', { name: copy.exportButton });
  }

  get createButton() {
    return this.page.getByRole('button', { name: copy.createButton }).first();
  }

  get bulkActivateButton() {
    return this.page.getByRole('button', { name: copy.bulkActivate });
  }

  get bulkDeactivateButton() {
    return this.page.getByRole('button', { name: copy.bulkDeactivate });
  }

  get bulkDeleteButton() {
    return this.page.getByRole('button', { name: copy.bulkDelete });
  }

  get tableCard() {
    return this.page.locator('.group\\/card');
  }

  get table() {
    return this.page.locator('table');
  }

  get tableRows() {
    return this.table.locator('tbody tr').filter({ has: this.page.locator('td') });
  }

  get detailModalPanel() {
    return this.page.locator('[id^="headlessui-dialog-panel"]');
  }

  rowByTourName(name: string): Locator {
    return this.tableRows.filter({ hasText: name });
  }

  rowCheckbox(row: Locator): Locator {
    return row.locator('input[type="checkbox"]');
  }

  viewButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.viewAction });
  }

  editButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.editAction });
  }

  deleteButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.deleteAction });
  }

  featuredSwitchInRow(row: Locator): Locator {
    return row.getByRole('switch').first();
  }

  hotSwitchInRow(row: Locator): Locator {
    return row.getByRole('switch').nth(1);
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  async selectStatusFilter(option: RegExp) {
    await this.page.getByText(copy.allStatus).first().click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async changeLimit(count: number) {
    await this.tableCard.getByText(new RegExp(`\\d+\\s*/\\s*(trang|page)`, 'i')).click();
    await this.page.getByRole('option', { name: new RegExp(String(count)) }).click();
  }

  async goToPage(pageNum: number) {
    await this.tableCard.getByRole('button', { name: String(pageNum), exact: true }).click();
  }

  async selectRowsByName(...names: string[]) {
    for (const name of names) {
      await this.rowCheckbox(this.rowByTourName(name)).check();
    }
  }

  async confirmDeleteDialog(bulk = false) {
    const btn = bulk
      ? this.page.getByRole('button', { name: copy.confirmBulkDelete })
      : this.page.getByRole('button', { name: copy.confirmDelete });
    await btn.click();
  }

  async openViewModal(tourName: string) {
    await this.viewButtonInRow(this.rowByTourName(tourName)).click();
    await this.detailModalPanel.getByRole('heading', { name: tourName }).waitFor({ state: 'visible', timeout: 15_000 });
  }

  async closeDetailModal() {
    await this.detailModalPanel.getByRole('button', { name: copy.closeModal }).first().click();
    await this.detailModalPanel.waitFor({ state: 'hidden', timeout: 10_000 });
  }

  waitForFeaturedPatch(tourId: number) {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/tours/${tourId}/featured`) &&
        res.status() === 200
    );
  }

  waitForHotPatch(tourId: number) {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/tours/${tourId}/hot`) &&
        res.status() === 200
    );
  }

  waitForStatusPatch(tourId: number) {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/tours/${tourId}/status`) &&
        res.status() === 200
    );
  }

  waitForDelete(tourId: number) {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/tours/${tourId}`) &&
        res.status() === 200
    );
  }

  waitForExport() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/admin/tours/export') &&
        res.status() === 200
    );
  }
}
