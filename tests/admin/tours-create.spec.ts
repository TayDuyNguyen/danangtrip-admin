/**
 * Admin Tour Create — mapped from 03b_tour_create.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { TourCreatePage, tourCreateCopy } from '../pages/admin/TourCreatePage';
import { TourListPage } from '../pages/admin/TourListPage';
import {
  mockToursApi,
  resetMockTours,
  findMockTourByName,
  setTourCreateFail,
} from '../fixtures/api/tours.mock';
import {
  requiredFieldKeys,
  tinyPngBuffer,
  validCreateTour,
  validCreateTourName,
  slugSourceName,
  expectedSlugFromName,
  longShortDesc,
  invalidVideoUrl,
  invalidDateRange,
  invalidPeopleRange,
  createApiErrorMessage,
} from '../fixtures/data/tour-create.data';

test.describe('Admin Tour Create @P1', () => {
  let createPage: TourCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    createPage = new TourCreatePage(adminPage);
    await createPage.goto();
  });

  /** ADMIN_TOUR_CREATE_001 / TC_AD_TCREATE_001 */
  test('TC_AD_TCREATE_001 shows validation errors on empty submit', async ({ adminPage }) => {
    await createPage.submit();

    for (const field of requiredFieldKeys) {
      await expect(createPage.fieldError(field)).toBeVisible();
    }
    await expect(createPage.fieldBlock('itinerary').locator('p.text-red-500').first()).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** ADMIN_TOUR_CREATE_002 / TC_AD_TCREATE_002 */
  test('TC_AD_TCREATE_002 uploads thumbnail and gallery images', async () => {
    await createPage.uploadThumbnail(tinyPngBuffer, 'cover.png');
    await createPage.uploadGalleryImages(
      [tinyPngBuffer, tinyPngBuffer, tinyPngBuffer],
      'gallery'
    );

    await expect(createPage.thumbnailPreview).toBeVisible();
    await expect(createPage.galleryPreviewImages).toHaveCount(3);

    const firstTile = createPage.galleryPreviewImages.first().locator('xpath=ancestor::div[contains(@class,"group")]');
    await firstTile.hover();
    await firstTile.getByRole('button').click();
    await expect(createPage.galleryPreviewImages).toHaveCount(2);
  });

  /** ADMIN_TOUR_CREATE_003 / TC_AD_TCREATE_003 */
  test('TC_AD_TCREATE_003 builds itinerary with add day', async () => {
    await createPage.fillForm({
      itineraryTitle: validCreateTour.itineraryTitle,
      itineraryContent: validCreateTour.itineraryContent,
    });
    await createPage.addItineraryDay();
    await createPage.itineraryTitleInput(1).fill('Buổi chiều Hội An');
    await createPage.itineraryContentInput(1).fill('Dạo phố cổ và thả đèn hoa đăng.');

    await expect(createPage.fieldBlock('itinerary').getByText(/Ngày 1|Day 1/i)).toBeVisible();
    await expect(createPage.fieldBlock('itinerary').getByText(/Ngày 2|Day 2/i)).toBeVisible();
    await expect(createPage.itineraryTitleInput(0)).toHaveValue(validCreateTour.itineraryTitle);
    await expect(createPage.itineraryContentInput(0)).toHaveValue(validCreateTour.itineraryContent);
    await expect(createPage.itineraryTitleInput(1)).toHaveValue('Buổi chiều Hội An');
  });

  /** ADMIN_TOUR_CREATE_004 / TC_AD_TCREATE_004 */
  test('TC_AD_TCREATE_004 creates tour and navigates to edit page', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();

    await createPage.fillForm(validCreateTour);
    await createPage.uploadThumbnail(tinyPngBuffer);
    await createPage.submit();

    const res = await createReq;
    expect(res.status()).toBe(201);
    await expect(adminPage.getByText(tourCreateCopy.createSuccessToast)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/\d+/);
    await expect(adminPage.getByRole('heading', { name: tourCreateCopy.editHeading })).toBeVisible();

    const listPage = new TourListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await expect(listPage.rowByTourName(validCreateTourName)).toBeVisible();
    expect(findMockTourByName(validCreateTourName)?.name).toBe(validCreateTourName);
  });

  /** ADMIN_TOUR_CREATE_005 / TC_AD_TCREATE_005 */
  test('TC_AD_TCREATE_005 cancel navigates back to tour list', async ({ adminPage }) => {
    await createPage.cancel();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });

  /** ADMIN_TOUR_CREATE_006 / TC_AD_TCREATE_006 */
  test('TC_AD_TCREATE_006 shows API error and dismisses alert', async ({ adminPage }) => {
    setTourCreateFail(422, createApiErrorMessage);

    await createPage.prepareValidSubmit();
    await createPage.submit();

    await expect(createPage.createErrorAlert).toBeVisible();
    await expect(createPage.createErrorAlert).toContainText(tourCreateCopy.createErrorTitle);
    await expect(createPage.createErrorAlert).toContainText(createApiErrorMessage);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);

    await createPage.dismissErrorButton.click();
    await expect(createPage.createErrorAlert).toBeHidden();
  });

  /** ADMIN_TOUR_CREATE_007 / TC_AD_TCREATE_007 */
  test('TC_AD_TCREATE_007 rejects end date before start date', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({
      availableFrom: invalidDateRange.availableFrom,
      availableTo: invalidDateRange.availableTo,
    });
    await createPage.submit();

    await expect(createPage.fieldError('available_to')).toBeVisible();
    await expect(createPage.fieldError('available_to')).toContainText(tourCreateCopy.dateAfterError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** ADMIN_TOUR_CREATE_008 / TC_AD_TCREATE_008 */
  test('TC_AD_TCREATE_008 removes itinerary day', async () => {
    await createPage.fillForm({
      itineraryTitle: validCreateTour.itineraryTitle,
      itineraryContent: validCreateTour.itineraryContent,
    });
    await createPage.addItineraryDay();
    await createPage.itineraryTitleInput(1).fill('Ngày phụ');
    await createPage.itineraryContentInput(1).fill('Nội dung ngày phụ.');

    await expect(createPage.fieldBlock('itinerary').getByText(/Ngày 2|Day 2/i)).toBeVisible();

    await createPage.removeItineraryDay(1);

    await expect(createPage.fieldBlock('itinerary').getByText(/Ngày 2|Day 2/i)).toBeHidden();
    await expect(createPage.itineraryTitleInput(0)).toHaveValue(validCreateTour.itineraryTitle);
    await expect(createPage.itineraryTitleInput(0)).toBeVisible();
  });

  /** ADMIN_TOUR_CREATE_009 / TC_AD_TCREATE_009 */
  test('TC_AD_TCREATE_009 creates tour with hidden status', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();

    await createPage.prepareValidSubmit();
    await createPage.selectHiddenStatus();
    await createPage.submit();

    const res = await createReq;
    const body = res.request().postDataJSON() as { status?: string };
    expect(body.status).toBe('inactive');
    expect(res.status()).toBe(201);
    expect(findMockTourByName(validCreateTourName)?.status).toBe('inactive');
    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/\d+/);
  });

  /** ADMIN_TOUR_CREATE_010 / TC_AD_TCREATE_010 */
  test('TC_AD_TCREATE_010 auto-generates slug from tour name', async () => {
    await createPage.nameInput.fill(slugSourceName);
    await expect(createPage.slugInput).toHaveValue(expectedSlugFromName);
  });

  /** ADMIN_TOUR_CREATE_011 / TC_AD_TCREATE_011 */
  test('TC_AD_TCREATE_011 rejects short description over 300 characters', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({ shortDesc: longShortDesc });
    await createPage.submit();

    await expect(createPage.fieldError('short_desc')).toBeVisible();
    await expect(createPage.fieldError('short_desc')).toContainText(tourCreateCopy.maxLengthError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** ADMIN_TOUR_CREATE_012 / TC_AD_TCREATE_012 */
  test('TC_AD_TCREATE_012 rejects max people less than min people', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({
      minPeople: invalidPeopleRange.minPeople,
      maxPeople: invalidPeopleRange.maxPeople,
    });
    await createPage.submit();

    await expect(createPage.fieldError('max_people')).toBeVisible();
    await expect(createPage.fieldError('max_people')).toContainText(tourCreateCopy.maxGteMinError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** ADMIN_TOUR_CREATE_013 / TC_AD_TCREATE_013 */
  test('TC_AD_TCREATE_013 rejects invalid video URL', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({ videoUrl: invalidVideoUrl });
    await createPage.submit();

    await expect(createPage.fieldError('video_url')).toBeVisible();
    await expect(createPage.fieldError('video_url')).toContainText(tourCreateCopy.invalidUrlError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** ADMIN_TOUR_CREATE_014 / TC_AD_TCREATE_014 */
  test('TC_AD_TCREATE_014 sends featured and hot flags in create payload', async () => {
    const createReq = createPage.waitForCreatePost();

    await createPage.prepareValidSubmit();
    await createPage.toggleFeatured(true);
    await createPage.toggleHot(true);
    await createPage.submit();

    const res = await createReq;
    const body = res.request().postDataJSON() as { is_featured?: boolean; is_hot?: boolean };
    expect(body.is_featured).toBe(true);
    expect(body.is_hot).toBe(true);
    expect(res.status()).toBe(201);
    const created = findMockTourByName(validCreateTourName);
    expect(created?.is_featured).toBe(true);
    expect(created?.is_hot).toBe(true);
  });

  /** ADMIN_TOUR_CREATE_015 / TC_AD_TCREATE_015 */
  test('TC_AD_TCREATE_015 removes and replaces thumbnail cover', async () => {
    await createPage.uploadThumbnail(tinyPngBuffer, 'cover-a.png');
    await expect(createPage.thumbnailPreview).toBeVisible();

    await createPage.removeThumbnail();
    await expect(createPage.thumbnailPreview).toBeHidden();

    await createPage.uploadThumbnail(tinyPngBuffer, 'cover-b.png');
    await expect(createPage.thumbnailPreview).toBeVisible();

    await createPage.changeThumbnail(tinyPngBuffer, 'cover-c.png');
    await expect(createPage.thumbnailPreview).toBeVisible();
  });

  /** ADMIN_TOUR_CREATE_016 / TC_AD_TCREATE_016 */
  test('TC_AD_TCREATE_016 creates tour via sidebar save button', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();

    await createPage.prepareValidSubmit();
    await createPage.submitFromSidebar();

    const res = await createReq;
    expect(res.status()).toBe(201);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/\d+/);
  });

  /** ADMIN_TOUR_CREATE_017 / TC_AD_TCREATE_017 */
  test('TC_AD_TCREATE_017 breadcrumb and schedule guide navigate to tour list', async ({ adminPage }) => {
    await createPage.breadcrumbLink(tourCreateCopy.breadcrumbTourList).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);

    await createPage.goto();
    await createPage.breadcrumbLink(tourCreateCopy.breadcrumbTours).click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);

    await createPage.goto();
    await createPage.scheduleGuideLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/list/);
  });
});
