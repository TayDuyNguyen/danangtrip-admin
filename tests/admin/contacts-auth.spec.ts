/**
 * Admin Contacts — auth guard (09)
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { contactsCopy as copy } from '../pages/admin/ContactsPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockContactsApi, resetMockContacts } from '../fixtures/api/contacts.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';

test.describe('Admin Contacts — auth @P0', () => {
  /** TC_AD_CNT_040 — ADMIN_CONTACT_DETAIL_001 guest */
  test('TC_AD_CNT_040 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const page = await context.newPage();
    await mockAdminLayoutApis(page);
    await page.route('**/api/v1/auth/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthenticated' }),
      });
    });
    await page.goto('/admin/contacts', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_CNT_041 */
  test('TC_AD_CNT_041 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockContacts();
    await mockAdminLayoutApis(page);
    await mockContactsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/contacts', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_CNT_042 */
  test('TC_AD_CNT_042 admin can access contacts page', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockContacts();
    await mockAdminLayoutApis(page);
    await mockContactsApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/contacts', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: copy.heading })).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
