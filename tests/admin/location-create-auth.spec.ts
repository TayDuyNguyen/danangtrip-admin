/**
 * Admin Location Create — auth guard (05b)
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { locationCreateCopy as copy } from '../pages/admin/LocationCreatePage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockLocationsApi, resetMockLocations } from '../fixtures/api/locations.mock';

test.describe('Admin Location Create — auth @P0', () => {
  /** TC_AD_LOCCREATE_030 */
  test('TC_AD_LOCCREATE_030 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/locations/create', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_LOCCREATE_031 */
  test('TC_AD_LOCCREATE_031 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockLocations();
    await mockAdminLayoutApis(page);
    await mockLocationsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/locations/create', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
