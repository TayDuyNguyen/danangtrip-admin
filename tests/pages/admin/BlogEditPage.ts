import type { Buffer } from 'node:buffer';
import type { Locator, Page, Response } from '@playwright/test';
import { tinyPngBuffer } from '../../fixtures/data/blog-edit.data';

export const blogEditCopy = {
  heading: /Chỉnh sửa Bài viết|Edit Blog Post/i,
  saveChanges: /Lưu thay đổi|Save [Cc]hanges/i,
  cancel: /^Hủy$|^Cancel$/i,
  updateSuccess: /Cập nhật bài viết thành công|Blog post updated successfully/i,
  updateError: /Cập nhật bài viết thất bại|Failed to update blog post/i,
  deleteSuccess: /Đã xóa bài viết thành công|Blog post deleted successfully/i,
  duplicateSuccess: /Đã nhân bản bài viết thành công|Blog post duplicated successfully/i,
  networkError: /Lỗi mạng hoặc máy chủ không phản hồi|Network error/i,
  categoryCreateSuccess: /Tạo danh mục thành công|Category created successfully/i,
  slugWarning: /Thay đổi slug sẽ làm thay đổi URL|Changing the slug will change/i,
  quickActions: /Thao tác nhanh|Quick Actions/i,
  viewPost: /Xem bài viết|View [Pp]ost/i,
  duplicatePost: /Nhân bản bài viết|Duplicate/i,
  deletePost: /Xóa bài viết|Delete/i,
  duplicateConfirmTitle: /Nhân bản bài viết này|Duplicate this post/i,
  confirmDeleteTitle: /Xóa bài viết này|Delete this article/i,
  confirmButton: /^Xác nhận$|^Confirm$/i,
  notFoundTitle: /Không tìm thấy bài viết|Post [Nn]ot [Ff]ound/i,
  backToList: /Quay lại danh sách bài viết|Back to blog list/i,
  infoSection: /THÔNG TIN|INFORMATION/i,
  draftOption: /Bản nháp|Draft/i,
  publishedOption: /Xuất bản ngay|Publish immediately/i,
  scheduledOption: /Lên lịch|Schedule/i,
  archivedOption: /Lưu trữ|Archived/i,
  addCategory: /Thêm danh mục mới|Add [Nn]ew [Cc]ategory/i,
  addCategoryBtn: /^Thêm$|^Add$/i,
  titlePlaceholder: /Nhập tiêu đề bài viết|Enter post title/i,
  previewDisabledHelper: /Chỉ có thể xem bài viết đã xuất bản|Only published articles can be viewed/i,
};

const copy = blogEditCopy;

export class BlogEditPage {
  readonly page: Page;
  readonly blogId: number;

  constructor(page: Page, blogId: number) {
    this.page = page;
    this.blogId = blogId;
  }

