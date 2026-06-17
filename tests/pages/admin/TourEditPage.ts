import type { Locator, Page, Response } from '@playwright/test';

import { TourCreatePage, tourCreateCopy } from './TourCreatePage';

const editCopy = {
  ...tourCreateCopy,
  heading: /Chỉnh sửa Tour|Edit.*Tour/i,
  saveChanges: /Lưu thay đổi|Save changes/i,
  updateSuccessToast: /Cập nhật tour thành công|Tour updated successfully/i,
  updateErrorToast: /Lỗi|error|failed/i,
  deleteSuccessToast: /Đã xóa tour thành công|deleted successfully/i,
  fetchErrorTitle: /Không thể tải thông tin tour|Could not load tour information/i,
  retryButton: /Thử lại|Retry/i,
  loadingText: /Đang tải|Loading/i,
  slugAutoToggle: /^Tự động$|^Auto$/i,
  slugManualToggle: /^Thủ công$|^Manual$/i,
  slugWarning: /slug|đường dẫn|liên kết|URL/i,
  breadcrumbTours: /Quản lý Tour|Tour Management/i,
  breadcrumbTourList: /Danh sách [Tt]our|Tour [Ll]ist/i,
  breadcrumbEditBadge: /Chỉnh sửa|Edit/i,
  departuresEmpty: /Chưa có đợt khởi hành|No departure runs yet/i,
  departuresLoadError: /Không tải được lịch|Could not load schedules/i,
  departuresRetry: /Thử lại|Try again/i,
  manageDepartures: /Thêm lịch|Add schedule|Manage/i,
  deleteTourDialogTitle: /Xóa tour này|Delete this tour/i,
  deleteTourConfirm: /^Xóa tour$|^Delete tour$/i,
  deleteScheduleDialogTitle: /Xóa lịch khởi hành này|Delete this schedule/i,
  deleteScheduleConfirm: /^Xóa lịch$|^Delete schedule$/i,
  dangerDeleteButton: /Xóa vĩnh viễn tour này|Permanently delete this tour/i,
};

export class TourEditPage extends TourCreatePage {
  readonly tourId: number;

  constructor(page: Page, tourId: number) {
    super(page);
    this.tourId = tourId;
  }

