import type { Locator, Page } from '@playwright/test';

const copy = {
  heading: /Users List|Danh sách Người dùng/,
  searchPlaceholder: /Search by name, email, username\.\.\.|Tìm theo tên, email, username\.\.\./,
  createButton: /Add User|Thêm người dùng/,
  exportButton: /Export Excel|Xuất Excel/,
  roleAll: /All Roles|Tất cả vai trò/,
  statusAll: /All Statuses|Tất cả trạng thái/,
  resetFilter: /Reset|Đặt lại/,
  blockAction: /^Block$|^Khóa$/,
  unblockAction: /^Unblock$|^Mở khóa$/,
  deleteAction: /^Delete$|^Xóa$/,
  bulkBlock: /Bulk Block|Khóa hàng loạt/,
  bulkActivate: /Bulk Activate|Kích hoạt hàng loạt/,
  bulkDelete: /Bulk Delete|Xóa hàng loạt/,
  confirmDelete: /Delete Account|Xóa tài khoản/,
  confirmBlock: /Block Account|Khóa tài khoản/,
  confirmRole: /Confirm Promotion|Xác nhận nâng quyền/,
  cancelDialog: /^Cancel$|^Hủy$/,
  colJoined: /Joined Date|Ngày tham gia/,
  roleAdmin: /^ADMIN$/,
  roleUser: /^USER$/,
  viewAction: /View details|Xem chi tiết/,
  editAction: /Edit|Chỉnh sửa/,
  networkError: /network error|Lỗi kết nối mạng|Export failed|Xuất.*thất bại/i,
  activeFilters: /Active Filters|Bộ lọc đang chọn/i,
  noDataSub: /Try changing filters|Thử thay đổi bộ lọc/,
  refresh: /Refresh|Làm mới/,
  statsTotal: /TOTAL USERS|TỔNG NGƯỜI DÙNG/,
  statsBanned: /^BANNED$|^BỊ KHÓA$/,
  statsAdmin: /^ADMIN$/,
  selfActionError: /cannot perform this action on your own|không thể tự thực hiện hành động này/i,
};

