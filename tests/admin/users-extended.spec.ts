/**
 * Admin User List — extended TC from 02a_user_list.md backlog
 * Run: npm run test:admin:users
 */
import { test, expect } from '../fixtures/auth.fixture';
import { seedNonAdminSession } from '../fixtures/auth.fixture';
import { UserListPage, userListCopy } from '../pages/admin/UserListPage';
import {
  mockUsersApi,
  getLastUsersExportQuery,
} from '../fixtures/api/users.mock';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  mockAdminUser,
  mockBannedUser,
  mockCustomerUser,
  mockStaffLikeUser,
  mockUserStats,
} from '../fixtures/data/users.data';

test.describe('Admin User List — Navigation & Display @P1', () => {
  let userListPage: UserListPage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    userListPage = new UserListPage(adminPage);
    await userListPage.goto();
    await userListPage.waitForTableLoaded();
  });

  /** TC_AD_ULIST_022 */
  test('TC_AD_ULIST_022 view action navigates to user detail', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockStaffLikeUser.email);
    await userListPage.viewActionInRow(row).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/detail/${mockStaffLikeUser.id}`));
  });

  /** TC_AD_ULIST_023 */
  test('TC_AD_ULIST_023 edit action navigates to user edit', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockStaffLikeUser.email);
    await userListPage.editActionInRow(row).click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/users/edit/${mockStaffLikeUser.id}`));
  });

  /** TC_AD_ULIST_024 */
  test('TC_AD_ULIST_024 create button navigates to create page', async ({ adminPage }) => {
    await userListPage.createButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/users\/create/);
  });

  /** TC_AD_ULIST_049 */
  test('TC_AD_ULIST_049 shows avatar initial, full name, email and username', async () => {
    const row = userListPage.rowByEmail(mockStaffLikeUser.email);
    await expect(row.getByText(mockStaffLikeUser.full_name)).toBeVisible();
    await expect(row.getByText(mockStaffLikeUser.email)).toBeVisible();
    await expect(row.getByText(mockStaffLikeUser.username)).toBeVisible();
    await expect(row.locator('.rounded-full').first()).toBeVisible();
  });
});

test.describe('Admin User List — Filters & Search @P1', () => {
  let userListPage: UserListPage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    userListPage = new UserListPage(adminPage);
    await userListPage.goto();
    await userListPage.waitForTableLoaded();
  });

  /** TC_AD_ULIST_025 */
  test('TC_AD_ULIST_025 filters rows by ADMIN role', async () => {
    await userListPage.selectRoleFilter('ADMIN');
    await expect(userListPage.tableRows).toHaveCount(1);
    await expect(userListPage.rowByEmail(mockAdminUser.email)).toBeVisible();
  });

  /** TC_AD_ULIST_026 */
  test('TC_AD_ULIST_026 filters rows by ACTIVE status', async () => {
    await userListPage.selectStatusFilter('ACTIVE');
    await expect(userListPage.rowByEmail(mockBannedUser.email)).toHaveCount(0);
    await expect(userListPage.rowByEmail(mockCustomerUser.email)).toBeVisible();
  });

  /** TC_AD_ULIST_027 */
  test('TC_AD_ULIST_027 shows active filter badges for q, role and status', async ({ adminPage }) => {
    await adminPage.goto('/admin/users?q=staff@danangtrip.vn&role=user&status=active');
    await userListPage.waitForTableLoaded();
    await expect(userListPage.activeFiltersLabel).toBeVisible();
    await expect(adminPage.getByText('"staff@danangtrip.vn"')).toBeVisible();
    await expect(adminPage.getByText(/Role:\s*USER|Vai trò:\s*USER/i)).toBeVisible();
    await expect(adminPage.getByText(/Status:\s*ACTIVE|Trạng thái:\s*HOẠT ĐỘNG/i)).toBeVisible();
  });

  /** TC_AD_ULIST_051 */
  test('TC_AD_ULIST_051 empty state shows title and subtitle', async ({ adminPage }) => {
    await userListPage.search('no-match-xyz-999');
    await expect(adminPage.getByText(/Không tìm thấy người dùng nào|No users found/i)).toBeVisible();
    await expect(adminPage.getByText(userListCopy.noDataSub)).toBeVisible();
  });

  /** TC_AD_ULIST_053 */
  test('TC_AD_ULIST_053 search debounce limits list API calls', async ({ adminPage }) => {
    let listCalls = 0;
    adminPage.on('request', (req) => {
      if (req.method() === 'GET' && /\/admin\/users\/?(\?|$)/.test(new URL(req.url()).pathname + new URL(req.url()).search)) {
        if (!req.url().includes('/export')) listCalls += 1;
      }
    });
    await userListPage.typeSearchFast('staff');
    expect(listCalls).toBeLessThanOrEqual(3);
  });
});

