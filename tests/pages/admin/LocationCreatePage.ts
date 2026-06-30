import type { Buffer } from 'node:buffer';
import type { Locator, Page, Response } from '@playwright/test';
import { tinyPngBuffer, validCreateLocation } from '../../fixtures/data/location-create.data';

export const locationCreateCopy = {
  heading: /Thêm Địa điểm|Add Location/i,
  submit: /Lưu địa điểm|Save location|Create location/i,
  cancel: /^Hủy$|^Cancel$/i,
  slugAuto: /Tự động tạo|Auto.?generate/i,
  createSuccess: /Tạo địa điểm thành công|Location created successfully/i,
  createError: /Có lỗi xảy ra khi tạo địa điểm|Error creating location/i,
  categoryPlaceholder: /Chọn danh mục|Select category/i,
  districtPlaceholder: /Chọn quận|Select district/i,
  completionLabel: /%|Fields/i,
  mapLatLabel: /LAT:/i,
  mapReset: /Đặt lại về trung tâm Đà Nẵng|Reset to Da Nang center/i,
};

const copy = locationCreateCopy;

export interface LocationCreateFormInput {
  name?: string;
  slug?: string;
  categoryLabel?: string;
  district?: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  priceMinDigits?: string;
  priceMaxDigits?: string;
  videoUrl?: string;
}

export class LocationCreatePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/locations/create', { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get submitButton() {
    return this.page.locator('.sticky.top-0').getByRole('button', { name: copy.submit });
  }

  get cancelButton() {
    return this.page.locator('.sticky.top-0').getByRole('button', { name: copy.cancel });
  }

  get backButton() {
    return this.page.locator('.sticky.top-0 .flex.items-center.gap-4 > button').first();
  }

  get slugAutoButton() {
    return this.page.getByRole('button', { name: copy.slugAuto });
  }

  get completionPercent() {
    return this.page.locator('.sticky.top-28').locator('span.text-3xl.font-black').first();
  }

  get statusCard() {
    return this.page.locator('.sticky.top-28 .bg-white.rounded-3xl').filter({ hasText: /Trạng thái|Status/i });
  }

  fieldBlock(field: string): Locator {
    return this.page.locator(`[data-location-field="${field}"]`);
  }

  fieldError(field: string): Locator {
    return this.fieldBlock(field).locator('p.text-red-500, p.text-xs.text-red-500').first();
  }

  get nameInput() {
    return this.fieldBlock('name').locator('input').first();
  }

  get slugInput() {
    return this.fieldBlock('slug').locator('input').first();
  }

  get shortDescriptionInput() {
    return this.fieldBlock('short_description').locator('textarea').first();
  }

  get descriptionInput() {
    return this.fieldBlock('description').locator('textarea').first();
  }

  get addressInput() {
    return this.fieldBlock('address').locator('input').first();
  }

  get emailInput() {
    return this.fieldBlock('email').locator('input').first();
  }

  get websiteInput() {
    return this.fieldBlock('website').locator('input').first();
  }

  get videoUrlInput() {
    return this.fieldBlock('video_url').locator('input').first();
  }

  get priceMinInput() {
    return this.fieldBlock('price_min').locator('input').first();
  }

  get priceMaxInput() {
    return this.fieldBlock('price_max').locator('input').first();
  }

  get thumbnailPreview() {
    return this.fieldBlock('thumbnail').locator('img[alt="Thumbnail"]');
  }

  get thumbnailFileInput() {
    return this.fieldBlock('thumbnail').locator('input[type="file"]').first();
  }

  get featuredToggle() {
    return this.statusCard.locator('button.rounded-full').last();
  }

  get statusToggle() {
    return this.statusCard.locator('button.rounded-full').first();
  }

  async selectCategory(label: string) {
    const block = this.fieldBlock('category_id');
    await block.locator('[class*="-control"]').first().click();
    await this.page.getByRole('option', { name: label }).click();
  }

  async selectDistrict(label: string) {
    const block = this.fieldBlock('district');
    await block.locator('[class*="-control"]').first().click();
    await this.page.getByRole('option', { name: label }).click();
  }

  async fillForm(input: LocationCreateFormInput = {}) {
    const data = { ...validCreateLocation, ...input };
    if (data.name != null) await this.nameInput.fill(data.name);
    if (data.slug != null) await this.slugInput.fill(data.slug);
    if (data.categoryLabel) await this.selectCategory(data.categoryLabel);
    if (data.district) await this.selectDistrict(data.district);
    if (data.shortDescription != null) await this.shortDescriptionInput.fill(data.shortDescription);
    if (data.description != null) await this.descriptionInput.fill(data.description);
    if (data.address != null) await this.addressInput.fill(data.address);
    if (data.phone != null) await this.fieldBlock('phone').locator('input').fill(data.phone);
    if (data.email != null) await this.emailInput.fill(data.email);
    if (data.website != null) await this.websiteInput.fill(data.website);
    if (data.priceMinDigits != null) await this.priceMinInput.fill(data.priceMinDigits);
    if (data.priceMaxDigits != null) await this.priceMaxInput.fill(data.priceMaxDigits);
    if (data.videoUrl != null) await this.videoUrlInput.fill(data.videoUrl);
  }

  async setMapCoordinates() {
    const mapSection = this.page.locator('.relative.h-\\[400px\\]');
    await mapSection.waitFor({ state: 'visible', timeout: 15_000 });
    await mapSection.getByRole('button', { name: copy.mapReset }).click();
    const latValue = this.page
      .locator('span.text-slate-400')
      .filter({ hasText: 'LAT:' })
      .locator('xpath=following-sibling::span')
      .first();
    await latValue.waitFor({ state: 'visible' });
  }

  async uploadThumbnail(buffer: Buffer = tinyPngBuffer, filename = 'thumb.png') {
    await this.thumbnailFileInput.setInputFiles({
      name: filename,
      mimeType: 'image/png',
      buffer,
    });
  }

  async clickSlugAuto() {
    await this.slugAutoButton.click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async prepareValidSubmit(input: LocationCreateFormInput = {}) {
    await this.fillForm(input);
    await this.setMapCoordinates();
    await this.uploadThumbnail();
  }

  waitForCreatePost(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/admin\/locations\/?$/.test(new URL(res.url()).pathname.replace(/\/$/, '')) &&
        !res.url().includes('/upload')
    );
  }
}
