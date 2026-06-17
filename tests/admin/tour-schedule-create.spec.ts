/**
 * Admin Tour Schedule Create — mapped from 03f_tour_schedule_create.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  TourScheduleCreatePage,
  tourScheduleCreateCopy as copy,
} from '../pages/admin/TourScheduleCreatePage';
import {
  mockToursApi,
  resetMockTours,
  setScheduleCreateFail,
  setTourDetailDelay,
  setTourDetailFail,
} from '../fixtures/api/tours.mock';
import {
  buildValidScheduleForm,
  futureStartDate,
  invalidBookingDeadline,
  invalidEndBeforeStart,
  pastStartDate,
  scheduleCreateValidationCopy,
  validScheduleSlots,
} from '../fixtures/data/tour-schedule-create.data';
import { mockFeaturedTour } from '../fixtures/data/tours.data';

const tourId = mockFeaturedTour.id;

test.describe('Admin Tour Schedule Create @P1', () => {
  let createPage: TourScheduleCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    createPage = new TourScheduleCreatePage(adminPage);
    await createPage.goto(tourId);
  });

  /** TC_AD_SCHEDCREATE_001 */
  test('TC_AD_SCHEDCREATE_001 renders heading form and preview', async () => {
    await expect(createPage.heading).toBeVisible();
    await expect(createPage.startDateInput).toBeVisible();
    await expect(createPage.endDateInput).toBeVisible();
    await expect(createPage.totalSlotsInput).toBeVisible();
    await expect(createPage.previewPanel).toBeVisible();
    await expect(createPage.previewPanel.getByText(copy.previewTitle)).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_002 */
  test('TC_AD_SCHEDCREATE_002 shows breadcrumb context', async () => {
    await expect(createPage.breadcrumbRoot).toBeVisible();
    await expect(createPage.breadcrumbCurrent).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_003 */
  test('TC_AD_SCHEDCREATE_003 displays tour name in info box', async () => {
    await expect(createPage.tourNameInInfo(mockFeaturedTour.name)).toBeVisible();
    await expect(
      createPage.tourInfoBox.locator('span').filter({ hasText: mockFeaturedTour.duration }).first()
    ).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_006 */
  test('TC_AD_SCHEDCREATE_006 shows primary form fields and default slots from tour', async () => {
    await expect(createPage.startDateInput).toBeVisible();
    await expect(createPage.endDateInput).toBeVisible();
    await expect(createPage.totalSlotsInput).toHaveValue(String(mockFeaturedTour.max_people));
    await expect(createPage.page.getByText(copy.statusAvailable).first()).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_010 */
  test('TC_AD_SCHEDCREATE_010 shows price override help notice', async () => {
    await expect(createPage.priceOverrideNotice).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_012 */
  test('TC_AD_SCHEDCREATE_012 preview shows placeholders before input', async () => {
    await expect(createPage.previewPanel.getByText('-').first()).toBeVisible();
    await expect(createPage.previewPanel.getByText(copy.priceFollowsTour).first()).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_019 — maps doc TC_AD_SCHEDCREATE_001 */
  test('TC_AD_SCHEDCREATE_019 blocks submit with empty date fields', async ({ adminPage }) => {
    await createPage.clearDateFields();
    await createPage.submit();

    await expect(createPage.fieldError(createPage.startDateInput)).toBeVisible();
    await expect(createPage.fieldError(createPage.endDateInput)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${tourId}/schedules/create`));
  });

  /** TC_AD_SCHEDCREATE_020 — maps doc TC_AD_SCHEDCREATE_002 */
  test('TC_AD_SCHEDCREATE_020 rejects past start date', async ({ adminPage }) => {
    const end = futureStartDate();
    await createPage.fillScheduleForm({
      startDate: pastStartDate(),
      endDate: end,
      totalSlots: validScheduleSlots,
    });
    await createPage.submit();

    await expect(createPage.fieldError(createPage.startDateInput)).toContainText(
      scheduleCreateValidationCopy.startDateFuture
    );
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${tourId}/schedules/create`));
  });

  /** TC_AD_SCHEDCREATE_021 */
  test('TC_AD_SCHEDCREATE_021 rejects end date before start date', async ({ adminPage }) => {
    const start = futureStartDate();
    await createPage.fillScheduleForm({
      startDate: start,
      endDate: invalidEndBeforeStart(),
      totalSlots: validScheduleSlots,
    });
    await createPage.submit();

    await expect(createPage.fieldError(createPage.endDateInput)).toContainText(
      scheduleCreateValidationCopy.endDateAfter
    );
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${tourId}/schedules/create`));
  });

  /** TC_AD_SCHEDCREATE_022 */
  test('TC_AD_SCHEDCREATE_022 rejects booking deadline after start date', async ({ adminPage }) => {
    const start = futureStartDate();
    await createPage.fillScheduleForm({
      startDate: start,
      endDate: start,
      totalSlots: validScheduleSlots,
      bookingDeadline: invalidBookingDeadline(),
    });
    await createPage.submit();

    await expect(createPage.fieldError(createPage.bookingDeadlineInput)).toContainText(
      scheduleCreateValidationCopy.bookingDeadlineBefore
    );
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${tourId}/schedules/create`));
  });

  /** TC_AD_SCHEDCREATE_023 */
  test('TC_AD_SCHEDCREATE_023 rejects zero total slots', async ({ adminPage }) => {
    const start = futureStartDate();
    await createPage.fillScheduleForm({
      startDate: start,
      endDate: start,
      totalSlots: 0,
    });
    await createPage.submit();

    await expect(createPage.fieldError(createPage.totalSlotsInput)).toContainText(
      scheduleCreateValidationCopy.totalSlotsMin
    );
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${tourId}/schedules/create`));
  });

  /** TC_AD_SCHEDCREATE_024 — maps doc TC_AD_SCHEDCREATE_003 */
  test('TC_AD_SCHEDCREATE_024 creates schedule and redirects to list filtered by tour', async ({
    adminPage,
  }) => {
    const form = buildValidScheduleForm();
    await createPage.fillScheduleForm(form);

    const createReq = createPage.waitForCreateResponse();
    await createPage.submit();
    const res = await createReq;
    expect(res.status()).toBe(201);

    await expect(adminPage.getByText(copy.createSuccessToast)).toBeVisible();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules\\?tour_id=${tourId}`)
    );
  });

  /** TC_AD_SCHEDCREATE_027 */
  test('TC_AD_SCHEDCREATE_027 cancel navigates to schedule list without POST', async ({ adminPage }) => {
    let postCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes(`/admin/tours/${tourId}/schedules`)) {
        postCalled = true;
      }
    });

    await createPage.headerCancelButton.click();
    expect(postCalled).toBe(false);
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/schedules\\?tour_id=${tourId}`));
  });
});

test.describe('Admin Tour Schedule Create — loading & errors @P2', () => {
  /** TC_AD_SCHEDCREATE_004 */
  test('TC_AD_SCHEDCREATE_004 shows tour info skeleton while loading', async ({ adminPage }) => {
    resetMockTours();
    setTourDetailDelay(800);
    await mockToursApi(adminPage);
    const createPage = new TourScheduleCreatePage(adminPage);
    await adminPage.goto(`/admin/tours/${tourId}/schedules/create`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(createPage.tourInfoSkeleton).toBeVisible({ timeout: 5_000 });
    await expect(createPage.tourNameInInfo(mockFeaturedTour.name)).toBeVisible({
      timeout: 15_000,
    });
  });

  /** TC_AD_SCHEDCREATE_005 */
  test('TC_AD_SCHEDCREATE_005 shows tour fetch error and disables submit', async ({ adminPage }) => {
    resetMockTours();
    setTourDetailFail(tourId);
    await mockToursApi(adminPage);
    const createPage = new TourScheduleCreatePage(adminPage);
    await createPage.goto(tourId);
    await expect(createPage.tourNameInInfo(mockFeaturedTour.name)).toHaveCount(0);
    await expect(createPage.tourFetchErrorBanner).toBeVisible();
    await expect(createPage.tourFetchRetryButton).toBeVisible();
    await expect(createPage.headerSubmitButton).toBeDisabled();
    await expect(createPage.heading).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_026 */
  test('TC_AD_SCHEDCREATE_026 shows error toast when create API fails', async ({ adminPage }) => {
    resetMockTours();
    setScheduleCreateFail(tourId, 500);
    await mockToursApi(adminPage);
    const createPage = new TourScheduleCreatePage(adminPage);
    await createPage.goto(tourId);
    await createPage.fillScheduleForm(buildValidScheduleForm());

    const createReq = createPage.waitForCreateResponse();
    await createPage.submit();
    const res = await createReq;
    expect(res.status()).toBe(500);

    await expect(adminPage.getByText(copy.createErrorToast)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${tourId}/schedules/create`));
  });
});
