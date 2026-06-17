/**
 * Admin Tour Schedule List — extended coverage (03e)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { TourScheduleListPage } from '../pages/admin/TourScheduleListPage';
import {
  getMockSchedule,
  mockToursApi,
  resetMockTours,
} from '../fixtures/api/tours.mock';
import { mockFeaturedTour } from '../fixtures/data/tours.data';

test.describe('Admin Tour Schedule List extended @P2', () => {
  let listPage: TourScheduleListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    listPage = new TourScheduleListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_SCHEDLIST_016 */
  test('TC_AD_SCHEDLIST_016 breadcrumb links to tour list', async ({ adminPage }) => {
    await adminPage.locator('a[href="/admin/tours/list"]').first().click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  /** TC_AD_SCHEDLIST_017 */
  test('TC_AD_SCHEDLIST_017 shows sold out booking badge for full schedule', async () => {
    const fullRow = listPage.tableRows.filter({ hasText: '25 / 25' });
    await expect(fullRow.getByText(/Hết chỗ|Sold out/i)).toBeVisible();
    await expect(fullRow.getByText(/^Đầy chỗ$|^Full$/i)).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_018 */
  test('TC_AD_SCHEDLIST_018 shows open booking badge for available schedule', async () => {
    const openRow = listPage.tableRows.filter({ hasText: '10 / 30' });
    await expect(openRow.getByText(/^Còn chỗ$|^Open$/i)).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_019 */
  test('TC_AD_SCHEDLIST_019 toggles sort by start date', async () => {
    const sortReq = listPage.waitForScheduleListResponse();
    await listPage.sortStartDateButton().click();
    await sortReq;
    await expect(listPage.sortStartDateButton()).toContainText(/Tăng dần|Ascending|Giảm dần|Descending/i);
  });

  /** TC_AD_SCHEDLIST_020 */
  test('TC_AD_SCHEDLIST_020 applies date range filter', async () => {
    await listPage.setDateFrom('2026-07-01');
    await listPage.setDateTo('2026-07-31');
    await listPage.applyDateFilter();
    await expect(listPage.tableRows).toHaveCount(3);
    await expect(listPage.rowByTourName('Tour Hội An cổ kính')).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_021 */
  test('TC_AD_SCHEDLIST_021 resets filters after search', async () => {
    await listPage.search('Ba Na');
    await expect(listPage.resetFilterButton).toBeVisible();
    await listPage.resetFilters();
    await expect(listPage.tableRows).toHaveCount(5);
  });

  /** TC_AD_SCHEDLIST_022 */
  test('TC_AD_SCHEDLIST_022 calendar reset clears date selection', async () => {
    await listPage.calendarDayCell(20).first().click();
    await expect(listPage.calendarResetDateButton).toBeVisible();
    await listPage.calendarResetDateButton.click();
    await expect(listPage.tableRows).toHaveCount(5);
  });

  /** TC_AD_SCHEDLIST_023 */
  test('TC_AD_SCHEDLIST_023 opens with tour_id query param', async ({ adminPage }) => {
    await adminPage.goto('/admin/tours/schedules?tour_id=1');
    await listPage.heading.waitFor({ state: 'visible' });
    await listPage.waitForTableLoaded();
    await expect(listPage.tableRows).toHaveCount(4);
    await expect(listPage.rowByTourName('Tour Hội An cổ kính')).toHaveCount(0);
  });

  /** TC_AD_SCHEDLIST_024 */
  test('TC_AD_SCHEDLIST_024 selects all rows on page and shows bulk toolbar', async () => {
    await listPage.selectAllCheckbox.check();
    await expect(listPage.tableCard.getByText(/Đã chọn|Selected/i)).toBeVisible();
    await expect(listPage.bulkActivateButton).toBeVisible();
    await expect(listPage.bulkCancelButton).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_025 */
  test('TC_AD_SCHEDLIST_025 bulk cancels selected schedules', async ({ adminPage }) => {
    const row = listPage.rowByTourName(mockFeaturedTour.name).filter({ hasText: '10 / 30' });
    await listPage.rowCheckbox(row).check();
    const patchReq = listPage.waitForScheduleStatusPatch(101);
    await listPage.bulkCancelButton.click();
    await patchReq;
    expect(getMockSchedule(101)?.status).toBe('cancelled');
    await expect(adminPage.getByText(/thành công|success/i).first()).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_026 */
  test('TC_AD_SCHEDLIST_026 bulk activates selected schedules', async ({ adminPage }) => {
    const row = listPage.tableRows.filter({ hasText: '5 / 20' });
    await listPage.rowCheckbox(row).check();
    const patchReq = listPage.waitForScheduleStatusPatch(103);
    await listPage.bulkActivateButton.click();
    await patchReq;
    expect(getMockSchedule(103)?.status).toBe('available');
    await expect(adminPage.getByText(/thành công|success/i).first()).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_027 */
  test('TC_AD_SCHEDLIST_027 row status dropdown patches schedule', async ({ adminPage }) => {
    const row = listPage.tableRows.filter({ hasText: '5 / 20' });
    const statusControl = row.locator('div[class*="-control"]').first();
    await statusControl.click();
    const patchReq = listPage.waitForScheduleStatusPatch(103);
    await adminPage.getByRole('option', { name: /Đã hủy|Cancelled/i }).click();
    await patchReq;
    expect(getMockSchedule(103)?.status).toBe('cancelled');
  });

  /** TC_AD_SCHEDLIST_028 */
  test('TC_AD_SCHEDLIST_028 changes per page limit', async () => {
    await listPage.changeLimit(20);
    await expect(listPage.tableCard.getByText(/20\s*\/\s*(trang|page)/i).first()).toBeVisible();
    await expect(listPage.tableRows).toHaveCount(5);
  });

  /** TC_AD_SCHEDLIST_029 */
  test('TC_AD_SCHEDLIST_029 shows price follows tour when no override', async () => {
    await expect(listPage.page.getByText(/Theo tour|Tour default/i).first()).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_030 */
  test('TC_AD_SCHEDLIST_030 disables delete when schedule has bookings', async () => {
    const fullRow = listPage.tableRows.filter({ hasText: '25 / 25' });
    await expect(fullRow.locator('button[disabled]').filter({ has: listPage.page.locator('svg') })).toBeVisible();
  });
});
