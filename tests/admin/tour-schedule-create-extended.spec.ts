/**
 * Admin Tour Schedule Create — extended cases (03f)
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  TourScheduleCreatePage,
  tourScheduleCreateCopy as copy,
} from '../pages/admin/TourScheduleCreatePage';
import { TourEditPage } from '../pages/admin/TourEditPage';
import {
  mockToursApi,
  resetMockTours,
} from '../fixtures/api/tours.mock';
import {
  buildValidScheduleForm,
  futureStartDate,
  previewDatePattern,
  validScheduleSlots,
} from '../fixtures/data/tour-schedule-create.data';
import { mockFeaturedTour } from '../fixtures/data/tours.data';

const tourId = mockFeaturedTour.id;

test.describe('Admin Tour Schedule Create — extended @P2', () => {
  let createPage: TourScheduleCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    createPage = new TourScheduleCreatePage(adminPage);
    await createPage.goto(tourId);
  });

  /** TC_AD_SCHEDCREATE_007 */
  test('TC_AD_SCHEDCREATE_007 shows operational fields', async () => {
    await expect(createPage.departureCodeInput).toBeVisible();
    await expect(createPage.departurePlaceInput).toBeVisible();
    await expect(createPage.bookingDeadlineInput).toBeVisible();
    await expect(createPage.formRoot.getByRole('heading', { name: copy.operationalSection })).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_008 */
  test('TC_AD_SCHEDCREATE_008 shows optional price inputs', async () => {
    await expect(createPage.formRoot.getByText(/Giá người lớn|Adult price/i).first()).toBeVisible();
    await expect(createPage.formRoot.getByText(/Giá trẻ em|Child price/i).first()).toBeVisible();
    await expect(createPage.formRoot.getByText(/Giá em bé|Infant price/i).first()).toBeVisible();
    await expect(createPage.formRoot.getByText(/Tùy chọn|Optional/i).first()).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_009 */
  test('TC_AD_SCHEDCREATE_009 defaults status to available', async () => {
    await expect(createPage.page.getByText(copy.statusAvailable).first()).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_011 */
  test('TC_AD_SCHEDCREATE_011 shows mobile action bar on narrow viewport', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await createPage.goto(tourId);
    await expect(createPage.mobileSubmitButton).toBeVisible();
    await expect(createPage.mobileCancelButton).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_028 */
  test('TC_AD_SCHEDCREATE_028 updates preview when form values change', async () => {
    const start = futureStartDate();
    await createPage.fillScheduleForm({
      startDate: start,
      endDate: start,
      totalSlots: validScheduleSlots,
    });

    const formatted = previewDatePattern(start);

    await expect(createPage.previewPanel.getByText(formatted).first()).toBeVisible();
    await expect(createPage.previewPanel.getByText(String(validScheduleSlots)).first()).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_029 — operational fields sent on create */
  test('TC_AD_SCHEDCREATE_029 POST create includes operational fields', async () => {
    const form = buildValidScheduleForm();
    await createPage.fillScheduleForm({
      ...form,
      departureCode: 'VN123',
      departurePlace: 'Sân bay Đà Nẵng',
      bookingDeadline: form.startDate,
    });

    const createReq = createPage.waitForCreateResponse();
    await createPage.submit();
    const res = await createReq;
    expect(res.status()).toBe(201);

    const body = res.request().postDataJSON() as Record<string, unknown>;
    expect(body.departure_code).toBe('VN123');
    expect(body.departure_place).toBe('Sân bay Đà Nẵng');
    expect(body.booking_deadline).toBe(form.startDate);
  });

  /** TC_AD_SCHEDCREATE_025 */
  test('TC_AD_SCHEDCREATE_025 redirects to tour edit after create from edit flow', async ({
    adminPage,
  }) => {
    const editPage = new TourEditPage(adminPage, tourId);
    await editPage.gotoAndWaitLoaded();
    await editPage.manageDeparturesButton.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${tourId}/schedules/create`));

    createPage = new TourScheduleCreatePage(adminPage);
    await expect(createPage.heading).toBeVisible();
    await createPage.fillScheduleForm(buildValidScheduleForm());

    const createReq = createPage.waitForCreateResponse();
    await createPage.submit();
    await createReq;

    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${tourId}`), {
      timeout: 15_000,
    });
    await expect(adminPage.getByText(copy.createSuccessToast)).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_030 */
  test('TC_AD_SCHEDCREATE_030 breadcrumb link navigates to schedule list filtered by tour', async ({
    adminPage,
  }) => {
    await createPage.breadcrumbSchedulesLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/schedules\\?tour_id=${tourId}`));
  });

  /** TC_AD_SCHEDCREATE_031 */
  test('TC_AD_SCHEDCREATE_031 auto-fills end date when start date is set', async () => {
    const start = futureStartDate();
    await createPage.startDateInput.fill(start);
    await expect(createPage.endDateInput).toHaveValue(start);
  });

  /** TC_AD_SCHEDCREATE_032 */
  test('TC_AD_SCHEDCREATE_032 collapses header badge on scroll', async () => {
    await createPage.scrollMainContent(240);
    await expect(createPage.collapsedContextBadge).toBeVisible();
  });

  /** TC_AD_SCHEDCREATE_034 */
  test('TC_AD_SCHEDCREATE_034 from=edit query redirects to tour edit after create', async ({
    adminPage,
  }) => {
    await createPage.goto(tourId, '?from=edit');
    await createPage.fillScheduleForm(buildValidScheduleForm());

    const createReq = createPage.waitForCreateResponse();
    await createPage.submit();
    await createReq;

    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${tourId}`));
  });

  /** TC_AD_SCHEDCREATE_035 */
  test('TC_AD_SCHEDCREATE_035 preview shows operational field values', async () => {
    await createPage.fillScheduleForm({
      departureCode: 'VN999',
      departurePlace: 'Đà Nẵng',
    });
    await expect(createPage.previewPanel.getByText('VN999')).toBeVisible();
    await expect(createPage.previewPanel.getByText('Đà Nẵng')).toBeVisible();
  });
});
