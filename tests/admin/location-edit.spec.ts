/**
 * Admin Location Edit — core (05c)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { LocationEditPage, locationEditCopy as copy } from '../pages/admin/LocationEditPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockLocationAfterUpdate,
  mockLocationsApi,
  patchMockLocation,
  resetMockLocations,
  setLocationDetailFailForId,
  setLocationUpdateFail,
} from '../fixtures/api/locations.mock';
import {
  defaultEditLocationId,
  deleteLocationId,
  expectedOpeningHoursFormText,
  invalidEditEmail,
  legacyOpeningHoursArray,
  mockEditLocation,
  notFoundLocationId,
  updatedDescription,
  updatedLocationName,
} from '../fixtures/data/location-edit.data';

test.describe('Admin Location Edit @P1', () => {
  let editPage: LocationEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    editPage = new LocationEditPage(adminPage, defaultEditLocationId);
  });

  /** TC_AD_LOCEDIT_001 */
  test('TC_AD_LOCEDIT_001 preloads form with location data', async () => {
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.nameInput).toHaveValue(mockEditLocation.name);
    await expect(editPage.slugInput).toHaveValue(mockEditLocation.slug);
    await expect(editPage.shortDescriptionInput).toHaveValue(mockEditLocation.short_description ?? '');
    await expect(editPage.descriptionInput).toHaveValue(mockEditLocation.description);
    await expect(editPage.addressInput).toHaveValue(mockEditLocation.address);
    await expect(editPage.thumbnailPreview).toBeVisible();
    await expect(editPage.page.getByText(/LAT:/i)).toBeVisible();
  });

  /** TC_AD_LOCEDIT_001b */
  test('TC_AD_LOCEDIT_001b maps legacy opening_hours array to multiline form text', async ({ adminPage }) => {
    patchMockLocation(defaultEditLocationId, { opening_hours: legacyOpeningHoursArray });
    editPage = new LocationEditPage(adminPage, defaultEditLocationId);
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.openingHoursInput).toHaveValue(expectedOpeningHoursFormText);
  });

  /** TC_AD_LOCEDIT_002 */
  test('TC_AD_LOCEDIT_002 updates description then redirects to detail', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.descriptionInput.fill(updatedDescription);
    await editPage.submit();

    const res = await updateReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as Record<string, unknown>;
    expect(body.description).toBe(updatedDescription);
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/locations/detail/${defaultEditLocationId}(/)?$`));
    expect(getMockLocationAfterUpdate(defaultEditLocationId)?.description).toBe(updatedDescription);
  });

  /** TC_AD_LOCEDIT_003 */
  test('TC_AD_LOCEDIT_003 updates name in PUT body and mock dataset', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.nameInput.fill(updatedLocationName);
    await editPage.submit();

    const res = await updateReq;
    const body = res.request().postDataJSON() as Record<string, unknown>;
    expect(body.name).toBe(updatedLocationName);
    expect(res.status()).toBe(200);
    expect(getMockLocationAfterUpdate(defaultEditLocationId)?.name).toBe(updatedLocationName);
  });

  /** TC_AD_LOCEDIT_004 */
  test('TC_AD_LOCEDIT_004 rejects empty name on submit', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.nameInput.fill('');
    await editPage.submit();
    await expect(editPage.fieldError('name')).toBeVisible();
  });

  /** TC_AD_LOCEDIT_005 */
  test('TC_AD_LOCEDIT_005 rejects invalid email format', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.emailInput.fill(invalidEditEmail);
    await editPage.submit();
    await expect(editPage.fieldError('email')).toBeVisible();
  });

  /** TC_AD_LOCEDIT_006 */
  test('TC_AD_LOCEDIT_006 back button navigates to location list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.backButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCEDIT_007 */
  test('TC_AD_LOCEDIT_007 cancel navigates to location list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.cancelButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCEDIT_007b */
  test('TC_AD_LOCEDIT_007b mobile cancel navigates to location list', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await editPage.gotoAndWaitLoaded();
    await editPage.cancelMobileButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCEDIT_009b */
  test('TC_AD_LOCEDIT_009b mobile delete opens confirm modal', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await editPage.gotoAndWaitLoaded();
    await editPage.deleteMobileButton.click();
    await expect(editPage.deleteModal).toBeVisible();
  });

  /** TC_AD_LOCEDIT_008 */
  test('TC_AD_LOCEDIT_008 delete modal cancel does not call DELETE', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes(`/admin/locations/${defaultEditLocationId}`)) {
        deleteCalled = true;
      }
    });

    await editPage.deleteHeaderButton.click();
    await expect(editPage.deleteModal).toBeVisible();
    await editPage.deleteCancelButton.click();
    await expect(editPage.deleteModal).toBeHidden();
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_LOCEDIT_009 */
  test('TC_AD_LOCEDIT_009 confirm delete removes location and redirects to list', async ({ adminPage }) => {
    editPage = new LocationEditPage(adminPage, deleteLocationId);
    await editPage.gotoAndWaitLoaded();

    const deleteReq = editPage.waitForDelete();
    await editPage.deleteHeaderButton.click();
    await expect(editPage.deleteModal).toBeVisible();
    await editPage.deleteConfirmButton.click();

    const res = await deleteReq;
    expect(res.status()).toBe(200);
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
    expect(getMockLocationAfterUpdate(deleteLocationId)).toBeUndefined();
  });

  /** TC_AD_LOCEDIT_010 */
  test('TC_AD_LOCEDIT_010 shows error toast when update API fails', async ({ adminPage }) => {
    setLocationUpdateFail(true);
    await editPage.gotoAndWaitLoaded();
    await editPage.nameInput.fill(updatedLocationName);
    await editPage.submit();
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/locations/edit/${defaultEditLocationId}`));
  });

  /** TC_AD_LOCEDIT_011 */
  test('TC_AD_LOCEDIT_011 shows not found UI when detail API returns 404', async ({ adminPage }) => {
    setLocationDetailFailForId(notFoundLocationId);
    editPage = new LocationEditPage(adminPage, notFoundLocationId);
    await editPage.goto();

    await expect(editPage.notFoundTitle).toBeVisible();
    await editPage.returnToListButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCEDIT_012 */
  test('TC_AD_LOCEDIT_012 sends featured flag in PUT body', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.featuredToggle.click();
    await editPage.submit();

    const res = await updateReq;
    const body = res.request().postDataJSON() as Record<string, unknown>;
    expect(body.is_featured).toBe(false);
    expect(res.status()).toBe(200);
  });

  /** TC_AD_LOCEDIT_013 */
  test('TC_AD_LOCEDIT_013 does not auto change slug when name changes in edit mode', async () => {
    await editPage.gotoAndWaitLoaded();
    const originalSlug = mockEditLocation.slug;
    await editPage.nameInput.fill('Tên mới hoàn toàn khác');
    await expect(editPage.slugInput).toHaveValue(originalSlug);
  });

  /** TC_AD_LOCEDIT_014 */
  test('TC_AD_LOCEDIT_014 shows location name in header subtitle', async () => {
    await editPage.gotoAndWaitLoaded();
    await expect(editPage.headerLocationName).toHaveText(mockEditLocation.name);
  });

  /** TC_AD_LOCEDIT_015 */
  test('TC_AD_LOCEDIT_015 shows high completion percent when form is loaded', async () => {
    await editPage.gotoAndWaitLoaded();
    const percentText = await editPage.completionPercent.textContent();
    const percent = Number.parseInt(percentText?.replace('%', '') ?? '0', 10);
    expect(percent).toBeGreaterThanOrEqual(80);
  });
});
