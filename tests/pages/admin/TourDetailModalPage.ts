import type { Locator } from '@playwright/test';
import { TourListPage } from './TourListPage';

const copy = {
  closeModal: /^Đóng$|^Close$/i,
  editModal: /Chỉnh sửa|Edit/i,
  retrySchedules: /Thử lại|Try again/i,
  noData: /Không tìm thấy tour nào|No tours found/i,
  noScheduleItinerary: /^Hết lịch$|^No schedule$/i,
  schedulesNoData: /Không có lịch khởi hành|No schedules found/i,
  loading: /Đang tải|Loading/i,
  featured: /Nổi bật|Featured/i,
  hot: /Tour Hot|Hot/i,
  loadError: /Không tải được lịch|Could not load schedules/i,
  soldOut: /Hết chỗ|Sold out/i,
  active: /^Active$|^Đang hoạt động$/i,
};

export class TourDetailModalPage {
  readonly listPage: TourListPage;

  constructor(listPage: TourListPage) {
    this.listPage = listPage;
  }

  get panel(): Locator {
    return this.listPage.detailModalPanel;
  }

  get headerCloseButton(): Locator {
    return this.panel.locator('.sticky.top-0').getByRole('button', { name: copy.closeModal });
  }

  get footerCloseButton(): Locator {
    return this.panel.locator('.border-t.border-slate-100').getByRole('button', { name: copy.closeModal });
  }

  get editButton(): Locator {
    return this.panel.getByRole('button', { name: copy.editModal });
  }

  get retryButton(): Locator {
    return this.panel.getByRole('button', { name: copy.retrySchedules });
  }

  get thumbnailArea(): Locator {
    return this.panel.locator('.aspect-video').first();
  }

  get galleryImages(): Locator {
    return this.panel.locator('.grid.grid-cols-4 img');
  }

  get scrollBody(): Locator {
    return this.panel.locator('.max-h-\\[85vh\\].overflow-y-auto');
  }

  async open(tourName: string) {
    await this.listPage.openViewModal(tourName);
  }

  async closeByX() {
    await this.headerCloseButton.click();
    await this.panel.waitFor({ state: 'hidden', timeout: 10_000 });
  }

  async closeByFooter() {
    await this.footerCloseButton.click();
    await this.panel.waitFor({ state: 'hidden', timeout: 10_000 });
  }
}

export { copy as tourDetailModalCopy };
