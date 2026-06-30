import type { Locator, Page, Response } from '@playwright/test';

export const locationListCopy = {
  heading: /Danh sách Địa điểm|Location List/i,
  subtitle: /Quản lý toàn bộ địa điểm du lịch|Manage all tourist locations/i,
  searchPlaceholder: /Tìm theo tên địa điểm|Search by name/i,
  statsTotal: /TỔNG ĐỊA ĐIỂM|TOTAL LOCATIONS/i,
  statsActive: /ĐANG HOẠT ĐỘNG|ACTIVE/i,
  statsFeatured: /NỔI BẬT|FEATURED/i,
  statsViews: /LƯỢT XEM|VIEWS/i,
  exportButton: /Xuất Excel|Export Excel/i,
  addButton: /Thêm mới|Add new/i,
  filterCategory: /^Danh mục$|^Category$/i,
  filterDistrict: /^Quận\/Huyện$|^District$/i,
  filterPrice: /^Mức giá$|^Price level$/i,
  filterStatus: /^Trạng thái$|^Status$/i,
  statusActive: /^Đang hoạt động$|^Active$/i,
  statusInactive: /^Tạm dừng$|^Inactive$/i,
  priceFree: /\$ - Miễn phí|\$ - Free/i,
  listPriceFree: /^Miễn phí$|^Free$/i,
  priceLow: /\$\$ - Phổ thông|\$\$ - Standard/i,
  bulkActivate: /^Kích hoạt$|^Activate$/i,
  bulkDeactivate: /^Tạm dừng$|^Deactivate$/i,
  bulkDelete: /^Xóa$|^Delete$/i,
  bulkSelected: /Đã chọn|Selected/i,
  deleteDialogTitle: /Xóa địa điểm này|Delete this location/i,
  confirmDelete: /^(Xóa|Delete)$/i,
  cancelDialog: /^Hủy$|^Cancel$/i,
  viewAction: /^Xem$|^View$/i,
  editAction: /Chỉnh sửa|Edit/i,
  deleteAction: /^Xóa$|^Remove$/i,
  emptyTitle: /Không có dữ liệu|No data/i,
  emptySubtitle: /Không tìm thấy địa điểm|Try changing filters/i,
  deleteSuccess: /Xóa địa điểm thành công|Location deleted successfully/i,
  deleteError: /Có lỗi xảy ra khi xóa|Error deleting location/i,
  updateSuccess: /Cập nhật thành công|Updated successfully/i,
  updateError: /Cập nhật thất bại|Update failed|Failed to update/i,
  bulkUpdateSuccess: /Cập nhật hàng loạt thành công|Bulk update successful|Updated successfully/i,
  bulkDeleteSuccess: /Đã xóa các địa điểm đã chọn|Selected locations deleted/i,
  bulkDeleteDialogTitle: /Xóa các địa điểm đã chọn|Delete selected locations/i,
  exportSuccess: /Đang tải file Excel|Excel file is downloading/i,
  exportError: /Có lỗi xảy ra khi xuất|error occurred while exporting/i,
  listLoadError: /Không tải được danh sách địa điểm|Failed to load location list/i,
  retryButton: /Thử lại|Retry/i,
  resetFilter: /^Đặt lại$|^Reset$/i,
  refresh: /Làm mới|Refresh/i,
};

const copy = locationListCopy;

