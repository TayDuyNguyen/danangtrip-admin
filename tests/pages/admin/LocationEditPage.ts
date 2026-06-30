import type { Page, Response } from '@playwright/test';
import { LocationCreatePage, locationCreateCopy } from './LocationCreatePage';

export const locationEditCopy = {
  ...locationCreateCopy,
  heading: /Chỉnh sửa Địa điểm|Edit Location/i,
  submit: /Cập nhật địa điểm|Update [Ll]ocation/i,
  updateSuccess: /Cập nhật thành công|Updated successfully/i,
  updateError: /Cập nhật thất bại|Update failed/i,
  deleteHeader: /^Xóa$|^Delete$/i,
  confirmDeleteTitle: /Xóa địa điểm này|Delete this location/i,
  confirmDeleteButton: /^Xóa$|^Delete$/i,
  cancelDeleteButton: /^Hủy$|^Cancel$/i,
  notFoundTitle: /Không tìm thấy địa điểm|Location not found/i,
  returnToList: /Quay lại danh sách|Back to list/i,
};

const copy = locationEditCopy;

export class LocationEditPage extends LocationCreatePage {
  readonly locationId: number;

  constructor(page: Page, locationId: number) {
    super(page);
    this.locationId = locationId;
  }

  async goto() {
    await this.page.goto(`/admin/locations/edit/${this.locationId}`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      this.nameInput.waitFor({ state: 'visible', timeout: 25_000 }),
      this.notFoundTitle.waitFor({ state: 'visible', timeout: 25_000 }),
    ]);
  }

  async gotoAndWaitLoaded() {
    await this.goto();
    await this.nameInput.waitFor({ state: 'visible', timeout: 20_000 });
  }

  override get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  override get submitButton() {
    return this.page.locator('.sticky.top-0').getByRole('button', { name: copy.submit });
  }

  get deleteHeaderButton() {
    return this.page.locator('.sticky.top-0').getByRole('button', { name: copy.deleteHeader });
  }

  get deleteMobileButton() {
    return this.page.locator('.sticky.top-28').getByRole('button', { name: copy.deleteHeader });
  }

  get cancelMobileButton() {
    return this.page.locator('.sticky.top-28').getByRole('button', { name: copy.cancel });
  }

  get deleteModal() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.confirmDeleteTitle });
  }

  get deleteConfirmButton() {
    return this.deleteModal.getByRole('button', { name: copy.confirmDeleteButton }).last();
  }

  get deleteCancelButton() {
    return this.deleteModal.getByRole('button', { name: copy.cancelDeleteButton });
  }

  get notFoundTitle() {
    return this.page.getByRole('heading', { name: copy.notFoundTitle });
  }

  get returnToListButton() {
    return this.page.getByRole('button', { name: copy.returnToList });
  }

  get headerLocationName() {
    return this.page.locator('.sticky.top-0 p.text-xs.text-slate-400').first();
  }

  get openingHoursInput() {
    return this.page
      .locator('.bg-white.rounded-3xl')
      .filter({ hasText: /Mức giá|Pricing/i })
      .locator('textarea')
      .first();
  }

  waitForUpdatePut(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        new RegExp(`/admin/locations/${this.locationId}/?$`).test(
          new URL(res.url()).pathname.replace(/\/$/, '')
        )
    );
  }

  waitForDelete(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new RegExp(`/admin/locations/${this.locationId}/?$`).test(
          new URL(res.url()).pathname.replace(/\/$/, '')
        )
    );
  }
}
