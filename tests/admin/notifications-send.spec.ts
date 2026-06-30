/**
 * Admin Notifications — send page (14b)
 */
import { test, expect } from '../fixtures/auth.fixture';
import {
  NotificationSendPage,
  notificationSendCopy as copy,
} from '../pages/admin/NotificationSendPage';
import {
  NotificationListPage,
} from '../pages/admin/NotificationListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockUsersApi } from '../fixtures/api/users.mock';
import {
  getLastNotificationSendAllBody,
  getLastNotificationSendBody,
  mockNotificationsApi,
  resetMockNotifications,
  setNotificationSendAllFail,
  setNotificationSendDelay,
  setNotificationSendFail,
} from '../fixtures/api/notifications.mock';
import {
  bulkSendForm,
  individualSendForm,
  notificationRecipientUser,
  notificationRecipientUserRaw,
} from '../fixtures/data/notifications.data';
import {
  mockPaginatedUserListResponse,
  mockStaffLikeUser,
} from '../fixtures/data/users.data';

test.describe.configure({ retries: 1 });

function usersWithRecipient() {
  return {
    paginated: true as const,
    listHandler: (params: URLSearchParams) => {
      const merged = {
        ...structuredClone(mockPaginatedUserListResponse),
        data: [...mockPaginatedUserListResponse.data, notificationRecipientUserRaw],
        total: mockPaginatedUserListResponse.total + 1,
      };
      const q = (params.get('q') || '').trim().toLowerCase();
      const status = params.get('status') || '';
      let rows = merged.data;
      if (status) {
        rows = rows.filter((u) => u.status === status);
      }
      if (q) {
        rows = rows.filter(
          (u) =>
            u.full_name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q)
        );
      }
      return { ...merged, data: rows, total: rows.length };
    },
  };
}

const expectedActiveUserCount =
  mockPaginatedUserListResponse.data.filter((u) => u.status === 'active').length + 1;

async function setupSendPage(adminPage: import('@playwright/test').Page) {
  resetMockNotifications();
  await adminPage.unroute('**/api/v1/**');
  await mockAdminLayoutApis(adminPage);
  await mockUsersApi(adminPage, usersWithRecipient());
  await mockNotificationsApi(adminPage);
  await mockAuthRefreshApi(adminPage);
  const sendPage = new NotificationSendPage(adminPage);
  await sendPage.goto();
  return sendPage;
}

test.describe('Admin Notification Send — navigation @P0', () => {
  /** TC_AD_NOTIF_SEND_002 */
  test('TC_AD_NOTIF_SEND_002 breadcrumb shows Notifications and Send labels', async ({
    adminPage,
  }) => {
    const sendPage = await setupSendPage(adminPage);
    await expect(sendPage.breadcrumbListLink).toBeVisible();
    await expect(
      sendPage.breadcrumbTrail.locator('span.text-\\[\\#14b8a6\\]').filter({ hasText: copy.breadcrumbSend })
    ).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_003 */
  test('TC_AD_NOTIF_SEND_003 cancel button navigates back to list', async ({ adminPage }) => {
    const sendPage = await setupSendPage(adminPage);
    await sendPage.cancelButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/notifications$/);
  });

  /** TC_AD_NOTIF_SEND_004 */
  test('TC_AD_NOTIF_SEND_004 list send button opens send page', async ({ adminPage }) => {
    resetMockNotifications();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { paginated: true });
    await mockNotificationsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    const listPage = new NotificationListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.sendButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/notifications\/send$/);
    await expect(adminPage.getByRole('heading', { level: 2, name: copy.title })).toBeVisible();
  });
});

