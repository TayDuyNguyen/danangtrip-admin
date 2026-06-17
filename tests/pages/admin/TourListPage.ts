import type { Locator, Page } from '@playwright/test';

export const tourListCopy = {
  heading: /^Danh sách Tour$|^Tour List$/i,
  statsTotal: /TỔNG TOUR|TOTAL TOURS/i,
  statsActive: /ĐANG HOẠT ĐỘNG|ACTIVE/i,
  statsFeatured: /NỔI BẬT|FEATURED/i,
  statsSoldOut: /HẾT CHỖ|SOLD OUT/i,
  searchPlaceholder: /Tìm theo tên tour|Search by tour name/i,
  allCategories: /Tất cả danh mục|All [Cc]ategories/i,
  allStatus: /Tất cả trạng thái|All [Ss]tatus/i,
  allBooking: /Tất cả \(chỗ\)|All \(availability\)/i,
  allTypes: /Tất cả loại|All [Tt]ypes/i,
  exportButton: /Xuất Excel|Export Excel/i,
  createButton: /Thêm|Add/i,
  bulkActivate: /^Kích hoạt$|^Activate$/i,
  bulkDeactivate: /^Tạm ẩn$|^Deactivate$/i,
  bulkDelete: /^Xóa$|^Delete$/i,
  bulkSelected: /Đã chọn|Selected/i,
  deleteDialogTitle: /Xóa tour này|Delete this tour/i,
  bulkDeleteDialogTitle: /Xác nhận xóa hàng loạt|Confirm bulk delete/i,
  confirmDelete: /Xóa tour|Delete Tour/i,
  confirmBulkDelete: /Xóa tất cả|Delete all/i,
  cancelDialog: /^Hủy$|^Cancel$/i,
  closeModal: /^Đóng$|^Close$/i,
  editModal: /Chỉnh sửa|Edit/i,
  viewAction: /^Xem$|^View$/i,
  editAction: /Chỉnh sửa|Edit/i,
  deleteAction: /^Xóa$|^Remove$|^Delete$/i,
  resetFilter: /Đặt lại|Reset/i,
  activeFilters: /Đang áp dụng|Active filters/i,
  noData: /Không tìm thấy tour nào|No tours found/i,
  noDataSub: /Thử thay đổi bộ lọc|Try changing filters/i,
  statusActiveOption: /Đang hoạt động|^Active$/i,
  statusInactiveOption: /Tạm ẩn|Hidden|Inactive/i,
  bookingOpen: /Còn chỗ|Open|Available/i,
  bookingSoldOut: /Hết chỗ|Sold out/i,
  typeFeatured: /^Nổi bật$|^Featured$/i,
  typeHot: /Hot Tour|Tour Hot|^Hot$/i,
  typeNormal: /^Thường$|^Normal$/i,
  breadcrumbTours: /Quản lý Tour|Tour Management/i,
  breadcrumbList: /Danh sách [Tt]our|Tour [Ll]ist/i,
  noSchedule: /Hết lịch|No schedule/i,
  perPerson: /\/ người|\/ person/i,
};

