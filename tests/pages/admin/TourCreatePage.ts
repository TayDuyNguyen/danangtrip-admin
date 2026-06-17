import type { Locator, Page, Response } from '@playwright/test';

import type { Buffer } from 'node:buffer';

import { tinyPngBuffer, validCreateTour } from '../../fixtures/data/tour-create.data';



const copy = {

  heading: /Thêm Tour mới|Add.*Tour/i,

  submit: /Tạo tour|Create tour/i,

  sidebarSave: /^Lưu tour$|^Save Tour$/i,

  cancel: /Hủy|Cancel/i,

  categoryPlaceholder: /Chọn danh mục|Select category/i,

  addItineraryDay: /Thêm ngày mới|Add New Day/i,

  createSuccessToast: /Tạo tour thành công|Tour created successfully/i,

  editHeading: /Chỉnh sửa Tour|Edit.*Tour/i,

  createErrorTitle: /Không thể tạo tour|Could not create tour/i,

  dismissError: /Đóng|Dismiss/i,

  statusHidden: /Ẩn|Hidden/i,

  featuredToggle: /Tour nổi bật|Set as Featured Tour/i,

  hotToggle: /Tour hot|Set as Hot Tour/i,

  changeThumbnail: /Thay đổi ảnh|Change image/i,

  breadcrumbTours: /Quản lý Tour|Tour Management/i,

  breadcrumbTourList: /Danh sách [Tt]our|Tour [Ll]ist/i,

  scheduleGuideLink: /Xem hướng dẫn|View guide/i,

  dateAfterError: /phải sau|after or equal to start date/i,

  maxGteMinError: /lớn hơn hoặc bằng|greater than or equal to minimum/i,

  maxLengthError: /tối đa|at most/i,

  invalidUrlError: /URL|url/i,

  minLengthError: /ít nhất|at least/i,

  positiveError: /số dương|positive number|must be a positive/i,

  maxPercentError: /không được vượt quá|must not exceed/i,

  categoryLoading: /Đang tải danh mục|Loading categories/i,

  categoryError: /Không thể tải danh mục|Could not load categories/i,

  categoryRetry: /Thử lại|Try again/i,

  creatingLabel: /Đang tạo|Creating/i,

  savingLabel: /Đang lưu|Saving/i,

  completionLabel: /% hoàn thành|% complete/i,

  breadcrumbCreateBadge: /Tạo mới|Create new/i,

  priceAfterDiscountLabel: /Giá sau giảm|Price after discount/i,

  checklistInclusions: /Bao gồm \/ Không bao gồm|Inclusions \/ Exclusions/i,

};



export interface TourCreateFormInput {

  name?: string;

  categoryLabel?: string;

  duration?: string;

  shortDesc?: string;

  description?: string;

  priceAdultDigits?: string;

  availableFrom?: string;

  availableTo?: string;

  meetingPoint?: string;

  itineraryTitle?: string;

  itineraryContent?: string;

  minPeople?: string;

  maxPeople?: string;

  videoUrl?: string;

  discountPercent?: string;

  priceChildDigits?: string;

  priceInfantDigits?: string;

  inclusions?: string;

  exclusions?: string;

}



export class TourCreatePage {

  readonly page: Page;



  constructor(page: Page) {

    this.page = page;

  }



  async goto() {

    await this.page.goto('/admin/tours/create', { waitUntil: 'domcontentloaded' });

    await this.heading.waitFor({ state: 'visible', timeout: 20_000 });

  }



  get heading() {

    return this.page.getByRole('heading', { level: 1, name: copy.heading });

  }



  get submitButton() {

    return this.page.locator('form button[type="submit"]').first();

  }



  get sidebarSaveButton() {

    return this.page.locator('aside').getByRole('button', {
      name: /Lưu tour|Save Tour|Đang lưu|Saving/i,
    });

  }



  get cancelButton() {

    return this.page.getByRole('button', { name: copy.cancel }).first();

  }



  fieldBlock(field: string): Locator {

    return this.page.locator(`[data-tour-field="${field}"]`);

  }



  fieldError(field: string): Locator {

    return this.fieldBlock(field).locator('p.text-red-500, p.text-xs.text-red-500').first();

  }



  get nameInput() {

    return this.page.getByPlaceholder(/Nhập tên tour|Enter tour name/i);

  }



  get slugInput() {

    return this.fieldBlock('slug').locator('input').first();

  }



  get durationInput() {

    return this.fieldBlock('duration').locator('input').first();

  }



  get shortDescInput() {

    return this.page.getByPlaceholder(/Tóm tắt những điểm|Summary of tour highlights/i);

  }



  get descriptionInput() {

    return this.page.getByPlaceholder(/Nhập nội dung mô tả chi tiết|Enter detailed tour content/i);

  }



  get priceAdultInput() {

    return this.fieldBlock('price_adult').locator('input').first();

  }