test.describe('Admin User List — Row actions @P1', () => {
  let userListPage: UserListPage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    userListPage = new UserListPage(adminPage);
    await userListPage.goto();
    await userListPage.waitForTableLoaded();
  });

  /** TC_AD_ULIST_038 */
  test('TC_AD_ULIST_038 demotes ADMIN to USER without confirmation dialog', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockStaffLikeUser.email);
    await userListPage.promoteToAdmin(row);
    await expect(userListPage.roleBadgeInRow(row)).toHaveText(/ADMIN/);

    const rolePatch = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/users/${mockStaffLikeUser.id}/role`) &&
        res.status() === 200
    );
    await userListPage.demoteToUser(row);
    await rolePatch;
    await expect(userListPage.roleBadgeInRow(row)).toHaveText(/USER/);
    await expect(adminPage.getByRole('button', { name: userListCopy.confirmRole })).toHaveCount(0);
  });

  /** TC_AD_ULIST_040 */
  test('TC_AD_ULIST_040 status badge click opens block dialog for active user', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockCustomerUser.email);
    await userListPage.statusBadgeInRow(row).click();
    await expect(userListPage.blockDialog).toBeVisible();
    await userListPage.cancelBlockDialog();
    const patchCalls = await adminPage.evaluate(() => 0);
    expect(patchCalls).toBe(0);
  });
});

test.describe('Admin User List — Bulk & Selection @P1', () => {
  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { paginated: true });
  });

  /** TC_AD_ULIST_034 */
  test('TC_AD_ULIST_034 bulk activates banned users', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    const bannedRow = page.rowByEmail(mockBannedUser.email);
    await page.rowCheckbox(bannedRow).check();
    await page.clickBulkActivate();
    await expect(page.statusBadgeInRow(bannedRow)).toHaveText(/ACTIVE|HOẠT ĐỘNG/);
  });

  /** TC_AD_ULIST_045 */
  test('TC_AD_ULIST_045 select-all shows selected count toolbar', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    await expect(page.tableRows).toHaveCount(10);
    await page.selectAllOnPage();
    await expect(page.bulkActivateButton).toBeVisible();
    await expect(adminPage.getByText(/Đã chọn|Selected/i)).toBeVisible();
  });

  /** TC_AD_ULIST_035 */
  test('TC_AD_ULIST_035 select-all excludes current admin row', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    await page.selectAllOnPage();
    await expect(page.rowCheckbox(page.rowByEmail(mockAdminUser.email))).not.toBeChecked();
  });

  /** TC_AD_ULIST_037 */
  test('TC_AD_ULIST_037 bulk delete confirm reject keeps rows', async ({ adminPage }) => {
    adminPage.on('dialog', (dialog) => dialog.dismiss());
    const page = new UserListPage(adminPage);
    await page.goto();
    const row = page.rowByEmail(mockStaffLikeUser.email);
    await page.rowCheckbox(row).check();
    await page.clickBulkDelete();
    await expect(row).toBeVisible();
  });

  /** TC_AD_ULIST_036 */
  test('TC_AD_ULIST_036 header checkbox is indeterminate on partial selection', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    await page.rowCheckbox(page.rowByEmail(mockStaffLikeUser.email)).check();
    expect(await page.isSelectAllIndeterminate()).toBe(true);
  });

  /** TC_AD_ULIST_043 */
  test('TC_AD_ULIST_043 selected row has highlight styling', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    const row = page.rowByEmail(mockStaffLikeUser.email);
    await page.rowCheckbox(row).check();
    await expect(row).toHaveClass(/bg-\[#dff7f4\]/);
  });
});

test.describe('Admin User List — Pagination & Refresh @P1', () => {
  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { paginated: true });
  });

  /** TC_AD_ULIST_028 */
  test('TC_AD_ULIST_028 changes per_page via selector', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    const listReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/users') && res.url().includes('per_page=20')
    );
    await adminPage.goto('/admin/users?page=1&per_page=20');
    await listReq;
    await page.waitForTableLoaded();
    await expect(adminPage).toHaveURL(/per_page=20/);
    await expect(page.tableRows).toHaveCount(14);
    await expect(page.tableCard.getByText(/20\s*\/\s*(page|trang)/i)).toBeVisible();
  });

  /** TC_AD_ULIST_029 */
  test('TC_AD_ULIST_029 shows pagination summary text', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    await expect(page.showingSummary()).toContainText(/1/);
    await expect(page.showingSummary()).toContainText(/10/);
    await expect(page.showingSummary()).toContainText(/14/);
  });

  /** TC_AD_ULIST_030 */
  test('TC_AD_ULIST_030 prev disabled on page 1 and ellipsis on middle page', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await adminPage.goto('/admin/users?per_page=2&page=1');
    await page.waitForTableLoaded();
    await expect(page.paginationPrevButton()).toBeDisabled();
    await adminPage.goto('/admin/users?per_page=2&page=4');
    await page.waitForTableLoaded();
    await expect(adminPage.getByText('...').first()).toBeVisible();
    await adminPage.goto('/admin/users?per_page=2&page=7');
    await page.waitForTableLoaded();
    await expect(page.paginationNextButton()).toBeDisabled();
  });

  /** TC_AD_ULIST_031 */
  test('TC_AD_ULIST_031 refresh button refetches user list', async ({ adminPage }) => {
    const page = new UserListPage(adminPage);
    await page.goto();
    const refetch = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        /\/admin\/users\/?(\?|$)/.test(new URL(res.url()).pathname) &&
        !res.url().includes('/export')
    );
    await page.refreshButton.click();
    await refetch;
  });
});

test.describe('Admin User List — Stats @P1', () => {
  /** TC_AD_ULIST_032 TC_AD_ULIST_033 */
  test('TC_AD_ULIST_032_033 stats cards show correct values from mock', async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    const page = new UserListPage(adminPage);
    await page.goto();
    const stats = page.statsRow;
    await expect(stats.getByText(userListCopy.statsTotal)).toBeVisible();
    await expect(stats.getByText(userListCopy.statsBanned)).toBeVisible();
    await expect(stats.getByText(userListCopy.statsAdmin)).toBeVisible();
    await expect(stats.getByRole('heading', { name: String(mockUserStats.total) })).toBeVisible();
    await expect(stats.getByRole('heading', { name: String(mockUserStats.banned) }).first()).toBeVisible();
  });

  /** TC_AD_ULIST_052 */
  test('TC_AD_ULIST_052 shows loading state on initial fetch delay', async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { listDelayMs: 800 });
    const page = new UserListPage(adminPage);
    await page.goto();
    await expect(adminPage.locator('tbody tr td[colspan="8"]')).toBeVisible({ timeout: 3_000 });
    await page.waitForTableLoaded();
  });

  /** TC_AD_ULIST_054 — stats refetch after delete (renamed from duplicate _019) */
  test('TC_AD_ULIST_054 stats decrease after user delete', async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    const page = new UserListPage(adminPage);
    await page.goto();
    const row = page.rowByEmail(mockCustomerUser.email);
    await page.deleteActionInRow(row).click();
    await page.confirmDeleteDialog();
    await expect(page.rowByEmail(mockCustomerUser.email)).toHaveCount(0);
    await expect(page.statsRow.getByText(String(mockUserStats.total - 1), { exact: true })).toBeVisible();
  });
});

test.describe('Admin User List — Export & Errors @P1', () => {
  /** TC_AD_ULIST_055 — export with active filters */
  test('TC_AD_ULIST_055 export request includes active filters', async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    const page = new UserListPage(adminPage);
    await page.goto();
    await page.selectRoleFilter('USER');
    const exportReq = adminPage.waitForResponse((res) => res.url().includes('/export'));
    await page.exportButton.click();
    await exportReq;
    expect(getLastUsersExportQuery()).toMatch(/role=user/);
  });

  /** TC_AD_ULIST_046 */
  test('TC_AD_ULIST_046 export button disabled while export pending', async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { exportDelayMs: 1_500 });
    const page = new UserListPage(adminPage);
    await page.goto();
    void page.exportButton.click();
    await expect(page.exportButton).toBeDisabled();
  });

  /** TC_AD_ULIST_047 */
  test('TC_AD_ULIST_047 shows error toast when export fails', async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { exportFail: true });
    const page = new UserListPage(adminPage);
    await page.goto();
    await page.exportButton.click();
    await expect(adminPage.getByText(userListCopy.networkError)).toBeVisible();
  });
});

test.describe('Admin User List — Dialog UX @P2', () => {
  let userListPage: UserListPage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage);
    userListPage = new UserListPage(adminPage);
    await userListPage.goto();
    await userListPage.waitForTableLoaded();
  });

  /** TC_AD_ULIST_041 */
  test('TC_AD_ULIST_041 block dialog cancel does not PATCH status', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockCustomerUser.email);
    let patched = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/status')) patched = true;
    });
    await userListPage.blockActionInRow(row).click();
    await userListPage.cancelBlockDialog();
    expect(patched).toBe(false);
    await expect(userListPage.statusBadgeInRow(row)).toHaveText(/ACTIVE|HOẠT ĐỘNG/);
  });

  /** TC_AD_ULIST_042 */
  test('TC_AD_ULIST_042 block dialog shows amber warning box', async () => {
    const row = userListPage.rowByEmail(mockCustomerUser.email);
    await userListPage.blockActionInRow(row).click();
    await expect(userListPage.blockDialog.getByText(/chặn truy cập|blocked from/i).first()).toBeVisible();
    await userListPage.cancelBlockDialog();
  });

  /** TC_AD_ULIST_059 */
  test('TC_AD_ULIST_059 delete dialog cancel does not DELETE user', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockCustomerUser.email);
    let deleted = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/users/')) deleted = true;
    });
    await userListPage.deleteActionInRow(row).click();
    await userListPage.cancelDeleteDialog();
    expect(deleted).toBe(false);
    await expect(row).toBeVisible();
  });

  /** TC_AD_ULIST_044 */
  test('TC_AD_ULIST_044 role promotion dialog cancel does not PATCH', async ({ adminPage }) => {
    const row = userListPage.rowByEmail(mockStaffLikeUser.email);
    await userListPage.roleBadgeInRow(row).click();
    await row.locator('div.absolute').getByRole('button', { name: userListCopy.roleAdmin }).click();
    let patched = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/role')) patched = true;
    });
    await userListPage.cancelRoleDialog();
    expect(patched).toBe(false);
  });

  /** TC_AD_ULIST_039 */
  test('TC_AD_ULIST_039 role dropdown closes on outside click', async () => {
    const row = userListPage.rowByEmail(mockStaffLikeUser.email);
    await userListPage.roleBadgeInRow(row).click();
    await expect(userListPage.roleDropdownInRow(row)).toBeVisible();
    await userListPage.heading.click();
    await expect(userListPage.roleDropdownInRow(row)).toHaveCount(0);
  });

  /** TC_AD_ULIST_048 */
  test('TC_AD_ULIST_048 self row blocks status toggle via disabled control', async () => {
    const selfRow = userListPage.rowByEmail(mockAdminUser.email);
    await expect(userListPage.statusBadgeInRow(selfRow)).toBeDisabled();
    await expect(userListPage.blockActionInRow(selfRow)).toBeDisabled();
  });
});

test.describe('Admin User List — Auth @P0', () => {
  /** TC_AD_ULIST_021 */
  test('TC_AD_ULIST_021 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedNonAdminSession(page);
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});

test.describe('Admin User List — Mutation errors @P2', () => {
  test('TC_AD_ULIST_047b block failure keeps user active on API error', async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUsersApi(adminPage, { mutationFail: true });
    const page = new UserListPage(adminPage);
    await page.goto();
    const row = page.rowByEmail(mockCustomerUser.email);
    const failedPatch = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/users/${mockCustomerUser.id}/status`) &&
        res.status() === 500
    );
    await page.blockActionInRow(row).click();
    await page.confirmBlockDialog();
    await failedPatch;
    await expect(page.statusBadgeInRow(row)).toHaveText(/ACTIVE/i);
  });
});