  async goto() {
    await this.page.goto(`/admin/tours/edit/${this.tourId}`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      this.nameInput.waitFor({ state: 'visible', timeout: 25_000 }),
      this.fetchErrorWidget.waitFor({ state: 'visible', timeout: 25_000 }),
    ]);
  }

  async gotoAndWaitLoaded() {
    await this.goto();
    await this.nameInput.waitFor({ state: 'visible', timeout: 20_000 });
  }

  override get heading() {
    return this.page.getByRole('heading', { level: 1, name: editCopy.heading });
  }

  get headerSaveButton() {
    return this.page.locator('form .sticky').getByRole('button', { name: editCopy.saveChanges });
  }

  /** Header submit — label switches to Saving while pending */
  get headerSaveOrSavingButton() {
    return this.page
      .locator('form .sticky')
      .getByRole('button')
      .filter({ hasText: /Lưu thay đổi|Save [Cc]hanges|Đang lưu|Saving/i });
  }

  override get submitButton() {
    return this.headerSaveButton;
  }

  override get sidebarSaveButton() {
    return this.page
      .locator('form aside')
      .filter({ has: this.page.getByRole('heading', { name: /Publish Settings|Thiết lập xuất bản/i }) })
      .getByRole('button', { name: editCopy.saveChanges });
  }

  get sidebarSaveOrSavingButton() {
    return this.page
      .locator('form aside')
      .filter({ has: this.page.getByRole('heading', { name: /Publish Settings|Thiết lập xuất bản/i }) })
      .getByRole('button')
      .filter({ hasText: /Lưu thay đổi|Save [Cc]hanges|Đang lưu|Saving/i });
  }

  async scrollToSidebar() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.locator('form aside').scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
  }

  get mobileSaveButton() {
    return this.page.locator('[data-tour-mobile-footer]').getByRole('button', { name: editCopy.saveChanges });
  }

  get stickyEditBadge() {
    return this.page
      .locator('form .sticky')
      .locator('span.rounded-full')
      .filter({ hasText: editCopy.breadcrumbEditBadge });
  }

  async scrollMainContent(pixels = 250) {
    await this.mainScrollContainer.evaluate((el, y) => {
      el.scrollTop = y;
    }, pixels);
    await this.page.waitForTimeout(350);
  }

  get backButton() {
    return this.page.locator('form .sticky.top-0 button').first();
  }

  get slugToggleButton() {
    return this.fieldBlock('slug').getByRole('button').first();
  }

  get slugWarningBanner() {
    return this.fieldBlock('slug').locator('p').filter({ hasText: editCopy.slugWarning });
  }

  get fetchErrorWidget() {
    return this.page.getByText(editCopy.fetchErrorTitle);
  }

  get pageLoadingIndicator() {
    return this.page.getByText(editCopy.loadingText);
  }

  get departuresSection() {
    return this.page
      .locator('form')
      .getByText(/Các đợt khởi hành|Departure runs/i)
      .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]')
      .first();
  }

  get manageDeparturesButton() {
    return this.page.locator('form').getByRole('button', { name: /^Thêm lịch$|^Add schedule$/i });
  }

  get departuresEmptyState() {
    return this.page.getByText(editCopy.departuresEmpty);
  }

  get departuresErrorBanner() {
    return this.page.getByText(editCopy.departuresLoadError);
  }

  get departuresRetryButton() {
    return this.departuresSection.getByRole('button', { name: editCopy.departuresRetry });
  }

  departureRow(index = 0) {
    return this.departuresSection.locator('ul li').nth(index);
  }

  departureEditButton(index = 0) {
    return this.departureRow(index).getByRole('button', {
      name: /Chỉnh sửa đợt khởi hành|Edit this departure run/i,
    });
  }

  departureDeleteButton(index = 0) {
    return this.departureRow(index).getByRole('button', {
      name: /Xóa đợt khởi hành|Delete this departure run/i,
    });
  }

  get dangerZoneDeleteButton() {
    return this.page.getByRole('button', { name: editCopy.dangerDeleteButton });
  }

  get tourDeleteDialog() {
    return this.page.getByRole('heading', { name: editCopy.deleteTourDialogTitle });
  }

  get scheduleDeleteDialog() {
    return this.page.getByRole('heading', { name: editCopy.deleteScheduleDialogTitle });
  }

  breadcrumbLink(name: RegExp) {
    return this.page.locator('form .sticky').getByRole('link', { name });
  }

  waitForUpdatePut() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        res.url().includes(`/admin/tours/${this.tourId}`) &&
        !res.url().includes('/status')
    );
  }

  waitForDeleteTour() {
    return this.page.waitForResponse(
      (res) => res.request().method() === 'DELETE' && res.url().includes(`/admin/tours/${this.tourId}`)
    );
  }

  waitForDeleteSchedule(scheduleId: number) {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/tour-schedules/${scheduleId}`)
    );
  }

  async submit() {
    await this.headerSaveButton.click();
  }

  async submitViaSidebar() {
    await this.sidebarSaveButton.click();
  }

  async enableAutoSlug() {
    const toggle = this.slugToggleButton;
    if (await toggle.textContent().then((t) => /Tự động|Auto/i.test(t ?? ''))) {
      await toggle.click();
    }
  }

  async enableManualSlug() {
    const toggle = this.slugToggleButton;
    if (await toggle.textContent().then((t) => /Thủ công|Manual/i.test(t ?? ''))) {
      await toggle.click();
    }
  }

  async confirmTourDelete() {
    await this.page.getByRole('button', { name: editCopy.deleteTourConfirm }).click();
  }

  async cancelTourDelete() {
    await this.page.getByRole('dialog').getByRole('button', { name: editCopy.cancel }).click();
  }

  async confirmScheduleDelete() {
    await this.page.getByRole('button', { name: editCopy.deleteScheduleConfirm }).click();
  }

  async cancelScheduleDelete() {
    await this.page.getByRole('dialog').getByRole('button', { name: editCopy.cancel }).click();
  }
}

export { editCopy as tourEditCopy };
