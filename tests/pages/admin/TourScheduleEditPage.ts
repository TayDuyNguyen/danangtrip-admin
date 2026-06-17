import type { Locator, Page, Response } from '@playwright/test';

export const tourScheduleEditCopy = {
  heading: /Cập nhật lịch trình|Update schedule/i,
  breadcrumbRoot: /Lịch khởi hành|^Schedules$|Departure schedules/i,
  breadcrumbCurrent: /Cập nhật lịch trình|Update schedule/i,
  cancel: /^Hủy$|^Cancel$/i,
  submit: /Cập nhật lịch|Save schedule/i,
  previewTitle: /Xem trước|Preview/i,
  priceOverrideHelp: /giá mặc định từ tour|default prices from the base tour/i,
  statusAvailable: /Đang hoạt động|^Active$/i,
  statusCancelled: /Đã hủy|^Cancelled$/i,
  operationalSection: /Thông tin vận hành|Operational/i,
  deleteThisSchedule: /Xóa lịch này|Delete this schedule/i,
  deleteWarningHint: /không thể hoàn tác|cannot be undone/i,
  deleteDialogTitle: /Xóa lịch khởi hành này|Delete this schedule/i,
  deleteConfirm: /Xóa lịch|Delete schedule/i,
  statsTitle: /THỐNG KÊ LỊCH|SCHEDULE STATS/i,
  statsBooked: /ĐÃ ĐẶT|BOOKED/i,
  hasBookingsNotice: /đơn đặt cho lịch này|booking.*for this schedule/i,
  pastEventTitle: /Lịch khởi hành trong quá khứ|past departure/i,
  updateSuccessToast: /Cập nhật thành công|Updated successfully/i,
  updateErrorToast: /Không thể cập nhật|Could not update/i,
  deleteSuccessToast: /Xóa thành công|Deleted successfully/i,
  deleteErrorToast: /Không thể xóa|Could not delete/i,
  unsavedTitle: /Thay đổi chưa được lưu|Unsaved Changes/i,
  scheduleFetchError: /Không thể tải thông tin lịch|Could not load schedule information/i,
  scheduleFetchRetry: /Thử lại|Try again|Retry/i,
  deleteBlocked: /Không thể xóa|Cannot delete.*bookings/i,
  stayOnPage: /Ở lại|Stay/i,
  departureCodePlaceholder: /VD: VN123/i,
  departurePlacePlaceholder: /Sân bay Đà Nẵng|Da Nang airport/i,
};

const copy = tourScheduleEditCopy;

export class TourScheduleEditPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(scheduleId: number | string) {
    await this.page.goto(`/admin/tours/schedules/edit/${scheduleId}`, {
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

  async scrollMainContent(pixels = 600) {
    const main = this.mainScrollContainer;
    if ((await main.count()) > 0) {
      await main.evaluate((el, y) => {
        el.scrollTop = y;
        el.dispatchEvent(new Event('scroll', { bubbles: true }));
      }, pixels);
    }
    await this.page.waitForTimeout(400);
  }

  get scheduleFetchErrorBanner() {
    return this.page.getByRole('alert').filter({ hasText: copy.scheduleFetchError });
  }

  get scheduleFetchRetryButton() {
    return this.page.getByRole('button', { name: copy.scheduleFetchRetry });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get pageLoadingSpinner() {
    return this.page.locator('.flex.h-\\[400px\\].items-center.justify-center');
  }

  get breadcrumbRoot() {
    return this.page.getByText(copy.breadcrumbRoot).first();
  }

  get breadcrumbCurrent() {
    return this.page.locator('.text-\\[12px\\]').getByText(copy.breadcrumbCurrent).first();
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

  get formRoot() {
    return this.page.locator('form').first();
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

  get statsBlock() {
    return this.previewPanel.locator('.rounded-2xl.border').filter({ hasText: copy.statsTitle });
  }

  get pastScheduleWarning() {
    return this.page.getByText(copy.pastEventTitle);
  }

  get deleteScheduleButton() {
    return this.page.getByRole('button', { name: copy.deleteThisSchedule });
  }

  get deleteDialog() {
    return this.page.locator('[role="dialog"]').last();
  }

  get deleteDialogHeading() {
    return this.page.getByRole('heading', { name: copy.deleteDialogTitle });
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

  get unsavedChangesDialog() {
    return this.page.getByRole('heading', { name: copy.unsavedTitle });
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
    if (data.startDate != null) await this.startDateInput.fill(data.startDate);
    if (data.endDate != null) await this.endDateInput.fill(data.endDate);
    if (data.totalSlots != null) await this.totalSlotsInput.fill(String(data.totalSlots));
    if (data.bookingDeadline != null) await this.bookingDeadlineInput.fill(data.bookingDeadline);
    if (data.departureCode != null) await this.departureCodeInput.fill(data.departureCode);
    if (data.departurePlace != null) await this.departurePlaceInput.fill(data.departurePlace);
  }

  async selectStatus(option: RegExp) {
    const statusBlock = this.formRoot
      .locator('.space-y-2')
      .filter({ hasText: /Trạng thái|Status/i })
      .first();
    await statusBlock.locator('[class*="control"]').click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async submit() {
    await this.headerSubmitButton.click();
  }

  async openDeleteDialog() {
    await this.deleteScheduleButton.scrollIntoViewIfNeeded();
    await this.deleteScheduleButton.click();
    await this.deleteDialogHeading.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async confirmDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.deleteConfirm }).click();
  }

  async cancelDeleteDialog() {
    await this.deleteDialog.getByRole('button', { name: copy.cancel }).click();
  }

  waitForScheduleDetailResponse(scheduleId: number): Promise<Response> {
    return this.page.waitForResponse(
      (res: Response) =>
        res.request().method() === 'GET' &&
        new URL(res.url()).pathname.endsWith(`/admin/tour-schedules/${scheduleId}`),
      { timeout: 20_000 }
    );
  }

  waitForUpdateResponse(scheduleId: number): Promise<Response> {
    return this.page.waitForResponse(
      (res: Response) =>
        res.request().method() === 'PUT' &&
        new URL(res.url()).pathname.endsWith(`/admin/tour-schedules/${scheduleId}`),
      { timeout: 20_000 }
    );
  }

  waitForDeleteResponse(scheduleId: number): Promise<Response> {
    return this.page.waitForResponse(
      (res: Response) =>
        res.request().method() === 'DELETE' &&
        new URL(res.url()).pathname.endsWith(`/admin/tour-schedules/${scheduleId}`),
      { timeout: 20_000 }
    );
  }
}
