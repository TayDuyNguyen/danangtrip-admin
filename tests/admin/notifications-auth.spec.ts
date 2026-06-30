/**
 * Admin Notifications — auth (14)
 */
import { test, expect, seedAdminSession, seedNonAdminSession } from '../fixtures/auth.fixture';
import { notificationListCopy as copy } from '../pages/admin/NotificationListPage';
import { notificationSendCopy as sendCopy } from '../pages/admin/NotificationSendPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockNotificationsApi, resetMockNotifications } from '../fixtures/api/notifications.mock';
import { mockUsersApi } from '../fixtures/api/users.mock';

test.describe('Admin Notifications — auth @P0', () => {
  /** TC_AD_NOTIF_040 */
  test('TC_AD_NOTIF_040 guest is redirected to login', async ({ browser }) => {
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
    await page.goto('/admin/notifications', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: copy.heading })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_NOTIF_SEND_001 */
  test('TC_AD_NOTIF_SEND_001 guest on send page is redirected to login', async ({ browser }) => {
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
    await page.goto('/admin/notifications/send', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 2, name: sendCopy.title })).toHaveCount(0);
    await context.close();
  });

  /** TC_AD_NOTIF_041 */
  test('TC_AD_NOTIF_041 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockNotifications();
    await mockAdminLayoutApis(page);
    await mockUsersApi(page, { paginated: true });
    await mockNotificationsApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/notifications', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_NOTIF_042 */
  test('TC_AD_NOTIF_042 admin can access notifications list', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockNotifications();
    await mockAdminLayoutApis(page);
    await mockUsersApi(page, { paginated: true });
    await mockNotificationsApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    await page.goto('/admin/notifications', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: copy.heading })).toBeVisible({
      timeout: 20_000,
    });
    await context.close();
  });
});
