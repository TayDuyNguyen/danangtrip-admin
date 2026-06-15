/**
 * Admin User Edit — extended TC from 02c_user_edit.md backlog
 * Run: npm run test:admin:user-edit
 */
import { test, expect } from '../fixtures/auth.fixture';
import { UserEditPage, userEditCopy } from '../pages/admin/UserEditPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  mockUserEditApi,
  getMockEditedUser,
  resetMockEditUsers,
} from '../fixtures/api/users-edit.mock';
import {
  mockCustomerUser,
  mockStaffLikeUser,
} from '../fixtures/data/users.data';
import { longFullName, longCity } from '../fixtures/data/user-create.data';

const EDIT_USER_ID = 3;
const BANNED_USER_ID = 4;
const SECONDARY_ADMIN_ID = 5;
const SELF_EDIT_USER_ID = 1;

test.describe('Admin User Edit — Load extended @P1', () => {
  /** TC_AD_UEDIT_025 */
  test('TC_AD_UEDIT_025 shows skeleton while user detail is loading', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage, { detailDelayMs: 2000 });
    const editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await adminPage.goto(`/admin/users/edit/${EDIT_USER_ID}`, { waitUntil: 'domcontentloaded' });
    await expect(editPage.formSkeletonBlocks.first()).toBeVisible();
    await editPage.fullNameInput.waitFor({ state: 'visible', timeout: 10_000 });
    await expect(editPage.formSkeletonBlocks).toHaveCount(0);
  });

  /** TC_AD_UEDIT_026 */
  test('TC_AD_UEDIT_026 strips list query params from edit URL', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.gotoWithSearch('?q=test&page=2&role=user&status=active&sort_by=created_at');
    await editPage.fullNameInput.waitFor({ state: 'visible', timeout: 15_000 });
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${EDIT_USER_ID}$`));
    expect(new URL(adminPage.url()).search).toBe('');
  });
});

test.describe('Admin User Edit — Profile extended @P1', () => {
  let editPage: UserEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.goto();
  });

  /** TC_AD_UEDIT_030 */
  test('TC_AD_UEDIT_030 updates optional fields in PUT body', async () => {
    const updateReq = editPage.waitForUpdatePut();
    await editPage.birthdateInput.fill('1990-05-15');
    await editPage.selectGender('female');
    await editPage.cityInput.fill('Hue');
    await editPage.submit();
    const res = await updateReq;
    const body = res.request().postDataJSON() as {
      birthdate?: string;
      gender?: string;
      city?: string;
    };
    expect(body.birthdate).toBe('1990-05-15');
    expect(body.gender).toBe('female');
    expect(body.city).toBe('Hue');
    expect(res.status()).toBe(200);
  });

  /** TC_AD_UEDIT_031 */
  test('TC_AD_UEDIT_031 rejects invalid phone format', async () => {
    await editPage.phoneInput.fill('abc-invalid');
    await editPage.submit();
    await expect(editPage.errorNearInput('phone')).toBeVisible();
  });

  /** TC_AD_UEDIT_032 */
  test('TC_AD_UEDIT_032 rejects full_name and city longer than 100 characters', async () => {
    await editPage.fullNameInput.fill(longFullName);
    await editPage.submit();
    await expect(editPage.errorNearInput('full_name')).toBeVisible();

    await editPage.fullNameInput.fill(mockCustomerUser.full_name);
    await editPage.cityInput.fill(longCity);
    await editPage.submit();
    await expect(editPage.errorNearInput('city')).toBeVisible();
  });
});

test.describe('Admin User Edit — Role & status extended @P1', () => {
  /** TC_AD_UEDIT_017 */
  test('TC_AD_UEDIT_017 demotes admin to user without confirmation dialog', async ({
    adminPage,
  }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, SECONDARY_ADMIN_ID);
    await editPage.goto();
    const roleReq = editPage.waitForRolePatch();
    await editPage.selectRole('user');
    await expect(editPage.adminConfirmDialog).toHaveCount(0);
    const res = await roleReq;
    expect(res.status()).toBe(200);
    expect(getMockEditedUser(SECONDARY_ADMIN_ID)?.role).toBe('user');
    await expect(adminPage.getByText(userEditCopy.roleSuccess)).toBeVisible();
  });

  /** TC_AD_UEDIT_016 */
  test('TC_AD_UEDIT_016 unlocks banned user via quick action', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, BANNED_USER_ID);
    await editPage.goto();
    await expect(editPage.unlockAccountButton).toBeVisible();
    const statusReq = editPage.waitForStatusPatch();
    await editPage.unlockAccountButton.click();
    const res = await statusReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as { status?: string };
    expect(body.status).toBe('active');
    expect(getMockEditedUser(BANNED_USER_ID)?.status).toBe('active');
    await expect(adminPage.getByText(userEditCopy.unlockSuccess)).toBeVisible();
  });

  /** TC_AD_UEDIT_033 */
  test('TC_AD_UEDIT_033 cancels admin role confirmation without PATCH', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.goto();
    let rolePatchCount = 0;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/role')) rolePatchCount += 1;
    });
    await editPage.selectRole('admin');
    await expect(editPage.adminConfirmDialog).toBeVisible();
    await editPage.cancelAdminRoleDialog();
    await expect(editPage.adminConfirmDialog).toHaveCount(0);
    expect(rolePatchCount).toBe(0);
    expect(getMockEditedUser(EDIT_USER_ID)?.role).toBe('user');
  });

  /** TC_AD_UEDIT_034 */
  test('TC_AD_UEDIT_034 keeps edit URL after PATCH role and status', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.goto();

    const roleReq = editPage.waitForRolePatch();
    await editPage.selectRole('admin');
    await editPage.confirmAdminRole();
    await roleReq;
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${EDIT_USER_ID}`));

    const statusReq = editPage.waitForStatusPatch();
    await editPage.statusToggle.click();
    await statusReq;
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${EDIT_USER_ID}`));
  });
});

test.describe('Admin User Edit — Self extended @P1', () => {
  /** TC_AD_UEDIT_020 */
  test('TC_AD_UEDIT_020 disables status toggle when editing own account', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const selfPage = new UserEditPage(adminPage, SELF_EDIT_USER_ID);
    await selfPage.goto();
    await expect(selfPage.statusToggle).toBeDisabled();
  });

  /** TC_AD_UEDIT_021 */
  test('TC_AD_UEDIT_021 hides delete on self-edit and updates auth store after save', async ({
    adminPage,
  }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const selfPage = new UserEditPage(adminPage, SELF_EDIT_USER_ID);
    await selfPage.goto();
    await expect(selfPage.deleteAccountButton).toHaveCount(0);

    const updateReq = selfPage.waitForUpdatePut();
    await selfPage.fullNameInput.fill('Admin Self Updated');
    await selfPage.submit();
    await updateReq;

    const stored = await adminPage.evaluate(() => localStorage.getItem('user-storage'));
    expect(stored).toContain('Admin Self Updated');
  });
});

test.describe('Admin User Edit — Delete & navigation @P2', () => {
  /** TC_AD_UEDIT_015 */
  test('TC_AD_UEDIT_015 deletes user via dialog and navigates to list', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, 2);
    await editPage.goto();
    const deleteReq = editPage.waitForDelete();
    await editPage.openDeleteDialog();
    await expect(editPage.deleteDialog.getByText(mockStaffLikeUser.full_name)).toBeVisible();
    await editPage.confirmDelete();
    const res = await deleteReq;
    expect(res.status()).toBe(200);
    await expect(adminPage.getByText(userEditCopy.deleteSuccess)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/users\/?$/, { timeout: 15_000 });
  });

  /** TC_AD_UEDIT_018 */
  test('TC_AD_UEDIT_018 quick action view profile navigates to detail', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.goto();
    await editPage.viewProfileButton.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/detail/${EDIT_USER_ID}`));
  });

  /** TC_AD_UEDIT_019 */
  test('TC_AD_UEDIT_019 quick action view bookings navigates with user_id', async ({
    adminPage,
  }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.goto();
    await editPage.viewBookingsButton.click();
    await expect(adminPage).toHaveURL(
      new RegExp(`/admin/bookings\\?user_id=${EDIT_USER_ID}`)
    );
  });
});

