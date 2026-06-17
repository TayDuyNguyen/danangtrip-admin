/**
 * Admin Tour Schedule Edit — mapped from 03g_tour_schedule_edit.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  TourScheduleEditPage,
  tourScheduleEditCopy as copy,
} from '../pages/admin/TourScheduleEditPage';
import { TourEditPage } from '../pages/admin/TourEditPage';
import {
  getMockSchedule,
  mockToursApi,
  resetMockTours,
  setScheduleDeleteFail,
  setScheduleDetailDelay,
  setScheduleDetailFail,
  setScheduleUpdateFail,
} from '../fixtures/api/tours.mock';
import {
  bookedEditSchedule,
  bookedEditScheduleId,
  defaultEditSchedule,
  defaultEditScheduleId,
  invalidBookingDeadline,
  scheduleEditValidationCopy,
} from '../fixtures/data/tour-schedule-edit.data';
import { mockFeaturedTour } from '../fixtures/data/tours.data';

const tourId = mockFeaturedTour.id;

test.describe('Admin Tour Schedule Edit @P1', () => {
  let editPage: TourScheduleEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(defaultEditScheduleId);
  });

  /** TC_AD_SCHEDEDIT_001 */
  test('TC_AD_SCHEDEDIT_001 preloads existing schedule into form', async () => {
    await expect(editPage.startDateInput).toHaveValue(defaultEditSchedule.start_date);
    await expect(editPage.endDateInput).toHaveValue(defaultEditSchedule.end_date);
    await expect(editPage.totalSlotsInput).toHaveValue(String(defaultEditSchedule.max_people));
    await expect(editPage.page.getByText(copy.statusAvailable).first()).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_002 — maps doc max slots update */
  test('TC_AD_SCHEDEDIT_002 updates max slots and redirects to filtered list', async ({
    adminPage,
  }) => {
    const newMax = defaultEditSchedule.max_people + 10;
    await editPage.totalSlotsInput.fill(String(newMax));

    const updateReq = editPage.waitForUpdateResponse(defaultEditScheduleId);
    await editPage.submit();
    const res = await updateReq;
    expect(res.status()).toBe(200);

    await expect(adminPage.getByText(copy.updateSuccessToast)).toBeVisible();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules\\?tour_id=${defaultEditSchedule.tour_id}`)
    );
    expect(getMockSchedule(defaultEditScheduleId)?.max_people).toBe(newMax);
  });

  /** TC_AD_SCHEDEDIT_003 — maps doc close sales → CANCELLED */
  test('TC_AD_SCHEDEDIT_003 sets status to cancelled on update', async ({ adminPage }) => {
    await editPage.selectStatus(copy.statusCancelled);

    const updateReq = editPage.waitForUpdateResponse(defaultEditScheduleId);
    await editPage.submit();
    await updateReq;

    await expect(adminPage.getByText(copy.updateSuccessToast)).toBeVisible();
    expect(getMockSchedule(defaultEditScheduleId)?.status).toBe('cancelled');
  });

  /** TC_AD_SCHEDEDIT_004 */
  test('TC_AD_SCHEDEDIT_004 renders heading and breadcrumb', async () => {
    await expect(editPage.heading).toBeVisible();
    await expect(editPage.breadcrumbRoot).toBeVisible();
    await expect(editPage.breadcrumbCurrent).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_005 */
  test('TC_AD_SCHEDEDIT_005 shows schedule info box with capacity', async () => {
    await expect(editPage.scheduleInfoBox).toBeVisible();
    await expect(
      editPage.scheduleInfoBox.getByText(
        `${defaultEditSchedule.booked_people} / ${defaultEditSchedule.max_people}`
      )
    ).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_006 */
  test('TC_AD_SCHEDEDIT_006 shows tour name in info box', async () => {
    await expect(editPage.tourNameInInfo(mockFeaturedTour.name)).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_007 */
  test('TC_AD_SCHEDEDIT_007 shows stats block for schedule', async () => {
    await expect(editPage.statsBlock).toBeVisible();
    await expect(editPage.statsBlock.getByText(copy.statsBooked)).toBeVisible();
    await expect(
      editPage.statsBlock.getByText(String(defaultEditSchedule.max_people)).first()
    ).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_009 */
  test('TC_AD_SCHEDEDIT_009 shows preview panel and price help', async () => {
    await expect(editPage.previewPanel.getByText(copy.previewTitle)).toBeVisible();
    await expect(editPage.priceOverrideNotice).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_013 */
  test('TC_AD_SCHEDEDIT_013 opens delete confirmation dialog', async () => {
    await editPage.openDeleteDialog();
    await expect(editPage.deleteDialogHeading).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_014 */
  test('TC_AD_SCHEDEDIT_014 cancel delete dialog without DELETE', async ({ adminPage }) => {
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (
        req.method() === 'DELETE' &&
        req.url().includes(`/admin/tour-schedules/${defaultEditScheduleId}`)
      ) {
        deleteCalled = true;
      }
    });

    await editPage.openDeleteDialog();
    await editPage.cancelDeleteDialog();
    await expect(editPage.deleteDialogHeading).toBeHidden();
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_SCHEDEDIT_015 */
  test('TC_AD_SCHEDEDIT_015 confirms delete and redirects to schedule list', async ({
    adminPage,
  }) => {
    const deleteId = defaultEditScheduleId;
    const deleteReq = editPage.waitForDeleteResponse(deleteId);

    await editPage.openDeleteDialog();
    await editPage.confirmDelete();
    const res = await deleteReq;
    expect(res.status()).toBe(200);

    await expect(adminPage.getByText(copy.deleteSuccessToast)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/schedules/);
    expect(getMockSchedule(deleteId)).toBeUndefined();
  });

  /** TC_AD_SCHEDEDIT_016 */
  test('TC_AD_SCHEDEDIT_016 rejects total slots below booked count', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(bookedEditScheduleId);

    await editPage.totalSlotsInput.fill(String(bookedEditSchedule.booked_people - 1));
    await editPage.submit();

    await expect(editPage.fieldError(editPage.totalSlotsInput)).toContainText(
      scheduleEditValidationCopy.totalSlotsMinBooked
    );
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules/edit/${bookedEditScheduleId}`)
    );
  });

  /** TC_AD_SCHEDEDIT_017 */
  test('TC_AD_SCHEDEDIT_017 rejects end date before start date', async ({ adminPage }) => {
    await editPage.startDateInput.fill('2026-09-01');
    await editPage.endDateInput.fill('2026-08-01');
    await editPage.submit();

    await expect(editPage.fieldError(editPage.endDateInput)).toContainText(
      scheduleEditValidationCopy.endDateAfter
    );
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules/edit/${defaultEditScheduleId}`)
    );
  });

  /** TC_AD_SCHEDEDIT_018 */
  test('TC_AD_SCHEDEDIT_018 rejects booking deadline after start date', async ({ adminPage }) => {
    await editPage.bookingDeadlineInput.fill(invalidBookingDeadline());
    await editPage.submit();

    await expect(editPage.fieldError(editPage.bookingDeadlineInput)).toContainText(
      scheduleEditValidationCopy.bookingDeadlineBefore
    );
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules/edit/${defaultEditScheduleId}`)
    );
  });
});

