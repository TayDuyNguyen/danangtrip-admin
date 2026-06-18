import type { Locator, Page, Response } from '@playwright/test';

export const bookingListCopy = {
  heading: /Danh sách Đơn hàng|Booking Management/i,
  subtitle: /Quản lý toàn bộ đơn đặt tour|Manage all customer tour bookings/i,
  searchPlaceholder: /Tìm theo mã đơn|Search by code, customer name/i,
  allStatus: /Tất cả trạng thái|All Statuses/i,
  allPayment: /Tất cả thanh toán|All Payments/i,
  filterButton: /^Lọc$|^Filter$/i,
  resetButton: /^Đặt lại$|^Reset$/i,
  activeFiltering: /ĐANG LỌC THEO|ACTIVE FILTERS/i,
  exportButton: /Xuất Excel|Export Excel/i,
  tableTitle: /Danh sách Đơn hàng|Booking Management/i,
  emptyTitle: /Không tìm thấy đơn hàng|No bookings found/i,
  emptySubtitle: /Thử thay đổi bộ lọc|Try changing the filters or date range/i,
  statsTotal: /TỔNG ĐƠN HÀNG|TOTAL BOOKINGS/i,
  statsPending: /CHỜ XÁC NHẬN|PENDING CONFIRMATION/i,
  statsConfirmed: /ĐÃ XÁC NHẬN|^CONFIRMED$/i,
  statsCompleted: /HOÀN TẤT|^COMPLETED$/i,
  statsCancelled: /ĐÃ HỦY|^CANCELLED$/i,
  listLoadError: /Không tải được danh sách đơn hàng|Failed to load booking list/i,
  retryButton: /Thử lại|Retry/i,
  updateError: /Có lỗi xảy ra khi cập nhật đơn hàng|An error occurred while updating the booking/i,
  statusPending: /^Chờ xác nhận$|^Pending$/i,
  statusConfirmed: /^Đã xác nhận$|^Confirmed$/i,
  statusCompleted: /^Hoàn tất$|^Completed$/i,
  statusCancelled: /^Đã hủy$|^Cancelled$/i,
  paymentPending: /^Chờ thanh toán$|^Pending$/i,
  paymentPaid: /^Đã thanh toán$|^Paid$/i,
  paymentRefunded: /^Hoàn tiền$|^Refunded$/i,
  viewAction: /^Xem$|^View$/i,
  confirmBookingAction: /Xác nhận đơn|Confirm Booking/i,
  confirmPaymentAction: /Xác nhận thanh toán|Confirm Payment/i,
  cancelBookingAction: /Hủy đơn|Cancel Booking/i,
  cancelDialogTitle: /Hủy đơn hàng này|Cancel this booking/i,
  confirmCancel: /Xác nhận hủy|Confirm Cancellation/i,
  confirmPaymentDialog: /Xác nhận thanh toán\?|Confirm Payment\?/i,
  confirmPaymentSubmit: /Xác nhận đã thanh toán|Confirm Paid/i,
  closeDialog: /^Đóng$|^Close$/i,
  refresh: /Làm mới|Refresh/i,
  exportSuccess: /Đang tải file Excel|Excel file is downloading/i,
  confirmSuccess: /Đã xác nhận đơn hàng thành công|Booking confirmed successfully/i,
  paymentSuccess: /Đã xác nhận thanh toán thành công|Payment confirmed successfully/i,
  cancelSuccess: /Đã hủy đơn hàng thành công|Booking cancelled successfully/i,
  reasonRequired: /Vui lòng nhập lý do hủy|Cancellation reason is required/i,
};

const copy = bookingListCopy;