  get priceChildInput() {

    return this.fieldBlock('price_child').locator('input').first();

  }



  get priceInfantInput() {

    return this.fieldBlock('price_infant').locator('input').first();

  }



  get discountInput() {

    return this.fieldBlock('discount_percent').locator('input').first();

  }



  get inclusionsInput() {

    return this.fieldBlock('inclusions').locator('textarea').first();

  }



  get exclusionsInput() {

    return this.fieldBlock('exclusions').locator('textarea').first();

  }



  get priceAfterDiscountDisplay() {

    return this.page

      .locator('label')

      .filter({ hasText: copy.priceAfterDiscountLabel })

      .locator('xpath=following-sibling::div[1]');

  }



  get categoryLoadingBanner() {

    return this.fieldBlock('tour_category_id').getByText(copy.categoryLoading);

  }



  get categoryErrorBanner() {

    return this.fieldBlock('tour_category_id').getByText(copy.categoryError);

  }



  get categoryRetryButton() {

    return this.fieldBlock('tour_category_id').getByRole('button', { name: copy.categoryRetry });

  }



  get categorySelectControl() {

    return this.fieldBlock('tour_category_id').locator('[class*="-control"]').first();

  }



  get completionPercentLabel() {

    return this.page.getByText(copy.completionLabel);

  }



  get stickyCreateBadge() {

    return this.page.locator('.sticky.top-0 span.rounded-full').filter({ hasText: copy.breadcrumbCreateBadge });

  }



  get mainScrollContainer() {

    return this.page.locator('main');

  }



  checklistItem(label: RegExp) {

    return this.page.locator('aside').getByText(label);

  }



  get minPeopleInput() {

    return this.fieldBlock('min_people').locator('input').first();

  }



  get maxPeopleInput() {

    return this.fieldBlock('max_people').locator('input').first();

  }



  get availableFromInput() {

    return this.fieldBlock('available_from').locator('input[type="date"]').first();

  }



  get availableToInput() {

    return this.fieldBlock('available_to').locator('input[type="date"]').first();

  }



  get meetingPointInput() {

    return this.fieldBlock('meeting_point').locator('input').first();

  }



  get videoUrlInput() {

    return this.fieldBlock('video_url').locator('input').first();

  }



  get thumbnailFileInput() {

    return this.fieldBlock('thumbnail').locator('input[type="file"]').first();

  }



  get galleryFileInput() {

    return this.fieldBlock('thumbnail').locator('input[type="file"][multiple]').first();

  }



  get thumbnailDropzone() {

    return this.fieldBlock('thumbnail').locator('.aspect-video').first();

  }



  get addItineraryDayButton() {

    return this.page.getByRole('button', { name: copy.addItineraryDay });

  }



  itineraryDayBlock(index: number) {

    return this.fieldBlock('itinerary').locator('.group').nth(index);

  }



  itineraryTitleInput(index = 0) {

    return this.fieldBlock('itinerary')

      .getByPlaceholder(/Khám phá Bà Nà|Discover Ba Na/i)

      .nth(index);

  }



  itineraryContentInput(index = 0) {

    return this.fieldBlock('itinerary')

      .getByPlaceholder(/Mô tả các hoạt động|Describe activities for this day/i)

      .nth(index);

  }



  itineraryRemoveButton(index: number) {

    return this.itineraryDayBlock(index).getByRole('button', { name: /Xóa ngày|Remove Day/i });

  }



  get galleryPreviewImages() {

    return this.fieldBlock('thumbnail').locator('.grid img');

  }



  get thumbnailPreview() {

    return this.fieldBlock('thumbnail').locator('.aspect-video img');

  }



  get createErrorAlert() {

    return this.page.getByRole('alert');

  }



  get dismissErrorButton() {

    return this.page.getByRole('button', { name: copy.dismissError });

  }



  get statusHiddenRadio() {

    return this.page.getByRole('radio', { name: copy.statusHidden });

  }



  get featuredCheckbox() {

    return this.page.getByRole('checkbox', { name: copy.featuredToggle });

  }



  get hotCheckbox() {

    return this.page.getByRole('checkbox', { name: copy.hotToggle });

  }



  breadcrumbLink(name: RegExp) {

    return this.page.getByRole('main').getByRole('link', { name });

  }



  get scheduleGuideLink() {

    return this.page.getByRole('button', { name: copy.scheduleGuideLink });

  }



  async selectCategory(label: string) {

    const control = this.fieldBlock('tour_category_id').locator('[class*="-control"]').first();

    await control.click();

    await this.page.getByRole('option', { name: label }).click();

  }



