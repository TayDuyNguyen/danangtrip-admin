/**
 * Admin User Detail — extended TC from 02d_user_detail.md backlog
 * Run: npm run test:admin:user-detail
 */
import { test, expect } from '../fixtures/auth.fixture';
import { UserDetailPage, userDetailCopy } from '../pages/admin/UserDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockDetailUser,
  mockUserDetailApi,
  resetMockDetailUsers,
} from '../fixtures/api/users-detail.mock';
import {
  mockAdminUser,
  mockCustomerUser,
  mockSecondaryAdmin,
  mockPendingUser,
} from '../fixtures/data/users.data';
import { mockBookingsForCustomer } from '../fixtures/data/users-detail.data';

const DETAIL_USER_ID = 3;
const SECONDARY_ADMIN_ID = 5;
const PENDING_USER_ID = 6;
const STAFF_USER_ID = 2;
const SELF_USER_ID = 1;

test.describe('Admin User Detail — Load extended @P1', () => {
  /** TC_AD_UDET_051 — loading skeleton (02d §4 backlog) */
  test('TC_AD_UDET_051 shows skeleton while user detail is loading', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage, { detailDelayMs: 2000 });
    await adminPage.goto(`/admin/users/detail/${DETAIL_USER_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(adminPage.locator('.animate-pulse.rounded-md').first()).toBeVisible();
    await adminPage.getByRole('heading', { name: userDetailCopy.personalInfo }).waitFor({
      state: 'visible',
      timeout: 10_000,
    });
  });
});

test.describe('Admin User Detail — Profile & stats extended @P1', () => {
  let detailPage: UserDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
  });

  /** TC_AD_UDET_027 */
  test('TC_AD_UDET_027 shows favorites stat card count', async () => {
    await expect(detailPage.favoritesStatValue).toHaveText(String(mockCustomerUser.favorites_count));
  });

  /** TC_AD_UDET_028 */
  test('TC_AD_UDET_028 shows mailto email link and avatar initial', async () => {
    await expect(detailPage.emailMailtoLink(mockCustomerUser.email)).toBeVisible();
    await expect(detailPage.avatarInitial('T')).toBeVisible();
  });

  /** TC_AD_UDET_029 */
  test('TC_AD_UDET_029 shows gender city birthdate and email verified fields', async ({
    adminPage,
  }) => {
    await expect(detailPage.personalInfoPanel.getByText(userDetailCopy.genderFemale)).toBeVisible();
    await expect(detailPage.personalInfoPanel.getByText(mockCustomerUser.city ?? '')).toBeVisible();
    await expect(detailPage.personalInfoPanel.getByText(/20\/08\/1995|08\/20\/1995|1995/)).toBeVisible();
    await expect(detailPage.personalInfoPanel.getByText(userDetailCopy.emailVerified)).toBeVisible();
  });

  /** TC_AD_UDET_030 */
  test('TC_AD_UDET_030 shows account sidebar role status and last login', async ({
    adminPage,
  }) => {
    await expect(detailPage.accountSidebar).toBeVisible();
    await expect(adminPage.getByText(/^USER$|^ADMIN$/i).first()).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.statusActive).first()).toBeVisible();
  });
});

test.describe('Admin User Detail — Bookings extended @P1', () => {
  let detailPage: UserDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
  });

  /** TC_AD_UDET_031 */
  test('TC_AD_UDET_031 view all bookings link navigates with user_id', async ({ adminPage }) => {
    await expect(detailPage.viewAllBookingsLink).toHaveAttribute(
      'href',
      `/admin/bookings?user_id=${DETAIL_USER_ID}`
    );
    await detailPage.viewAllBookingsLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/bookings\\?user_id=${DETAIL_USER_ID}`));
  });

  /** TC_AD_UDET_032 */
  test('TC_AD_UDET_032 shows booking status badges for all states', async ({ adminPage }) => {
    await expect(adminPage.getByText(userDetailCopy.bookingCompleted).first()).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.bookingConfirmed).first()).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.bookingPending).first()).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.bookingCancelled).first()).toBeVisible();
    await expect(adminPage.getByText(mockBookingsForCustomer[0].items![0].tour!.name).first()).toBeVisible();
  });
});

