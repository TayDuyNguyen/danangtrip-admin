import type { Locator, Page, Response } from '@playwright/test';

export const blogListCopy = {
  heading: /Danh sách Bài viết|Blog Posts/i,
  subtitle: /Quản lý nội dung bài viết du lịch|Manage Da Nang tourism blog content/i,
  searchPlaceholder: /Tìm theo tiêu đề bài viết|Search by article title/i,
  statsTotal: /TỔNG BÀI VIẾT|TOTAL POSTS/i,
  statsPublished: /ĐÃ XUẤT BẢN|PUBLISHED/i,
  statsDraft: /BẢN NHÁP|DRAFTS?/i,
  statsArchived: /LƯU TRỮ|ARCHIVED/i,
  addButton: /Thêm mới|Add New/i,
  resetFilter: /^Đặt lại$|^Reset$/i,
  statusDraft: /^Bản nháp$|^Draft$/i,
  statusPublished: /^Đã xuất bản$|^Published$/i,
  statusArchived: /^Lưu trữ$|^Archived$/i,
  bulkPublish: /^Xuất bản$|^Publish$/i,
  bulkArchive: /^Lưu trữ$|^Archive$/i,
  bulkDelete: /^Xóa$|^Delete$/i,
  bulkSelected: /Đã chọn|Selected/i,
  deleteDialogTitle: /Xóa bài viết này|Delete this post/i,
  bulkDeleteDialogTitle: /Xóa các bài viết đã chọn|Delete selected posts/i,
  confirmDelete: /^(Xóa|Delete)$/i,
  cancelDialog: /^Hủy$|^Cancel$/i,
  viewAction: /^Xem$|^View$/i,
  editAction: /^Sửa$|^Edit$/i,
  deleteAction: /^Xóa$|^Delete$/i,
  emptyTitle: /Không tìm thấy bài viết nào|No articles found/i,
  emptySubtitle: /Thử thay đổi bộ lọc|Try changing the filters/i,
  deleteSuccess: /Đã xóa bài viết thành công|Blog post deleted successfully/i,
  networkError: /Lỗi mạng hoặc máy chủ không phản hồi|Network error/i,
  listLoadError: /Không tải được danh sách bài viết|Failed to load blog posts/i,
  retryButton: /Thử lại|Retry/i,
  statusSuccess: /Cập nhật trạng thái bài viết thành công|Blog post status updated successfully/i,
  bulkDeleteSuccess: /Đã xóa các bài viết thành công|Blog posts deleted successfully/i,
  bulkStatusSuccess: /Đã cập nhật trạng thái các bài viết|Blog posts status updated successfully/i,
  bulkPartialError: /Một số bài viết không thể cập nhật|Some posts could not be updated/i,
  activeFiltersLabel: /Bộ lọc đang kích hoạt|Active filters/i,
  scheduledBadge: /LÊN LỊCH|SCHEDULED/i,
  refresh: /Làm mới|Refresh/i,
  colViews: /Lượt xem|Views/i,
  colCreated: /Ngày tạo|Created At/i,
};

const copy = blogListCopy;

export class BlogListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/blog-posts', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async gotoLegacyBlogRoute() {
    await this.page.goto('/admin/blog', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  get activeFiltersRow() {
    return this.filterForm.locator('.border-t').filter({ hasText: copy.activeFiltersLabel });
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

  get filterForm() {
    return this.page.locator('form').filter({ has: this.searchInput });
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get addButton() {
    return this.page.getByRole('button', { name: copy.addButton });
  }

  get resetFilterButton() {
    return this.filterForm.getByRole('button', { name: copy.resetFilter });
  }

  get listErrorPanel() {
    return this.page.getByTestId('blog-list-error');
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

  get bulkPublishButton() {
    return this.tableCard.getByRole('button', { name: copy.bulkPublish });
  }

  get bulkArchiveButton() {
    return this.tableCard.getByRole('button', { name: copy.bulkArchive });
  }

  get bulkDeleteButton() {
    return this.tableCard.getByRole('button', { name: copy.bulkDelete, exact: true });
  }

  get bulkSelectedLabel() {
    return this.tableCard.getByText(copy.bulkSelected);
  }

  get deleteDialog() {
    return this.page.locator('.fixed.inset-0').filter({
      hasText: /Xóa bài viết này|Delete this post|Xóa các bài viết đã chọn|Delete selected posts/i,
    });
  }

  get paginationBar() {
    return this.tableCard.locator('.border-t').last();
  }

  rowByTitle(title: string): Locator {
    return this.tableRows.filter({ hasText: title });
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

  titleLinkInRow(row: Locator): Locator {
    return row.locator('h4').first();
  }

  statusButtonInRow(row: Locator): Locator {
    return row.locator('td').nth(6).locator('button').first();
  }

  sortHeader(label: RegExp): Locator {
    return this.table.locator('th').filter({ hasText: label });
  }

  private filterSelectControl(index: number): Locator {
    return this.filterForm.locator('[class*="-control"]').nth(index);
  }

  async selectCategoryFilter(option: string) {
    await this.filterSelectControl(0).click();
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(400);
  }

  async selectStatusFilter(option: RegExp) {
    await this.filterSelectControl(1).click();
    await this.page.getByRole('option', { name: option }).click();
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
    await this.tableCard.locator('[class*="-control"]').first().click();
    await this.page.getByRole('option', { name: new RegExp(`${count}.*(page|dòng|trang)`, 'i') }).click();
    await this.page.waitForTimeout(350);
  }

  async goToPage(pageNum: number) {
    await this.paginationBar.getByRole('button', { name: String(pageNum), exact: true }).click();
    await this.page.waitForTimeout(350);
  }

  async selectRowsByTitle(...titles: string[]) {
    for (const title of titles) {
      await this.rowCheckbox(this.rowByTitle(title)).check();
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

  async changeRowStatus(row: Locator, statusOption: RegExp) {
    await this.statusButtonInRow(row).click();
    await this.page
      .locator('.absolute.left-4.top-12')
      .getByRole('button', { name: statusOption })
      .click();
    await this.page.waitForTimeout(300);
  }

  waitForListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        /\/admin\/blog-posts\/?$/.test(new URL(res.url()).pathname.replace(/\/$/, '')) &&
        res.status() === 200
    );
  }

  waitForDelete(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/blog-posts/${id}`) &&
        res.status() === 200
    );
  }

  waitForStatusPatch(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/blog-posts/${id}/status`) &&
        res.status() === 200
    );
  }
}
