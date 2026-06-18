/**
 * Admin Tour Schedule Detail — mapped from 03h_tour_schedule_detail.md
 * Detail = dedicated read-only route + GET API.
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  TourScheduleDetailPage,
  tourScheduleDetailCopy as copy,
} from '../pages/admin/TourScheduleDetailPage';
import {
  clearScheduleDetailFail,
  mockToursApi,
  patchMockSchedule,
  resetMockTours,
  setScheduleDetailFail,
} from '../fixtures/api/tours.mock';
import {
  cancelledEditSchedule,
  cancelledScheduleId,
  defaultEditSchedule,
  defaultEditScheduleId,
  detailOperationalFixture,
  fullEditSchedule,
  fullScheduleId,
  invalidScheduleId,
} from '../fixtures/data/tour-schedule-detail.data';
import { mockFeaturedTour } from '../fixtures/data/tours.data';

test.describe('Admin Tour Schedule Detail @P1', () => {
  let detailPage: TourScheduleDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId);
  });

  /** TC_AD_SCHEDDETAIL_010 */
  test('TC_AD_SCHEDDETAIL_010 preloads schedule detail into summary panel', async () => {
    const [y, m, d] = defaultEditSchedule.start_date.split('-');
    const formattedStart = `${d}/${m}/${y}`;
    await expect(detailPage.summaryPanel).toBeVisible();
    await expect(detailPage.summaryPanel).toContainText(formattedStart);
    await expect(detailPage.summaryPanel).toContainText(`#${defaultEditScheduleId}`);
    await expect(detailPage.statsBlock.getByText(String(defaultEditSchedule.max_people)).first()).toBeVisible();
    await expect(detailPage.page.getByText(copy.statusAvailable).first()).toBeVisible();
    await detailPage.captureUiScreenshot('TC_AD_SCHEDDETAIL_010');
  });

  /** TC_AD_SCHEDDETAIL_020 */
  test('TC_AD_SCHEDDETAIL_020 shows schedule date range in info box', async () => {
    const [y, m, d] = defaultEditSchedule.start_date.split('-');
    const formatted = `${d}/${m}/${y}`;
    await expect(detailPage.scheduleInfoBox).toBeVisible();
    await expect(detailPage.scheduleInfoBox).toContainText(formatted);
  });

  /** TC_AD_SCHEDDETAIL_021 */
  test('TC_AD_SCHEDDETAIL_021 shows available status badge in info box', async () => {
    await expect(detailPage.statusBadgeInInfoBox(copy.statusAvailable)).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_024 */
  test('TC_AD_SCHEDDETAIL_024 shows booked and max capacity in info box', async () => {
    await expect(
      detailPage.scheduleInfoBox.getByText(
        `${defaultEditSchedule.booked_people} / ${defaultEditSchedule.max_people}`
      )
    ).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_025 */
  test('TC_AD_SCHEDDETAIL_025 shows tour name from nested API tour', async () => {
    await expect(detailPage.tourNameInInfo(mockFeaturedTour.name)).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_026 */
  test('TC_AD_SCHEDDETAIL_026 shows stats block with booked available and max', async () => {
    const available = defaultEditSchedule.max_people - defaultEditSchedule.booked_people;
    await expect(detailPage.statsBlock).toBeVisible();
    await expect(detailPage.statsBlock.getByText(copy.statsBooked)).toBeVisible();
    await expect(detailPage.statsBlock.getByText(String(available)).first()).toBeVisible();
    await expect(
      detailPage.statsBlock.getByText(String(defaultEditSchedule.max_people)).first()
    ).toBeVisible();
    await expect(
      detailPage.statsBlock.getByText(String(defaultEditSchedule.booked_people)).first()
    ).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_030 */
  test('TC_AD_SCHEDDETAIL_030 shows operational fields in summary panel', async ({
    adminPage,
  }) => {
    resetMockTours();
    patchMockSchedule(defaultEditScheduleId, detailOperationalFixture);
    await mockToursApi(adminPage);
    detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(defaultEditScheduleId);

    await expect(detailPage.summaryPanel).toContainText(detailOperationalFixture.departure_code);
    await expect(detailPage.summaryPanel).toContainText(detailOperationalFixture.departure_place);
    const [y, m, d] = detailOperationalFixture.booking_deadline.split('-');
    await expect(detailPage.summaryPanel).toContainText(`${d}/${m}/${y}`);
  });
});

test.describe('Admin Tour Schedule Detail — status variants @P1', () => {
  /** TC_AD_SCHEDDETAIL_022 */
  test('TC_AD_SCHEDDETAIL_022 shows full status badge for sold-out schedule', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(fullScheduleId);

    await expect(detailPage.statusBadgeInInfoBox(copy.statusFull)).toBeVisible();
    await expect(
      detailPage.scheduleInfoBox.getByText(
        `${fullEditSchedule.booked_people} / ${fullEditSchedule.max_people}`
      )
    ).toBeVisible();
    await detailPage.captureUiScreenshot('TC_AD_SCHEDDETAIL_022');
  });

  /** TC_AD_SCHEDDETAIL_023 */
  test('TC_AD_SCHEDDETAIL_023 shows cancelled status badge', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(cancelledScheduleId);

    await expect(detailPage.statusBadgeInInfoBox(copy.statusCancelled)).toBeVisible();
    await expect(
      detailPage.scheduleInfoBox.getByText(
        `${cancelledEditSchedule.booked_people} / ${cancelledEditSchedule.max_people}`
      )
    ).toBeVisible();
  });

  /** TC_AD_SCHEDDETAIL_027 */
  test('TC_AD_SCHEDDETAIL_027 shows full progress bar at one hundred percent', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);
    await detailPage.gotoDetail(fullScheduleId);

    await expect(detailPage.progressBarFill).toHaveAttribute('style', /width:\s*100%/);
    await expect(detailPage.statsBlock.getByText('100%')).toBeVisible();
  });
});

test.describe('Admin Tour Schedule Detail — errors @P2', () => {
  /** TC_AD_SCHEDDETAIL_012 */
  test('TC_AD_SCHEDDETAIL_012 shows not found for invalid schedule id', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);

    const response = await detailPage.gotoDetailExpectingError(invalidScheduleId);
    expect(response.status()).toBe(404);
    await expect(detailPage.errorAlert).toContainText(copy.notFound, { timeout: 15_000 });
    await expect(detailPage.retryButton).toHaveCount(0);
  });

  /** TC_AD_SCHEDDETAIL_013 */
  test('TC_AD_SCHEDDETAIL_013 retry reloads schedule detail after server error', async ({
    adminPage,
  }) => {
    resetMockTours();
    setScheduleDetailFail(defaultEditScheduleId);
    await mockToursApi(adminPage);
    const detailPage = new TourScheduleDetailPage(adminPage);

    const failResponse = await detailPage.gotoDetailExpectingError(defaultEditScheduleId);
    expect(failResponse.status()).toBe(500);
    await expect(detailPage.errorAlert).toContainText(copy.serverError, { timeout: 15_000 });

    clearScheduleDetailFail();
    const detailReq = detailPage.waitForDetailResponse(defaultEditScheduleId);
    await detailPage.retryButton.click();
    await detailReq;

    await expect(detailPage.heading).toBeVisible({ timeout: 15_000 });
    await expect(detailPage.summaryPanel).toBeVisible();
  });
});

test.describe('Admin Tour Schedule Detail — auth @P0', () => {
  /** TC_AD_SCHEDDETAIL_001 */
  test('TC_AD_SCHEDDETAIL_001 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/tours/schedules/detail/${defaultEditScheduleId}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