  async fillForm(data: TourCreateFormInput) {

    if (data.name !== undefined) await this.nameInput.fill(data.name);

    if (data.categoryLabel) await this.selectCategory(data.categoryLabel);

    if (data.duration !== undefined) await this.durationInput.fill(data.duration);

    if (data.shortDesc !== undefined) await this.shortDescInput.fill(data.shortDesc);

    if (data.description !== undefined) await this.descriptionInput.fill(data.description);

    if (data.priceAdultDigits !== undefined) await this.priceAdultInput.fill(data.priceAdultDigits);

    if (data.availableFrom !== undefined) await this.availableFromInput.fill(data.availableFrom);

    if (data.availableTo !== undefined) await this.availableToInput.fill(data.availableTo);

    if (data.meetingPoint !== undefined) await this.meetingPointInput.fill(data.meetingPoint);

    if (data.minPeople !== undefined) await this.minPeopleInput.fill(data.minPeople);

    if (data.maxPeople !== undefined) await this.maxPeopleInput.fill(data.maxPeople);

    if (data.videoUrl !== undefined) await this.videoUrlInput.fill(data.videoUrl);

    if (data.discountPercent !== undefined) await this.discountInput.fill(data.discountPercent);

    if (data.priceChildDigits !== undefined) await this.priceChildInput.fill(data.priceChildDigits);

    if (data.priceInfantDigits !== undefined) await this.priceInfantInput.fill(data.priceInfantDigits);

    if (data.inclusions !== undefined) await this.inclusionsInput.fill(data.inclusions);

    if (data.exclusions !== undefined) await this.exclusionsInput.fill(data.exclusions);

    if (data.itineraryTitle !== undefined) {

      await this.itineraryTitleInput(0).fill(data.itineraryTitle);

    }

    if (data.itineraryContent !== undefined) {

      await this.itineraryContentInput(0).fill(data.itineraryContent);

    }

  }



  async prepareValidSubmitWithoutThumbnail(overrides: TourCreateFormInput = {}) {

    await this.fillForm({ ...validCreateTour, ...overrides });

  }



  async scrollMainContent(pixels = 200) {

    await this.mainScrollContainer.evaluate((el, y) => {

      el.scrollTop = y;

    }, pixels);

    await this.page.waitForTimeout(350);

  }



  async prepareValidSubmit(overrides: TourCreateFormInput = {}) {

    await this.fillForm({ ...validCreateTour, ...overrides });

    await this.uploadThumbnail(tinyPngBuffer);

  }



  async uploadThumbnail(buffer: Buffer, filename = 'cover.png') {

    await this.thumbnailFileInput.setInputFiles({

      name: filename,

      mimeType: 'image/png',

      buffer,

    });

    await this.thumbnailPreview.waitFor({ state: 'visible', timeout: 15_000 });

  }



  async uploadGalleryImages(buffers: Buffer[], baseName = 'gallery') {

    await this.galleryFileInput.setInputFiles(

      buffers.map((buffer, i) => ({

        name: `${baseName}${i + 1}.png`,

        mimeType: 'image/png',

        buffer,

      }))

    );

    await this.galleryPreviewImages.first().waitFor({ state: 'visible', timeout: 15_000 });

  }



  async removeThumbnail() {

    await this.thumbnailDropzone.hover();

    await this.thumbnailDropzone.getByRole('button', { name: /Xóa ảnh đại diện|Remove cover image/i }).click();

    await this.thumbnailPreview.waitFor({ state: 'hidden', timeout: 10_000 });

  }



  async changeThumbnail(buffer: Buffer, filename = 'cover-new.png') {

    await this.thumbnailDropzone.hover();

    await this.thumbnailDropzone.getByRole('button', { name: copy.changeThumbnail }).click();

    await this.thumbnailFileInput.setInputFiles({

      name: filename,

      mimeType: 'image/png',

      buffer,

    });

    await this.thumbnailPreview.waitFor({ state: 'visible', timeout: 15_000 });

  }



  async addItineraryDay() {

    await this.addItineraryDayButton.click();

  }



  async removeItineraryDay(index: number) {

    await this.itineraryRemoveButton(index).click();

  }



  async selectHiddenStatus() {

    await this.statusHiddenRadio.check();

  }



  async toggleFeatured(checked = true) {

    const label = this.page.locator('label').filter({ has: this.featuredCheckbox });

    if ((await this.featuredCheckbox.isChecked()) !== checked) {

      await label.click();

    }

  }



  async toggleHot(checked = true) {

    const label = this.page.locator('label').filter({ has: this.hotCheckbox });

    if ((await this.hotCheckbox.isChecked()) !== checked) {

      await label.click();

    }

  }



  async cancel() {

    await this.cancelButton.click();

  }



  async submit() {

    await this.submitButton.click();

  }



  async submitFromSidebar() {

    await this.sidebarSaveButton.click();

  }



  waitForCreatePost(): Promise<Response> {

    return this.page.waitForResponse(

      (res) =>

        res.request().method() === 'POST' &&

        /\/api\/v1\/admin\/tours\/?$/.test(new URL(res.url()).pathname) &&

        res.status() !== 0,

      { timeout: 20_000 }

    );

  }

}



export { copy as tourCreateCopy };


