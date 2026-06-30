import type { Locator, Page, Response } from '@playwright/test';

export const blogDetailCopy = {
  pageTitle: /Chi tiết Bài viết|Blog Post Details/i,
  statusPublishedBadge: /ĐÃ XUẤT BẢN|PUBLISHED/i,
  statusDraftBadge: /BẢN NHÁP|DRAFT/i,
  statusArchivedBadge: /LƯU TRỮ|ARCHIVED/i,
  statusScheduledBadge: /LÊN LỊCH|SCHEDULED/i,
  statusDraftOption: /^Bản nháp$|^Draft$/i,
  statusPublishedOption: /^Đã xuất bản$|^Published$/i,
  statusArchivedOption: /^Lưu trữ$|^Archived$/i,
  editButton: /^Sửa$|^Edit$/i,
  deleteButton: /^Xóa$|^Delete$/i,
  viewPost: /Xem bài viết|View [Pp]ost/i,
  quickActions: /Thao tác nhanh|Quick Actions/i,
  editPostQuick: /Chỉnh sửa bài viết|Edit [Pp]ost/i,
  duplicatePost: /Nhân bản bài viết|Duplicate/i,
  deletePost: /Xóa bài viết|Delete/i,
  publishSection: /Trạng thái Xuất bản|Publish Status/i,
  authorSection: /Tác giả bài viết|Post Author/i,
  infoSection: /Thông tin bổ sung|Additional Info/i,
  notFoundTitle: /Không tìm thấy bài viết|Post [Nn]ot [Ff]ound/i,
  notFoundDesc: /không tồn tại hoặc đã bị xóa|does not exist or has been removed/i,
  backToListButton: /Quay lại danh sách bài viết|Back to blog list/i,
  statusSuccess: /Cập nhật trạng thái bài viết thành công|Status updated successfully/i,
  statusError: /Lỗi mạng hoặc máy chủ không phản hồi|Network error/i,
  deleteSuccess: /Đã xóa bài viết thành công|Blog post deleted successfully/i,
  duplicateSuccess: /Đã nhân bản bài viết thành công|Blog post duplicated successfully/i,
  copySlugSuccess: /Đã sao chép slug|Slug copied/i,
  duplicateConfirmTitle: /Nhân bản bài viết này|Duplicate this post/i,
  confirmDeleteTitle: /Xóa bài viết này|Delete this article/i,
  confirmButton: /^Xác nhận$|^Confirm$/i,
  cancelButton: /^Hủy$|^Cancel$/i,
  noFeaturedImage: /Không có ảnh đại diện|No featured image/i,
  noContent: /không có nội dung|has no content/i,
  previewDisabledHelper: /Chỉ có thể xem bài viết đã xuất bản|Only published articles can be viewed/i,
  contentLabel: /^Nội dung$|^Content$/i,
  excerptLabel: /Mô tả ngắn|Excerpt/i,
  slugLabel: /^Slug$/i,
};

const copy = blogDetailCopy;

export class BlogDetailPage {
  readonly page: Page;
  readonly blogId: number;

  constructor(page: Page, blogId: number) {
    this.page = page;
    this.blogId = blogId;
  }

