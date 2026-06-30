/**
 * Admin Reports — smoke other report types (10_reports)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { ReportPage, reportsCopy as copy } from '../pages/admin/ReportPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockReportsApi, resetMockReports } from '../fixtures/api/reports.mock';

test.describe.configure({ retries: 1 });

test.describe('Admin Reports — other types @P1', () => {
  test.beforeEach(async ({ adminPage }) => {
    resetMockReports();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockReportsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
  });

  /** TC_AD_REP_014 — REP_BKG_014 */
  test('TC_AD_REP_014 renders bookings report stats and charts', async ({ adminPage }) => {
    const page = new ReportPage(adminPage, '/admin/reports/bookings');
    await page.goto();
    await page.waitForContentLoaded();
    await expect(page.heading).toBeVisible();
    await expect(page.page.getByText(copy.bookingsTotal)).toBeVisible();
    await expect(page.page.getByText('Trần Minh Tâm')).toBeVisible();
    await expect(page.reportTable).toBeVisible();
  });

  /** TC_AD_REP_015 — REP_LOC_015 */
  test('TC_AD_REP_015 renders locations report with district data', async ({ adminPage }) => {
    const page = new ReportPage(adminPage, '/admin/reports/locations');
    await page.goto('mock=1');
    await page.waitForContentLoaded();
    await expect(page.heading).toBeVisible();
    await expect(page.page.getByText(copy.locationsTotal)).toBeVisible();
    await expect(page.page.getByRole('cell', { name: 'Sơn Trà' }).first()).toBeVisible();
    await expect(page.page.getByText('Bãi biển Mỹ Khê').first()).toBeVisible();
  });

  /** TC_AD_REP_016 — REP_RAT_016 */
  test('TC_AD_REP_016 renders ratings star distribution', async ({ adminPage }) => {
    const page = new ReportPage(adminPage, '/admin/reports/ratings');
    await page.goto('mock=1');
    await page.waitForContentLoaded();
    await expect(page.heading).toBeVisible();
    await expect(page.page.getByText(copy.ratingsTotal).first()).toBeVisible();
    await expect(page.page.getByText(/Dịch vụ tuyệt vời|Tour rất tuyệt vời/i).first()).toBeVisible();
    await expect(page.reportTable).toBeVisible();
  });

  /** TC_AD_REP_017 — REP_USR_017 */
  test('TC_AD_REP_017 renders users growth chart', async ({ adminPage }) => {
    const page = new ReportPage(adminPage, '/admin/reports/users');
    await page.goto();
    await page.waitForContentLoaded();
    await expect(page.heading).toBeVisible();
    await expect(page.page.getByText(copy.usersNew).first()).toBeVisible();
    await expect(page.page.getByRole('heading', { name: copy.usersGrowthChart })).toBeVisible();
    await expect(page.page.locator('.recharts-responsive-container').first()).toBeVisible();
  });

  /** TC_AD_REP_018 — REP_USR_018 */
  test('TC_AD_REP_018 users report shows year filter and table', async ({ adminPage }) => {
    const page = new ReportPage(adminPage, '/admin/reports/users');
    await page.goto('year=2026');
    await page.waitForContentLoaded();
    await expect(page.reportTable).toBeVisible();
    await expect(page.page.getByText(/Tháng 1|January/i).first()).toBeVisible();
  });
});
