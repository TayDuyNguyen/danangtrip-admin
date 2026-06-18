/**
 * Admin Tour Schedule List — mapped from 03e_tour_schedule_list.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { TourScheduleListPage, tourScheduleListCopy as copy } from '../pages/admin/TourScheduleListPage';
import {
  getMockSchedule,
  mockToursApi,
  resetMockTours,
  setScheduleListFail,
  setScheduleListReturnEmpty,
} from '../fixtures/api/tours.mock';
import {
  expectedMockScheduleStats,
  mockFeaturedTour,
  scheduleListAvailableCapacityText,
  scheduleListFullCapacityText,
  scheduleListSearchKeyword,
} from '../fixtures/data/tours.data';

test.describe('Admin Tour Schedule List @P1', () => {
  let listPage: TourScheduleListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    listPage = new TourScheduleListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_SCHEDLIST_001 */
  test('TC_AD_SCHEDLIST_001 renders heading stats calendar filters and table', async () => {
    await expect(listPage.heading).toBeVisible();
    await expect(listPage.subtitle).toBeVisible();
    await expect(listPage.statsGrid).toBeVisible();
    await expect(listPage.calendarPanel).toBeVisible();
    await expect(listPage.searchInput).toBeVisible();
    await expect(listPage.table).toBeVisible();
    await expect(listPage.tableRows).toHaveCount(expectedMockScheduleStats.total_schedules);
  });

  /** TC_AD_SCHEDLIST_002 */
  test('TC_AD_SCHEDLIST_002 shows stats cards from API', async () => {
    await expect(listPage.statValue(/Tổng lịch|TOTAL/i)).toHaveText(
      String(expectedMockScheduleStats.total_schedules)
    );
    await expect(listPage.statValue(/Đang hoạt động|Active/i)).toHaveText(
      String(expectedMockScheduleStats.available_schedules)
    );
    await expect(listPage.statValue(/Hết chỗ|Sold out/i)).toHaveText(
      String(expectedMockScheduleStats.full_schedules)
    );
    await expect(listPage.statValue(/Đã hủy|CANCELLED/i)).toHaveText(
      String(expectedMockScheduleStats.cancelled_schedules)
    );
  });

  /** TC_AD_SCHEDLIST_003 — data display integrity */
  test('TC_AD_SCHEDLIST_003 displays tour name and capacity from API', async () => {
    await expect(listPage.rowByTourName(mockFeaturedTour.name).first()).toBeVisible();
    await expect(listPage.page.getByText(scheduleListAvailableCapacityText)).toBeVisible();
    await expect(listPage.page.getByText(scheduleListFullCapacityText)).toBeVisible();
    await expect(listPage.page.getByText(/City Tour/i).first()).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_004 */
  test('TC_AD_SCHEDLIST_004 navigates calendar months', async () => {
    await expect(listPage.calendarPanel.getByText(/Tháng 6|Month 6/i)).toBeVisible();
    await listPage.calendarNextMonthButton.click();
    await expect(listPage.calendarPanel.getByText(/Tháng 7|Month 7/i)).toBeVisible();
    await listPage.calendarPrevMonthButton.click();
    await expect(listPage.calendarPanel.getByText(/Tháng 6|Month 6/i)).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_005 */
  test('TC_AD_SCHEDLIST_005 calendar day click filters table by date', async () => {
    const listReq = listPage.waitForScheduleListResponse();
    await listPage.calendarDayCell(20).first().click();
    await listReq;
    await expect(listPage.tableRows).toHaveCount(1);
    await expect(listPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
  });

  /** TC_AD_SCHEDLIST_006 */
  test('TC_AD_SCHEDLIST_006 filters rows by search keyword', async () => {
    await listPage.search(scheduleListSearchKeyword);
    await expect(listPage.rowByTourName(mockFeaturedTour.name).first()).toBeVisible({ timeout: 10_000 });
    await expect(listPage.rowByTourName('Tour Hội An cổ kính')).toHaveCount(0);
  });

  /** TC_AD_SCHEDLIST_031 */
  test('TC_AD_SCHEDLIST_031 search is case-insensitive', async () => {
    await listPage.search('ba na');
    await expect(listPage.rowByTourName(mockFeaturedTour.name).first()).toBeVisible({ timeout: 10_000 });
    await listPage.searchInput.fill('');
    await listPage.search('BA NA');
    await expect(listPage.rowByTourName(mockFeaturedTour.name).first()).toBeVisible({ timeout: 10_000 });
  });

  /** TC_AD_SCHEDLIST_007 */
  test('TC_AD_SCHEDLIST_007 filters by tour dropdown', async () => {
    await listPage.selectTourFilter(mockFeaturedTour.name);
    await expect(listPage.tableRows).toHaveCount(4);
    await expect(listPage.rowByTourName('Tour Hội An cổ kính')).toHaveCount(0);
  });

  /** TC_AD_SCHEDLIST_008 */
  test('TC_AD_SCHEDLIST_008 filters by cancelled status', async () => {
    await listPage.selectStatusFilter(/Đã hủy|Cancelled/i);
    await expect(listPage.tableRows).toHaveCount(1);
    await expect(listPage.page.getByText(scheduleListFullCapacityText)).toHaveCount(0);
  });

  /** TC_AD_SCHEDLIST_009 */
  test('TC_AD_SCHEDLIST_009 deletes schedule after confirm dialog', async ({ adminPage }) => {
    const row = listPage.tableRows.filter({ hasText: '0 / 15' });
    const deleteReq = listPage.waitForScheduleDelete(99);
    await listPage.deleteButtonInRow(row).click();
    await expect(adminPage.getByRole('heading', { name: /Xóa lịch khởi hành|Delete this schedule/i })).toBeVisible();
    await listPage.confirmDeleteDialog();
    await deleteReq;
    expect(getMockSchedule(99)).toBeUndefined();
    await expect(listPage.tableRows).toHaveCount(expectedMockScheduleStats.total_schedules - 1);
  });

  /** TC_AD_SCHEDLIST_010 */
  test('TC_AD_SCHEDLIST_010 cancels delete dialog without API call', async ({ adminPage }) => {
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/tour-schedules/')) {
        deleteCalled = true;
      }
    });
    const row = listPage.tableRows.filter({ hasText: '0 / 15' });
    await listPage.deleteButtonInRow(row).click();
    await listPage.cancelDeleteDialog();
    await expect(listPage.deleteDialogPanel).toHaveCount(0);
    expect(deleteCalled).toBe(false);
    expect(getMockSchedule(99)).toBeTruthy();
  });

  /** TC_AD_SCHEDLIST_011 */
  test('TC_AD_SCHEDLIST_011 edit button navigates to schedule edit', async ({ adminPage }) => {
    const row = listPage.rowByTourName(mockFeaturedTour.name).first();
    await listPage.editButtonInRow(row).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/schedules\/edit\/\d+/);
  });

  /** TC_AD_SCHEDLIST_012 */
  test('TC_AD_SCHEDLIST_012 add button navigates to schedule create', async ({ adminPage }) => {
    const row = listPage.rowByTourName(mockFeaturedTour.name).first();
    await listPage.addButtonInRow(row).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${mockFeaturedTour.id}/schedules/create`));
  });

  /** TC_AD_SCHEDLIST_013 */
  test('TC_AD_SCHEDLIST_013 tour name button filters table by tour', async ({ adminPage }) => {
    const listReq = listPage.waitForScheduleListResponse();
    await listPage.tourNameButton(mockFeaturedTour.name).first().click();
    await listReq;
    await expect(adminPage).toHaveURL(new RegExp(`tour_id=${mockFeaturedTour.id}`));
    await expect(listPage.tableRows).toHaveCount(4);
    await expect(listPage.rowByTourName('Tour Hội An cổ kính')).toHaveCount(0);
  });
});

test.describe('Admin Tour Schedule List — empty & error @P1', () => {
  let listPage: TourScheduleListPage;

  test('TC_AD_SCHEDLIST_014 shows empty state when no schedules', async ({ adminPage }) => {
    resetMockTours();
    setScheduleListReturnEmpty(true);
    await mockToursApi(adminPage);
    listPage = new TourScheduleListPage(adminPage);
    await listPage.goto();
    await expect(listPage.page.getByText(/Không có lịch khởi hành|No schedules found/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(listPage.tableRows).toHaveCount(0);
  });

  test('TC_AD_SCHEDLIST_015 shows fetch error when list API fails', async ({ adminPage }) => {
    resetMockTours();
    setScheduleListFail(true);
    await mockToursApi(adminPage);
    listPage = new TourScheduleListPage(adminPage);
    await listPage.goto();
    await expect(
      listPage.page.getByRole('heading', { name: copy.fetchError })
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(listPage.retryButton).toBeVisible();
  });
});