test.describe('Admin User Edit — UX extended @P2', () => {
  let editPage: UserEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.goto();
  });

  /** TC_AD_UEDIT_029 */
  test('TC_AD_UEDIT_029 unsaved guard allows leaving page', async ({ adminPage }) => {
    await editPage.fullNameInput.fill('Leave Page Name');
    await editPage.usersBreadcrumbLink.click();
    await expect(
      adminPage.getByRole('heading', { name: userEditCopy.unsavedTitle })
    ).toBeVisible({ timeout: 15_000 });
    await editPage.leavePageButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/users\/?$/);
  });

  /** TC_AD_UEDIT_022 */
  test('TC_AD_UEDIT_022 shows readonly username with badge', async ({ adminPage }) => {
    await expect(adminPage.getByText(mockCustomerUser.username, { exact: false })).toBeVisible();
    await expect(editPage.usernameReadonlyBadge).toBeVisible();
  });

  /** TC_AD_UEDIT_023 */
  test('TC_AD_UEDIT_023 shows password change info box', async () => {
    await expect(editPage.passwordInfoBox).toBeVisible();
  });

  /** TC_AD_UEDIT_024 */
  test('TC_AD_UEDIT_024 shows metadata sidebar with join date and verification', async () => {
    await expect(editPage.page.getByText(userEditCopy.joinedDate)).toBeVisible();
    await expect(editPage.page.getByText(userEditCopy.lastUpdated)).toBeVisible();
    await expect(editPage.page.locator('span').filter({ hasText: /^VERIFIED$|^ĐÃ XÁC THỰC$/i })).toBeVisible();
  });

  /** TC_AD_UEDIT_027 */
  test('TC_AD_UEDIT_027 shows spinner on role radio while PATCH is pending', async ({
    adminPage,
  }) => {
    await mockUserEditApi(adminPage, { patchDelayMs: 2500 });
    const roleReq = editPage.waitForRolePatch();
    await editPage.selectRole('admin');
    await editPage.confirmAdminRole();
    await expect(editPage.roleSpinner).toBeVisible({ timeout: 3000 });
    await roleReq;
    await expect(editPage.roleSpinner).toHaveCount(0);
  });

  /** TC_AD_UEDIT_028 */
  test('TC_AD_UEDIT_028 shows saving state in sticky header during PUT', async ({ adminPage }) => {
    await mockUserEditApi(adminPage, { putDelayMs: 1500 });
    const updateReq = editPage.waitForUpdatePut();
    await editPage.fullNameInput.fill('Header Saving Test');
    await editPage.desktopHeaderSubmit.click();
    await expect(
      adminPage.locator('.sticky.top-0').getByRole('button', { name: userEditCopy.saving })
    ).toBeVisible();
    await updateReq;
  });

  /** TC_AD_UEDIT_036 */
  test('TC_AD_UEDIT_036 shows mobile footer submit button', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await expect(editPage.mobileSubmitButton).toBeVisible();
    await expect(editPage.desktopHeaderSubmit).toBeHidden();
  });

  /** TC_AD_UEDIT_035 */
  test('TC_AD_UEDIT_035 shows error toast on PATCH role status and DELETE failures', async ({
    adminPage,
  }) => {
    await mockUserEditApi(adminPage, { roleFail: true });
    await editPage.selectRole('admin');
    await editPage.confirmAdminRole();
    await expect(adminPage.getByText(userEditCopy.roleError)).toBeVisible();
    if (await editPage.adminConfirmDialog.isVisible()) {
      await editPage.cancelAdminRoleDialog();
    }

    await mockUserEditApi(adminPage, { statusFail: true });
    await editPage.lockAccountButton.click();
    await expect(adminPage.getByText(userEditCopy.statusError)).toBeVisible();

    await mockUserEditApi(adminPage, { deleteFail: true });
    await editPage.openDeleteDialog();
    await editPage.confirmDelete();
    await expect(adminPage.getByText(userEditCopy.deleteError)).toBeVisible();
  });
});
