/**
 * Admin User List — E2E tests mapped from 02a_user_list.md
 * Run: npx playwright test tests/admin/users.spec.ts
 */
import { test, expect } from '../fixtures/auth.fixture';
import { UserListPage } from '../pages/admin/UserListPage';
import { mockUsersApi } from '../fixtures/api/users.mock';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  mockBannedUser,
  mockCustomerUser,
  mockStaffLikeUser,
  searchKeyword,
  sqlInjectionPayload,
  xssPayload,
} from '../fixtures/data/users.data';

test.describe('Admin User List — Core @P1', () => {
  let userListPage: UserListPage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    userListPage = new UserListPage(adminPage);
    await userListPage.goto();
    await userListPage.waitForTableLoaded();
  });

  /** TC_AD_ULIST_001 */
  test('TC_AD_ULIST_001 renders table with all columns', async () => {
    await expect(userListPage.heading).toBeVisible();
    await userListPage.assertColumnHeaders();
    await expect(userListPage.tableRows).toHaveCount(4);
    await expect(userListPage.rowByEmail(mockStaffLikeUser.email)).toBeVisible();
    await expect(userListPage.createButton).toBeVisible();
    await expect(userListPage.exportButton).toBeVisible();
  });

  /** TC_AD_ULIST_002 */
  test('TC_AD_ULIST_002 filters rows by search keyword', async () => {
    await userListPage.search(searchKeyword);
    await expect(userListPage.tableRows).toHaveCount(1);
    await expect(userListPage.rowByEmail(mockStaffLikeUser.email)).toBeVisible();
    await expect(userListPage.rowByEmail(mockCustomerUser.email)).toHaveCount(0);
  });

  /** TC_AD_ULIST_003 */
  test('TC_AD_ULIST_003 filters rows by USER role', async () => {
    await userListPage.selectRoleFilter('USER');
    await expect(userListPage.rowByEmail(mockStaffLikeUser.email)).toBeVisible();
    await expect(userListPage.rowByEmail(mockCustomerUser.email)).toBeVisible();
    await expect(userListPage.rowByEmail('admin@danangtrip.vn')).toHaveCount(0);
  });

  /** TC_AD_ULIST_004 */
  test('TC_AD_ULIST_004 blocks an active user account', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockCustomerUser.email);
    const statusPatch = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/users/${mockCustomerUser.id}/status`) &&
        res.status() === 200
    );
    await userListPage.blockActionInRow(row).click();
    await expect(adminPage.getByTestId('block-user-dialog')).toBeVisible();
    await userListPage.confirmBlockDialog();
    await statusPatch;
    await expect(userListPage.statusBadgeInRow(row)).toHaveText(/BANNED|BỊ KHÓA/);
  });

  /** TC_AD_ULIST_005 */
  test('TC_AD_ULIST_005 unblocks a banned user account', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockBannedUser.email);
    await expect(userListPage.statusBadgeInRow(row)).toHaveText(/BANNED|BỊ KHÓA/);
    const statusPatch = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/users/${mockBannedUser.id}/status`) &&
        res.status() === 200
    );
    await userListPage.unblockActionInRow(row).click();
    await statusPatch;
    await expect(userListPage.statusBadgeInRow(row)).toHaveText(/ACTIVE|HOẠT ĐỘNG/);
  });

  /** TC_AD_ULIST_006 */
  test('TC_AD_ULIST_006 filters rows by BANNED status', async () => {
    await userListPage.selectStatusFilter('BANNED');
    await expect(userListPage.tableRows).toHaveCount(1);
    await expect(userListPage.rowByEmail(mockBannedUser.email)).toBeVisible();
  });

  /** TC_AD_ULIST_008 */
  test('TC_AD_ULIST_008 exports users to Excel', async ({ adminPage }) => {
    const downloadPromise = adminPage.waitForEvent('download');
    await userListPage.exportButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
  });

  /** TC_AD_ULIST_011 */
  test('TC_AD_ULIST_011 promotes user to ADMIN role', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockStaffLikeUser.email);
    const rolePatch = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/users/${mockStaffLikeUser.id}/role`) &&
        res.status() === 200
    );
    await userListPage.promoteToAdmin(row);
    await rolePatch;
    await expect(userListPage.roleBadgeInRow(row)).toHaveText(/ADMIN/);
  });

  /** TC_AD_ULIST_012 */
  test('TC_AD_ULIST_012 deletes a single user via modal', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockCustomerUser.email);
    const deleteReq = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/users/${mockCustomerUser.id}`) &&
        res.status() === 200
    );
    await userListPage.deleteActionInRow(row).click();
    await userListPage.confirmDeleteDialog();
    await deleteReq;
    await expect(userListPage.rowByEmail(mockCustomerUser.email)).toHaveCount(0);
  });

  /** TC_AD_ULIST_013 */
  test('TC_AD_ULIST_013 prevents self-action on current admin row', async () => {
    const selfRow = userListPage.rowByEmail('admin@danangtrip.vn');
    await expect(userListPage.rowCheckbox(selfRow)).toBeDisabled();
    await expect(userListPage.blockActionInRow(selfRow)).toBeDisabled();
    await expect(userListPage.deleteActionInRow(selfRow)).toBeDisabled();
    await expect(userListPage.statusBadgeInRow(selfRow)).toBeDisabled();
    await expect(selfRow.getByText(/YOU|BẠN/)).toBeVisible();
  });

  /** TC_AD_ULIST_015 */
  test('TC_AD_ULIST_015 toggles sort order on joined date column', async ({ adminPage }) => {
    await userListPage.clickSortJoined();
    await expect(adminPage).toHaveURL(/sort_by=created_at/);
    await expect(adminPage).toHaveURL(/sort_order=asc/);
    await userListPage.clickSortJoined();
    await expect(adminPage).toHaveURL(/sort_order=desc/);
  });

  /** TC_AD_ULIST_016 */
  test('TC_AD_ULIST_016 resets active filters including search', async ({ adminPage }) => {
    await userListPage.search(searchKeyword);
    await userListPage.selectRoleFilter('USER');
    await userListPage.resetFilters();
    await expect(adminPage).not.toHaveURL(/[?&]q=/);
    await expect(adminPage).not.toHaveURL(/[?&]role=/);
    await expect(userListPage.tableRows).toHaveCount(4);
  });
});

