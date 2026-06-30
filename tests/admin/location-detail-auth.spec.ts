/**
 * Admin Location Detail — auth guard (05d)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { locationDetailCopy as copy } from '../pages/admin/LocationDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockLocationsApi, resetMockLocations } from '../fixtures/api/locations.mock';
import { defaultDetailLocationId } from '../fixtures/data/location-detail.data';

test.describe('Admin Location Detail — auth @P0', () => {
  /** TC_AD_LOCDET_050 */
  test('TC_AD_LOCDET_050 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/locations/detail/${defaultDetailLocationId}`);
    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await expect(page.getByRole('button', { name: copy.editButton })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_LOCDET_051 */
  test('TC_AD_LOCDET_051 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockLocations();
    await mockAdminLayoutApis(page);
    await mockLocationsApi(page);
    await seedNonAdminSession(page);
    await page.goto(`/admin/locations/detail/${defaultDetailLocationId}`);
    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await context.close();
  });
});