test.describe('Admin Tour Schedule Edit — loading & errors @P2', () => {
  /** TC_AD_SCHEDEDIT_011 */
  test('TC_AD_SCHEDEDIT_011 shows loading spinner while fetching schedule', async ({
    adminPage,
  }) => {
    resetMockTours();
    setScheduleDetailDelay(900);
    await mockToursApi(adminPage);
    const editPage = new TourScheduleEditPage(adminPage);

    await adminPage.goto(`/admin/tours/schedules/edit/${defaultEditScheduleId}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(editPage.pageLoadingSpinner).toBeVisible({ timeout: 5_000 });
    await expect(editPage.heading).toBeVisible({ timeout: 20_000 });
  });

  /** TC_AD_SCHEDEDIT_032 */
  test('TC_AD_SCHEDEDIT_032 shows schedule fetch error with retry', async ({ adminPage }) => {
    resetMockTours();
    setScheduleDetailFail(defaultEditScheduleId);
    await mockToursApi(adminPage);
    const editPage = new TourScheduleEditPage(adminPage);

    await adminPage.goto(`/admin/tours/schedules/edit/${defaultEditScheduleId}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(editPage.scheduleFetchErrorBanner).toBeVisible({ timeout: 15_000 });
    await expect(editPage.scheduleFetchRetryButton).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_020 */
  test('TC_AD_SCHEDEDIT_020 shows error toast when update fails', async ({ adminPage }) => {
    resetMockTours();
    setScheduleUpdateFail(defaultEditScheduleId);
    await mockToursApi(adminPage);
    const editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(defaultEditScheduleId);

    await editPage.totalSlotsInput.fill(String(defaultEditSchedule.max_people + 1));
    await editPage.submit();

    await expect(adminPage.getByText(copy.updateErrorToast)).toBeVisible();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules/edit/${defaultEditScheduleId}`)
    );
  });

  /** TC_AD_SCHEDEDIT_028 */
  test('TC_AD_SCHEDEDIT_028 shows error toast when delete fails', async ({ adminPage }) => {
    resetMockTours();
    setScheduleDeleteFail(defaultEditScheduleId);
    await mockToursApi(adminPage);
    const editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(defaultEditScheduleId);

    await editPage.openDeleteDialog();
    await editPage.confirmDelete();

    await expect(adminPage.getByText(copy.deleteErrorToast)).toBeVisible();
    expect(getMockSchedule(defaultEditScheduleId)).toBeTruthy();
  });
});

test.describe('Admin Tour Schedule Edit — navigation @P2', () => {
  /** TC_AD_SCHEDEDIT_021 */
  test('TC_AD_SCHEDEDIT_021 redirects to tour edit when opened from tour edit flow', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);

    const tourEditPage = new TourEditPage(adminPage, tourId);
    await tourEditPage.gotoAndWaitLoaded();
    await tourEditPage.departureEditButton(0).click();

    const editPage = new TourScheduleEditPage(adminPage);
    await expect(editPage.heading).toBeVisible();

    await editPage.totalSlotsInput.fill(String(defaultEditSchedule.max_people + 2));
    const updateReq = editPage.waitForUpdateResponse(defaultEditScheduleId);
    await editPage.submit();
    await updateReq;

    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${tourId}`), {
      timeout: 15_000,
    });
  });

  /** TC_AD_SCHEDEDIT_022 */
  test('TC_AD_SCHEDEDIT_022 unsaved changes guard blocks leaving page', async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);

    const tourEditPage = new TourEditPage(adminPage, tourId);
    await tourEditPage.gotoAndWaitLoaded();
    await tourEditPage.departureEditButton(0).click();

    const editPage = new TourScheduleEditPage(adminPage);
    await editPage.totalSlotsInput.fill(String(defaultEditSchedule.max_people + 3));
    await editPage.headerCancelButton.click();

    await expect(editPage.unsavedChangesDialog).toBeVisible({ timeout: 15_000 });
    await editPage.page.getByRole('button', { name: copy.stayOnPage }).click();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules/edit/${defaultEditScheduleId}`)
    );
  });
});
