/**
 * Admin Location Create — core (05b)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { LocationCreatePage, locationCreateCopy as copy } from '../pages/admin/LocationCreatePage';
import { LocationListPage } from '../pages/admin/LocationListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  findMockLocationByName,
  getLastCreatedLocationId,
  mockLocationsApi,
  resetMockLocations,
  setLocationCreateFail,
} from '../fixtures/api/locations.mock';
import {
  createApiErrorMessage,
  expectedSlugFromName,
  invalidEmail,
  invalidPriceRange,
  invalidVideoUrl,
  invalidWebsite,
  longShortDescription,
  requiredFieldKeys,
  shortLocationName,
  slugSourceName,
  validCreateLocation,
  validCreateLocationName,
} from '../fixtures/data/location-create.data';
import { mockLocationCategories } from '../fixtures/data/locations.data';

test.describe('Admin Location Create @P1', () => {
  let createPage: LocationCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    createPage = new LocationCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_LOCCREATE_001 */
  test('TC_AD_LOCCREATE_001 shows validation errors on empty submit', async ({ adminPage }) => {
    await createPage.submit();
    for (const field of requiredFieldKeys.filter((f) => f !== 'thumbnail')) {
      await expect(createPage.fieldError(field)).toBeVisible();
    }
    await expect(adminPage.locator('p.text-red-500.font-bold').first()).toBeVisible();
    await expect(createPage.fieldBlock('category_id').locator('[class*="-placeholder"]')).toBeVisible();
    await expect(createPage.page.locator('p.text-red-500').filter({ hasText: /Bản đồ|Map/i })).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/create/);
  });

  /** TC_AD_LOCCREATE_002 */
  test('TC_AD_LOCCREATE_002 rejects name shorter than 3 characters', async () => {
    await createPage.nameInput.fill(shortLocationName);
    await createPage.submit();
    await expect(createPage.fieldError('name')).toBeVisible();
  });

  /** TC_AD_LOCCREATE_003 */
  test('TC_AD_LOCCREATE_003 rejects short description over 300 characters', async () => {
    await createPage.shortDescriptionInput.fill(longShortDescription);
    await createPage.submit();
    await expect(createPage.fieldError('short_description')).toBeVisible();
  });

  /** TC_AD_LOCCREATE_004 */
  test('TC_AD_LOCCREATE_004 rejects invalid email format', async () => {
    await createPage.fillForm({ email: invalidEmail });
    await createPage.submit();
    await expect(createPage.fieldError('email')).toBeVisible();
  });

  /** TC_AD_LOCCREATE_005 */
  test('TC_AD_LOCCREATE_005 rejects invalid website URL', async () => {
    await createPage.fillForm({ website: invalidWebsite });
    await createPage.submit();
    await expect(createPage.fieldError('website')).toBeVisible();
  });

  /** TC_AD_LOCCREATE_006 */
  test('TC_AD_LOCCREATE_006 blocks submit with invalid video URL', async ({ adminPage }) => {
    let createCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/admin/locations') && !req.url().includes('/upload')) {
        createCalled = true;
      }
    });
    await createPage.prepareValidSubmit({ ...validCreateLocation, videoUrl: invalidVideoUrl });
    await createPage.submit();
    expect(createCalled).toBe(false);
    await expect(createPage.fieldError('video_url')).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/create/);
  });

  /** TC_AD_LOCCREATE_007 */
  test('TC_AD_LOCCREATE_007 rejects price max lower than price min', async () => {
    await createPage.fillForm(invalidPriceRange);
    await createPage.submit();
    await expect(createPage.fieldError('price_max')).toBeVisible();
  });

  /** TC_AD_LOCCREATE_010 */
  test('TC_AD_LOCCREATE_010 auto generates slug from name', async () => {
    await createPage.nameInput.fill(slugSourceName);
    await expect(createPage.slugInput).toHaveValue(expectedSlugFromName);
  });

  /** TC_AD_LOCCREATE_011 */
  test('TC_AD_LOCCREATE_011 uploads thumbnail preview', async () => {
    await createPage.uploadThumbnail();
    await expect(createPage.thumbnailPreview).toBeVisible();
  });

  /** TC_AD_LOCCREATE_012 */
  test('TC_AD_LOCCREATE_012 sets coordinates via map reset button', async () => {
    await createPage.setMapCoordinates();
    const latValue = createPage.page
      .locator('span.text-slate-400')
      .filter({ hasText: 'LAT:' })
      .locator('xpath=following-sibling::span')
      .first();
    await expect(latValue).toContainText(/\d/);
  });

  /** TC_AD_LOCCREATE_013 */
  test('TC_AD_LOCCREATE_013 updates sidebar completion when filling name', async () => {
    await expect(createPage.completionPercent).toHaveText('0%');
    await createPage.nameInput.fill(validCreateLocationName);
    await expect(createPage.completionPercent).not.toHaveText('0%');
  });

  /** TC_AD_LOCCREATE_014 */
  test('TC_AD_LOCCREATE_014 loads category and district options from API', async () => {
    await createPage.fieldBlock('category_id').locator('[class*="-control"]').first().click();
    await expect(createPage.page.getByRole('option', { name: mockLocationCategories[0]!.name })).toBeVisible();
    await createPage.page.keyboard.press('Escape');

    await createPage.fieldBlock('district').locator('[class*="-control"]').first().click();
    await expect(createPage.page.getByRole('option', { name: 'Sơn Trà' })).toBeVisible();
  });

  /** TC_AD_LOCCREATE_020 */
  test('TC_AD_LOCCREATE_020 creates location with toast and appears in list', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();
    await createPage.prepareValidSubmit(validCreateLocation);
    await createPage.submit();
    const res = await createReq;
    expect(res.status()).toBe(201);
    await expect(adminPage.getByText(copy.createSuccess)).toBeVisible();
    const createdId = getLastCreatedLocationId();
    expect(createdId).not.toBeNull();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/locations/edit/${createdId}(/)?$`));

    const listPage = new LocationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search(validCreateLocationName);
    await expect(listPage.rowByName(validCreateLocationName)).toBeVisible();
    expect(findMockLocationByName(validCreateLocationName)?.name).toBe(validCreateLocationName);
  });

  /** TC_AD_LOCCREATE_021 */
  test('TC_AD_LOCCREATE_021 cancel navigates to location list', async ({ adminPage }) => {
    await createPage.cancel();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCCREATE_022 */
  test('TC_AD_LOCCREATE_022 back button navigates to location list', async ({ adminPage }) => {
    await createPage.backButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCCREATE_023 */
  test('TC_AD_LOCCREATE_023 sends inactive and featured flags in POST body', async ({ adminPage }) => {
    await createPage.prepareValidSubmit(validCreateLocation);
    await createPage.statusToggle.click();
    await createPage.featuredToggle.click();

    const createReq = adminPage.waitForRequest(
      (req) => req.method() === 'POST' && req.url().includes('/admin/locations') && !req.url().includes('/upload')
    );
    await createPage.submit();
    const req = await createReq;
    const body = req.postDataJSON() as { status?: string; is_featured?: boolean };
    expect(body.status).toBe('inactive');
    expect(body.is_featured).toBe(true);
  });

  /** TC_AD_LOCCREATE_024 */
  test('TC_AD_LOCCREATE_024 shows error toast when create API fails', async ({ adminPage }) => {
    setLocationCreateFail(true, 422, createApiErrorMessage);
    await createPage.prepareValidSubmit(validCreateLocation);
    const failRes = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        res.url().includes('/admin/locations') &&
        !res.url().includes('/upload') &&
        res.status() === 422
    );
    await createPage.submit();
    await failRes;
    await expect(adminPage.getByText(copy.createError)).toBeVisible({ timeout: 15_000 });
    await expect(adminPage).toHaveURL(/\/admin\/locations\/create/);
  });
});
