/**
 * Admin Tour Schedule Edit — extended cases (03g)
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  TourScheduleEditPage,
  tourScheduleEditCopy as copy,
} from '../pages/admin/TourScheduleEditPage';
import {
  getLastScheduleUpdateBody,
  mockToursApi,
  patchMockSchedule,
  resetMockTours,
} from '../fixtures/api/tours.mock';
import {
  bookedEditSchedule,
  bookedEditScheduleId,
  defaultEditSchedule,
  defaultEditScheduleId,
  futureStartDate,
  previewDatePattern,
  ymdDaysFromToday,
} from '../fixtures/data/tour-schedule-edit.data';

test.describe('Admin Tour Schedule Edit — extended @P2', () => {
  let editPage: TourScheduleEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(defaultEditScheduleId);
  });

  /** TC_AD_SCHEDEDIT_008 */
  test('TC_AD_SCHEDEDIT_008 shows booking notice when schedule has bookings', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(bookedEditScheduleId);

    await expect(editPage.statsBlock.getByText(copy.hasBookingsNotice)).toBeVisible();
    await expect(
      editPage.statsBlock.getByText(String(bookedEditSchedule.booked_people)).first()
    ).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_012 */
  test('TC_AD_SCHEDEDIT_012 shows operational fields section', async () => {
    await expect(editPage.departureCodeInput).toBeVisible();
    await expect(editPage.departurePlaceInput).toBeVisible();
    await expect(editPage.bookingDeadlineInput).toBeVisible();
    await expect(editPage.formRoot.getByRole('heading', { name: copy.operationalSection })).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_019 */
  test('TC_AD_SCHEDEDIT_019 shows success toast after update', async ({ adminPage }) => {
    await editPage.totalSlotsInput.fill(String(defaultEditSchedule.max_people + 1));
    await editPage.submit();
    await expect(adminPage.getByText(copy.updateSuccessToast)).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_023 */
  test('TC_AD_SCHEDEDIT_023 shows mobile action bar on narrow viewport', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await editPage.goto(defaultEditScheduleId);
    await expect(editPage.mobileSubmitButton).toBeVisible();
    await expect(editPage.mobileCancelButton).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_024 */
  test('TC_AD_SCHEDEDIT_024 shows past schedule warning banner', async ({ adminPage }) => {
    resetMockTours();
    patchMockSchedule(defaultEditScheduleId, {
      start_date: ymdDaysFromToday(-30),
      end_date: ymdDaysFromToday(-30),
    });
    await mockToursApi(adminPage);
    editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(defaultEditScheduleId);

    await expect(editPage.pastScheduleWarning).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_025 */
  test('TC_AD_SCHEDEDIT_025 PUT update includes operational fields', async () => {
    const code = 'VN999';
    const place = 'Sân bay Đà Nẵng';
    await editPage.fillScheduleForm({
      departureCode: code,
      departurePlace: place,
      bookingDeadline: defaultEditSchedule.start_date,
    });

    const updateReq = editPage.waitForUpdateResponse(defaultEditScheduleId);
    await editPage.submit();
    await updateReq;

    const body = getLastScheduleUpdateBody();
    expect(body?.departure_code).toBe(code);
    expect(body?.departure_place).toBe(place);
    expect(body?.booking_deadline).toBe(defaultEditSchedule.start_date);
  });

  /** TC_AD_SCHEDEDIT_026 */
  test('TC_AD_SCHEDEDIT_026 preview updates when form values change', async () => {
    const start = futureStartDate();
    await editPage.fillScheduleForm({
      startDate: start,
      endDate: start,
      totalSlots: 18,
    });

    await expect(editPage.previewPanel.getByText(previewDatePattern(start)).first()).toBeVisible();
    await expect(editPage.previewPanel.getByText('18').first()).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_027 */
  test('TC_AD_SCHEDEDIT_027 shows delete warning hint near delete button', async () => {
    await expect(editPage.page.getByText(copy.deleteWarningHint)).toBeVisible();
    await expect(editPage.deleteScheduleButton).toBeVisible();
  });

  /** TC_AD_SCHEDEDIT_029 */
  test('TC_AD_SCHEDEDIT_029 disables delete when schedule has bookings', async ({
    adminPage,
  }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    editPage = new TourScheduleEditPage(adminPage);
    await editPage.goto(bookedEditScheduleId);

    await expect(editPage.deleteScheduleButton).toBeDisabled();
  });

  /** TC_AD_SCHEDEDIT_030 */
  test('TC_AD_SCHEDEDIT_030 breadcrumb link navigates to schedule list filtered by tour', async ({
    adminPage,
  }) => {
    await editPage.breadcrumbSchedulesLink.click();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/tours/schedules\\?tour_id=${defaultEditSchedule.tour_id}`)
    );
  });

  /** TC_AD_SCHEDEDIT_031 */
  test('TC_AD_SCHEDEDIT_031 collapses header badge on scroll', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 1280, height: 720 });
    await editPage.goto(defaultEditScheduleId);
    await editPage.scrollMainContent(600);
    await expect(editPage.heading).toHaveClass(/text-lg/);
    await expect(editPage.collapsedContextBadge).toBeVisible({ timeout: 15_000 });
  });
});