const copy = tourListCopy;

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

  get statsGrid() {
    return this.page.locator('.grid').filter({ hasText: copy.statsTotal }).first();
  }

  get filterPanel() {
    return this.page.locator('.bg-white.border').filter({ has: this.searchInput });
  }

  filterCombobox(index: number) {
    return this.filterPanel.locator('div[class*="-control"]').nth(index);
  }

  private async clickFilterControl(label: RegExp) {
    await this.filterPanel.scrollIntoViewIfNeeded();
    await this.filterPanel
      .getByText(label)
      .locator('xpath=ancestor::div[contains(@class,"-control")]')
      .first()
      .click();
  }

  async openSelect(_currentLabel: RegExp) {
    /* legacy */
  }

  async selectOption(name: RegExp | string) {
    if (typeof name === 'string') {
      await this.page.getByRole('option', { name }).click();
    } else {
      await this.page.getByRole('option', { name }).click();
    }
  }

  async selectStatusFilter(option: RegExp) {
    await this.clickFilterControl(copy.allStatus);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async selectCategoryFilter(option: RegExp | string) {
    await this.clickFilterControl(copy.allCategories);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async selectBookingFilter(option: RegExp) {
    await this.clickFilterControl(copy.allBooking);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async selectTypeFilter(option: RegExp) {
    await this.clickFilterControl(copy.allTypes);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async searchCategoryDropdown(keyword: string) {
    await this.clickFilterControl(copy.allCategories);
    await this.page.locator('input[type="text"]').last().fill(keyword);
  }

  statCard(label: RegExp) {
    return this.statsGrid.getByText(label).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]').first();
  }

  statValue(label: RegExp) {
    return this.statCard(label).locator('span.text-\\[20px\\]');
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

  get bulkSelectedLabel() {
    return this.tableCard.getByText(copy.bulkSelected);
  }

  get resetFilterButton() {
    return this.page.getByRole('button', { name: copy.resetFilter });
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

  get selectAllCheckbox() {
    return this.table.locator('thead input[type="checkbox"]');
  }

  get detailModalPanel() {
    return this.page.locator('[id^="headlessui-dialog-panel"]');
  }

  get refreshButton() {
    return this.tableCard.locator('h2').locator('xpath=..').getByRole('button');
  }

  get breadcrumbTrail() {
    return this.page.locator('.text-xs.font-black.text-slate-400.uppercase').first();
  }

  get paginationBar() {
    return this.tableCard.locator('.border-t').last();
  }

  get pageNavButtons() {
    return this.paginationBar.locator('> div.flex.items-center.gap-1\\.5').last();
  }

  get prevPageButton() {
    return this.pageNavButtons.locator(':scope > button').first();
  }

  get nextPageButton() {
    return this.pageNavButtons.locator(':scope > button').last();
  }

  pageButton(pageNum: number): Locator {
    return this.paginationBar.getByRole('button', {
      name: new RegExp(`^(Trang|Page)\\s*${pageNum}$`, 'i'),
    });
  }

  get statsSection() {
    return this.statsGrid.getByText(copy.statsTotal);
  }

  rowByTourName(name: string): Locator {
    return this.tableRows.filter({ hasText: name });
  }

  rowCheckbox(row: Locator): Locator {
    return row.locator('input[type="checkbox"]');
  }

  rowStt(row: Locator): Locator {
    return row.locator('td').nth(1);
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

  activeFilterTag(text: RegExp | string): Locator {
    return this.page.getByText(typeof text === 'string' ? text : text).locator('xpath=ancestor::div[contains(@class,"rounded-full")]').first();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  async typeSearchFast(keyword: string) {
    await this.searchInput.fill('');
    await this.searchInput.pressSequentially(keyword, { delay: 40 });
    await this.page.waitForTimeout(450);
  }

  async changeLimit(count: number) {
    await this.tableCard.getByText(new RegExp(`\\d+\\s*/\\s*(trang|page)`, 'i')).click();
    await this.page.getByRole('option', { name: new RegExp(String(count)) }).click();
    await this.page.waitForTimeout(300);
  }

  async goToPage(pageNum: number) {
    await this.pageButton(pageNum).click();
    await this.page.waitForTimeout(300);
  }

  async selectRowsByName(...names: string[]) {
    for (const name of names) {
      await this.rowCheckbox(this.rowByTourName(name)).check();
    }
  }

  async selectAllOnPage() {
    await this.selectAllCheckbox.check();
  }

  async confirmDeleteDialog(bulk = false) {
    const btn = bulk
      ? this.page.getByRole('button', { name: copy.confirmBulkDelete })
      : this.page.getByRole('button', { name: copy.confirmDelete });
    await btn.click();
  }

  async cancelDeleteDialog() {
    await this.page.getByRole('button', { name: copy.cancelDialog }).click();
  }

  async closeDeleteDialogX() {
    await this.detailModalPanel.locator('button').filter({ has: this.page.locator('svg') }).first().click();
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
