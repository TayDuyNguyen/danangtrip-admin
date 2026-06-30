import { expect, type Locator, type Page, type Response } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const paymentListCopy = {
  heading: /Danh sách Giao dịch|Payment Transactions|Transaction List/i,
  subtitle: /Quản lý, tìm kiếm|Manage, search/i,
  exportButton: /Xuất báo cáo Excel|Export Excel Report/i,
  searchPlaceholder: /Tìm.*mã giao dịch|Tìm kiếm mã|Search transaction/i,
  allStatuses: /Tất cả Trạng thái|All statuses/i,
  allGateways: /Tất cả Cổng thanh toán|All payment gateways/i,
  allRefundStatuses: /Tất cả yêu cầu hoàn|All Refund Requests/i,
  statusSuccess: /^Thành công$|^Success$/i,
  statusPending: /^Đang chờ$|^Pending$/i,
  statusFailed: /^Lỗi$|^Failed$/i,
  statusRefunded: /Đã hoàn tiền|^Refunded$/i,
  statusPartial: /Thanh toán một phần|Partially [Pp]aid/i,
  gatewaySepay: /^SePay$/i,
  gatewayVnpay: /^VNPay$/i,
  refundPending: /Chờ hoàn tiền|Pending Refund/i,
  resetFilters: /^Làm mới$|^Reset$|^Refresh filters$/i,
  emptyTitle: /Không tìm thấy giao dịch|No transactions found/i,
  detailAction: /^Chi tiết$|^Details$/i,
  refundAction: /^Hoàn tiền$|^Refund$/i,
  refundStaffTooltip: /Chỉ người quản trị|Only administrators/i,
  exportSuccess: /Đã xuất báo cáo giao dịch|Transaction report exported/i,
  exportError: /Có lỗi xảy ra khi xuất báo cáo|error.*export/i,
  refundSuccess: /Refund request for transaction|Đã thực hiện hoàn tiền|hoàn tiền.*thành công/i,
  statsRevenue: /Tổng Doanh thu.*trang này|Total Revenue.*this page/i,
  statsSuccess: /Giao dịch Thành công.*trang này|Successful Payments.*this page/i,
  colTransaction: /Mã Giao dịch|Transaction/i,
  colBooking: /Đơn hàng|Booking/i,
};

const copy = paymentListCopy;

export class PaymentListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/payments', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login') || this.page.url().includes('/dashboard')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/payments', { waitUntil: 'domcontentloaded' });
    }
    await this.heading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async waitForTableLoaded() {
    if (this.page.url().includes('/login') || this.page.url().includes('/dashboard')) {
      await ensureAdminSessionOnPage(this.page);
      await this.goto();
    }
    await this.tableBodyRows.first().waitFor({ state: 'visible', timeout: 20_000 });
  }

  waitForListResponse(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/payments') &&
        !res.url().includes('/export') &&
        !res.url().match(/\/payments\/\d+/) &&
        res.request().method() === 'GET' &&
        res.status() === 200
    );
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1, name: copy.heading });
  }

  get subtitle() {
    return this.page.getByText(copy.subtitle).first();
  }

  get exportButton() {
    return this.page.getByRole('button', { name: copy.exportButton });
  }

  get searchInput() {
    return this.page.getByPlaceholder(copy.searchPlaceholder);
  }

  get filterPanel() {
    return this.page.locator('.bg-white\\/80').filter({ has: this.searchInput }).first();
  }

  get statsGrid() {
    return this.page.locator('.grid').filter({ hasText: copy.statsRevenue }).first();
  }

  get tableBodyRows() {
    return this.page.locator('main main tbody tr, main tbody tr').filter({ has: this.page.locator('td') });
  }

  get emptyState() {
    return this.page.getByText(copy.emptyTitle);
  }

  get resetFiltersButton() {
    return this.filterPanel.getByRole('button', { name: copy.resetFilters });
  }

  get tableRefreshButton() {
    return this.page.getByRole('button', { name: /Làm mới|^Refresh$/i }).filter({
      has: this.page.locator('svg'),
    }).first();
  }

  private async openFilterSelect(index: number) {
    await this.filterPanel.scrollIntoViewIfNeeded();
    await this.filterPanel.locator('div[class*="-control"]').nth(index).click();
  }

  async selectStatusFilter(option: RegExp) {
    await this.openFilterSelect(0);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(400);
  }

  async selectGatewayFilter(option: RegExp) {
    await this.openFilterSelect(1);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(400);
  }

  async selectRefundFilter(option: RegExp) {
    await this.openFilterSelect(2);
    await this.page.getByRole('option', { name: option }).click();
    await this.page.waitForTimeout(400);
  }

  rowByTransactionCode(code: string) {
    return this.page.locator('main main tbody tr, main tbody tr').filter({ hasText: code });
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.waitForTimeout(400);
  }

  async clickDetailOnRow(code: string) {
    await this.rowByTransactionCode(code).getByRole('link', { name: copy.detailAction }).click();
  }

  async clickTransactionLink(code: string) {
    await this.rowByTransactionCode(code).getByRole('link', { name: code }).click();
  }

  refundButtonInRow(code: string) {
    return this.rowByTransactionCode(code).getByRole('button', { name: copy.refundAction });
  }

  get paginationNext() {
    return this.page.locator('button').filter({ has: this.page.locator('svg') }).last();
  }

  async expectToast(pattern: RegExp) {
    await expect(this.page.getByText(pattern).first()).toBeVisible({ timeout: 10_000 });
  }

  statCardValue(title: RegExp) {
    return this.statsGrid
      .locator('div.rounded-2xl')
      .filter({ has: this.page.getByText(title) })
      .locator('.text-2xl');
  }
}

export default PaymentListPage;