export class UserListPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get table() {
    return this.page.locator('table');
  }

  get tableRows() {
    return this.table.locator('tbody tr').filter({ has: this.page.locator('td') });
  }

  get createButton() {
    return this.page.getByRole('button', { name: copy.createButton });
  }

  get exportButton() {
    return this.page.getByRole('button', { name: copy.exportButton });
  }

  get selectAllCheckbox() {
    return this.table.locator('thead input[type="checkbox"]');
  }

  get tableCard() {
    return this.page.locator('.group\\/card').first();
  }

  get refreshButton() {
    return this.tableCard.getByRole('button', { name: copy.refresh });
  }

  get statsRow() {
    return this.page.locator('.lg\\:grid-cols-4').first();
  }

  get activeFiltersLabel() {
    return this.page.getByText(copy.activeFilters);
  }

  get bulkActivateButton() {
    return this.page.getByRole('button', { name: copy.bulkActivate });
  }

  get blockDialog() {
    return this.page.getByTestId('block-user-dialog');
  }

  rowByEmail(email: string): Locator {
    return this.tableRows.filter({ hasText: email });
  }

  rowCheckbox(row: Locator): Locator {
    return row.locator('input[type="checkbox"]');
  }

  async selectRoleFilter(label: string) {
    await this.page.getByText(copy.roleAll).first().click();
    await this.page.getByRole('option', { name: label, exact: true }).click();
  }

  async selectStatusFilter(label: string) {
    const statusPatterns: Record<string, RegExp> = {
      ACTIVE: /ACTIVE|HOẠT ĐỘNG/,
      BANNED: /BANNED|BỊ KHÓA/,
    };
    await this.page.getByText(copy.statusAll).first().click();
    const pattern = statusPatterns[label] ?? new RegExp(`^${label}$`);
    await this.page.getByRole('option', { name: pattern }).click();
  }

  async resetFilters() {
    await this.page.getByRole('button', { name: copy.resetFilter }).click();
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

  statusBadgeInRow(row: Locator): Locator {
    return row.locator('button').filter({
      hasText: /ACTIVE|HOẠT ĐỘNG|BANNED|BỊ KHÓA|CHỜ KÍCH HOẠT|PENDING/i,
    });
  }

  blockActionInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.blockAction });
  }

  unblockActionInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.unblockAction });
  }

  deleteActionInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.deleteAction });
  }

  viewActionInRow(row: Locator): Locator {
    return row.locator('td').last().locator('button').first();
  }

  editActionInRow(row: Locator): Locator {
    return row.locator('td').last().locator('button').nth(1);
  }

  roleBadgeInRow(row: Locator): Locator {
    return row.locator('button').filter({ hasText: /^(ADMIN|USER)$/ });
  }

  roleDropdownInRow(row: Locator): Locator {
    return row.locator('div.absolute');
  }

  statCard(title: RegExp): Locator {
    return this.page.locator('.grid').filter({ has: this.page.getByText(title) }).getByText(title).locator('..');
  }

  statValue(title: RegExp): Locator {
    const card = this.page.locator('div').filter({ has: this.page.getByText(title) }).first();
    return card.locator('p, span').filter({ hasText: /^\d/ }).first();
  }

  async promoteToAdmin(row: Locator) {
    await this.roleBadgeInRow(row).click();
    await row.locator('div.absolute').getByRole('button', { name: copy.roleAdmin }).click();
    await this.page.getByRole('button', { name: copy.confirmRole }).click();
  }

  async demoteToUser(row: Locator) {
    await this.roleBadgeInRow(row).click();
    await row.locator('div.absolute').getByRole('button', { name: copy.roleUser }).click();
  }

  async confirmDeleteDialog() {
    await this.page.getByRole('button', { name: copy.confirmDelete }).click();
  }

  async cancelDeleteDialog() {
    await this.page.getByRole('button', { name: copy.cancelDialog }).click();
  }

  async confirmBlockDialog() {
    await this.page.getByTestId('block-user-dialog-confirm').click();
  }

  async cancelBlockDialog() {
    await this.blockDialog.getByRole('button', { name: copy.cancelDialog }).click();
  }

  async cancelRoleDialog() {
    await this.page.getByRole('button', { name: copy.cancelDialog }).click();
  }

  async clickBulkBlock() {
    await this.page.getByRole('button', { name: copy.bulkBlock }).click();
  }

  async clickBulkActivate() {
    await this.bulkActivateButton.click();
  }

  async clickBulkDelete() {
    await this.page.getByRole('button', { name: copy.bulkDelete }).click();
  }

  async goToPage(pageNum: number) {
    await this.page.getByRole('button', { name: String(pageNum), exact: true }).click();
  }

  async clickSortJoined() {
    await this.page.getByRole('columnheader', { name: copy.colJoined }).click();
  }

  async selectPerPage(count: number) {
    await this.tableCard.scrollIntoViewIfNeeded();
    await this.tableCard.getByRole('combobox').click();
    await this.page.getByRole('option', { name: new RegExp(`${count}\\s*/\\s*(page|trang)`, 'i') }).click();
  }

  paginationPrevButton() {
    return this.tableCard.locator('.border-t').getByRole('button').first();
  }

  paginationNextButton() {
    return this.tableCard.locator('.border-t').getByRole('button').last();
  }

  async selectAllOnPage() {
    await this.selectAllCheckbox.click();
  }

  showingSummary() {
    return this.page.getByText(/Hiển thị|Showing/i).first();
  }

  async waitForTableLoaded() {
    await this.table.waitFor({ state: 'visible' });
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  async assertColumnHeaders() {
    const labels = [
      /User|Người dùng/,
      /Role|Vai trò/,
      /Orders|Đơn hàng/,
      /Reviews|Đánh giá/,
      copy.colJoined,
      /Status|Trạng thái/,
      /Actions|Thao tác/,
    ];
    for (const label of labels) {
      await this.page.getByRole('columnheader', { name: label }).waitFor({ state: 'visible' });
    }
  }

  async isSelectAllIndeterminate(): Promise<boolean> {
    return this.selectAllCheckbox.evaluate((el: HTMLInputElement) => el.indeterminate);
  }

  async triggerSelfStatusClick(email: string) {
    const badge = this.statusBadgeInRow(this.rowByEmail(email));
    await badge.evaluate((el: HTMLButtonElement) => {
      el.disabled = false;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  }
}

export { copy as userListCopy };
