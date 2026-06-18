/**
 * Admin Tour Schedule Detail — extended (03h)
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  TourScheduleDetailPage,
  tourScheduleDetailCopy as copy,
} from '../pages/admin/TourScheduleDetailPage';
import { TourEditPage } from '../pages/admin/TourEditPage';
import { TourScheduleEditPage } from '../pages/admin/TourScheduleEditPage';
import { TourScheduleListPage } from '../pages/admin/TourScheduleListPage';
import {
  mockToursApi,
  patchMockSchedule,
  resetMockTours,
} from '../fixtures/api/tours.mock';
import {
  defaultEditSchedule,
  defaultEditScheduleId,
  detailPriceOverrideFixture,
  isoStartDateLegacy,
} from '../fixtures/data/tour-schedule-detail.data';
import { mockFeaturedTour } from '../fixtures/data/tours.data';

const tourId = mockFeaturedTour.id;

test.describe('Admin Tour Schedule Detail — data display @P2', () => {
  /** TC_AD_SCHEDDETAIL_031 */
  test('TC_AD_SCHEDDETAIL_031 shows price follows tour when override is null', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId);

    await expect(detailPage.summaryPanel.getByText(copy.priceFollowsTour).first()).toBeVisible();
    await detailPage.captureUiScreenshot('TC_AD_SCHEDDETAIL_031');
  });

  /** TC_AD_SCHEDDETAIL_032 */
  test('TC_AD_SCHEDDETAIL_032 shows formatted override prices in summary', async ({
    adminPage,
  }) => {
    resetMockTours();
    patchMockSchedule(defaultEditScheduleId, detailPriceOverrideFixture);
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId);

    await expect(detailPage.summaryPanel.getByText(/1\.500\.000|1,500,000/)).toBeVisible();
    await expect(detailPage.summaryPanel.getByText(/900\.000|900,000/)).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_033 */
  test('TC_AD_SCHEDDETAIL_033 maps ISO start_date from API to summary display', async ({
    adminPage,
  }) => {
    resetMockTours();
    patchMockSchedule(defaultEditScheduleId, { start_date: isoStartDateLegacy });
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId);

    const [y, m, d] = defaultEditSchedule.start_date.split('-');
    await expect(detailPage.summaryPanel).toContainText(`${d}/${m}/${y}`);
  });
});

test.describe('Admin Tour Schedule Detail — navigation @P2', () => {
  /** TC_AD_SCHEDDETAIL_040 */
  test('TC_AD_SCHEDDETAIL_040 opens schedule edit from tour edit departures', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);

    const tourEditPage = new TourEditPage(adminPage, tourId);
    await tourEditPage.gotoAndWaitLoaded();

    const detailReq = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        res.url().includes(`/admin/tour-schedules/${defaultEditScheduleId}`) &&
        res.status() === 200
    );
    await tourEditPage.departureEditButton(0).click();
    await detailReq;

    const editPage = new TourScheduleEditPage(adminPage);
    await expect(editPage.heading).toBeVisible();
    await expect(editPage.startDateInput).toHaveValue(defaultEditSchedule.start_date);
    await expect(
      editPage.scheduleInfoBox.getByText(
        `${defaultEditSchedule.booked_people} / ${defaultEditSchedule.max_people}`
      )
    ).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_041 */
  test('TC_AD_SCHEDDETAIL_041 tour edit add schedule button opens schedule create', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);

    const tourEditPage = new TourEditPage(adminPage, tourId);
    await tourEditPage.gotoAndWaitLoaded();
    await tourEditPage.manageDeparturesButton.click();

    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/${tourId}/schedules/create\\?from=edit`)
    );
  });

  /** TC_AD_SCHEDDETAIL_042 */
  test('TC_AD_SCHEDDETAIL_042 schedule list view opens detail route', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);

    const listPage = new TourScheduleListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();

    const row = listPage.tableRows.filter({ hasText: '0 / 15' }).first();
    await listPage.viewButtonInRow(row).click();

    await expect(adminPage).toHaveURL(/\/admin\/tours\/schedules\/detail\/\d+/);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await expect(detailPage.heading).toBeVisible();
    await expect(detailPage.scheduleInfoBox).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_043 */
  test('TC_AD_SCHEDDETAIL_043 breadcrumb schedules link keeps tour filter', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId);

    await detailPage.breadcrumbSchedulesLink.click();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules\\?tour_id=${defaultEditSchedule.tour_id}`)
    );
  });
});

test.describe('Admin Tour Schedule Detail — responsive @P2', () => {
  /** TC_AD_SCHEDDETAIL_060 */
  test('TC_AD_SCHEDDETAIL_060 renders detail panels at standard viewport 1535x697', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId);

    await expect(detailPage.scheduleInfoBox).toBeVisible();
    await expect(detailPage.statsBlock).toBeVisible();
    await expect(detailPage.summaryPanel).toBeVisible();
    await detailPage.captureUiScreenshot('TC_AD_SCHEDDETAIL_060');
  });

  /** TC_AD_SCHEDDETAIL_061 */
  test('TC_AD_SCHEDDETAIL_061 stacks info box on mobile viewport', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId, { width: 390, height: 844 });

    await expect(detailPage.scheduleInfoBox).toBeVisible();
    await expect(
      detailPage.scheduleInfoBox.getByText(
        `${defaultEditSchedule.booked_people} / ${defaultEditSchedule.max_people}`
      )
    ).toBeVisible();
  });
});
