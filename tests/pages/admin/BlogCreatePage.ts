import type { Buffer } from 'node:buffer';
import type { Locator, Page, Response } from '@playwright/test';
import { tinyPngBuffer } from '../../fixtures/data/blog-create.data';

export const blogCreateCopy = {
  heading: /Tạo Bài viết mới|Create New Post/i,
  titlePlaceholder: /Nhập tiêu đề bài viết|Enter post title/i,
  saveDraft: /Lưu bản nháp|Save draft/i,
  publishBtn: /^Xuất bản$|^Publish$/i,
  cancel: /^Hủy$|^Cancel$/i,
  draftSuccess: /Đã lưu bản nháp thành công|Draft saved successfully/i,
  publishSuccess: /được xuất bản|published successfully/i,
  networkError: /Lỗi mạng hoặc máy chủ không phản hồi|Network error/i,
  categoryCreateSuccess: /Tạo danh mục thành công|Category created successfully/i,
  slugAuto: /Tự động|Auto/i,
  guidelines: /Lưu ý|Guidelines/i,
  addCategory: /Thêm danh mục mới|Add new category/i,
  addCategoryBtn: /^Thêm$|^Add$/i,
  selectImage: /Chọn ảnh|Select image/i,
  draftOption: /Bản nháp|Draft/i,
  publishedOption: /Xuất bản ngay|Publish now/i,
  scheduledOption: /Lên lịch|Schedule/i,
};

const copy = blogCreateCopy;

export interface BlogCreateFormInput {
  title?: string;
  excerpt?: string;
  content?: string;
  categoryName?: string;
}

export class BlogCreatePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/blog-posts/create', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get stickyHeader() {
    return this.page.locator('.sticky.top-0').first();
  }

  get sidebar() {
    return this.page.locator('.sticky.top-28').first();
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

  get slugPreview() {
    return this.page.locator('span.font-semibold.text-slate-700').first();
  }

  get mobileFooter() {
    return this.page.locator('.fixed.bottom-0').first();
  }

  get mobileSubmitButton() {
    return this.mobileFooter.getByRole('button', { name: /Lưu bản nháp|Save draft|Xuất bản|Publish/i });
  }

  get mobileCancelButton() {
    return this.mobileFooter.getByRole('button', { name: copy.cancel });
  }

  get sidebarSubmitButton() {
    return this.sidebar.getByRole('button', { name: /Lưu bản nháp|Save draft|Xuất bản|Publish/i });
  }

  get headerSubmitButton() {
    return this.stickyHeader.getByRole('button', { name: /Lưu bản nháp|Save draft|Xuất bản|Publish/i });
  }

  get headerCancelButton() {
    return this.stickyHeader.getByRole('button', { name: copy.cancel });
  }

  get sidebarCancelButton() {
    return this.sidebar.getByRole('button', { name: copy.cancel });
  }

  get backButton() {
    return this.stickyHeader.locator('button').first();
  }

  get featuredFileInput() {
    return this.page.locator('input[type="file"][accept="image/*"]').first();
  }

  get scheduleDateInput() {
    return this.sidebar.locator('input[type="date"]');
  }

  get scheduleTimeInput() {
    return this.sidebar.locator('input[type="time"]');
  }

  get addCategoryToggle() {
    return this.page.getByRole('button', { name: copy.addCategory });
  }

  get newCategoryInput() {
    return this.page.getByPlaceholder(/Tên danh mục mới|New category name/i);
  }

  get addCategoryConfirmButton() {
    return this.sidebar.getByRole('button', { name: copy.addCategoryBtn });
  }

  categoryCheckbox(name: string): Locator {
    return this.sidebar.locator('label').filter({ hasText: name }).locator('input[type="checkbox"]');
  }

  publishOption(option: 'draft' | 'published' | 'scheduled'): Locator {
    const pattern =
      option === 'draft' ? copy.draftOption : option === 'published' ? copy.publishedOption : copy.scheduledOption;
    return this.sidebar.locator('label').filter({ hasText: pattern }).locator('input[type="radio"]');
  }

  async fillForm(input: BlogCreateFormInput) {
    if (input.title != null) await this.titleInput.fill(input.title);
    if (input.excerpt != null) {
      await this.excerptTextarea.fill(input.excerpt);
    }
    if (input.content != null) await this.contentEditor.fill(input.content);
    if (input.categoryName) await this.categoryCheckbox(input.categoryName).check();
  }

  async uploadFeaturedImage(buffer: Buffer = tinyPngBuffer) {
    await this.featuredFileInput.setInputFiles({
      name: 'featured.png',
      mimeType: 'image/png',
      buffer,
    });
    await this.page.locator('img[alt="Featured"]').waitFor({ state: 'visible', timeout: 15_000 });
  }

  async selectPublishOption(option: 'draft' | 'published' | 'scheduled') {
    await this.publishOption(option).check();
  }

  async submit() {
    if (await this.headerSubmitButton.isVisible()) {
      await this.headerSubmitButton.click();
    } else if (await this.mobileSubmitButton.isVisible()) {
      await this.mobileSubmitButton.click();
    } else {
      await this.sidebarSubmitButton.click();
    }
  }

  async submitHeader() {
    await this.headerSubmitButton.click();
  }

  async cancel() {
    if (await this.headerCancelButton.isVisible()) {
      await this.headerCancelButton.click();
    } else if (await this.sidebarCancelButton.isVisible()) {
      await this.sidebarCancelButton.click();
    } else {
      await this.mobileCancelButton.click();
    }
  }

  async prepareValidSubmit(input: BlogCreateFormInput) {
    await this.fillForm(input);
    await this.uploadFeaturedImage();
  }

  waitForCreatePost(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/admin\/blog-posts\/?$/.test(new URL(res.url()).pathname.replace(/\/$/, '')) &&
        res.status() === 201
    );
  }
}
