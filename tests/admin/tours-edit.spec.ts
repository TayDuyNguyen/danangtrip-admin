/**
 * Admin Tour Edit — core TC from 03c_tour_edit.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { TourEditPage, tourEditCopy } from '../pages/admin/TourEditPage';
import {
  mockToursApi,
  resetMockTours,
  getMockTourAfterUpdate,
  patchMockTour,
  setScheduleEmptyForTour,
} from '../fixtures/api/tours.mock';
import {
  defaultEditTourId,
  deleteTourId,
  emptyScheduleTourId,
  mockEditTour,
  updatedTourName,
  updatedPriceAdultDigits,
  legacyItineraryItem,
  legacyItineraryContentText,
  tinyPngBuffer,
  formatScheduleSlots,
} from '../fixtures/data/tour-edit.data';
import { mockSchedulesForTour1 } from '../fixtures/data/tours.data';

test.describe('Admin Tour Edit @P1', () => {
  let editPage: TourEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    editPage = new TourEditPage(adminPage, defaultEditTourId);
  });

  /** TC_AD_TEDIT_001 */
  test('TC_AD_TEDIT_001 preloads form with tour data', async () => {
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.nameInput).toHaveValue(mockEditTour.name);
    await expect(editPage.slugInput).toHaveValue(mockEditTour.slug);
    await expect(editPage.priceAdultInput).toHaveValue(/850[.,]000/);
    await expect(editPage.itineraryTitleInput(0)).toHaveValue(mockEditTour.itinerary![0]!.title);
    await expect(editPage.itineraryContentInput(0)).toHaveValue(mockEditTour.itinerary![0]!.content);
    await expect(editPage.thumbnailPreview).toBeVisible();
    await expect(editPage.galleryPreviewImages).toHaveCount(mockEditTour.images!.length);
  });

  /** TC_AD_TEDIT_001b — legacy itinerary description field */
  test('TC_AD_TEDIT_001b maps legacy itinerary description to content', async ({ adminPage }) => {
    patchMockTour(defaultEditTourId, {
      itinerary: [legacyItineraryItem as unknown as (typeof mockEditTour.itinerary)[number]],
    });
    editPage = new TourEditPage(adminPage, defaultEditTourId);
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.itineraryTitleInput(0)).toHaveValue(legacyItineraryItem.title);
    await expect(editPage.itineraryContentInput(0)).toHaveValue(legacyItineraryContentText);
  });

  /** TC_AD_TEDIT_002 */
  test('TC_AD_TEDIT_002 updates name and price then redirects to list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.nameInput.fill(updatedTourName);
    await editPage.priceAdultInput.fill(updatedPriceAdultDigits);
    await editPage.submit();

    const res = await updateReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as Record<string, unknown>;
    expect(body.name).toBe(updatedTourName);
    expect(body.price_adult).toBe(Number(updatedPriceAdultDigits));
    await expect(adminPage.getByText(tourEditCopy.updateSuccessToast)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
    expect(getMockTourAfterUpdate(defaultEditTourId)?.name).toBe(updatedTourName);
  });

  /** TC_AD_TEDIT_007 */
  test('TC_AD_TEDIT_007 sends partial PUT with only dirty fields', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.nameInput.fill('Chỉ đổi tên tour');
    await editPage.submit();

    const res = await updateReq;
    const body = res.request().postDataJSON() as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(['name']);
    expect(res.status()).toBe(200);
  });

  /** TC_AD_TEDIT_008 */
  test('TC_AD_TEDIT_008 save without changes navigates without PUT', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    let putCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'PUT' && req.url().includes(`/admin/tours/${defaultEditTourId}`)) {
        putCalled = true;
      }
    });

    await editPage.submit();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
    expect(putCalled).toBe(false);
  });

  /** TC_AD_TEDIT_006 */
  test('TC_AD_TEDIT_006 back and cancel navigate to tour list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();

    await editPage.backButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);

    await editPage.gotoAndWaitLoaded();
    await editPage.cancelButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  /** TC_AD_TEDIT_013 */
  test('TC_AD_TEDIT_013 breadcrumb navigates to tour list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.breadcrumbLink(tourEditCopy.breadcrumbTourList).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  /** TC_AD_TEDIT_012 */
  test('TC_AD_TEDIT_012 saves via sidebar button', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.shortDescInput.fill('Mô tả ngắn đã cập nhật từ sidebar');
    await editPage.submitViaSidebar();

    expect((await updateReq).status()).toBe(200);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  /** TC_AD_TEDIT_019 */
  test('TC_AD_TEDIT_019 shows departure schedules with slots and status', async () => {
    await editPage.gotoAndWaitLoaded();
    const first = mockSchedulesForTour1[0]!;

    await expect(editPage.departureRow(0)).toBeVisible();
    await expect(editPage.departureRow(0)).toContainText(
      formatScheduleSlots(first.booked_people, first.max_people)
    );
    await expect(editPage.departureRow(0)).toContainText(/Còn chỗ|Available|Active|Đang hoạt động|Đã đầy|Full|Đã hủy|Cancelled/i);
  });

  /** TC_AD_TEDIT_020 */
  test('TC_AD_TEDIT_020 shows empty departures state', async ({ adminPage }) => {
    setScheduleEmptyForTour(emptyScheduleTourId);
    editPage = new TourEditPage(adminPage, emptyScheduleTourId);
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.departuresEmptyState).toBeVisible();
  });

  /** TC_AD_TEDIT_022 */
  test('TC_AD_TEDIT_022 manage departures opens schedule create', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.manageDeparturesButton.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/${defaultEditTourId}/schedules/create`));
  });

  /** TC_AD_TEDIT_023 */
  test('TC_AD_TEDIT_023 edit departure row navigates to schedule edit', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    const scheduleId = mockSchedulesForTour1[0]!.id;

    await editPage.departureEditButton(0).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/schedules/edit/${scheduleId}`));
  });

  /** TC_AD_TEDIT_025 */
  test('TC_AD_TEDIT_025 opens tour delete dialog from danger zone', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.dangerZoneDeleteButton.click();
    await expect(editPage.tourDeleteDialog).toBeVisible();
  });

  /** TC_AD_TEDIT_040 */
  test('TC_AD_TEDIT_040 cancel tour delete dialog without DELETE', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes(`/admin/tours/${defaultEditTourId}`)) {
        deleteCalled = true;
      }
    });

    await editPage.dangerZoneDeleteButton.click();
    await editPage.cancelTourDelete();
    await expect(editPage.tourDeleteDialog).toBeHidden();
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_TEDIT_026 */
  test('TC_AD_TEDIT_026 confirms tour delete and redirects to list', async ({ adminPage }) => {
    editPage = new TourEditPage(adminPage, deleteTourId);
    await editPage.gotoAndWaitLoaded();
    const deleteReq = editPage.waitForDeleteTour();

    await editPage.dangerZoneDeleteButton.click();
    await editPage.confirmTourDelete();

    expect((await deleteReq).status()).toBe(200);
    await expect(adminPage.getByText(tourEditCopy.deleteSuccessToast)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  /** TC_AD_TEDIT_024 */
  test('TC_AD_TEDIT_024 deletes schedule via dialog and refetches list', async () => {
    await editPage.gotoAndWaitLoaded();
    const scheduleId = mockSchedulesForTour1[0]!.id;
    const deleteReq = editPage.waitForDeleteSchedule(scheduleId);

    await editPage.departureDeleteButton(0).click();
    await expect(editPage.scheduleDeleteDialog).toBeVisible();
    await editPage.confirmScheduleDelete();

    expect((await deleteReq).status()).toBe(200);
    await expect(editPage.departuresSection.locator('ul li')).toHaveCount(mockSchedulesForTour1.length - 1);
  });

  /** TC_AD_TEDIT_003 */
  test('TC_AD_TEDIT_003 removes gallery image and uploads new thumbnail', async () => {
    await editPage.gotoAndWaitLoaded();
    const initialCount = await editPage.galleryPreviewImages.count();

    const firstTile = editPage.galleryPreviewImages.first().locator('xpath=ancestor::div[contains(@class,"group")]');
    await firstTile.hover();
    await firstTile.getByRole('button').click();
    await expect(editPage.galleryPreviewImages).toHaveCount(initialCount - 1);

    await editPage.changeThumbnail(tinyPngBuffer, 'edit-cover.png');
    await expect(editPage.thumbnailPreview).toBeVisible();
  });
});
