/**
 * Admin User Edit — mapped from 02c_user_edit.md
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { UserEditPage } from '../pages/admin/UserEditPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockUserEditApi, getMockEditedUser, resetMockEditUsers } from '../fixtures/api/users-edit.mock';
import { mockAdminUser, mockCustomerUser } from '../fixtures/data/users.data';

const EDIT_USER_ID = 3;
const SELF_EDIT_USER_ID = 1;
const NOT_FOUND_USER_ID = 999;

test.describe('Admin User Edit @P1', () => {
  test.describe.configure({ mode: 'serial' });
  let editPage: UserEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    editPage = new UserEditPage(adminPage, EDIT_USER_ID);
    await editPage.goto();
  });

  /** TC_AD_UEDIT_001 */
  test('TC_AD_UEDIT_001 preloads existing user data', async ({ adminPage }) => {
    await expect(editPage.fullNameInput).toHaveValue(mockCustomerUser.full_name);
    await expect(editPage.emailInput).toHaveValue(mockCustomerUser.email);
    await expect(editPage.phoneInput).toHaveValue(mockCustomerUser.phone ?? '');
    await expect(editPage.birthdateInput).toHaveValue('1995-08-20');
    await expect(adminPage.getByText(mockCustomerUser.username, { exact: false })).toBeVisible();
  });

  /** TC_AD_UEDIT_002 */
  test('TC_AD_UEDIT_002 updates personal info successfully', async ({ adminPage }) => {
    const updateReq = editPage.waitForUpdatePut();
    await editPage.fullNameInput.fill('Nguyen Van A V2');
    await editPage.phoneInput.fill('0901234567');
    await editPage.submit();
    const res = await updateReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as { full_name?: string; phone?: string; role?: string };
    expect(body.full_name).toBe('Nguyen Van A V2');
    expect(body.phone).toBe('0901234567');
    expect(body.role).toBeUndefined();
    await expect(adminPage.getByText(/updated successfully|Cập nhật thông tin người dùng thành công/i)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/detail/${EDIT_USER_ID}`));
    expect(getMockEditedUser(EDIT_USER_ID)?.full_name).toBe('Nguyen Van A V2');
  });

  /** TC_AD_UEDIT_003 */
  test('TC_AD_UEDIT_003 promotes user to ADMIN after confirmation', async () => {
    const roleReq = editPage.waitForRolePatch();
    await editPage.selectRole('admin');
    await expect(editPage.adminConfirmDialog).toBeVisible();
    await editPage.confirmAdminRole();
    const res = await roleReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as { role?: string };
    expect(body.role).toBe('admin');
    expect(getMockEditedUser(EDIT_USER_ID)?.role).toBe('admin');
  });

  /** TC_AD_UEDIT_004 */
  test('TC_AD_UEDIT_004 rejects invalid email format', async () => {
    await editPage.emailInput.fill('not-an-email');
    await editPage.submit();
    await expect(editPage.errorNearInput('email')).toBeVisible();
  });

  /** TC_AD_UEDIT_005 */
  test('TC_AD_UEDIT_005 rejects empty full name', async () => {
    await editPage.fullNameInput.fill('');
    await editPage.submit();
    await expect(editPage.errorNearInput('full_name')).toBeVisible();
  });

  /** TC_AD_UEDIT_006 */
  test('TC_AD_UEDIT_006 shows email change warning', async ({ adminPage }) => {
    await editPage.emailInput.fill('newemail@test.com');
    await expect(
      adminPage.getByText(/xác thực lại tài khoản|verify|re-verify/i)
    ).toBeVisible();
  });

  /** TC_AD_UEDIT_011 */
  test('TC_AD_UEDIT_011 quick action locks account via status API', async ({ adminPage }) => {
    const statusReq = editPage.waitForStatusPatch();
    await editPage.lockAccountButton.click();
    const res = await statusReq;
    expect(res.status()).toBe(200);
    await expect(adminPage.getByText(/blocked|khóa/i)).toBeVisible();
    expect(getMockEditedUser(EDIT_USER_ID)?.status).toBe('banned');
  });

  /** TC_AD_UEDIT_014 */
  test('TC_AD_UEDIT_014 status toggle locks account via status API', async ({ adminPage }) => {
    const statusReq = editPage.waitForStatusPatch();
    await editPage.statusToggle.click();
    const res = await statusReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as { status?: string };
    expect(body.status).toBe('banned');
    await expect(adminPage.getByText(/blocked|khóa/i)).toBeVisible();
    expect(getMockEditedUser(EDIT_USER_ID)?.status).toBe('banned');
  });

  /** TC_AD_UEDIT_012 */
  test('TC_AD_UEDIT_012 unsaved changes guard blocks navigation', async ({ adminPage }) => {
    await editPage.fullNameInput.fill('Unsaved Change Name');
    await editPage.usersBreadcrumbLink.click();
    await expect(
      adminPage.getByRole('heading', { name: /Unsaved Changes|Thay đổi chưa được lưu/i })
    ).toBeVisible({ timeout: 15_000 });
    await adminPage.getByRole('button', { name: /Stay|Ở lại/i }).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${EDIT_USER_ID}`));
  });

  /** TC_AD_UEDIT_013 */
  test('TC_AD_UEDIT_013 shows duplicate email error from API', async ({ adminPage }) => {
    await editPage.emailInput.fill(mockAdminUser.email);
    await editPage.submit();
    await expect(editPage.errorNearInput('email')).toContainText(/already taken|đã được sử dụng/i);
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${EDIT_USER_ID}`));
  });
});

test.describe('Admin User Edit — Self @P1', () => {
  test('TC_AD_UEDIT_009 disables role change when editing own account', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const selfPage = new UserEditPage(adminPage, SELF_EDIT_USER_ID);
    await selfPage.goto();
    await expect(selfPage.adminRoleRadio).toBeDisabled();
    await expect(selfPage.userRoleRadio).toBeDisabled();
  });
});

test.describe('Admin User Edit — Not Found @P2', () => {
  test('TC_AD_UEDIT_010 shows not found for missing user', async ({ adminPage }) => {
    resetMockEditUsers();
    await mockAdminLayoutApis(adminPage);
    await mockUserEditApi(adminPage);
    const missingPage = new UserEditPage(adminPage, NOT_FOUND_USER_ID);
    await missingPage.gotoExpectNotFound();
    await expect(missingPage.notFoundHeading).toBeVisible();
    await expect(adminPage.getByRole('button', { name: /back|Quay lại/i })).toBeVisible();
  });
});

test.describe('Admin User Edit — Auth @P0', () => {
  test('TC_AD_UEDIT_007 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/admin/users/edit/${EDIT_USER_ID}`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  test('TC_AD_UEDIT_008 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedNonAdminSession(page);
    await page.goto(`/admin/users/edit/${EDIT_USER_ID}`);
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