test.describe('Admin User List — Pagination & Bulk @P1', () => {
  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { paginated: true });
  });

  /** TC_AD_ULIST_007 */
  test('TC_AD_ULIST_007 paginates user list', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    await expect(page.tableRows).toHaveCount(10);
    await page.goToPage(2);
    await expect(adminPage).toHaveURL(/[?&]page=2/);
    await expect(page.tableRows).toHaveCount(4);
  });

  /** TC_AD_ULIST_009 */
  test('TC_AD_ULIST_009 bulk blocks selected users', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    const row2 = page.rowByEmail(mockStaffLikeUser.email);
    const row3 = page.rowByEmail(mockCustomerUser.email);
    await page.rowCheckbox(row2).check();
    await page.rowCheckbox(row3).check();
    await page.clickBulkBlock();
    await expect(page.statusBadgeInRow(row2)).toHaveText(/BANNED|BỊ KHÓA/);
    await expect(page.statusBadgeInRow(row3)).toHaveText(/BANNED|BỊ KHÓA/);
  });

  /** TC_AD_ULIST_010 */
  test('TC_AD_ULIST_010 bulk deletes selected users', async ({ adminPage }) => {
    adminPage.on('dialog', (dialog) => dialog.accept());
    const page = new UserListPage(adminPage);
    await page.goto();
    const row2 = page.rowByEmail(mockStaffLikeUser.email);
    const row3 = page.rowByEmail(mockCustomerUser.email);
    await page.rowCheckbox(row2).check();
    await page.rowCheckbox(row3).check();
    await page.clickBulkDelete();
    await expect(row2).toHaveCount(0);
    await expect(row3).toHaveCount(0);
  });
});

test.describe('Admin User List — Security & Permission @P1', () => {
  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
  });

  /** TC_AD_ULIST_014 */
  test('TC_AD_ULIST_014 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_ULIST_017 */
  test('TC_AD_ULIST_017 shows empty state when search has no matches', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    await page.search('no-match-xyz-999');
    await expect(adminPage.getByText(/No users found|Không tìm thấy người dùng nào/)).toBeVisible();
  });

  /** TC_AD_ULIST_018 */
  test('TC_AD_ULIST_018 search sanitizes SQL injection payload', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    await page.search(sqlInjectionPayload);
    await expect(page.table).toBeVisible();
    await expect(adminPage.getByText(/No users found|Không tìm thấy người dùng nào/)).toBeVisible();
  });

  /** TC_AD_ULIST_019 */
  test('TC_AD_ULIST_019 search sanitizes XSS payload', async ({ adminPage }) => {
    const dialogs: string[] = [];
    adminPage.on('dialog', (dialog) => {
      dialogs.push(dialog.message());
      void dialog.dismiss();
    });
    const page = new UserListPage(adminPage);
    await page.goto();
    await page.search(xssPayload);
    expect(dialogs).toHaveLength(0);
    await expect(adminPage.locator('tbody')).not.toContainText('<script>');
  });
});
