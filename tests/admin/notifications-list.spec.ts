/**
 * Admin Notifications — list (14)
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  NotificationListPage,
  notificationListCopy as copy,
} from '../pages/admin/NotificationListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockUsersApi } from '../fixtures/api/users.mock';
import {
  getLastNotificationListQuery,
  mockNotificationsApi,
  resetMockNotifications,
  setNotificationListDelay,
  setNotificationListEmpty,
} from '../fixtures/api/notifications.mock';
import {
  bookingNotification,
  mockNotificationSearchKeyword,
  notificationRecipientUser,
  primaryNotification,
  unreadSystemNotification,
} from '../fixtures/data/notifications.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Notifications — list @P1', () => {
  let listPage: NotificationListPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockNotifications();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { paginated: true });
    await mockNotificationsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    listPage = new NotificationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_NOTIF_001 */
  test('TC_AD_NOTIF_001 renders heading stats filters and table columns', async () => {
    await expect(listPage.heading).toBeVisible();
    await expect(listPage.subtitle).toBeVisible();
    await expect(listPage.statsGrid).toBeVisible();
    await expect(listPage.searchInput).toBeVisible();
    await expect(listPage.sendButton).toBeVisible();
    await expect(listPage.page.getByRole('columnheader', { name: copy.colRecipient })).toBeVisible();
    await expect(listPage.page.getByRole('columnheader', { name: copy.colContent })).toBeVisible();
    await expect(listPage.page.getByRole('columnheader', { name: copy.colType })).toBeVisible();
    await expect(listPage.page.getByRole('columnheader', { name: copy.colTime })).toBeVisible();
    await expect(listPage.page.getByRole('columnheader', { name: copy.colRead })).toBeVisible();
  });

  /** TC_AD_NOTIF_001b — data display integrity */
  test('TC_AD_NOTIF_001b displays notification fields from API', async () => {
    const row = listPage.rowByTitle(primaryNotification.title);
    await expect(row).toBeVisible();
    await expect(row).toContainText(primaryNotification.content);
    await expect(row).toContainText(notificationRecipientUser.email);
    await expect(row).toContainText(copy.typePromotion);
  });

  /** TC_AD_NOTIF_003 */
  test('TC_AD_NOTIF_003 filters list by search keyword', async () => {
    await listPage.search(mockNotificationSearchKeyword);
    await expect(listPage.rowByTitle(primaryNotification.title)).toBeVisible();
    await expect(listPage.rowByTitle(unreadSystemNotification.title)).toHaveCount(0);
    expect(getLastNotificationListQuery().search).toBe(mockNotificationSearchKeyword);
  });

  /** TC_AD_NOTIF_003b */
  test('TC_AD_NOTIF_003b syncs debounced search keyword to URL', async () => {
    await listPage.searchInput.fill(mockNotificationSearchKeyword);
    await expect
      .poll(() => new URL(listPage.page.url()).searchParams.get('q'))
      .toBe(mockNotificationSearchKeyword);
  });

  /** TC_AD_NOTIF_004 */
  test('TC_AD_NOTIF_004 filters list by system type', async () => {
    await listPage.selectTypeFilter(copy.typeSystem);
    await expect(listPage.rowByTitle(unreadSystemNotification.title)).toBeVisible();
    await expect(listPage.rowByTitle(primaryNotification.title)).toHaveCount(0);
    expect(getLastNotificationListQuery().type).toBe('system');
  });

  /** TC_AD_NOTIF_005 */
  test('TC_AD_NOTIF_005 filters list by unread status', async () => {
    await listPage.selectReadFilter(copy.statusUnread);
    await expect(listPage.rowByTitle(unreadSystemNotification.title)).toBeVisible();
    await expect(listPage.rowByTitle(bookingNotification.title)).toHaveCount(0);
    expect(getLastNotificationListQuery().is_read).toBe('0');
  });

  /** TC_AD_NOTIF_006 */
  test('TC_AD_NOTIF_006 resets filters after reset click', async () => {
    await listPage.selectTypeFilter(copy.typeSystem);
    await listPage.waitForTableLoaded();
    await expect(listPage.resetFiltersButton).toBeVisible();
    await listPage.resetFiltersButton.click();
    await expect(listPage.resetFiltersButton).toHaveCount(0);
    await listPage.waitForTableLoaded();
    await expect(listPage.rowByTitle(primaryNotification.title)).toBeVisible();
  });

  /** TC_AD_NOTIF_007 */
  test('TC_AD_NOTIF_007 navigates to send page from header button', async ({ adminPage }) => {
    await listPage.sendButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/notifications\/send$/);
  });

  /** TC_AD_NOTIF_009 */
  test('TC_AD_NOTIF_009 paginates to second page', async () => {
    await listPage.goToPage(2);
    await listPage.waitForTableLoaded();
    expect(Number(getLastNotificationListQuery().page)).toBe(2);
  });

  /** TC_AD_NOTIF_010 */
  test('TC_AD_NOTIF_010 shows empty state when list API returns no rows', async () => {
    resetMockNotifications();
    setNotificationListEmpty(true);
    await listPage.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(listPage.emptyState).toBeVisible({ timeout: 15_000 });
  });

  /** TC_AD_NOTIF_011 */
  test('TC_AD_NOTIF_011 shows loading state while list API is delayed', async () => {
    resetMockNotifications();
    setNotificationListDelay(1500);
    await listPage.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(listPage.page.locator('.animate-spin, [class*="loading"]').first()).toBeVisible();
    await listPage.waitForTableLoaded();
  });

  /** TC_AD_NOTIF_012 */
  test('TC_AD_NOTIF_012 deletes notification after confirm dialog', async () => {
    await listPage.deleteButtonInRow(unreadSystemNotification.title).click();
    await expect(listPage.deleteDialog).toBeVisible();
    await listPage.confirmDelete();
    await listPage.expectToast(copy.deleteSuccess);
    await expect(listPage.rowByTitle(unreadSystemNotification.title)).toHaveCount(0);
  });

  /** TC_AD_NOTIF_013 */
  test('TC_AD_NOTIF_013 cancel delete dialog without removing row', async () => {
    await listPage.deleteButtonInRow(primaryNotification.title).click();
    await expect(listPage.deleteDialog).toBeVisible();
    await listPage.cancelDelete();
    await expect(listPage.deleteDialog).toHaveCount(0);
    await expect(listPage.rowByTitle(primaryNotification.title)).toBeVisible();
  });

  /** TC_AD_NOTIF_014 */
  test('TC_AD_NOTIF_014 bulk deletes selected notifications', async () => {
    await listPage.checkboxInRow(primaryNotification.title).check();
    await listPage.checkboxInRow(bookingNotification.title).check();
    await listPage.page.getByRole('button', { name: copy.bulkDelete }).click();
    await expect(listPage.bulkDeleteDialog).toBeVisible();
    await listPage.bulkDeleteDialog.getByRole('button', { name: copy.deleteConfirm }).click();
    await listPage.expectToast(copy.bulkDeleteSuccess);
    await expect(listPage.rowByTitle(primaryNotification.title)).toHaveCount(0);
    await expect(listPage.rowByTitle(bookingNotification.title)).toHaveCount(0);
  });
});
