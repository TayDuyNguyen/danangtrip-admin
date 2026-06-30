import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const blogCategoriesCopy = {
  heading: /Danh mục bài viết|Blog Categories|Article Categories/i,
  subtitle: /Quản lý danh mục phân loại|Manage.*categor/i,
  addButton: /Thêm danh mục mới|Add.*categor/i,
  searchPlaceholder: /Tìm danh mục|Search categor/i,
  statsTotalCategories: /TỔNG DANH MỤC|TOTAL CATEGORIES/i,
  statsTotalPosts: /TỔNG BÀI VIẾT|TOTAL POSTS/i,
  statsScopeNote: /Thống kê toàn hệ thống|System-wide stats/i,
  reorderButton: /Sắp xếp thứ tự|Sort order/i,
  reorderingButton: /Đang sắp xếp|Sorting/i,
  reorderBarTitle: /Kéo thả để thay đổi|Drag.*reorder/i,
  reorderSave: /Lưu thứ tự|Save order/i,
  reorderCancel: /^Hủy$|^Cancel$/i,
  resetSearch: /Xóa tìm kiếm|Clear search/i,
  emptySearchTitle: /Không tìm thấy kết quả|No results found/i,
  emptyTitle: /Chưa có danh mục nào|No categories yet/i,
  loadErrorTitle: /Không tải được danh mục|Failed to load categor/i,
  retryButton: /Thử lại|Try again|Reset/i,
  addFormTitle: /Thêm danh mục|Add categor/i,
  editFormTitle: /Chỉnh sửa danh mục|Edit categor/i,
  createButton: /Tạo mới|Create/i,
  saveButton: /Lưu thay đổi|Save Changes/i,
  cancelForm: /^Hủy$|^Cancel$/i,
  deleteDialogTitle: /Xóa danh mục này\?|Delete this categor/i,
  confirmDelete: /Xóa danh mục|Delete categor/i,
  deleteBlocked: /Không thể xóa|Cannot delete/i,
  createSuccess: /Tạo danh mục thành công|Category created successfully/i,
  updateSuccess: /Cập nhật danh mục thành công|Category updated successfully/i,
  deleteSuccess: /Xóa danh mục thành công|Category deleted successfully/i,
  reorderSuccess: /cập nhật thứ tự danh mục|order.*updated/i,
  nameRequired: /Tên danh mục không được để trống|Category name.*required/i,
  previewLabel: /XEM TRƯỚC|PREVIEW/i,
};

const copy = blogCategoriesCopy;

export class BlogCategoriesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/blog-categories', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/blog-categories', { waitUntil: 'domcontentloaded' });
    }
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForListLoaded() {
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      await this.goto();
    }
    await this.categoryCards.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  waitForListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/blog-categories') &&
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

  get addHeaderButton() {
    return this.page.getByTestId('blog-category-add-button');
  }

  get statsRow() {
    return this.page.getByTestId('blog-category-stats');
  }

  get statsScopeNote() {
    return this.page.getByText(copy.statsScopeNote);
  }

  statValue(label: RegExp) {
    return this.statsRow
      .locator('.bg-white.rounded-3xl')
      .filter({ has: this.page.getByText(label) })
      .locator('h3');
  }

  get searchInput() {
    return this.page.getByTestId('blog-category-search');
  }

  get resetSearchButton() {
    return this.page.getByTestId('blog-category-reset-search');
  }

  get reorderButton() {
    return this.page.getByTestId('blog-category-reorder-button');
  }

  get reorderingButton() {
    return this.page.getByRole('button', { name: copy.reorderingButton });
  }

  get reorderFloatingBar() {
    return this.page.getByTestId('blog-category-reorder-bar');
  }

  get categoryCards() {
    return this.page.locator('[data-testid^="blog-category-card-"]');
  }

  cardByName(name: string) {
    return this.categoryCards.filter({
      has: this.page.getByRole('heading', { level: 4, name }),
    });
  }

  cardById(id: number) {
    return this.page.getByTestId(`blog-category-card-${id}`);
  }

  deleteButtonForId(id: number) {
    return this.page.getByTestId(`blog-category-delete-${id}`);
  }

  postsLinkForId(id: number) {
    return this.page.getByTestId(`blog-category-posts-link-${id}`);
  }

  get formPanel() {
    return this.page.getByTestId('blog-category-form');
  }

  get nameInput() {
    return this.page.getByTestId('blog-category-name-input');
  }

  get slugInput() {
    return this.page.getByTestId('blog-category-slug-input');
  }

  get descriptionInput() {
    return this.page.getByTestId('blog-category-description-input');
  }

  get submitButton() {
    return this.page.getByTestId('blog-category-form-submit');
  }

  get cancelFormButton() {
    return this.page.getByTestId('blog-category-form-cancel');
  }

  get deleteDialog() {
    return this.page.getByTestId('blog-category-delete-dialog');
  }

  editButtonInCard(card: Locator) {
    return card.locator('[data-testid^="blog-category-edit-"]');
  }

  deleteButtonInCard(card: Locator) {
    return card.locator('[data-testid^="blog-category-delete-"]');
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(300);
  }

  async openAddForm() {
    await this.addHeaderButton.click();
    await expect(this.formPanel.getByText(copy.addFormTitle)).toBeVisible();
  }

  async openEditForName(name: string) {
    const card = this.cardByName(name);
    await this.editButtonInCard(card).click();
    await expect(this.formPanel.getByText(copy.editFormTitle)).toBeVisible();
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

  async submitForm() {
    await this.submitButton.click();
  }

  async confirmDelete() {
    await this.deleteDialog.getByTestId('blog-category-delete-confirm').click();
  }

  async cancelDelete() {
    await this.deleteDialog.getByTestId('blog-category-delete-cancel').click();
  }

  async enterReorderMode() {
    await this.reorderButton.click();
    await expect(this.reorderFloatingBar).toBeVisible();
  }

  async cancelReorderMode() {
    await this.reorderFloatingBar.getByTestId('blog-category-reorder-cancel').click();
    await expect(this.reorderFloatingBar).toHaveCount(0);
  }

  async saveReorder() {
    const patchReq = this.page.waitForResponse(
      (res) =>
        res.url().includes('/admin/blog-categories/reorder') &&
        res.request().method() === 'PATCH' &&
        res.status() === 200
    );
    await this.reorderFloatingBar.getByTestId('blog-category-reorder-save').click();
    await patchReq;
  }
}