export class LocationListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/locations', { waitUntil: 'domcontentloaded' });
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
      .locator('div.rounded-3xl')
      .filter({ has: this.page.getByText(label) })
      .locator('h3.text-2xl');
  }

  get filterPanel() {
    return this.page.locator('.bg-white.border').filter({ has: this.searchInput }).first();
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get exportButton() {
    return this.page.getByRole('button', { name: copy.exportButton });
  }

  get addButton() {
    return this.page.getByRole('button', { name: copy.addButton });
  }

  get resetFilterButton() {
    return this.filterPanel.getByRole('button', { name: copy.resetFilter });
  }

  get listErrorPanel() {
    return this.page.getByTestId('location-list-error');
  }

  get retryListButton() {
    return this.listErrorPanel.getByRole('button', { name: copy.retryButton });
  }

  get tableCard() {
    return this.page.locator('.group\\/card').first();
  }

  get table() {
    return this.page.locator('table');
  }

  get tableRows() {
    return this.table.locator('tbody tr').filter({ has: this.page.locator('input[type="checkbox"]') });
  }

  get selectAllCheckbox() {
    return this.table.locator('thead input[type="checkbox"]');
  }

  get refreshButton() {
    return this.tableCard.getByRole('button', { name: copy.refresh });
  }

  get bulkActivateButton() {
    return this.tableCard.getByRole('button', { name: copy.bulkActivate });
  }

  get bulkDeactivateButton() {
    return this.tableCard.getByRole('button', { name: copy.bulkDeactivate });
  }

  get bulkDeleteButton() {
    return this.tableCard.getByRole('button', { name: copy.bulkDelete, exact: true });
  }

  get bulkSelectedLabel() {
    return this.tableCard.getByText(copy.bulkSelected);
  }

  get deleteDialog() {
    return this.page.locator('.relative.w-full.max-w-md').filter({
      hasText: /Xóa địa điểm này|Delete this location|Xóa các địa điểm đã chọn|Delete selected locations/i,
    });
  }

  get emptyTitle() {
    return this.page.getByText(copy.emptyTitle);
  }

  get paginationBar() {
    return this.tableCard.locator('.border-t').last();
  }

  rowByName(name: string): Locator {
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

  featuredToggleInRow(row: Locator): Locator {
    return row.locator('button.rounded-full').first();
  }

  locationNameLinkInRow(row: Locator): Locator {
    return row.locator('h4').first();
  }

  private async clickFilterControl(label: RegExp) {
    await this.filterPanel.scrollIntoViewIfNeeded();
    await this.filterPanel
      .getByText(label)
      .locator('xpath=ancestor::div[contains(@class,"-control")]')
      .first()
      .click();
  }

  async selectOption(name: RegExp | string) {
    if (typeof name === 'string') {
      await this.page.getByRole('option', { name }).click();
    } else {
      await this.page.getByRole('option', { name }).click();
    }
  }

  async selectCategoryFilter(option: RegExp | string) {
    await this.clickFilterControl(copy.filterCategory);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async selectDistrictFilter(option: string) {
    await this.clickFilterControl(copy.filterDistrict);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async selectPriceFilter(option: RegExp) {
    await this.clickFilterControl(copy.filterPrice);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async selectStatusFilter(option: RegExp) {
    await this.clickFilterControl(copy.filterStatus);
    await this.selectOption(option);
    await this.page.waitForTimeout(400);
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(450);
  }

  async resetFilters() {
    await this.resetFilterButton.click();
    await this.page.waitForTimeout(400);
  }

  async changeLimit(count: number) {
    await this.tableCard.getByText(new RegExp(`\\d+\\s*/\\s*(trang|page)`, 'i')).click();
    await this.page.getByRole('option', { name: new RegExp(String(count)) }).click();
    await this.page.waitForTimeout(350);
  }

  async goToPage(pageNum: number) {
    await this.paginationBar.getByRole('button', { name: String(pageNum), exact: true }).click();
    await this.page.waitForTimeout(350);
  }

  async selectRowsByName(...names: string[]) {
    for (const name of names) {
      await this.rowCheckbox(this.rowByName(name)).check();
    }
  }

  async selectAllOnPage() {
    await this.selectAllCheckbox.check();
  }

  async confirmDeleteDialog() {
    await this.deleteDialog.getByRole('button', { name: copy.confirmDelete }).click();
  }

  async cancelDeleteDialog() {
    await this.deleteDialog.getByRole('button', { name: copy.cancelDialog }).click();
  }

  waitForListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        /\/admin\/locations\/?$/.test(new URL(res.url()).pathname.replace(/\/$/, '')) &&
        res.status() === 200
    );
  }

  waitForDelete(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/locations/${id}`) &&
        res.status() === 200
    );
  }

  waitForFeaturedPatch(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/locations/${id}/featured`) &&
        res.status() === 200
    );
  }

  waitForStatusPatch(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/locations/${id}/status`) &&
        res.status() === 200
    );
  }
}