test.describe('Admin User Detail — Ratings extended @P2', () => {
  let detailPage: UserDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
  });

  /** TC_AD_UDET_033 */
  test('TC_AD_UDET_033 shows empty ratings state for user without reviews', async ({
    adminPage,
  }) => {
    const emptyPage = new UserDetailPage(adminPage, SELF_USER_ID);
    await emptyPage.goto();
    await expect(adminPage.getByText(userDetailCopy.noRatings)).toBeVisible();
  });

  /** TC_AD_UDET_034 */
  test('TC_AD_UDET_034 shows stars score comment and status badge', async ({ adminPage }) => {
    await expect(adminPage.locator('.fill-amber-400').first()).toBeVisible();
    await expect(adminPage.getByText('5.0').first()).toBeVisible();
    await expect(adminPage.getByText('Tour rất tuyệt vời!')).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.ratingApproved).first()).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.ratingPending).first()).toBeVisible();
  });

  /** TC_AD_UDET_035 */
  test('TC_AD_UDET_035 shows rating attached to location not only tour', async ({ adminPage }) => {
    await expect(adminPage.getByText('Cầu Rồng Đà Nẵng')).toBeVisible();
  });

  /** TC_AD_UDET_036 */
  test('TC_AD_UDET_036 view all ratings link navigates with user_id', async ({ adminPage }) => {
    await expect(detailPage.viewAllRatingsLink).toHaveAttribute(
      'href',
      `/admin/reports/ratings?user_id=${DETAIL_USER_ID}`
    );
    await detailPage.viewAllRatingsLink.click();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/reports/ratings\\?user_id=${DETAIL_USER_ID}`)
    );
  });
});

test.describe('Admin User Detail — Status & role extended @P1', () => {
  test.describe.configure({ mode: 'serial' });
  /** TC_AD_UDET_023 */
  test('TC_AD_UDET_023 header role badge opens change role dialog', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
    await detailPage.openChangeRoleDialogFromHeader();
    await expect(detailPage.roleDialog).toBeVisible();
  });

  /** TC_AD_UDET_024 */
  test('TC_AD_UDET_024 header status badge toggles account via PATCH', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
    const statusReq = detailPage.waitForStatusPatch();
    await detailPage.headerStatusBadge.click();
    const res = await statusReq;
    expect(res.status()).toBe(200);
    expect(getMockDetailUser(DETAIL_USER_ID)?.status).toBe('banned');
  });

  /** TC_AD_UDET_037 */
  test('TC_AD_UDET_037 demotes admin to user via role dialog', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const detailPage = new UserDetailPage(adminPage, SECONDARY_ADMIN_ID);
    await detailPage.goto();
    const roleReq = detailPage.waitForRolePatch();
    await detailPage.openChangeRoleDialog();
    await detailPage.selectUserRoleInDialog();
    await detailPage.confirmRoleChange();
    const res = await roleReq;
    expect(res.status()).toBe(200);
    expect(getMockDetailUser(SECONDARY_ADMIN_ID)?.role).toBe('user');
  });

  /** TC_AD_UDET_038 */
  test('TC_AD_UDET_038 role dialog disables save when unchanged and warns on admin', async ({
    adminPage,
  }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
    await detailPage.openChangeRoleDialog();
    await expect(detailPage.roleDialogSaveButton).toBeDisabled();
    await detailPage.selectAdminRoleInDialog();
    await expect(detailPage.roleDialogAdminWarning).toBeVisible();
    await expect(detailPage.roleDialogSaveButton).toBeEnabled();
  });

  /** TC_AD_UDET_039 */
  test('TC_AD_UDET_039 cancels role dialog without PATCH', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
    let rolePatchCount = 0;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/role')) rolePatchCount += 1;
    });
    await detailPage.openChangeRoleDialog();
    await detailPage.selectAdminRoleInDialog();
    await detailPage.cancelRoleDialog();
    await expect(detailPage.roleDialog).toHaveCount(0);
    expect(rolePatchCount).toBe(0);
  });

  /** TC_AD_UDET_043 */
  test('TC_AD_UDET_043 refetches user detail after status PATCH', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
    const statusReq = detailPage.waitForStatusPatch();
    const refetchReq = detailPage.waitForUserDetailGet();
    await detailPage.headerBlockButton.click();
    await statusReq;
    await refetchReq;
    await expect(detailPage.headerStatusBadge).toContainText(/BỊ KHÓA|BANNED/i);
  });

  /** TC_AD_UDET_045 */
  test('TC_AD_UDET_045 shows pending status badge in amber', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const detailPage = new UserDetailPage(adminPage, PENDING_USER_ID);
    await detailPage.goto();
    await expect(detailPage.headerStatusBadge).toContainText(/CHỜ KÍCH HOẠT|PENDING/i);
    await expect(detailPage.headerStatusBadge).toHaveClass(/amber/);
  });
});

test.describe('Admin User Detail — Delete extended @P2', () => {
  test.describe.configure({ mode: 'serial' });
  let detailPage: UserDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
  });

  /** TC_AD_UDET_040 */
  test('TC_AD_UDET_040 delete dialog shows cascade warning', async () => {
    await detailPage.openDeleteDialog();
    await expect(detailPage.deleteCascadeWarning).toBeVisible();
  });

  /** TC_AD_UDET_041 */
  test('TC_AD_UDET_041 cancels delete dialog without DELETE request', async ({ adminPage }) => {
    let deleteCount = 0;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/users/')) deleteCount += 1;
    });
    await detailPage.openDeleteDialog();
    await detailPage.cancelDeleteDialog();
    await expect(detailPage.deleteDialog).toHaveCount(0);
    expect(deleteCount).toBe(0);
  });
});

test.describe('Admin User Detail — Navigation extended @P2', () => {
  test.describe.configure({ mode: 'serial' });
  let detailPage: UserDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
  });

  /** TC_AD_UDET_021 */
  test('TC_AD_UDET_021 header edit link navigates to edit page', async ({ adminPage }) => {
    await expect(detailPage.headerEditLink).toHaveAttribute(
      'href',
      `/admin/users/edit/${DETAIL_USER_ID}`
    );
    await detailPage.headerEditLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${DETAIL_USER_ID}`));
  });

  /** TC_AD_UDET_022 */
  test('TC_AD_UDET_022 back button and breadcrumb navigate to user list', async ({ adminPage }) => {
    await Promise.all([
      adminPage.waitForURL(/\/admin\/users\/?$/),
      detailPage.headerBackButton.click(),
    ]);
    await detailPage.goto();
    await Promise.all([
      adminPage.waitForURL(/\/admin\/users\/?$/),
      detailPage.breadcrumbUsersLink.click(),
    ]);
  });

  /** TC_AD_UDET_025 */
  test('TC_AD_UDET_025 actions card edit link navigates to edit page', async ({ adminPage }) => {
    await expect(detailPage.actionsEditLink).toHaveAttribute(
      'href',
      `/admin/users/edit/${DETAIL_USER_ID}`
    );
    await detailPage.actionsEditLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${DETAIL_USER_ID}`));
  });

  /** TC_AD_UDET_026 */
  test('TC_AD_UDET_026 actions card block button patches status', async () => {
    const statusReq = detailPage.waitForStatusPatch();
    await detailPage.actionsBlockButton.click();
    const res = await statusReq;
    expect(res.status()).toBe(200);
    expect(getMockDetailUser(DETAIL_USER_ID)?.status).toBe('banned');
  });
});

test.describe('Admin User Detail — UX & error extended @P2', () => {
  test.describe.configure({ mode: 'serial' });
  let detailPage: UserDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    detailPage = new UserDetailPage(adminPage, DETAIL_USER_ID);
    await detailPage.goto();
  });

  /** TC_AD_UDET_042 */
  test('TC_AD_UDET_042 shows error toast on status role and delete failures', async ({
    adminPage,
  }) => {
    await mockUserDetailApi(adminPage, { statusFail: true });
    await detailPage.headerBlockButton.click();
    await expect(adminPage.getByText(userDetailCopy.statusError)).toBeVisible();

    await mockUserDetailApi(adminPage, { roleFail: true });
    await detailPage.openChangeRoleDialog();
    await detailPage.selectAdminRoleInDialog();
    await detailPage.confirmRoleChange();
    await expect(adminPage.getByText(userDetailCopy.roleError)).toBeVisible();
    await detailPage.cancelRoleDialog();

    await mockUserDetailApi(adminPage, { deleteFail: true });
    await detailPage.openDeleteDialog();
    await detailPage.confirmDelete();
    await expect(adminPage.getByText(userDetailCopy.deleteError)).toBeVisible();
  });

  /** TC_AD_UDET_044 */
  test('TC_AD_UDET_044 formats booking dates via formatAdminShortDate', async ({ adminPage }) => {
    await expect(
      detailPage.bookingCodeLink(mockBookingsForCustomer[0].booking_code).locator('..').locator('..')
    ).toContainText(/01\/05\/2026|05\/01\/2026|2026/);
  });

  /** TC_AD_UDET_046 */
  test('TC_AD_UDET_046 survives bookings API 500 without crashing page', async ({ adminPage }) => {
    await mockUserDetailApi(adminPage, { bookingsFail: true });
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(detailPage.personalInfoCard).toBeVisible();
    await expect(detailPage.bookingsLoadError).toBeVisible();
    await expect(detailPage.bookingsRetryButton).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.noBookings)).toHaveCount(0);
  });

  /** TC_AD_UDET_047 */
  test('TC_AD_UDET_047 survives ratings API 500 without crashing page', async ({ adminPage }) => {
    resetMockDetailUsers();
    await mockUserDetailApi(adminPage, { ratingsFail: true });
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(detailPage.personalInfoCard).toBeVisible();
    await expect(detailPage.ratingsLoadError).toBeVisible({ timeout: 20_000 });
    await expect(detailPage.ratingsRetryButton).toBeVisible();
    await expect(adminPage.getByText(userDetailCopy.noRatings)).toHaveCount(0);
  });

  /** TC_AD_UDET_048 */
  test('TC_AD_UDET_048 issues GET user detail refetch after role PATCH', async () => {
    const roleReq = detailPage.waitForRolePatch();
    const refetchReq = detailPage.waitForUserDetailGet();
    await detailPage.openChangeRoleDialog();
    await detailPage.selectAdminRoleInDialog();
    await detailPage.confirmRoleChange();
    await roleReq;
    await refetchReq;
  });

  /** TC_AD_UDET_049 */
  test('TC_AD_UDET_049 renders sticky sidebar container on large layout', async () => {
    await expect(detailPage.stickySidebar).toBeVisible();
  });

  /** TC_AD_UDET_050 */
  test('TC_AD_UDET_050 full regression smoke across detail sections and navigation', async ({
    adminPage,
  }) => {
    await expect(detailPage.pageHeading).toContainText(mockCustomerUser.full_name);
    await expect(detailPage.personalInfoCard).toBeVisible();
    await expect(detailPage.bookingsCard).toBeVisible();
    await expect(detailPage.ratingsCard).toBeVisible();
    await expect(detailPage.accountSidebar).toBeVisible();
    await detailPage.actionsViewBookingsLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/bookings\\?user_id=${DETAIL_USER_ID}`));
    await adminPage.goBack();
    await detailPage.openChangeRoleDialog();
    await detailPage.cancelRoleDialog();
    await detailPage.headerEditLink.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${DETAIL_USER_ID}`));
  });
});

test.describe('Admin User Detail — Empty bookings user @P2', () => {
  /** TC_AD_UDET_012b empty bookings for staff user */
  test('TC_AD_UDET_012b shows empty bookings for user without booking history', async ({
    adminPage,
  }) => {
    resetMockDetailUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserDetailApi(adminPage);
    const staffPage = new UserDetailPage(adminPage, STAFF_USER_ID);
    await staffPage.goto();
    await expect(adminPage.getByText(userDetailCopy.noBookings)).toBeVisible();
  });
});
