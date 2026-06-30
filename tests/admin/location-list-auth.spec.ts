/**
 * Admin Location List — auth guard (05a)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { locationListCopy as copy } from '../pages/admin/LocationListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockLocationsApi, resetMockLocations } from '../fixtures/api/locations.mock';

test.describe('Admin Location List — auth @P0', () => {
  /** TC_AD_LOCLIST_030 */
  test('TC_AD_LOCLIST_030 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/locations', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_LOCLIST_031 */
  test('TC_AD_LOCLIST_031 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockLocations();
    await mockAdminLayoutApis(page);
    await mockLocationsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/locations', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