export class BookingListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(query = '') {
    const suffix = query ? (query.startsWith('?') ? query : `?${query}`) : '';
    await this.page.goto(`/admin/bookings${suffix}`, { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForTableLoaded() {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get subtitle() {
    return this.page.getByText(copy.subtitle);
  }

  get statsGrid() {
    return this.page.locator('.grid').filter({ hasText: copy.statsTotal }).first();
  }

  statValue(label: RegExp) {
    return this.statsGrid
      .getByText(label)
      .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]')
      .locator('span.text-\\[20px\\]');
  }

  get filterPanel() {
    return this.page.locator('.rounded-2xl.border').filter({ has: this.searchInput }).first();
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get filterButton() {
    return this.filterPanel.getByRole('button', { name: copy.filterButton });
  }

  get resetFilterButton() {
    return this.filterPanel.getByRole('button', { name: copy.resetButton });
  }

  get exportButton() {
    return this.page.getByRole('button', { name: copy.exportButton });
  }

  get tableCard() {
    return this.page.locator('.group\\/card').filter({ has: this.table }).first();
  }

  get table() {
    return this.page.locator('table');
  }

  get tableRows() {
    return this.table.locator('tbody tr').filter({ has: this.page.locator('td') });
  }

  get refreshButton() {
    return this.tableCard.getByRole('button', { name: copy.refresh });
  }

  get perPageSelect() {
    return this.tableCard.locator('div[class*="-control"]').last();
  }

  get prevPageButton() {
    return this.tableCard.locator('.border-t button').first();
  }

  get nextPageButton() {
    return this.tableCard.locator('.border-t .flex.items-center.gap-1\\.5 button').last();
  }

  pageButton(pageNum: number): Locator {
    return this.tableCard.getByRole('button', { name: String(pageNum), exact: true });
  }

  rowByCode(code: string): Locator {
    return this.tableRows.filter({ hasText: code });
  }

  sortBookedAtButton() {
    return this.table.locator('thead th').filter({ hasText: /Ngày đặt|Booked/i });
  }

  sortAmountButton() {
    return this.table.locator('thead th').filter({ hasText: /TỔNG TIỀN|TOTAL/i });
  }

  viewButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.viewAction });
  }

  confirmBookingButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.confirmBookingAction });
  }

  confirmPaymentButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.confirmPaymentAction });
  }

  cancelBookingButtonInRow(row: Locator): Locator {
    return row.getByRole('button', { name: copy.cancelBookingAction });
  }

  async clickFilterControl(label: RegExp) {
    await this.filterPanel
      .getByText(label)
      .locator('xpath=ancestor::div[contains(@class,"-control")]')
      .first()
      .click();
  }

  async selectStatusFilter(option: RegExp) {
    await this.clickFilterControl(copy.allStatus);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(350);
  }

  async selectPaymentFilter(option: RegExp) {
    await this.clickFilterControl(copy.allPayment);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(350);
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.filterButton.click();
    await this.page.waitForTimeout(350);
  }

  async submitSearchWithEnter(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(350);
  }

  async setDateFrom(value: string) {
    await this.filterPanel.locator('input[type="date"]').first().fill(value);
  }

  async setDateTo(value: string) {
    await this.filterPanel.locator('input[type="date"]').nth(1).fill(value);
  }

  async applyFilters() {
    await this.filterButton.click();
    await this.page.waitForTimeout(350);
  }

  async resetFilters() {
    await this.resetFilterButton.click();
    await this.page.waitForTimeout(350);
  }

  async changeLimit(count: number) {
    await this.perPageSelect.click();
    await this.page.getByRole('option', { name: new RegExp(String(count)) }).click();
    await this.page.waitForTimeout(350);
  }

  async goToPage(pageNum: number) {
    await this.pageButton(pageNum).click();
    await this.page.waitForTimeout(350);
  }

  get cancelDialog() {
    return this.page.locator('form').filter({ hasText: copy.cancelDialogTitle });
  }

  get confirmPaymentDialog() {
    return this.page.locator('.relative.w-full.max-w-\\[440px\\]').filter({ hasText: copy.confirmPaymentDialog });
  }

  async fillCancelReason(reason: string) {
    await this.page.locator('#booking-cancel-reason').fill(reason);
  }

  async submitCancelDialog() {
    await this.cancelDialog.getByRole('button', { name: copy.confirmCancel }).click();
  }

  async closeCancelDialog() {
    await this.cancelDialog.getByRole('button', { name: copy.closeDialog }).click();
  }

  async confirmPaymentDialogSubmit() {
    await this.confirmPaymentDialog.getByRole('button', { name: copy.confirmPaymentSubmit }).click();
  }

  async closeConfirmPaymentDialog() {
    await this.confirmPaymentDialog.getByRole('button', { name: copy.closeDialog }).click();
  }

  async clearFilterChip(key: 'status' | 'payment_status' | 'date_from' | 'date_to' | 'user_id' | 'tour_schedule_id') {
    const chip = this.filterPanel.getByTestId(`booking-filter-chip-${key}`);
    await chip.locator('button').click();
    await this.page.waitForTimeout(350);
  }

  get listErrorPanel() {
    return this.page.getByText(copy.listLoadError);
  }

  get retryListButton() {
    return this.page.getByRole('button', { name: copy.retryButton });
  }

  waitForBookingListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes('/admin/bookings') &&
        !res.url().includes('status-counts') &&
        !res.url().includes('/export') &&
        res.status() === 200
    );
  }

  waitForBookingStatusPatch(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/bookings/${id}/status`)
    );
  }

  waitForBookingConfirmPayment(id: number): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/bookings/${id}/confirm-payment`)
    );
  }
}
