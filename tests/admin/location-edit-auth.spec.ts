/**
 * Admin Location Edit — auth guard (05c)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { locationEditCopy as copy } from '../pages/admin/LocationEditPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockLocationsApi, resetMockLocations } from '../fixtures/api/locations.mock';
import { defaultEditLocationId } from '../fixtures/data/location-edit.data';

test.describe('Admin Location Edit — auth @P0', () => {
  /** TC_AD_LOCEDIT_030 */
  test('TC_AD_LOCEDIT_030 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/locations/edit/${defaultEditLocationId}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_LOCEDIT_031 */
  test('TC_AD_LOCEDIT_031 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockLocations();
    await mockAdminLayoutApis(page);
    await mockLocationsApi(page);
    await seedNonAdminSession(page);
    await page.goto(`/admin/locations/edit/${defaultEditLocationId}`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
