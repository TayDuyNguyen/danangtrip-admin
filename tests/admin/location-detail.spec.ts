/**
 * Admin Location Detail — core (05d)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { LocationDetailPage, locationDetailCopy as copy } from '../pages/admin/LocationDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockLocation,
  mockLocationsApi,
  patchMockLocation,
  resetMockLocations,
  setLocationDetailDelay,
  setLocationDetailFailForId,
  setLocationFeaturedFailForId,
  setLocationStatusFailForId,
  setLocationRatingsFailForId,
} from '../fixtures/api/locations.mock';
import {
  defaultDetailLocationId,
  deleteDetailLocationId,
  emptyReviewsLocationId,
  expectedFavoriteCountLabel,
  expectedViewCountLabel,
  mockDetailLocation,
  mockLocationRatings,
  notFoundDetailLocationId,
} from '../fixtures/data/location-detail.data';

test.describe('Admin Location Detail @P1', () => {
  let detailPage: LocationDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockLocations();
    await mockAdminLayoutApis(adminPage);
    await mockLocationsApi(adminPage);
    detailPage = new LocationDetailPage(adminPage, defaultDetailLocationId);
  });

  /** TC_AD_LOCDET_001 */
  test('TC_AD_LOCDET_001 loads header hero tabs and sidebar stats', async () => {
    await detailPage.gotoAndWaitLoaded();

    await expect(detailPage.pageHeading).toContainText(mockDetailLocation.name);
    await expect(detailPage.heroImage).toBeVisible();
    await expect(detailPage.tabInfoButton).toBeVisible();
    await expect(detailPage.tabReviewsButton).toBeVisible();
    await expect(detailPage.tabMapButton).toBeVisible();
    await expect(detailPage.managementCard).toBeVisible();
    await expect(detailPage.statCard(copy.statsViews)).toHaveText(expectedViewCountLabel);
    await expect(detailPage.statCard(copy.statsFavorites)).toHaveText(expectedFavoriteCountLabel);
  });

  /** TC_AD_LOCDET_002 */
  test('TC_AD_LOCDET_002 info tab shows description and contact by default', async () => {
    await detailPage.gotoAndWaitLoaded();

    await expect(detailPage.page.getByRole('heading', { name: copy.descriptionHeading })).toBeVisible();
    await expect(detailPage.page.getByText(mockDetailLocation.description)).toBeVisible();
    await expect(detailPage.page.getByText(mockDetailLocation.address)).toBeVisible();
  });

  /** TC_AD_LOCDET_003 */
  test('TC_AD_LOCDET_003 formats view and favorite counts', async () => {
    await detailPage.gotoAndWaitLoaded();

    await expect(detailPage.statCard(copy.statsViews)).toHaveText('48.2K');
    await expect(detailPage.statCard(copy.statsFavorites)).toHaveText('3.2K');
  });

  /** TC_AD_LOCDET_004 */
  test('TC_AD_LOCDET_004 hero displays thumbnail image', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.heroImage).toHaveAttribute('src', /.+/);
  });

  /** TC_AD_LOCDET_004b */
  test('TC_AD_LOCDET_004b hero shows fallback when no images', async ({ adminPage }) => {
    patchMockLocation(defaultDetailLocationId, { thumbnail: '', images: [] });
    await detailPage.gotoAndWaitLoaded();
    await expect(adminPage.getByText(copy.heroNoImages)).toBeVisible();
  });

  /** TC_AD_LOCDET_005 */
  test('TC_AD_LOCDET_005 shows skeleton while detail API is delayed', async ({ adminPage }) => {
    setLocationDetailDelay(1200);
    await detailPage.goto();
    await expect(adminPage.locator('.rounded-3xl').first()).toBeVisible();
    await expect(detailPage.pageHeading).toBeVisible({ timeout: 15_000 });
  });

  /** TC_AD_LOCDET_011 */
  test('TC_AD_LOCDET_011 reviews tab lists mock ratings', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.tabReviewsButton.click();

    await expect(adminPage.getByText(copy.allReviews)).toBeVisible();
    await expect(adminPage.getByText(mockLocationRatings[0]!.comment)).toBeVisible();
    await expect(adminPage.getByText(mockLocationRatings[1]!.user.full_name)).toBeVisible();
  });

  /** TC_AD_LOCDET_012 */
  test('TC_AD_LOCDET_012 reviews tab shows empty state for location without reviews', async ({ adminPage }) => {
    detailPage = new LocationDetailPage(adminPage, emptyReviewsLocationId);
    await detailPage.gotoAndWaitLoaded();
    await detailPage.tabReviewsButton.click();
    await expect(adminPage.getByText(copy.reviewsEmpty)).toBeVisible();
  });

  /** TC_AD_LOCDET_013 */
  test('TC_AD_LOCDET_013 map tab shows coordinates and directions link', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.tabMapButton.click();

    await expect(adminPage.getByText(copy.mapCoordinates)).toBeVisible();
    await expect(adminPage.getByText(`${mockDetailLocation.latitude}, ${mockDetailLocation.longitude}`)).toBeVisible();
    await expect(adminPage.getByRole('link', { name: copy.mapDirections })).toBeVisible();
    await expect(adminPage.locator('iframe[title]').first()).toBeVisible();
  });

  /** TC_AD_LOCDET_014 */
  test('TC_AD_LOCDET_014 map tab shows fallback when coordinates missing', async ({ adminPage }) => {
    patchMockLocation(defaultDetailLocationId, { latitude: null as unknown as number, longitude: null as unknown as number });
    await detailPage.gotoAndWaitLoaded();
    await detailPage.tabMapButton.click();
    await expect(adminPage.getByText(copy.mapNoCoordinates).first()).toBeVisible();
  });

  /** TC_AD_LOCDET_020 */
  test('TC_AD_LOCDET_020 back button navigates to location list', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.goBackToList();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCDET_021 */
  test('TC_AD_LOCDET_021 edit button navigates to edit page', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.editButton.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/locations/edit/${defaultDetailLocationId}(/)?$`));
  });

  /** TC_AD_LOCDET_030 */
  test('TC_AD_LOCDET_030 admin sees management card and danger zone', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.managementCard).toBeVisible();
    await expect(detailPage.featuredToggle).toBeVisible();
    await expect(adminPage.getByText(copy.dangerZone)).toBeVisible();
    await expect(detailPage.dangerDeleteButton).toBeVisible();
  });

  /** TC_AD_LOCDET_031 */
  test('TC_AD_LOCDET_031 changes status to inactive via sidebar select', async () => {
    await detailPage.gotoAndWaitLoaded();
    const statusReq = detailPage.waitForStatusPatch();
    await detailPage.selectStatus(copy.statusInactive);
    const res = await statusReq;
    expect(res.status()).toBe(200);
    expect(getMockLocation(defaultDetailLocationId)?.status).toBe('inactive');
  });

  /** TC_AD_LOCDET_032 */
  test('TC_AD_LOCDET_032 toggles featured off via PATCH', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    const patchReq = detailPage.waitForFeaturedPatch();
    await detailPage.featuredToggle.click();
    const res = await patchReq;
    expect(res.status()).toBe(200);
    expect(getMockLocation(defaultDetailLocationId)?.is_featured).toBe(false);
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
  });

  /** TC_AD_LOCDET_033 */
  test('TC_AD_LOCDET_033 delete modal cancel does not call DELETE', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes(`/admin/locations/${defaultDetailLocationId}`)) {
        deleteCalled = true;
      }
    });

    await detailPage.headerDeleteButton.click();
    await expect(detailPage.deleteModal).toBeVisible();
    await detailPage.deleteCancelButton.click();
    await expect(detailPage.deleteModal).toBeHidden();
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_LOCDET_034 */
  test('TC_AD_LOCDET_034 confirm delete from danger zone redirects to list', async ({ adminPage }) => {
    detailPage = new LocationDetailPage(adminPage, deleteDetailLocationId);
    await detailPage.gotoAndWaitLoaded();

    const deleteReq = detailPage.waitForDelete();
    await detailPage.dangerDeleteButton.click();
    await expect(detailPage.deleteModal).toBeVisible();
    await detailPage.deleteConfirmButton.click();

    const res = await deleteReq;
    expect(res.status()).toBe(200);
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
    expect(getMockLocation(deleteDetailLocationId)).toBeUndefined();
  });

  /** TC_AD_LOCDET_040 */
  test('TC_AD_LOCDET_040 shows not found UI when detail API returns 404', async ({ adminPage }) => {
    setLocationDetailFailForId(notFoundDetailLocationId);
    detailPage = new LocationDetailPage(adminPage, notFoundDetailLocationId);
    await detailPage.goto();

    await expect(detailPage.notFoundTitle).toBeVisible();
    await detailPage.returnToListButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/locations\/?$/);
  });

  /** TC_AD_LOCDET_041 */
  test('TC_AD_LOCDET_041 shows error toast when featured toggle fails', async ({ adminPage }) => {
    setLocationFeaturedFailForId(defaultDetailLocationId);
    await detailPage.gotoAndWaitLoaded();
    await detailPage.featuredToggle.click();
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
  });

  /** TC_AD_LOCDET_042 */
  test('TC_AD_LOCDET_042 shows error toast when status change fails', async ({ adminPage }) => {
    setLocationStatusFailForId(defaultDetailLocationId);
    await detailPage.gotoAndWaitLoaded();
    await detailPage.selectStatus(copy.statusInactive);
    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
  });

  /** TC_AD_LOCDET_044 */
  test('TC_AD_LOCDET_044 shows reviews error state when ratings API fails', async ({ adminPage }) => {
    setLocationRatingsFailForId(defaultDetailLocationId);
    await detailPage.gotoAndWaitLoaded();
    await detailPage.tabReviewsButton.click();
    await expect(adminPage.getByText(copy.reviewsLoadError)).toBeVisible();
    await expect(detailPage.retryButton).toBeVisible();
  });

  /** TC_AD_LOCDET_043 */
  test('TC_AD_LOCDET_043 retry refetches detail after transient server error', async ({ adminPage }) => {
    setLocationDetailFailForId(defaultDetailLocationId, 500);
    await detailPage.goto();
    await expect(detailPage.errorWidget).toBeVisible();

    setLocationDetailFailForId(null);
    const detailReq = detailPage.waitForDetailGet();
    await detailPage.retryButton.click();
    await detailReq;
    await expect(detailPage.pageHeading).toContainText(mockDetailLocation.name);
  });
});
