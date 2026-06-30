import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const promotionsCopy = {
  heading: /Quản lý Khuyến mãi|Promotions & Discounts/i,
  subtitle: /Quản lý các chiến dịch khuyến mãi|Manage discount codes/i,
  addButton: /Thêm mã giảm giá mới|Add New Promotion/i,
  searchPlaceholder: /Tìm kiếm theo mã hoặc tên|Search by code or name/i,
  statsTotal: /Tổng số mã|Total codes/i,
  statsActive: /Đang chạy \(trang này\)|Active \(this page\)/i,
  statsUsed: /Lượt dùng \(trang này\)|Uses \(this page\)/i,
  validNowFilter: /Đang có hiệu lực lúc này|Valid Right Now/i,
  resetFilter: /Đặt lại bộ lọc|Reset filters/i,
  statusAll: /Tất cả trạng thái|All statuses/i,
  statusActive: /Đang chạy|Active/i,
  statusInactive: /Tạm ngưng|Suspended/i,
  statusExpired: /Hết hạn|Expired/i,
  emptyTitle: /Không tìm thấy mã khuyến mãi nào|No promotion codes found/i,
  saveButton: /Lưu thông tin|Save Changes/i,
  cancelDrawer: /^Hủy bỏ$|^Cancel$/i,
  editDrawerTitle: /Chỉnh sửa mã|Edit Code/i,
  addDrawerTitle: /Thêm mã giảm giá mới|Add New Promotion/i,
  deleteDialogTitle: /Xác nhận xóa|Confirm delete/i,
  confirmDelete: /Đồng ý xóa|Delete promotion/i,
  cancelDelete: /^Hủy bỏ$|^Cancel$/i,
  createSuccess: /Đã tạo mã khuyến mãi thành công|Promotion created successfully/i,
  updateSuccess: /Cập nhật mã khuyến mãi thành công|Promotion updated successfully/i,
  statusSuccess: /Đã cập nhật trạng thái hoạt động|Status updated/i,
  deleteSuccess: /Đã xóa mã khuyến mãi thành công|Promotion deleted/i,
  codeRequired: /Vui lòng nhập mã giảm giá|Discount code is required/i,
  nameRequired: /Vui lòng nhập tên chương trình|Campaign name is required/i,
  discountValueMin: /Giá trị giảm phải lớn hơn 0|greater than 0/i,
  endsAfterStarts: /Ngày kết thúc phải sau ngày bắt đầu|End date must be after start date/i,
  typePercent: /Theo phần trăm|Percentage/i,
  typeFixed: /Số tiền cố định|Fixed [Aa]mount/i,
  removeFilter: /Xóa lọc|Remove filter/i,
  createFailed: /Tạo mã khuyến mãi thất bại|Failed to create promotion/i,
  updateFailed: /Cập nhật mã khuyến mãi thất bại|Failed to update promotion/i,
};

const copy = promotionsCopy;