  async goto() {
    await this.page.goto(`/admin/blog-posts/edit/${this.blogId}`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      this.titleInput.waitFor({ state: 'visible', timeout: 25_000 }),
      this.notFoundTitle.waitFor({ state: 'visible', timeout: 25_000 }),
    ]);
  }

  async gotoAndWaitLoaded() {
    await this.goto();
    await this.titleInput.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get stickyHeader() {
    return this.page.locator('.sticky.top-0').first();
  }

  get formSidebar() {
    return this.page.locator('.sticky.top-28').first();
  }

  get quickActionsCard() {
    return this.page.locator('.bg-white.rounded-3xl').filter({ hasText: copy.quickActions });
  }

  get titleInput() {
    return this.page.getByPlaceholder(copy.titlePlaceholder);
  }

  get excerptTextarea() {
    return this.page.getByPlaceholder(/Mô tả ngắn gọn về bài viết|brief description of the post/i);
  }

  get contentEditor() {
    return this.page.locator('.rc-md-editor textarea, .sec-md-textarea').first();
  }

  get headerSaveButton() {
    return this.stickyHeader.getByRole('button', { name: copy.saveChanges });
  }

  get sidebarSaveButton() {
    return this.formSidebar.getByRole('button', { name: copy.saveChanges });
  }

  get mobileFooter() {
    return this.page.locator('.fixed.bottom-0').first();
  }

  get mobileSaveButton() {
    return this.mobileFooter.getByRole('button', { name: copy.saveChanges });
  }

  get headerCancelButton() {
    return this.stickyHeader.getByRole('button', { name: copy.cancel });
  }

  get sidebarCancelButton() {
    return this.formSidebar.getByRole('button', { name: copy.cancel });
  }

  get backButton() {
    return this.stickyHeader.locator('button').first();
  }

  get headerPostTitle() {
    return this.stickyHeader.locator('p.text-xs.text-slate-400').first();
  }

  get slugWarning() {
    return this.page.getByText(copy.slugWarning);
  }

  get featuredFileInput() {
    return this.page.locator('input[type="file"][accept="image/*"]').first();
  }

  get scheduleDateInput() {
    return this.formSidebar.locator('input[type="date"]');
  }

  get scheduleTimeInput() {
    return this.formSidebar.locator('input[type="time"]');
  }

  get addCategoryToggle() {
    return this.page.getByRole('button', { name: copy.addCategory });
  }

  get newCategoryInput() {
    return this.page.getByPlaceholder(/Tên danh mục mới|New category name/i);
  }

  get addCategoryConfirmButton() {
    return this.formSidebar.getByRole('button', { name: copy.addCategoryBtn });
  }

  get viewPostHeaderButton() {
    return this.stickyHeader.getByRole('button', { name: copy.viewPost });
  }

  get viewPostQuickButton() {
    return this.quickActionsCard.getByRole('button', { name: copy.viewPost });
  }

  get duplicateQuickButton() {
    return this.quickActionsCard.getByRole('button', { name: copy.duplicatePost });
  }

  get deleteQuickButton() {
    return this.quickActionsCard.getByRole('button', { name: copy.deletePost });
  }

  get duplicateModal() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.duplicateConfirmTitle });
  }

  get deleteModal() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.confirmDeleteTitle });
  }

  get deleteConfirmButton() {
    return this.deleteModal.getByRole('button', { name: /^Xóa$|^Delete$/i }).last();
  }

  get notFoundTitle() {
    return this.page.getByRole('heading', { name: copy.notFoundTitle });
  }

  get notFoundBackButton() {
    return this.page.getByRole('button', { name: copy.backToList });
  }

  categoryCheckbox(name: string): Locator {
    return this.formSidebar.locator('label').filter({ hasText: name }).locator('input[type="checkbox"]');
  }

  publishOption(option: 'draft' | 'published' | 'scheduled' | 'archived'): Locator {
    const pattern =
      option === 'draft'
        ? copy.draftOption
        : option === 'published'
          ? copy.publishedOption
          : option === 'scheduled'
            ? copy.scheduledOption
            : copy.archivedOption;
    return this.formSidebar.locator('label').filter({ hasText: pattern }).locator('input[type="radio"]');
  }

  async submit() {
    if (await this.headerSaveButton.isVisible()) {
      await this.headerSaveButton.click();
    } else if (await this.mobileSaveButton.isVisible()) {
      await this.mobileSaveButton.click();
    } else {
      await this.sidebarSaveButton.click();
    }
  }

  async cancel() {
    if (await this.headerCancelButton.isVisible()) {
      await this.headerCancelButton.click();
    } else if (await this.sidebarCancelButton.isVisible()) {
      await this.sidebarCancelButton.click();
    } else {
      await this.mobileFooter.getByRole('button', { name: copy.cancel }).click();
    }
  }

  async selectPublishOption(option: 'draft' | 'published' | 'scheduled' | 'archived') {
    await this.publishOption(option).check();
  }

  async uploadFeaturedImage(buffer: Buffer = tinyPngBuffer) {
    await this.featuredFileInput.setInputFiles({
      name: 'featured-edit.png',
      mimeType: 'image/png',
      buffer,
    });
    await this.page.locator('img[alt="Featured"]').waitFor({ state: 'visible', timeout: 15_000 });
  }

  waitForUpdatePut(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        new RegExp(`/admin/blog-posts/${this.blogId}/?$`).test(
          new URL(res.url()).pathname.replace(/\/$/, '')
        )
    );
  }

  waitForDelete(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new RegExp(`/admin/blog-posts/${this.blogId}/?$`).test(
          new URL(res.url()).pathname.replace(/\/$/, '')
        )
    );
  }
}
