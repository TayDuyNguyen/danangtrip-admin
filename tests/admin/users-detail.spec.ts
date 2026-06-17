/**
 * Admin User Detail — mapped from 02d_user_detail.md
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { UserDetailPage } from '../pages/admin/UserDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockDetailUser,
  mockUserDetailApi,
  resetMockDetailUsers,
} from '../fixtures/api/users-detail.mock';
import {
  mockAdminUser,
  mockCustomerUser,
} from '../fixtures/data/users.data';
import { mockBookingsForCustomer } from '../fixtures/data/users-detail.data';

const DETAIL_USER_ID = 3;
const BANNED_USER_ID = 4;
const SELF_USER_ID = 1;
const NOT_FOUND_USER_ID = 999;

test.describe('Admin User Detail @P1', () => {
  test.describe.configure({ mode: 'serial' });
  let detailPage: UserDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
  });

  /** ADMIN_USER_DETAIL_003 / TC_AD_UDET_001 */
  test('TC_AD_UDET_001 loads user profile with sections', async ({ adminPage }) => {
    await expect(detailPage.pageHeading).toContainText(mockCustomerUser.full_name);
    await expect(detailPage.personalInfoCard).toBeVisible();
    await expect(detailPage.bookingsCard).toBeVisible();
    await expect(detailPage.actionsCard).toBeVisible();
    await expect(adminPage.getByText(mockCustomerUser.email).first()).toBeVisible();
    await expect(adminPage.getByText(mockCustomerUser.phone ?? '').first()).toBeVisible();
  });

  /** ADMIN_USER_DETAIL_006 */
  test('TC_AD_UDET_002 shows personal info and stats', async ({ adminPage }) => {
    await expect(detailPage.pageHeading).toContainText(mockCustomerUser.full_name);
    await expect(adminPage.getByText(mockCustomerUser.email).first()).toBeVisible();
    await expect(adminPage.getByText(/3\.200\.000|3,200,000/)).toBeVisible();
  });

  /** ADMIN_USER_DETAIL_011 */
  test('TC_AD_UDET_003 shows recent bookings with total count', async ({ adminPage }) => {
    await expect(adminPage.getByText(/10.*đơn|10 orders/i)).toBeVisible();
    await expect(detailPage.bookingCodeLink(mockBookingsForCustomer[0].booking_code)).toBeVisible();
    await expect(adminPage.locator('table tbody tr')).toHaveCount(5);
  });

  /** ADMIN_USER_DETAIL_013 */
  test('TC_AD_UDET_004 shows recent ratings with total count', async ({ adminPage }) => {
    await expect(adminPage.getByText(/5.*đánh giá|5 reviews/i)).toBeVisible();
    await expect(adminPage.getByText('Tour rất tuyệt vời!')).toBeVisible();
  });

  /** ADMIN_USER_DETAIL_029 */
  test('TC_AD_UDET_005 booking link navigates to booking detail', async ({ adminPage }) => {
    await detailPage.bookingCodeLink(mockBookingsForCustomer[0].booking_code).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/bookings/detail/${mockBookingsForCustomer[0].id}`));
  });

  /** MarkUp: actions card — Xem đơn đặt tour */
  test('TC_AD_UDET_017 view bookings action navigates with user_id', async ({ adminPage }) => {
    await expect(detailPage.actionsViewBookingsLink).toHaveAttribute(
      'href',
      `/admin/bookings?user_id=${DETAIL_USER_ID}`
    );
    await detailPage.actionsViewBookingsLink.hover();
    await detailPage.actionsViewBookingsLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/bookings\\?user_id=${DETAIL_USER_ID}`));
  });

  /** MarkUp: actions card — Xem đánh giá */
  test('TC_AD_UDET_018 view ratings action navigates with user_id', async ({ adminPage }) => {
    await expect(detailPage.actionsViewRatingsLink).toHaveAttribute(
      'href',
      `/admin/reports/ratings?user_id=${DETAIL_USER_ID}`
    );
    await detailPage.actionsViewRatingsLink.hover();
    await detailPage.actionsViewRatingsLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/reports/ratings\\?user_id=${DETAIL_USER_ID}`));
  });

  /** MarkUp: round-trip — Xem đơn đặt tour → Back về detail */
  test('TC_AD_UDET_019 view bookings then browser back returns to detail', async ({ adminPage }) => {
    const detailPath = `/admin/users/detail/${DETAIL_USER_ID}`;
    await detailPage.actionsViewBookingsLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/bookings\\?user_id=${DETAIL_USER_ID}`));
    await adminPage.goBack();
    await expect(adminPage).toHaveURL(new RegExp(detailPath.replace(/\//g, '\\/')));
    await expect(detailPage.pageHeading).toContainText(mockCustomerUser.full_name);
    await expect(detailPage.actionsViewBookingsLink).toBeVisible();
  });

  /** MarkUp: round-trip — Xem đánh giá → Back về detail */
  test('TC_AD_UDET_020 view ratings then browser back returns to detail', async ({ adminPage }) => {
    const detailPath = `/admin/users/detail/${DETAIL_USER_ID}`;
    await detailPage.actionsViewRatingsLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/reports/ratings.*user_id=${DETAIL_USER_ID}`));
    await adminPage.goBack();
    await expect(adminPage).toHaveURL(new RegExp(detailPath.replace(/\//g, '\\/')));
    await expect(detailPage.pageHeading).toContainText(mockCustomerUser.full_name);
    await expect(detailPage.actionsViewRatingsLink).toBeVisible();
  });

  /** ADMIN_USER_DETAIL_015 */
  test('TC_AD_UDET_011 blocks active user via status API', async ({ adminPage }) => {
    const statusReq = detailPage.waitForStatusPatch();
    await detailPage.headerBlockButton.click();
    const res = await statusReq;
    expect(res.status()).toBe(200);
    await expect(adminPage.getByText(/blocked|khóa/i)).toBeVisible();
    expect(getMockDetailUser(DETAIL_USER_ID)?.status).toBe('banned');
  });

  /** ADMIN_USER_DETAIL_018 */
  test('TC_AD_UDET_013 opens change role dialog', async () => {
    await detailPage.openChangeRoleDialog();
    await expect(detailPage.roleDialog).toBeVisible();
  });

  /** ADMIN_USER_DETAIL_019 */
  test('TC_AD_UDET_014 promotes user to admin via role API', async ({ adminPage }) => {
    const roleReq = detailPage.waitForRolePatch();
    await detailPage.openChangeRoleDialog();
    await detailPage.selectAdminRoleInDialog();
    await detailPage.confirmRoleChange();
    const res = await roleReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as { role?: string };
    expect(body.role).toBe('admin');
    await expect(adminPage.getByText(/role updated|vai trò thành công/i)).toBeVisible();
    expect(getMockDetailUser(DETAIL_USER_ID)?.role).toBe('admin');
  });

  /** ADMIN_USER_DETAIL_022 */
  test('TC_AD_UDET_015 opens delete confirmation with user name', async () => {
    await detailPage.openDeleteDialog();
    await expect(detailPage.deleteDialog).toBeVisible();
    await expect(detailPage.deleteDialog.getByText(mockCustomerUser.full_name)).toBeVisible();
  });

  /** ADMIN_USER_DETAIL_023 */
  test('TC_AD_UDET_016 deletes user and navigates to list', async ({ adminPage }) => {
    const deleteTarget = new UserDetailPage(adminPage, 2);
    await deleteTarget.goto();
    const deleteReq = deleteTarget.waitForDelete();
    await deleteTarget.openDeleteDialog();
    await deleteTarget.confirmDelete();
    const res = await deleteReq;
    expect(res.status()).toBe(200);
    await expect(adminPage.getByText(/deleted|xóa tài khoản/i)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/users\/?$/, { timeout: 15_000 });
    expect(getMockDetailUser(2)).toBeUndefined();
  });
});

test.describe('Admin User Detail — Banned user @P1', () => {
  test('TC_AD_UDET_012 unblocks banned user via status API', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const bannedPage = new UserDetailPage(adminPage, BANNED_USER_ID);
    await bannedPage.goto();

    const statusReq = bannedPage.waitForStatusPatch();
    await bannedPage.headerUnblockButton.click();
    const res = await statusReq;
    expect(res.status()).toBe(200);
    await expect(adminPage.getByText(/unblocked|mở khóa/i)).toBeVisible();
    expect(getMockDetailUser(BANNED_USER_ID)?.status).toBe('active');
  });
});

test.describe('Admin User Detail — Self @P1', () => {
  test('TC_AD_UDET_009 disables dangerous actions on own profile', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const selfPage = new UserDetailPage(adminPage, SELF_USER_ID);
    await selfPage.goto();

    await expect(selfPage.youBadge).toBeVisible();
    await expect(selfPage.headerBlockButton).toBeDisabled();
    await expect(selfPage.actionsChangeRoleButton).toBeDisabled();
    await expect(selfPage.actionsDeleteButton).toBeDisabled();
  });
});

test.describe('Admin User Detail — Empty activity @P2', () => {
  test('TC_AD_UDET_006 shows zero stats for admin without activity', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const adminDetail = new UserDetailPage(adminPage, SELF_USER_ID);
    await adminDetail.goto();

    await expect(adminPage.getByRole('heading', { name: mockAdminUser.full_name })).toBeVisible();
    await expect(adminDetail.bookingsCard).toBeVisible();
    await expect(adminPage.getByText(copyNoBookings())).toBeVisible();
  });
});

function copyNoBookings() {
  return /Chưa có đơn đặt tour nào|no bookings/i;
}

test.describe('Admin User Detail — Not Found @P2', () => {
  test('TC_AD_UDET_010 shows not found UI', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const missingPage = new UserDetailPage(adminPage, NOT_FOUND_USER_ID);
    await missingPage.gotoExpectNotFound();
    await expect(missingPage.notFoundHeading).toBeVisible();
    await expect(missingPage.backToListButton).toBeVisible();
  });
});

test.describe('Admin User Detail — Auth @P0', () => {
  test('TC_AD_UDET_007 guest is redirected to login', async ({ page }) => {
    await page.goto(`/admin/users/detail/${DETAIL_USER_ID}`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('TC_AD_UDET_008 non-admin user is redirected to login', async ({ page }) => {
    await seedNonAdminSession(page);
    await page.goto(`/admin/users/detail/${DETAIL_USER_ID}`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