export class PromotionsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/promotions', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/promotions', { waitUntil: 'domcontentloaded' });
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
        res.url().includes('/api/v1/admin/promotions') &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get subtitle() {
    return this.page.getByText(copy.subtitle).first();
  }

  get addButton() {
    return this.page.getByRole('button', { name: copy.addButton });
  }

  get statsGrid() {
    return this.page.locator('.grid').filter({ hasText: copy.statsTotal }).first();
  }

  statValue(label: RegExp) {
    return this.statsGrid
      .locator('div.rounded-3xl')
      .filter({ has: this.page.getByText(label) })
      .locator('p.text-3xl');
  }

  get filterPanel() {
    return this.page.locator('.bg-white.border').filter({ has: this.searchInput }).first();
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get validNowButton() {
    return this.filterPanel.getByRole('button', { name: copy.validNowFilter });
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
      has: this.page.locator('button[title*="Edit"], button[title*="Chỉnh"]'),
    });
  }

  get listErrorPanel() {
    return this.page.getByTestId('promotion-list-error');
  }

  get paginationBar() {
    return this.tableCard.locator('.border-t').last();
  }

  get drawerPanel() {
    return this.page.locator('.fixed.inset-y-0.right-0').filter({ has: this.page.locator('h2') }).first();
  }

  get drawer() {
    return this.drawerPanel;
  }

  async expectDrawerClosed() {
    await expect(this.drawerPanel).toHaveClass(/translate-x-full/, { timeout: 8_000 });
  }

  get deleteDialog() {
    return this.page.getByTestId('promotion-delete-dialog');
  }

  rowByCode(code: string): Locator {
    return this.tableRows.filter({ hasText: code });
  }

  editButtonInRow(row: Locator): Locator {
    return row.locator('button[title*="Chỉnh"], button[title*="Edit"]').first();
  }

  deleteButtonInRow(row: Locator): Locator {
    return row.locator('button[title*="Xóa"], button[title*="Remove"]').first();
  }

  toggleInRow(row: Locator): Locator {
    return row.locator('button.rounded-full').first();
  }

  private filterStatusControl() {
    return this.filterPanel.locator('[class*="-control"]').first();
  }

  get filterTagsBar() {
    return this.filterPanel.locator('.border-t.border-slate-100');
  }

  async removeFilterTag(tagLabel: RegExp) {
    const tag = this.filterTagsBar.locator('div.rounded-full').filter({ hasText: tagLabel });
    const listReq = this.waitForListResponse();
    await tag.getByRole('button', { name: copy.removeFilter }).click();
    await listReq;
    await this.page.waitForTimeout(300);
  }

  async removeFilterTagByKey(key: 'status' | 'valid_now') {
    await this.page.getByTestId(`promotion-filter-remove-${key}`).click();
    await this.page.waitForTimeout(500);
  }

  async selectStatusFilter(option: RegExp) {
    await this.filterStatusControl().click();
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
    await this.page.waitForTimeout(500);
  }

  async toggleValidNow() {
    await this.validNowButton.click();
    await this.page.waitForTimeout(500);
  }

  async openAddDrawer() {
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.goto();
    }
    await this.addButton.click();
    await this.drawer.waitFor({ state: 'visible' });
  }

  async openEditForCode(code: string) {
    const row = this.rowByCode(code);
    await this.editButtonInRow(row).click();
    await this.drawer.waitFor({ state: 'visible' });
  }

  get codeInput() {
    return this.drawer.getByPlaceholder(/Ví dụ: SUMMER50|e\.g\. SUMMER50/i);
  }

  get nameInput() {
    return this.drawer.getByPlaceholder(/Khuyến mãi hè rực rỡ|Summer promotion/i);
  }

  get discountValueInput() {
    return this.drawer.locator('input[type="number"]').nth(0);
  }

  get usageLimitInput() {
    return this.drawer.locator('input[placeholder="100"]');
  }

  get startsAtInput() {
    return this.drawer.locator('input[type="datetime-local"]').first();
  }

  get endsAtInput() {
    return this.drawer.locator('input[type="datetime-local"]').nth(1);
  }

  get saveButton() {
    return this.drawer.getByRole('button', { name: copy.saveButton });
  }

  get cancelDrawerButton() {
    return this.drawer.getByRole('button', { name: copy.cancelDrawer });
  }

  async selectDiscountType(option: RegExp) {
    const control = this.drawer.locator('[class*="-control"]').first();
    await control.click();
    const menu = this.page.locator('[class*="-menu"]').last();
    await menu.getByRole('option', { name: option }).click();
  }

  async fillCreatePercentForm(opts: {
    code: string;
    name: string;
    discountValue: string;
    usageLimit?: string;
    startsAt?: string;
    endsAt?: string;
  }) {
    await this.codeInput.fill(opts.code);
    await this.nameInput.fill(opts.name);
    await this.discountValueInput.fill(opts.discountValue);
    if (opts.usageLimit) await this.usageLimitInput.fill(opts.usageLimit);
    if (opts.startsAt) await this.startsAtInput.fill(opts.startsAt);
    if (opts.endsAt) await this.endsAtInput.fill(opts.endsAt);
  }

  async submitDrawer() {
    await this.saveButton.click();
  }

  async confirmDelete() {
    await this.deleteDialog.getByTestId('promotion-delete-confirm').click();
  }

  async cancelDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.cancelDelete }).click();
  }

  async changeLimit(count: number) {
    const listReq = this.waitForListResponse();
    await this.tableCard.locator('[class*="-control"]').first().click();
    await this.page.getByRole('option', { name: new RegExp(`${count}.*(page|dòng|trang)`, 'i') }).click();
    await listReq;
  }

  async goToPage(pageNum: number) {
    const listReq = this.waitForListResponse();
    await this.paginationBar.getByRole('button', { name: String(pageNum), exact: true }).click();
    await listReq;
  }
}
