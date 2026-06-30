/**
 * Admin Reports — Revenue (10_reports REP_GEN + REP_REV + REP_EXP)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { ReportPage, reportsCopy as copy } from '../pages/admin/ReportPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockReportsApi,
  resetMockReports,
  setRevenueApiDelay,
  setRevenueApiFail,
  setRevenueExportFail,
} from '../fixtures/api/reports.mock';
import {
  primaryRevenuePayment,
  reportFilterFrom,
  reportFilterTo,
  reportUrlRecoveryFrom,
  reportUrlRecoveryTo,
} from '../fixtures/data/reports-shared.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Reports — Revenue @P1', () => {
  let reportPage: ReportPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockReports();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockReportsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    reportPage = new ReportPage(adminPage, '/admin/reports/revenue');
    await reportPage.goto();
    await reportPage.waitForContentLoaded();
  });

  /** TC_AD_REP_001 — REP_GEN_001 */
  test('TC_AD_REP_001 syncs filters to URL on apply', async ({ adminPage }) => {
    await reportPage.applyDateRange(reportFilterFrom, reportFilterTo);
    await expect(adminPage).toHaveURL(/from=2026-05-01/);
    await expect(adminPage).toHaveURL(/to=2026-05-31/);
    await expect(adminPage).toHaveURL(/page=1/);
  });

  /** TC_AD_REP_002 — REP_GEN_002 */
  test('TC_AD_REP_002 restores filters from URL query', async () => {
    await reportPage.goto(`from=${reportUrlRecoveryFrom}&to=${reportUrlRecoveryTo}`);
    await reportPage.waitForContentLoaded();
    await expect(reportPage.fromDateInput).toHaveValue(reportUrlRecoveryFrom);
    await expect(reportPage.toDateInput).toHaveValue(reportUrlRecoveryTo);
  });

  /** TC_AD_REP_003 — REP_GEN_003 */
  test('TC_AD_REP_003 blocks invalid date range with toast', async ({ adminPage }) => {
    await reportPage.fromDateInput.fill('2026-06-15');
    await reportPage.toDateInput.fill('2026-06-01');
    await reportPage.applyButton.click();
    await reportPage.expectToast(copy.dateRangeError);
    await expect(adminPage).not.toHaveURL(/from=2026-06-15/);
  });

  /** TC_AD_REP_004 — REP_GEN_004 */
  test('TC_AD_REP_004 resets filters to defaults', async ({ adminPage }) => {
    await reportPage.applyDateRange(reportFilterFrom, reportFilterTo);
    await reportPage.resetButton.click();
    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0];
    await expect(reportPage.fromDateInput).toHaveValue(firstOfMonth);
    await expect(reportPage.toDateInput).toHaveValue(today);
    await expect(adminPage).toHaveURL(new RegExp(`from=${firstOfMonth}`));
  });

  /** TC_AD_REP_005 — REP_GEN_005 */
  test('TC_AD_REP_005 toggles mock mode manually', async () => {
    await reportPage.enableMockMode();
    await expect(reportPage.page.getByText(copy.topTours)).toBeVisible();
    await reportPage.expectToast(copy.mockSwitchedOn);
    await reportPage.disableMockMode();
    await reportPage.expectToast(copy.mockSwitchedReal);
  });

  /** TC_AD_REP_006 — REP_GEN_006 */
  test('TC_AD_REP_006 shows error panel when API fails without auto mock', async ({ adminPage }) => {
    setRevenueApiFail(true);
    const failReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/dashboard/revenue') && res.status() === 500
    );
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await failReq;
    await expect(reportPage.errorPanel).toBeVisible({ timeout: 15_000 });
    await expect(reportPage.page.locator('button').filter({ hasText: copy.mockOff })).toBeVisible();
    await expect(reportPage.page.getByText(copy.trendChart)).toHaveCount(0);
    await reportPage.expectToast(copy.autoMockToast);
  });

  /** TC_AD_REP_007 — REP_GEN_007 */
  test('TC_AD_REP_007 uses mock data from error panel', async ({ adminPage }) => {
    setRevenueApiFail(true);
    const failReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/dashboard/revenue') && res.status() === 500
    );
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await failReq;
    await expect(reportPage.errorPanel).toBeVisible({ timeout: 15_000 });
    await reportPage.useMockButton.click();
    await expect(reportPage.page.locator('button').filter({ hasText: copy.mockOn })).toBeVisible();
    await expect(reportPage.page.getByText(copy.trendChart)).toBeVisible();
    await expect(adminPage).toHaveURL(/mock=1/);
  });

  /** TC_AD_REP_008 — REP_GEN_008 */
  test('TC_AD_REP_008 retries API from error panel', async ({ adminPage }) => {
    setRevenueApiFail(true);
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(reportPage.errorPanel).toBeVisible({ timeout: 15_000 });
    setRevenueApiFail(false);
    const retryReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/dashboard/revenue') && res.status() === 200
    );
    await reportPage.retryButton.click();
    await retryReq;
    await expect(
      reportPage.reportTable.getByText(primaryRevenuePayment.transaction_code!)
    ).toBeVisible();
  });

  /** TC_AD_REP_009 — REP_GEN_009 */
  test('TC_AD_REP_009 shows loading state while API is delayed', async ({ adminPage }) => {
    setRevenueApiDelay(1500);
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(reportPage.page.locator('.animate-spin').first()).toBeVisible();
    await expect(reportPage.reportTable.getByText(primaryRevenuePayment.transaction_code!)).toBeVisible({
      timeout: 12_000,
    });
    setRevenueApiDelay(0);
  });

  /** TC_AD_REP_010 — REP_REV_010 */
  test('TC_AD_REP_010 renders revenue trend chart', async () => {
    await expect(reportPage.page.getByText(copy.trendChart)).toBeVisible();
    await expect(reportPage.page.locator('.recharts-responsive-container').first()).toBeVisible();
  });

  /** TC_AD_REP_011 — REP_REV_011 */
  test('TC_AD_REP_011 renders payment gateway chart', async () => {
    await expect(reportPage.page.getByText(copy.gatewayDonut)).toBeVisible();
    await expect(reportPage.page.locator('span.uppercase').filter({ hasText: /^momo$/i }).first()).toBeVisible();
  });

  /** TC_AD_REP_012 — REP_REV_012 */
  test('TC_AD_REP_012 renders top 5 tours widget', async () => {
    await expect(reportPage.page.getByText(copy.topTours)).toBeVisible();
    const topToursCard = reportPage.page
      .getByText(copy.topTours)
      .locator('xpath=ancestor::div[contains(@class,"rounded")]')
      .first();
    await expect(topToursCard.locator('.recharts-bar-rectangle')).toHaveCount(5);
  });

  /** TC_AD_REP_013 — REP_REV_013 */
  test('TC_AD_REP_013 displays transaction table fields from API', async () => {
    const row = reportPage.reportTable.locator('tbody tr').first();
    await expect(row.getByText(primaryRevenuePayment.transaction_code!)).toBeVisible();
    await expect(
      row.getByRole('link', { name: `#${primaryRevenuePayment.booking!.booking_code}` })
    ).toBeVisible();
    await expect(row.getByText(primaryRevenuePayment.booking!.user!.full_name)).toBeVisible();
    await expect(row.getByText(primaryRevenuePayment.booking!.tour_name!)).toBeVisible();
    await expect(row.getByText(/momo/i)).toBeVisible();
  });

  /** TC_AD_REP_019 — REP_EXP_019 */
  test('TC_AD_REP_019 exports mock CSV in mock mode', async () => {
    await reportPage.enableMockMode();
    await reportPage.exportButton.click();
    await reportPage.page.waitForTimeout(1500);
    await reportPage.expectToast(copy.exportMockSuccess);
  });

  /** TC_AD_REP_020 — REP_EXP_020 */
  test('TC_AD_REP_020 exports real xlsx via API', async ({ adminPage }) => {
    const exportReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/payments/export') && res.status() === 200
    );
    await reportPage.exportButton.click();
    const res = await exportReq;
    expect(res.ok()).toBeTruthy();
  });

  /** TC_AD_REP_021 — REP_EXP_021 */
  test('TC_AD_REP_021 shows toast when export API fails', async ({ adminPage }) => {
    setRevenueExportFail(true);
    const exportReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/payments/export') && res.status() === 500
    );
    await reportPage.exportButton.click();
    await exportReq;
    await reportPage.expectToast(copy.exportError);
  });

  /** TC_AD_REP_022 — REP_EXP_022 */
  test('TC_AD_REP_022 paginates transaction table', async ({ adminPage }) => {
    await reportPage.enableMockMode();
    await expect(reportPage.nextPageButton).toBeEnabled();
    await reportPage.nextPageButton.click();
    await expect(adminPage).toHaveURL(/page=2/);
    await expect(reportPage.reportTable.locator('tbody tr').first()).toBeVisible();
  });
});
