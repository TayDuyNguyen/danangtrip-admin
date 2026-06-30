import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const tourCategoriesCopy = {
  heading: /Quản lý Danh mục Tour|Tour Category Management/i,
  subtitle: /Phân loại và quản lý các nhóm sản phẩm|Categorize and manage travel tour groups/i,
  addButton: /Thêm mới|Add New/i,
  searchPlaceholder: /Tìm kiếm danh mục|Search categories/i,
  statsTotalTours: /Tổng tour liên kết|Linked tours total/i,
  statsActiveCategories: /Danh mục đang hoạt động|Active categories/i,
  statsInactiveCategories: /Danh mục tạm ẩn|Hidden categories/i,
  statusActive: /Đang hoạt động|^Active$/i,
  statusInactive: /Tạm ẩn|^Hidden$/i,
  statusAll: /Tất cả trạng thái|All statuses/i,
  reorderButton: /^Sắp xếp$|^Reorder$/i,
  reorderingButton: /Đang sắp xếp|Reordering/i,
  reorderBarTitle: /Chế độ sắp xếp|Reorder mode/i,
  reorderSave: /Lưu thứ tự mới|Save new order/i,
  reorderCancel: /^Hủy$|^Cancel$/i,
  resultsLabel: /Kết quả:|Results:/i,
  emptyTitle: /Không có danh mục nào|No categories found/i,
  loadErrorTitle: /Lỗi tải dữ liệu|Data Loading Error/i,
  retryButton: /Thử lại|Try again|Retry/i,
  addDrawerTitle: /Thêm danh mục|Add category/i,
  editDrawerTitle: /Sửa danh mục|Edit category/i,
  saveButton: /Lưu thay đổi|Save Changes/i,
  cancelDrawer: /^Hủy$|^Cancel$/i,
  deleteDialogTitle: /Xóa danh mục này\?|Delete this category\?/i,
  confirmDelete: /Xóa danh mục|Delete category/i,
  createSuccess: /Đã tạo danh mục thành công|Category created successfully/i,
  updateSuccess: /Đã cập nhật danh mục thành công|Category updated successfully/i,
  deleteSuccess: /Đã xóa danh mục thành công|Category deleted successfully/i,
  deleteBlocked: /Không thể xóa danh mục vì đang có tour liên kết|Cannot delete category because it has linked tours/i,
  nameRequired: /Vui lòng nhập tên danh mục|Category name is required/i,
  iconBrowserTitle: /Thư viện biểu tượng|Icon library/i,
};

const copy = tourCategoriesCopy;

export class TourCategoriesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/tour-categories', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/tour-categories', { waitUntil: 'domcontentloaded' });
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
        res.url().includes('/api/v1/admin/tour-categories') &&
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
    return this.page.getByTestId('tour-category-stats');
  }

  statValue(label: RegExp) {
    return this.statsRow
      .locator('div.rounded-\\[32px\\]')
      .filter({ has: this.page.getByText(label) })
      .locator('p.text-3xl');
  }

  get searchInput() {
    return this.page.getByTestId('tour-category-search');
  }

  get filterPanel() {
    return this.page.locator('.bg-white.p-4.rounded-\\[32px\\]').filter({ has: this.searchInput }).first();
  }

  filterStatusControl() {
    return this.filterPanel.locator('[class*="-control"]').first();
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
    return this.page.locator('.bg-white.rounded-\\[32px\\].border').filter({
      has: this.page.locator('h3.font-black'),
    });
  }

  cardByName(name: string) {
    return this.categoryCards.filter({
      has: this.page.getByRole('heading', { level: 3, name }),
    });
  }

  deleteButtonForCategory(id: number) {
    return this.page.getByTestId(`tour-category-delete-${id}`);
  }

  editButtonForCategory(id: number) {
    return this.page.getByTestId(`tour-category-edit-${id}`);
  }

  statusBadgeInCard(card: Locator) {
    return card.getByRole('button').filter({ hasText: /Đang hoạt động|Tạm ẩn|Active|Hidden/i }).first();
  }

  editButtonInCard(card: Locator) {
    return card.getByTestId(/^tour-category-edit-/);
  }

  deleteButtonInCard(card: Locator) {
    return card.getByTestId(/^tour-category-delete-/);
  }

  get drawer() {
    return this.page.getByTestId('tour-category-drawer');
  }

  get deleteDialog() {
    return this.page.getByTestId('tour-category-delete-dialog');
  }

  get nameInput() {
    return this.page.getByTestId('tour-category-name-input');
  }

  get descriptionInput() {
    return this.drawer.getByPlaceholder(/Nhập mô tả ngắn|Enter a short description/i);
  }

  get saveButton() {
    return this.page.getByTestId('tour-category-save');
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

  async clearSearch() {
    const listReq = this.waitForListResponse();
    await this.searchInput.clear();
    await listReq;
    await this.page.waitForTimeout(350);
  }

  async openAddDrawer() {
    await this.addButton.click();
    await expect(this.drawer).toHaveAttribute('aria-hidden', 'false');
    await expect(this.drawer.getByText(copy.addDrawerTitle)).toBeVisible();
  }

  async openEditForName(name: string) {
    const card = this.cardByName(name);
    await this.editButtonInCard(card).click();
    await expect(this.drawer).toHaveAttribute('aria-hidden', 'false');
    await expect(this.drawer.getByText(copy.editDrawerTitle)).toBeVisible();
  }

  async openDeleteForName(name: string) {
    const card = this.cardByName(name);
    await this.deleteButtonInCard(card).click();
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
    await this.page.getByTestId('tour-category-delete-confirm').click();
  }

  async cancelDelete() {
    await this.page.getByTestId('tour-category-delete-cancel').click();
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
        res.url().includes('/admin/tour-categories/reorder') &&
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

  async clickRetryOnError() {
    const listReq = this.waitForListResponse();
    await this.page.getByRole('button', { name: copy.retryButton }).click();
    await listReq;
  }
}