test.describe('Admin Notification Send — validation @P0', () => {
  let sendPage: NotificationSendPage;

  test.beforeEach(async ({ adminPage }) => {
    sendPage = await setupSendPage(adminPage);
  });

  /** TC_AD_NOTIF_SEND_010 */
  test('TC_AD_NOTIF_SEND_010 shows title_required when title is empty', async () => {
    await sendPage.contentField.fill('Nội dung hợp lệ cho validation.');
    await sendPage.submitOnly();
    await expect(sendPage.page.getByText(copy.validationTitle)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_011 */
  test('TC_AD_NOTIF_SEND_011 shows content_required when content is empty', async () => {
    await sendPage.titleField.fill('Tiêu đề hợp lệ');
    await sendPage.submitOnly();
    await expect(sendPage.page.getByText(copy.validationContent)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_012 */
  test('TC_AD_NOTIF_SEND_012 shows title_max when title exceeds 100 chars', async () => {
    await sendPage.fillForm({
      title: 'x'.repeat(101),
      content: 'Nội dung hợp lệ cho validation.',
    });
    await sendPage.submitOnly();
    await expect(sendPage.page.getByText(copy.validationTitleMax)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_013 */
  test('TC_AD_NOTIF_SEND_013 shows content_max when content exceeds 500 chars', async () => {
    await sendPage.fillForm({
      title: 'Tiêu đề hợp lệ',
      content: 'x'.repeat(501),
    });
    await sendPage.submitOnly();
    await expect(sendPage.page.getByText(copy.validationContentMax)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_014 */
  test('TC_AD_NOTIF_SEND_014 shows data_invalid_link for malformed link', async () => {
    await sendPage.fillForm({
      title: 'Test title',
      content: 'Test content long enough for validation.',
      link: 'invalid-link',
    });
    await sendPage.submitOnly();
    await expect(sendPage.page.getByText(copy.validationLink)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_015 */
  test('TC_AD_NOTIF_SEND_015 accepts valid relative and https links', async () => {
    for (const link of ['/tours', 'https://danangtrip.vn/tours']) {
      await sendPage.goto();
      await sendPage.fillForm({
        title: individualSendForm.title,
        content: individualSendForm.content,
        link,
      });
      await sendPage.selectRecipientByEmail(notificationRecipientUser.email);
      await sendPage.submitOnly();
      await expect(sendPage.page.getByText(copy.validationLink)).toHaveCount(0);
    }
  });

  /** TC_AD_NOTIF_SEND_016 */
  test('TC_AD_NOTIF_SEND_016 blocks individual submit without recipient', async ({ adminPage }) => {
    let sendPosts = 0;
    adminPage.on('request', (req) => {
      if (
        req.url().includes('/admin/notifications/send') &&
        !req.url().includes('send-all') &&
        req.method() === 'POST'
      ) {
        sendPosts += 1;
      }
    });
    await sendPage.fillForm({
      title: individualSendForm.title,
      content: individualSendForm.content,
    });
    await sendPage.submitOnly();
    await expect(sendPage.page.getByText(copy.validationUser)).toBeVisible();
    expect(sendPosts).toBe(0);
  });
});

test.describe('Admin Notification Send — individual @P1', () => {
  let sendPage: NotificationSendPage;

  test.beforeEach(async ({ adminPage }) => {
    sendPage = await setupSendPage(adminPage);
  });

  /** TC_AD_NOTIF_SEND_020 */
  test('TC_AD_NOTIF_SEND_020 allows selecting all notification types', async () => {
    const types = [copy.typeBooking, copy.typeRating, copy.typeSystem, copy.typePromotion];
    for (const typeOption of types) {
      await sendPage.selectType(typeOption);
      await expect(sendPage.previewCard.getByText(typeOption)).toBeVisible();
    }
  });

  /** TC_AD_NOTIF_SEND_021 */
  test('TC_AD_NOTIF_SEND_021 recipient search finds user by email and name', async () => {
    await sendPage.recipientSearch.fill(mockStaffLikeUser.email);
    await expect(
      sendPage.page.getByRole('listbox').getByRole('option').filter({ hasText: mockStaffLikeUser.email })
    ).toBeVisible();
    await sendPage.recipientSearch.clear();
    await sendPage.selectRecipientByName(mockStaffLikeUser.full_name);
    await expect(
      sendPage.page.locator('#recipient-section').getByText(mockStaffLikeUser.email)
    ).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_022 */
  test('TC_AD_NOTIF_SEND_022 preview shows selected recipient name and email', async () => {
    await sendPage.selectRecipientByEmail(notificationRecipientUser.email);
    await expect(sendPage.previewCard.getByText(notificationRecipientUser.full_name)).toBeVisible();
    await expect(sendPage.previewCard.getByText(notificationRecipientUser.email)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_023 */
  test('TC_AD_NOTIF_SEND_023 individual success shows toast and redirects to list', async ({
    adminPage,
  }) => {
    await sendPage.fillForm({
      title: individualSendForm.title,
      content: individualSendForm.content,
    });
    await sendPage.selectRecipientByEmail(notificationRecipientUser.email);
    await sendPage.submitOnly();
    await sendPage.expectToast(copy.sendIndividualSuccess);
    await expect(adminPage).toHaveURL(/\/admin\/notifications$/);
  });

  /** TC_AD_NOTIF_SEND_024 */
  test('TC_AD_NOTIF_SEND_024 individual API payload includes user_id type title content and data.url', async () => {
    await sendPage.selectType(copy.typePromotion);
    await sendPage.fillForm({
      title: individualSendForm.title,
      content: individualSendForm.content,
      link: 'https://danangtrip.vn/promo',
    });
    await sendPage.selectRecipientByEmail(notificationRecipientUser.email);
    const sendReq = sendPage.page.waitForResponse(
      (res) =>
        res.url().includes('/admin/notifications/send') &&
        !res.url().includes('send-all') &&
        res.request().method() === 'POST'
    );
    await sendPage.submitOnly();
    await sendReq;
    const body = getLastNotificationSendBody();
    expect(body?.user_id).toBe(notificationRecipientUser.id);
    expect(body?.type).toBe('promotion');
    expect(body?.title).toBe(individualSendForm.title);
    expect(body?.content).toBe(individualSendForm.content);
    expect((body?.data as { url?: string })?.url).toBe('https://danangtrip.vn/promo');
  });

  /** TC_AD_NOTIF_SEND_025 */
  test('TC_AD_NOTIF_SEND_025 individual API error shows toast and keeps form data', async () => {
    setNotificationSendFail(true);
    await sendPage.fillForm({
      title: individualSendForm.title,
      content: individualSendForm.content,
    });
    await sendPage.selectRecipientByEmail(notificationRecipientUser.email);
    await sendPage.submitOnly();
    await sendPage.expectToast(copy.sendFailed);
    await expect(sendPage.titleField).toHaveValue(individualSendForm.title);
    await expect(sendPage.contentField).toHaveValue(individualSendForm.content);
  });

  /** TC_AD_NOTIF_SEND_026 */
  test('TC_AD_NOTIF_SEND_026 disables submit and shows sending label while pending', async () => {
    setNotificationSendDelay(2500);
    await sendPage.fillForm({
      title: individualSendForm.title,
      content: individualSendForm.content,
    });
    await sendPage.selectRecipientByEmail(notificationRecipientUser.email);
    await sendPage.headerSubmitButton.click();
    await expect(sendPage.headerSubmitButton).toBeDisabled();
    await expect(sendPage.page.locator('.select-none').getByText(copy.sendingButton)).toBeVisible();
  });
});

test.describe('Admin Notification Send — bulk @P1', () => {
  let sendPage: NotificationSendPage;

  test.beforeEach(async ({ adminPage }) => {
    sendPage = await setupSendPage(adminPage);
  });

  /** TC_AD_NOTIF_SEND_030 */
  test('TC_AD_NOTIF_SEND_030 bulk mode hides recipient selector and shows user count preview', async () => {
    await expect(sendPage.recipientSearch).toBeVisible();
    await sendPage.modeBulkButton.click();
    await expect(sendPage.recipientSearch).toHaveCount(0);
    await expect(sendPage.previewCard.getByText(copy.previewToAll)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_031 */
  test('TC_AD_NOTIF_SEND_031 bulk mode displays active user count from users API', async () => {
    await sendPage.modeBulkButton.click();
    await expect(
      sendPage.previewCard.getByText(
        new RegExp(`${expectedActiveUserCount}|All ${expectedActiveUserCount} users`, 'i')
      )
    ).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_032 */
  test('TC_AD_NOTIF_SEND_032 bulk submit opens confirm dialog without calling API', async ({
    adminPage,
  }) => {
    let sendAllPosts = 0;
    adminPage.on('request', (req) => {
      if (req.url().includes('/send-all') && req.method() === 'POST') sendAllPosts += 1;
    });
    await sendPage.modeBulkButton.click();
    await sendPage.fillForm({
      title: bulkSendForm.title,
      content: bulkSendForm.content,
    });
    await sendPage.submitOnly();
    await expect(sendPage.bulkDialog).toBeVisible();
    expect(sendAllPosts).toBe(0);
  });

  /** TC_AD_NOTIF_SEND_033 */
  test('TC_AD_NOTIF_SEND_033 bulk dialog shows recipient count', async () => {
    await sendPage.modeBulkButton.click();
    await sendPage.fillForm({
      title: bulkSendForm.title,
      content: bulkSendForm.content,
    });
    await sendPage.submitOnly();
    await expect(sendPage.bulkDialog).toContainText(String(expectedActiveUserCount));
  });

  /** TC_AD_NOTIF_SEND_034 */
  test('TC_AD_NOTIF_SEND_034 confirm bulk sends POST send-all and success toast', async () => {
    await sendPage.modeBulkButton.click();
    await sendPage.fillForm({
      title: bulkSendForm.title,
      content: bulkSendForm.content,
      link: bulkSendForm.link,
    });
    const sendAllReq = sendPage.page.waitForResponse(
      (res) => res.url().includes('/send-all') && res.request().method() === 'POST'
    );
    await sendPage.submitOnly();
    await sendPage.confirmBulkSend();
    const res = await sendAllReq;
    expect(res.ok()).toBeTruthy();
    expect(getLastNotificationSendAllBody()?.title).toBe(bulkSendForm.title);
    await sendPage.expectToast(copy.sendBulkSuccess);
  });

  /** TC_AD_NOTIF_SEND_035 */
  test('TC_AD_NOTIF_SEND_035 cancel bulk dialog closes without API call', async ({ adminPage }) => {
    let sendAllPosts = 0;
    adminPage.on('request', (req) => {
      if (req.url().includes('/send-all') && req.method() === 'POST') sendAllPosts += 1;
    });
    await sendPage.modeBulkButton.click();
    await sendPage.fillForm({
      title: bulkSendForm.title,
      content: bulkSendForm.content,
    });
    await sendPage.submitOnly();
    await expect(sendPage.bulkDialog).toBeVisible();
    await sendPage.cancelBulkSend();
    await expect(sendPage.bulkDialog).toHaveCount(0);
    expect(sendAllPosts).toBe(0);
  });

  /** TC_AD_NOTIF_SEND_036 */
  test('TC_AD_NOTIF_SEND_036 bulk API error shows toast and closes dialog', async () => {
    setNotificationSendAllFail(true);
    await sendPage.modeBulkButton.click();
    await sendPage.fillForm({
      title: bulkSendForm.title,
      content: bulkSendForm.content,
    });
    await sendPage.submitOnly();
    const failRes = sendPage.page.waitForResponse(
      (res) => res.url().includes('/send-all') && res.request().method() === 'POST'
    );
    await sendPage.confirmBulkSend();
    const res = await failRes;
    expect(res.status()).toBe(500);
    await expect(sendPage.bulkDialog).toHaveCount(0);
    await sendPage.expectToast(copy.sendFailed);
  });

  /** TC_AD_NOTIF_SEND_037 */
  test('TC_AD_NOTIF_SEND_037 bulk success redirects to notifications list', async ({ adminPage }) => {
    await sendPage.modeBulkButton.click();
    await sendPage.fillForm({
      title: bulkSendForm.title,
      content: bulkSendForm.content,
    });
    await sendPage.submitOnly();
    await sendPage.confirmBulkSend();
    await sendPage.expectToast(copy.sendBulkSuccess);
    await expect(adminPage).toHaveURL(/\/admin\/notifications$/);
  });
});

test.describe('Admin Notification Send — preview @P1', () => {
  let sendPage: NotificationSendPage;

  test.beforeEach(async ({ adminPage }) => {
    sendPage = await setupSendPage(adminPage);
  });

  /** TC_AD_NOTIF_SEND_040 */
  test('TC_AD_NOTIF_SEND_040 preview updates when typing title and content', async () => {
    await sendPage.titleField.fill('Preview title sample');
    await sendPage.contentField.fill('Preview body content for notification.');
    await expect(sendPage.previewCard.getByText('Preview title sample')).toBeVisible();
    await expect(sendPage.previewCard.getByText('Preview body content for notification.')).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_041 */
  test('TC_AD_NOTIF_SEND_041 preview badge changes when notification type changes', async () => {
    await sendPage.selectType(copy.typePromotion);
    await expect(sendPage.previewCard.getByText(copy.typePromotion)).toBeVisible();
    await sendPage.selectType(copy.typeBooking);
    await expect(sendPage.previewCard.getByText(copy.typeBooking)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_042 */
  test('TC_AD_NOTIF_SEND_042 individual preview shows selected user', async () => {
    await sendPage.selectRecipientByEmail(notificationRecipientUser.email);
    await expect(sendPage.previewCard.getByText(notificationRecipientUser.full_name)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_043 */
  test('TC_AD_NOTIF_SEND_043 bulk preview shows send to all users message', async () => {
    await sendPage.modeBulkButton.click();
    await expect(sendPage.previewCard.getByText(copy.previewToAll)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_044 */
  test('TC_AD_NOTIF_SEND_044 empty title and content show preview placeholders', async () => {
    await expect(sendPage.previewCard.getByText(copy.previewEmptyTitle)).toBeVisible();
    await expect(sendPage.previewCard.getByText(copy.previewEmptyContent)).toBeVisible();
    await expect(sendPage.previewCard.getByText(copy.previewNoUser)).toBeVisible();
  });
});

test.describe('Admin Notification Send — UI @P2', () => {
  let sendPage: NotificationSendPage;

  test.beforeEach(async ({ adminPage }) => {
    sendPage = await setupSendPage(adminPage);
  });

  /** TC_AD_NOTIF_SEND_050 */
  test('TC_AD_NOTIF_SEND_050 collapsible data link field expands and collapses', async () => {
    await expect(sendPage.linkField).toHaveCount(0);
    await sendPage.expandLinkField();
    await expect(sendPage.linkField).toBeVisible();
    await sendPage.collapseLinkField();
    await expect(sendPage.linkField).toHaveCount(0);
  });

  /** TC_AD_NOTIF_SEND_051 */
  test('TC_AD_NOTIF_SEND_051 guide card shows four help items', async () => {
    await expect(sendPage.page.getByText(copy.guideItem1)).toBeVisible();
    await expect(sendPage.page.getByText(copy.guideItem2)).toBeVisible();
    await expect(sendPage.page.getByText(copy.guideItem3)).toBeVisible();
    await expect(sendPage.page.getByText(copy.guideItem4)).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_052 */
  test('TC_AD_NOTIF_SEND_052 mobile viewport shows dedicated footer actions', async ({
    adminPage,
  }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await expect(sendPage.page.getByTestId('notification-send-mobile-footer')).toBeVisible();
    await expect(sendPage.page.getByTestId('notification-send-mobile-submit')).toBeVisible();
    await expect(sendPage.page.getByTestId('notification-send-mobile-cancel')).toBeVisible();
  });

  /** TC_AD_NOTIF_SEND_053 */
  test('TC_AD_NOTIF_SEND_053 header submit button is bound to notification-send-form', async () => {
    await expect(sendPage.headerSubmitButton).toHaveAttribute('form', 'notification-send-form');
    await expect(sendPage.headerSubmitButton).toHaveAttribute('type', 'submit');
  });

  /** TC_AD_NOTIF_SEND_054 */
  test('TC_AD_NOTIF_SEND_054 desktop layout uses 65/35 form and sidebar columns', async ({
    adminPage,
  }) => {
    await adminPage.setViewportSize({ width: 1280, height: 800 });
    await expect(sendPage.formColumn).toBeVisible();
    await expect(sendPage.sidebarColumn).toBeVisible();
  });
});
