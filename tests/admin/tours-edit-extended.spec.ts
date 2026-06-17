/**
 * Admin Tour Edit — extended TC from 03c_tour_edit.md
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { TourEditPage, tourEditCopy } from '../pages/admin/TourEditPage';
import {
  mockToursApi,
  resetMockTours,
  setTourDetailFail,
  clearTourDetailFail,
  setTourDetailDelay,
  setTourUpdateFail,
  setTourUpdateDelay,
  setTourCategoriesBlocked,
  setScheduleErrorForTour,
  releaseScheduleErrorForTour,
} from '../fixtures/api/tours.mock';
import {
  defaultEditTourId,
  notFoundTourId,
  longShortDesc,
  invalidVideoUrl,
  invalidDateRange,
  invalidPeopleRange,
  shortTourName,
  expectedSlugFromName,
  slugSourceName,
} from '../fixtures/data/tour-edit.data';

test.describe('Admin Tour Edit — Auth @P0', () => {
  test('TC_AD_TEDIT_037 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/tours/edit/${defaultEditTourId}`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  test('TC_AD_TEDIT_038 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockTours();
    await mockToursApi(page);
    await seedNonAdminSession(page);
    await page.goto(`/admin/tours/edit/${defaultEditTourId}`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});

test.describe('Admin Tour Edit — Extended @P1-P2', () => {
  let editPage: TourEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    editPage = new TourEditPage(adminPage, defaultEditTourId);
  });

  test('TC_AD_TEDIT_004 shows fetch error with retry', async () => {
    setTourDetailFail(defaultEditTourId);
    await editPage.goto();
    await expect(editPage.fetchErrorWidget).toBeVisible();

    clearTourDetailFail();
    await editPage.page.getByRole('button', { name: tourEditCopy.retryButton }).click();
    await expect(editPage.heading).toBeVisible({ timeout: 20_000 });
  });

  test('TC_AD_TEDIT_005 shows loading state while tour loads', async () => {
    setTourDetailDelay(1500);
    await editPage.page.goto(`/admin/tours/edit/${defaultEditTourId}`, { waitUntil: 'domcontentloaded' });
    await expect(editPage.pageLoadingIndicator).toBeVisible();
    await expect(editPage.heading).toBeVisible({ timeout: 20_000 });
  });

  test('TC_AD_TEDIT_030 shows error for missing tour', async () => {
    editPage = new TourEditPage(editPage.page, notFoundTourId);
    await editPage.goto();
    await expect(editPage.fetchErrorWidget).toBeVisible();
  });

  test('TC_AD_TEDIT_009 shows update success toast', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.meetingPointInput.fill('456 Lê Duẩn, Đà Nẵng');
    await editPage.submit();
    await expect(adminPage.getByText(tourEditCopy.updateSuccessToast)).toBeVisible();
  });

  test('TC_AD_TEDIT_010 shows error toast when PUT fails', async ({ adminPage }) => {
    setTourUpdateFail(defaultEditTourId, 422, 'Slug already exists');
    await editPage.gotoAndWaitLoaded();
    await editPage.nameInput.fill('Tour trùng slug');
    await editPage.submit();
    await expect(adminPage.getByText(tourEditCopy.updateErrorToast)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${defaultEditTourId}`));
  });

  test('TC_AD_TEDIT_031 disables save and shows spinner while pending', async () => {
    await editPage.page.setViewportSize({ width: 1280, height: 800 });
    setTourUpdateDelay(3000);
    await editPage.gotoAndWaitLoaded();
    await editPage.descriptionInput.fill('Mô tả cập nhật để kích hoạt PUT');
    const updateReq = editPage.waitForUpdatePut();
    await editPage.headerSaveButton.click({ noWaitAfter: true });
    await expect(editPage.headerSaveOrSavingButton).toBeDisabled();
    await expect(editPage.headerSaveOrSavingButton).toContainText(tourEditCopy.savingLabel);
    await updateReq;
  });

  test('TC_AD_TEDIT_014 toggles slug auto and manual modes', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.enableAutoSlug();
    await expect(editPage.slugInput).toHaveAttribute('readonly', '');
    await editPage.enableManualSlug();
    await expect(editPage.slugInput).not.toHaveAttribute('readonly', '');
  });

  test('TC_AD_TEDIT_015 shows slug warning in manual mode', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.enableManualSlug();
    await expect(editPage.slugWarningBanner).toBeVisible();
  });

  test('TC_AD_TEDIT_016 auto slug updates when tour name changes', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.enableAutoSlug();
    await editPage.nameInput.fill(slugSourceName);
    await expect(editPage.slugInput).toHaveValue(expectedSlugFromName);
  });

  test('TC_AD_TEDIT_011 rejects end date before start date', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.availableFromInput.fill(invalidDateRange.availableFrom);
    await editPage.availableToInput.fill(invalidDateRange.availableTo);
    await editPage.submit();
    await expect(editPage.fieldError('available_to')).toBeVisible();
    await expect(editPage.fieldError('available_to')).toContainText(tourEditCopy.dateAfterError);
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${defaultEditTourId}`));
  });

  test('TC_AD_TEDIT_032 rejects max people less than min people', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.minPeopleInput.fill(invalidPeopleRange.minPeople);
    await editPage.maxPeopleInput.fill(invalidPeopleRange.maxPeople);
    await editPage.submit();
    await expect(editPage.fieldError('max_people')).toContainText(tourEditCopy.maxGteMinError);
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${defaultEditTourId}`));
  });

  test('TC_AD_TEDIT_033 rejects short description over 300 characters', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.shortDescInput.fill(longShortDesc);
    await editPage.submit();
    await expect(editPage.fieldError('short_desc')).toContainText(tourEditCopy.maxLengthError);
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${defaultEditTourId}`));
  });

  test('TC_AD_TEDIT_034 rejects invalid video URL', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.videoUrlInput.fill(invalidVideoUrl);
    await editPage.submit();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${defaultEditTourId}`));
  });

  test('TC_AD_TEDIT_035 rejects tour name shorter than 3 characters', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.nameInput.fill(shortTourName);
    await editPage.submit();
    await expect(editPage.fieldError('name')).toContainText(tourEditCopy.minLengthError);
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${defaultEditTourId}`));
  });

  test('TC_AD_TEDIT_036 adds and removes itinerary day', async () => {
    await editPage.gotoAndWaitLoaded();
    const initialCount = await editPage.fieldBlock('itinerary').locator('.group').count();
    await editPage.addItineraryDay();
    await expect(editPage.fieldBlock('itinerary').locator('.group')).toHaveCount(initialCount + 1);
    await editPage.removeItineraryDay(initialCount);
    await expect(editPage.fieldBlock('itinerary').locator('.group')).toHaveCount(initialCount);
  });

  test('TC_AD_TEDIT_017 sends inactive status in PUT', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();
    await editPage.selectHiddenStatus();
    await editPage.submit();
    const body = (await updateReq).request().postDataJSON() as { status?: string };
    expect(body.status).toBe('inactive');
  });

  test('TC_AD_TEDIT_018 sends featured and hot flags in partial PUT', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();
    await editPage.toggleFeatured(false);
    await editPage.toggleHot(false);
    await editPage.submit();
    const body = (await updateReq).request().postDataJSON() as {
      is_featured?: boolean;
      is_hot?: boolean;
    };
    expect(body.is_featured).toBe(false);
    expect(body.is_hot).toBe(false);
  });

  test('TC_AD_TEDIT_021 shows schedule load error and recovers on retry', async () => {
    setScheduleErrorForTour(defaultEditTourId);
    await editPage.gotoAndWaitLoaded();
    await expect(editPage.departuresErrorBanner).toBeVisible();

    releaseScheduleErrorForTour(defaultEditTourId);
    await editPage.departuresRetryButton.click();
    await expect(editPage.departureRow(0)).toBeVisible({ timeout: 15_000 });
  });

  test('TC_AD_TEDIT_041 cancel schedule delete without DELETE', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/tour-schedules/')) {
        deleteCalled = true;
      }
    });

    await editPage.departureDeleteButton(0).click();
    await editPage.cancelScheduleDelete();
    await expect(editPage.scheduleDeleteDialog).toBeHidden();
    expect(deleteCalled).toBe(false);
  });

  test('TC_AD_TEDIT_028 shows category error banner and recovers on retry', async ({ browser }) => {
    resetMockTours();
    setTourCategoriesBlocked(true);

    const context = await browser.newContext();
    const page = await context.newPage();
    await seedAdminSession(page);
    await mockToursApi(page);

    const localEditPage = new TourEditPage(page, defaultEditTourId);
    await localEditPage.gotoAndWaitLoaded();

    await expect(localEditPage.categoryErrorBanner).toBeVisible({ timeout: 15_000 });
    await expect(localEditPage.categoryRetryButton).toBeVisible();

    setTourCategoriesBlocked(false);
    await localEditPage.categoryRetryButton.click();
    await expect(localEditPage.categorySelectControl).toBeVisible({ timeout: 15_000 });
    await expect(localEditPage.categoryErrorBanner).toBeHidden();

    await context.close();
  });

  test('TC_AD_TEDIT_039 schedule guide link navigates to tour list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.scheduleGuideLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  test('TC_AD_TEDIT_027 hides header save and shows mobile footer on small viewport', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.page.setViewportSize({ width: 375, height: 812 });
    await expect(editPage.headerSaveButton).toBeHidden();
    await expect(editPage.mobileSaveButton).toBeVisible();
    await expect(editPage.mobileSaveButton).toBeEnabled();
  });

  test('TC_AD_TEDIT_029 shows video_url validation error in ImageGallery', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.videoUrlInput.fill(invalidVideoUrl);
    await editPage.submit();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/tours/edit/${defaultEditTourId}`));
    await expect(editPage.fieldBlock('video_url').locator('p.text-red-500')).toBeVisible();
  });
});
