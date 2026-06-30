import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const locationCategoriesCopy = {
  heading: /Danh mục Địa điểm|Location Categories/i,
  subtitle: /Quản lý các loại hình địa điểm|Manage place types/i,
  addButton: /Thêm mới|Add New/i,
  searchPlaceholder: /Tìm theo tên danh mục|Search by category name/i,
  statsTotal: /TỔNG DANH MỤC|TOTAL CATEGORIES/i,
  statsActive: /ĐANG HOẠT ĐỘNG|^ACTIVE$/i,
  statsInactive: /TẠM DỪNG|^INACTIVE$/i,
  statusActive: /Đang hoạt động|^Active$/i,
  statusInactive: /Tạm dừng|^Inactive$/i,
  statusAll: /^Tất cả$|^All$/i,
  reorderButton: /^Sắp xếp thứ tự$|^Reorder$/i,
  reorderingButton: /Đang sắp xếp|^Sorting$/i,
  reorderBarTitle: /Chế độ sắp xếp đang bật|Reorder mode is active/i,
  reorderSave: /Lưu thứ tự|Save order/i,
  reorderCancel: /^Hủy$|^Cancel$/i,
  resetFilters: /Đặt lại bộ lọc|Reset filters/i,
  emptyTitle: /Không có danh mục nào|No categories found/i,
  loadErrorTitle: /Không thể tải danh mục địa điểm|Unable to load location categories/i,
  retryButton: /Thử lại|Try again|Retry/i,
  addDrawerTitle: /Thêm danh mục|Add category/i,
  editDrawerTitle: /Chỉnh sửa danh mục|Edit category/i,
  saveButton: /Lưu thay đổi|Save [Cc]hanges/i,
  cancelDrawer: /^Hủy$|^Cancel$/i,
  deleteDialogTitle: /Xóa danh mục\?|Delete Category\?/i,
  confirmDelete: /Xóa danh mục|Delete category/i,
  createSuccess: /Tạo danh mục thành công|Category created successfully/i,
  updateSuccess: /Cập nhật danh mục thành công|Category updated successfully/i,
  deleteSuccess: /Xóa danh mục thành công|Category deleted successfully/i,
  statusUpdateSuccess: /Cập nhật trạng thái thành công|Status updated successfully/i,
  deleteBlocked: /Không thể xóa — đang có \d+ địa điểm|Cannot delete — \d+ linked places/i,
  nameRequired: /Tên danh mục là bắt buộc|Category Name is required/i,
  iconBrowserTitle: /Thư viện icon|Icon browser/i,
};

const copy = locationCategoriesCopy;

export class LocationCategoriesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/location-categories', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/location-categories', { waitUntil: 'domcontentloaded' });
    }
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForGridLoaded() {
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.goto();
    }
    await this.categoryCards.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  waitForListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/categories') &&
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

  get statsRow() {
    return this.page.getByTestId('location-category-stats');
  }

  statValue(label: RegExp) {
    return this.statsRow
      .locator('div.rounded-\\[32px\\]')
      .filter({ has: this.page.getByText(label) })
      .locator('p.text-3xl');
  }

  get searchInput() {
    return this.page.getByTestId('location-category-search');
  }

  get filterPanel() {
    return this.page.locator('.bg-white.p-4.rounded-\\[32px\\]').filter({ has: this.searchInput }).first();
  }

  filterStatusControl() {
    return this.filterPanel.locator('[class*="-control"]').first();
  }

  get resetFiltersButton() {
    return this.page.getByTestId('location-category-reset-filters');
  }

  get reorderButton() {
    return this.page.getByRole('button', { name: copy.reorderButton });
  }

  get reorderingButton() {
    return this.page.getByRole('button', { name: copy.reorderingButton });
  }

  get reorderFloatingBar() {
    return this.page.locator('.fixed.bottom-8').filter({ hasText: copy.reorderBarTitle });
  }

  get categoryCards() {
    return this.page.locator('[data-testid^="location-category-card-"]');
  }

  cardByName(name: string) {
    return this.categoryCards.filter({
      has: this.page.getByRole('heading', { level: 3, name }),
    });
  }

  deleteButtonForCategory(id: number) {
    return this.page.getByTestId(`location-category-delete-${id}`);
  }

  editButtonForCategory(id: number) {
    return this.page.getByTestId(`location-category-edit-${id}`);
  }

  statusBadgeInCard(card: Locator) {
    return card.getByTestId(/^location-category-status-/);
  }

  get drawer() {
    return this.page.getByTestId('location-category-drawer');
  }

  get deleteDialog() {
    return this.page.getByTestId('location-category-delete-dialog');
  }

  get nameInput() {
    return this.page.getByTestId('location-category-name-input');
  }

  get slugInput() {
    return this.drawer.getByPlaceholder(/am-thuc-dia-phuong|local-cuisine/i);
  }

  get descriptionInput() {
    return this.drawer.getByPlaceholder(/Mô tả ngắn|Short description/i);
  }

  get saveButton() {
    return this.page.getByTestId('location-category-save');
  }

  get cancelDrawerButton() {
    return this.drawer.getByRole('button', { name: copy.cancelDrawer });
  }

  async selectStatusFilter(option: RegExp) {
    await this.filterStatusControl().click();
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(500);
  }

  async search(keyword: string) {
    const listReq = this.waitForListResponse();
    await this.searchInput.fill(keyword);
    await listReq;
    await this.page.waitForTimeout(350);
  }

  async openAddDrawer() {
    await this.addButton.click();
    await expect(this.drawer).toHaveAttribute('aria-hidden', 'false');
    await expect(this.drawer.getByRole('heading', { name: copy.addDrawerTitle })).toBeVisible();
  }

  async openEditForName(name: string) {
    const card = this.cardByName(name);
    await card.getByTestId(/^location-category-edit-/).click();
    await expect(this.drawer).toHaveAttribute('aria-hidden', 'false');
    await expect(this.drawer.getByRole('heading', { name: copy.editDrawerTitle })).toBeVisible();
  }

  async openDeleteForName(name: string) {
    const card = this.cardByName(name);
    await card.getByTestId(/^location-category-delete-/).click();
    await this.deleteDialog.waitFor({ state: 'visible' });
  }

  async fillCreateForm(opts: { name: string; description?: string }) {
    await this.nameInput.fill(opts.name);
    if (opts.description) {
      await this.descriptionInput.fill(opts.description);
    }
  }

  async submitDrawer() {
    await this.saveButton.click();
  }

  async confirmDelete() {
    await this.page.getByTestId('location-category-delete-confirm').click();
  }

  async cancelDelete() {
    await this.page.getByTestId('location-category-delete-cancel').click();
  }

  async enterReorderMode() {
    await this.reorderButton.click();
    await expect(this.reorderFloatingBar).toBeVisible();
  }

  async cancelReorderMode() {
    await this.reorderFloatingBar.getByRole('button', { name: copy.reorderCancel }).click();
    await expect(this.reorderFloatingBar).toHaveCount(0);
  }

  async saveReorder() {
    const patchReq = this.page.waitForResponse(
      (res) =>
        res.url().includes('/admin/categories/reorder') &&
        res.request().method() === 'PATCH' &&
        res.status() === 200
    );
    await this.reorderFloatingBar.getByRole('button', { name: copy.reorderSave }).click();
    await patchReq;
  }

  async openIconBrowser() {
    await this.drawer.locator('form button[type="button"]').first().click();
    await expect(this.drawer.getByText(copy.iconBrowserTitle)).toBeVisible();
  }
}
