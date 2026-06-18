import type { Locator, Page, Response } from '@playwright/test';

export const tourScheduleDetailCopy = {
  heading: /Chi tiết lịch khởi hành|Schedule detail/i,
  breadcrumbRoot: /Lịch khởi hành|^Schedules$|Departure schedules/i,
  summaryTitle: /Tóm tắt|Summary/i,
  statusFull: /Đầy chỗ|^Full$/i,
  statusAvailable: /Đang hoạt động|^Active$/i,
  statusCancelled: /Đã hủy|^Cancelled$/i,
  priceFollowsTour: /Theo tour|Tour default/i,
  statsTitle: /THỐNG KÊ LỊCH|SCHEDULE STATS/i,
  statsBooked: /ĐÃ ĐẶT|BOOKED/i,
  statsAvailable: /CÒN TRỐNG|SLOTS AVAILABLE/i,
  notFound: /Không tìm thấy lịch khởi hành|Schedule not found/i,
  serverError: /Không thể tải thông tin lịch|Could not load schedule/i,
  retry: /Thử lại|Try again|Retry/i,
};

const copy = tourScheduleDetailCopy;

export class TourScheduleDetailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoDetail(scheduleId: number | string, viewport = { width: 1535, height: 697 }) {
    await this.page.setViewportSize(viewport);
    const detailResponse = this.waitForDetailResponse(Number(scheduleId));
    await this.page.goto(`/admin/tours/schedules/detail/${scheduleId}`, {
      waitUntil: 'domcontentloaded',
    });
    await detailResponse.catch(() => undefined);
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 }).catch(() => undefined);
  }

  async gotoDetailExpectingError(scheduleId: number | string): Promise<Response> {
    const detailResponse = this.page.waitForResponse(
      (res: Response) =>
        res.request().method() === 'GET' &&
        new URL(res.url()).pathname.endsWith(`/admin/tour-schedules/${scheduleId}`),
      { timeout: 20_000 }
    );
    await this.page.goto(`/admin/tours/schedules/detail/${scheduleId}`, {
      waitUntil: 'domcontentloaded',
    });
    return detailResponse;
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get breadcrumbSchedulesLink() {
    return this.page.locator('.border-b a').filter({ hasText: copy.breadcrumbRoot }).first();
  }

  get scheduleInfoBox() {
    return this.page.locator('.rounded-2xl.border.border-amber-200.bg-amber-50\\/50').first();
  }

  get tourInfoBox() {
    return this.page
      .locator('.inline-flex.items-center.gap-4.rounded-2xl.border')
      .filter({ has: this.page.locator('h4') })
      .first();
  }

  tourNameInInfo(name: string | RegExp) {
    return this.tourInfoBox.getByRole('heading', { level: 4, name });
  }

  get summaryPanel() {
    return this.page.locator('.rounded-2xl.border').filter({ hasText: copy.summaryTitle }).first();
  }

  get statsBlock() {
    return this.page.locator('.rounded-2xl.border').filter({ hasText: copy.statsTitle });
  }

  get progressBarFill(): Locator {
    return this.statsBlock.locator('.absolute.left-0.top-0.h-full.rounded-full').first();
  }

  get errorAlert() {
    return this.page.getByRole('alert');
  }

  get retryButton() {
    return this.page.getByRole('button', { name: copy.retry });
  }

  statusBadgeInInfoBox(label: RegExp): Locator {
    return this.scheduleInfoBox.getByText(label);
  }

  summaryRowValue(label: RegExp): Locator {
    return this.summaryPanel
      .locator('div.space-y-1')
      .filter({ has: this.summaryPanel.locator('dt').filter({ hasText: label }) })
      .locator('dd');
  }

  async captureUiScreenshot(tcId: string) {
    await this.page.screenshot({
      path: `reports/ui-screenshots/tour-schedule-detail/${tcId}.png`,
      fullPage: false,
    });
  }

  waitForDetailResponse(scheduleId: number): Promise<Response> {
    return this.page.waitForResponse(
      (res: Response) =>
        res.request().method() === 'GET' &&
        new URL(res.url()).pathname.endsWith(`/admin/tour-schedules/${scheduleId}`),
      { timeout: 20_000 }
    );
  }
}