  async goto() {
    await this.page.goto(`/admin/blog-posts/${this.blogId}`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      this.contentCard.waitFor({ state: 'visible', timeout: 25_000 }),
      this.notFoundTitle.waitFor({ state: 'visible', timeout: 25_000 }),
      this.skeletonRoot.waitFor({ state: 'visible', timeout: 25_000 }),
    ]);
  }

  async gotoAndWaitLoaded() {
    await this.goto();
    await this.postTitleHeading.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get stickyHeader() {
    return this.page.locator('.sticky.top-0').first();
  }

  get skeletonRoot() {
    return this.page.locator('.animate-pulse').filter({ has: this.page.locator('.rounded-3xl') }).first();
  }

  get pageHeading() {
    return this.stickyHeader.getByRole('heading', { level: 1, name: copy.pageTitle });
  }

  get headerPostTitle() {
    return this.stickyHeader.locator('p.text-xs.text-slate-400').first();
  }

  get backButton() {
    return this.stickyHeader.locator('button').first();
  }

  get contentCard() {
    return this.page.locator('.bg-white.rounded-3xl').filter({ has: this.postTitleHeading }).first();
  }

  get postTitleHeading() {
    return this.page.locator('h1.text-2xl, h1.text-3xl').first();
  }

  get heroImage() {
    return this.contentCard.locator('.relative.w-full img').first();
  }

  get heroFallback() {
    return this.contentCard.getByText(copy.noFeaturedImage);
  }

  get slugCode() {
    return this.contentCard.locator('code.font-mono').first();
  }

  get copySlugButton() {
    return this.contentCard.locator('button[title]').filter({ has: this.page.locator('svg') }).last();
  }

  get contentHtmlBlock() {
    return this.contentCard.locator('.prose').first();
  }

  get quickActionsCard() {
    return this.page.locator('.bg-white.rounded-3xl.hidden.lg\\:block').filter({ hasText: copy.quickActions });
  }

  get mobileFooter() {
    return this.page.locator('.md\\:hidden.fixed.bottom-0').first();
  }

  get mobilePreviewButton() {
    return this.mobileFooter.getByRole('button', { name: copy.viewPost });
  }

  get mobileEditButton() {
    return this.mobileFooter.getByRole('button', { name: copy.editButton });
  }

  get mobileDeleteButton() {
    return this.mobileFooter.getByRole('button', { name: copy.deleteButton });
  }

  get publishStatusCard() {
    return this.page.locator('.bg-white.rounded-3xl').filter({ hasText: copy.publishSection });
  }

  get authorCard() {
    return this.page.locator('.bg-white.rounded-3xl').filter({ hasText: copy.authorSection });
  }

  get infoCard() {
    return this.page.locator('.bg-white.rounded-3xl').filter({ hasText: copy.infoSection });
  }

  get statusDropdownButton() {
    return this.stickyHeader.locator('button').filter({ hasText: /ĐÃ XUẤT BẢN|BẢN NHÁP|LƯU TRỮ|PUBLISHED|DRAFT|ARCHIVED/i }).first();
  }

  get statusMenu() {
    return this.page.locator('.absolute.right-0.top-11');
  }

  get headerPreviewButton() {
    return this.stickyHeader.getByRole('button', { name: copy.viewPost });
  }

  get headerEditButton() {
    return this.stickyHeader.getByRole('button', { name: copy.editButton });
  }

  get headerDeleteButton() {
    return this.stickyHeader.getByRole('button', { name: copy.deleteButton });
  }

  get sidebarPreviewButton() {
    return this.quickActionsCard.getByRole('button', { name: copy.viewPost });
  }

  get sidebarEditButton() {
    return this.quickActionsCard.getByRole('button', { name: copy.editPostQuick });
  }

  get sidebarDuplicateButton() {
    return this.quickActionsCard.getByRole('button', { name: copy.duplicatePost });
  }

  get sidebarDeleteButton() {
    return this.quickActionsCard.getByRole('button', { name: copy.deletePost });
  }

  get duplicateModal() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.duplicateConfirmTitle });
  }

  get deleteModal() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.confirmDeleteTitle });
  }

  get duplicateConfirmButton() {
    return this.duplicateModal.getByRole('button', { name: copy.confirmButton });
  }

  get deleteConfirmButton() {
    return this.deleteModal.getByRole('button', { name: copy.deleteButton }).last();
  }

  get notFoundTitle() {
    return this.page.getByRole('heading', { level: 2, name: copy.notFoundTitle });
  }

  get notFoundBackButton() {
    return this.page.getByRole('button', { name: copy.backToListButton });
  }

  categoryBadge(name: string): Locator {
    return this.contentCard.locator('span').filter({ hasText: new RegExp(`^${name}$`) });
  }

  async openStatusDropdown() {
    await this.statusDropdownButton.click();
    await this.statusMenu.waitFor({ state: 'visible' });
  }

  async selectStatus(option: 'draft' | 'published' | 'archived') {
    const optionCopy =
      option === 'draft'
        ? copy.statusDraftOption
        : option === 'published'
          ? copy.statusPublishedOption
          : copy.statusArchivedOption;
    await this.openStatusDropdown();
    await this.statusMenu.getByRole('button', { name: optionCopy }).click();
  }

  async goBackToList() {
    await this.backButton.click();
  }

  waitForDetailGet(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        new RegExp(`/admin/blog-posts/${this.blogId}/?$`).test(new URL(res.url()).pathname.replace(/\/$/, ''))
    );
  }

  waitForStatusPatch(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/blog-posts/${this.blogId}/status`)
    );
  }

  waitForDelete(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/blog-posts/${this.blogId}`)
    );
  }
}
