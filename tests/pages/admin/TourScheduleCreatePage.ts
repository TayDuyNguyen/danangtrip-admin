import type { Locator, Page, Response } from '@playwright/test';

export const tourScheduleCreateCopy = {
  heading: /^Thêm lịch$|^Add schedule$/i,
  breadcrumbRoot: /Lịch khởi hành|^Schedules$|Departure schedules/i,
  breadcrumbCurrent: /Thêm lịch|Add schedule/i,
  cancel: /^Hủy$|^Cancel$/i,
  submit: /Thêm lịch|Add schedule/i,
  previewTitle: /Xem trước|Preview/i,
  priceFollowsTour: /Theo tour|Tour default|Follows tour/i,
  priceOverrideHelp: /giá mặc định từ tour|default prices from the base tour/i,
  statusAvailable: /Đang hoạt động|^Active$/i,
  startDateLabel: /Ngày khởi hành|Start date/i,
  endDateLabel: /Ngày kết thúc|End date/i,
  maxPeopleLabel: /Số người tối đa|Maximum guests/i,
  departureCodePlaceholder: /VD: VN123/i,
  departurePlacePlaceholder: /Sân bay Đà Nẵng|Da Nang airport/i,
  bookingDeadlineLabel: /Hạn chót đặt chỗ|Booking deadline/i,
  operationalSection: /Thông tin vận hành|Operational/i,
  createSuccessToast: /Tạo thành công|Created successfully/i,
  createErrorToast: /Không thể tạo|Could not create/i,
  tourFetchError: /Không thể tải thông tin tour|Could not load tour information/i,
  tourFetchRetry: /Thử lại|Try again|Retry/i,
};

const copy = tourScheduleCreateCopy;

export class TourScheduleCreatePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(tourId: number | string, query = '') {
    const suffix = query ? (query.startsWith('?') ? query : `?${query}`) : '';
    await this.page.goto(`/admin/tours/${tourId}/schedules/create${suffix}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  get breadcrumbSchedulesLink() {
    return this.page.locator('.sticky.top-0 a').filter({ hasText: copy.breadcrumbRoot }).first();
  }

  get collapsedContextBadge() {
    return this.page
      .locator('.sticky.top-0 span.hidden.md\\:inline-flex')
      .filter({ hasText: copy.breadcrumbCurrent });
  }

  get mainScrollContainer() {
    return this.page.locator('main.overflow-y-auto');
  }

  async scrollMainContent(pixels = 200) {
    await this.mainScrollContainer.evaluate((el, y) => {
      el.scrollTop = y;
    }, pixels);
    await this.page.waitForTimeout(350);
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get breadcrumbRoot() {
    return this.page.getByText(copy.breadcrumbRoot).first();
  }

  get breadcrumbCurrent() {
    return this.page.getByText(copy.breadcrumbCurrent).first();
  }

  get formRoot() {
    return this.page.locator('form').first();
  }

  get tourInfoBox() {
    return this.page
      .locator('.inline-flex.items-center.gap-4.rounded-2xl.border')
      .filter({ has: this.page.locator('h4') })
      .first();
  }

  get tourInfoSkeleton() {
    return this.page
      .locator('.inline-flex.items-center.gap-4.rounded-2xl.border')
      .filter({ has: this.page.locator('[class*="Skeleton"], .animate-pulse') })
      .first();
  }

  get tourFetchErrorBanner() {
    return this.page.getByRole('alert').filter({ hasText: copy.tourFetchError });
  }

  get tourFetchRetryButton() {
    return this.tourFetchErrorBanner.getByRole('button', { name: copy.tourFetchRetry });
  }

  tourNameInInfo(name: string | RegExp) {
    return this.tourInfoBox.getByRole('heading', { level: 4, name });
  }

  formFieldBlock(label: RegExp) {
    return this.formRoot.locator('.space-y-2').filter({ hasText: label }).first();
  }

  get startDateInput() {
    return this.formRoot.locator('#schedule-start-date');
  }

  get endDateInput() {
    return this.formRoot.locator('#schedule-end-date');
  }

  get bookingDeadlineInput() {
    return this.formRoot.locator('#schedule-booking-deadline');
  }

  get totalSlotsInput() {
    return this.formRoot.locator('#schedule-total-slots');
  }

  get departureCodeInput() {
    return this.formRoot.getByPlaceholder(copy.departureCodePlaceholder);
  }

  get departurePlaceInput() {
    return this.formRoot.getByPlaceholder(copy.departurePlacePlaceholder);
  }

  get previewPanel() {
    return this.page.locator('.lg\\:col-span-5').locator('.sticky.top-24').first();
  }

  get priceOverrideNotice() {
    return this.previewPanel.getByText(copy.priceOverrideHelp);
  }

  get headerActions() {
    return this.page.locator('.hidden.items-center.gap-3.md\\:flex');
  }

  get headerSubmitButton() {
    return this.headerActions.getByRole('button', { name: copy.submit });
  }

  get headerCancelButton() {
    return this.headerActions.getByRole('button', { name: copy.cancel });
  }

  get mobileActionBar() {
    return this.page.locator('.fixed.bottom-0').filter({ has: this.page.getByRole('button', { name: copy.submit }) });
  }

  get mobileSubmitButton() {
    return this.mobileActionBar.getByRole('button', { name: copy.submit });
  }

  get mobileCancelButton() {
    return this.mobileActionBar.getByRole('button', { name: copy.cancel });
  }

  fieldError(field: Locator) {
    return field.locator('xpath=ancestor::div[contains(@class,"space-y-2")][1]').locator('p.text-red-500');
  }

  async fillScheduleForm(data: {
    startDate?: string;
    endDate?: string;
    totalSlots?: number | string;
    bookingDeadline?: string;
    departureCode?: string;
    departurePlace?: string;
  }) {
    if (data.startDate != null) {
      await this.startDateInput.fill(data.startDate);
    }
    if (data.endDate != null) {
      await this.endDateInput.fill(data.endDate);
    }
    if (data.totalSlots != null) {
      await this.totalSlotsInput.fill(String(data.totalSlots));
    }
    if (data.bookingDeadline != null) {
      await this.bookingDeadlineInput.fill(data.bookingDeadline);
    }
    if (data.departureCode != null) {
      await this.departureCodeInput.fill(data.departureCode);
    }
    if (data.departurePlace != null) {
      await this.departurePlaceInput.fill(data.departurePlace);
    }
  }

  async clearDateFields() {
    await this.startDateInput.fill('');
    await this.endDateInput.fill('');
  }

  async submit() {
    await this.headerSubmitButton.click();
  }

  waitForCreateResponse() {
    return this.page.waitForResponse(
      (res: Response) =>
        res.request().method() === 'POST' &&
        /\/admin\/tours\/\d+\/schedules\/?$/.test(new URL(res.url()).pathname),
      { timeout: 20_000 }
    );
  }
}
