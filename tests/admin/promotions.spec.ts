/**
 * Admin Promotions — core (07)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { PromotionsPage, promotionsCopy as copy } from '../pages/admin/PromotionsPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockPromotionsApi,
  resetMockPromotions,
  setPromotionDeleteFailForId,
  setPromotionListFail,
  setPromotionListEmpty,
  setPromotionCreateFail,
  setPromotionUpdateFailForId,
  setPromotionStatusFailForId,
} from '../fixtures/api/promotions.mock';
import {
  deletablePromotionRow,
  expectedPromotionStatsPage1,
  fixedPromotionRow,
  inactivePromotionRow,
  expiredPromotionRow,
  mockPromotionSearchKeyword,
  primaryPromotionRow,
} from '../fixtures/data/promotions-list.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Promotions @P1', () => {
  let promoPage: PromotionsPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockPromotions();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockPromotionsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    promoPage = new PromotionsPage(adminPage);
    await promoPage.goto();
    await promoPage.waitForTableLoaded();
  });

  /** TC_AD_PROM_001 */
  test('TC_AD_PROM_001 renders heading stats filters and table', async () => {
    await expect(promoPage.heading).toBeVisible();
    await expect(promoPage.subtitle).toBeVisible();
    await expect(promoPage.statsGrid).toBeVisible();
    await expect(promoPage.searchInput).toBeVisible();
    await expect(promoPage.addButton).toBeVisible();
    await expect(promoPage.table).toBeVisible();
    await expect(promoPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_PROM_002 — data display integrity */
  test('TC_AD_PROM_002 displays code name discount and usage from API', async () => {
    const row = promoPage.rowByCode(primaryPromotionRow.code);
    await expect(row).toBeVisible();
    await expect(row).toContainText(primaryPromotionRow.code);
    await expect(row).toContainText(primaryPromotionRow.name);
    await expect(row).toContainText(primaryPromotionRow.description!);
    await expect(row).toContainText('-10%');
    await expect(row).toContainText('42 / 500');
    await expect(row.getByText(/^Đang chạy$|^Active$/)).toBeVisible();
  });

  /** TC_AD_PROM_003 */
  test('TC_AD_PROM_003 shows stats cards from list response', async () => {
    await expect(promoPage.statValue(copy.statsTotal)).toHaveText(
      String(expectedPromotionStatsPage1.totalCount)
    );
    await expect(promoPage.statValue(copy.statsActive)).toHaveText(
      String(expectedPromotionStatsPage1.activeCount)
    );
    await expect(promoPage.statValue(copy.statsUsed)).toHaveText(
      String(expectedPromotionStatsPage1.totalUsed)
    );
  });

  /** TC_AD_PROM_010 */
  test('TC_AD_PROM_010 validates required fields on create', async () => {
    await promoPage.openAddDrawer();
    await promoPage.submitDrawer();
    await expect(promoPage.drawer.getByText(copy.codeRequired)).toBeVisible();
    await expect(promoPage.drawer.getByText(copy.nameRequired)).toBeVisible();
    await expect(promoPage.drawer.getByText(copy.discountValueMin)).toBeVisible();
  });

  /** TC_AD_PROM_011 */
  test('TC_AD_PROM_011 creates percent promotion successfully', async ({ adminPage }) => {
    await promoPage.openAddDrawer();
    await promoPage.fillCreatePercentForm({
      code: 'HELLOSUMMER',
      name: 'Khuyến mãi hè 2026',
      discountValue: '15',
      usageLimit: '100',
      startsAt: '2026-06-15T08:00',
      endsAt: '2026-12-31T23:59',
    });
    await promoPage.submitDrawer();
    await expect(adminPage.getByText(copy.createSuccess)).toBeVisible({ timeout: 15_000 });
    await expect(promoPage.rowByCode('HELLOSUMMER')).toBeVisible();
  });

  /** TC_AD_PROM_012 */
  test('TC_AD_PROM_012 creates fixed amount promotion', async ({ adminPage }) => {
    await promoPage.openAddDrawer();
    await promoPage.selectDiscountType(copy.typeFixed);
    await promoPage.fillCreatePercentForm({
      code: 'FIXED200K',
      name: 'Giảm 200k cố định',
      discountValue: '200000',
      usageLimit: '50',
      startsAt: '2026-06-15T08:00',
      endsAt: '2026-12-31T23:59',
    });
    await promoPage.submitDrawer();
    await expect(adminPage.getByText(copy.createSuccess)).toBeVisible();
    const row = promoPage.rowByCode('FIXED200K');
    await expect(row).toBeVisible();
    await expect(row).toContainText('-200,000');
  });

  /** TC_AD_PROM_013 */
  test('TC_AD_PROM_013 rejects end date before start date', async () => {
    await promoPage.openAddDrawer();
    await promoPage.fillCreatePercentForm({
      code: 'BADDATE',
      name: 'Mã lỗi ngày',
      discountValue: '10',
      startsAt: '2026-06-15T10:00',
      endsAt: '2026-06-01T10:00',
    });
    await promoPage.submitDrawer();
    await expect(promoPage.drawer.getByText(copy.endsAfterStarts)).toBeVisible();
  });

  /** TC_AD_PROM_014 */
  test('TC_AD_PROM_014 toggles promotion to inactive', async ({ adminPage }) => {
    const row = promoPage.rowByCode(primaryPromotionRow.code);
    await promoPage.toggleInRow(row).click();
    await expect(adminPage.getByText(copy.statusSuccess)).toBeVisible({ timeout: 15_000 });
    await expect(promoPage.toggleInRow(row)).toHaveClass(/bg-slate-200/);
    await expect(row.getByText(copy.statusInactive)).toBeVisible();
  });

  /** TC_AD_PROM_015 */
  test('TC_AD_PROM_015 toggles inactive promotion back to active', async ({ adminPage }) => {
    const row = promoPage.rowByCode(inactivePromotionRow.code);
    await promoPage.toggleInRow(row).click();
    await expect(adminPage.getByText(copy.statusSuccess)).toBeVisible({ timeout: 15_000 });
    await expect(promoPage.toggleInRow(row)).toHaveClass(/bg-\[#14b8a6\]/);
    await expect(row.getByText(/^Đang chạy$|^Active$/)).toBeVisible();
  });

  /** TC_AD_PROM_016 */
  test('TC_AD_PROM_016 deletes promotion after confirmation', async ({ adminPage }) => {
    const row = promoPage.rowByCode(deletablePromotionRow.code);
    await promoPage.deleteButtonInRow(row).click();
    await expect(promoPage.deleteDialog).toBeVisible();
    await expect(promoPage.deleteDialog).toContainText(deletablePromotionRow.code);

    const deleteReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/promotions/${deletablePromotionRow.id}`) &&
        res.request().method() === 'DELETE'
    );
    await promoPage.confirmDelete();
    await deleteReq;
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    await expect(promoPage.rowByCode(deletablePromotionRow.code)).toHaveCount(0);
  });

  /** TC_AD_PROM_017 */
  test('TC_AD_PROM_017 cancels delete dialog without API call', async ({ adminPage }) => {
    const row = promoPage.rowByCode(fixedPromotionRow.code);
    await promoPage.deleteButtonInRow(row).click();
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/promotions/')) {
        deleteCalled = true;
      }
    });
    await promoPage.cancelDelete();
    await expect(promoPage.deleteDialog).toHaveCount(0);
    await expect(promoPage.rowByCode(fixedPromotionRow.code)).toBeVisible();
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_PROM_020 */
  test('TC_AD_PROM_020 searches by code with debounce', async () => {
    await promoPage.search(mockPromotionSearchKeyword);
    await expect(promoPage.tableRows).toHaveCount(1);
    await expect(promoPage.rowByCode(primaryPromotionRow.code)).toBeVisible();
  });

  /** TC_AD_PROM_021 */
  test('TC_AD_PROM_021 filters by inactive status', async () => {
    await promoPage.selectStatusFilter(copy.statusInactive);
    await expect(promoPage.rowByCode(inactivePromotionRow.code)).toBeVisible();
    await expect(promoPage.rowByCode(primaryPromotionRow.code)).toHaveCount(0);
  });

  /** TC_AD_PROM_022 */
  test('TC_AD_PROM_022 filters valid now promotions', async () => {
    await promoPage.toggleValidNow();
    await expect(promoPage.rowByCode(primaryPromotionRow.code)).toBeVisible();
    await expect(promoPage.rowByCode('VIP25')).toHaveCount(0);
  });

  /** TC_AD_PROM_023 */
  test('TC_AD_PROM_023 resets filters', async () => {
    await promoPage.search(mockPromotionSearchKeyword);
    await expect(promoPage.tableRows).toHaveCount(1);
    await promoPage.resetFilters();
    await expect(promoPage.searchInput).toHaveValue('');
    await expect(promoPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_PROM_024 */
  test('TC_AD_PROM_024 opens edit drawer with existing data', async () => {
    await promoPage.openEditForCode(primaryPromotionRow.code);
    await expect(promoPage.drawer.getByRole('heading', { name: copy.editDrawerTitle })).toBeVisible();
    await expect(promoPage.codeInput).toHaveValue(primaryPromotionRow.code);
    await expect(promoPage.nameInput).toHaveValue(primaryPromotionRow.name);
  });

  /** TC_AD_PROM_025 */
  test('TC_AD_PROM_025 updates promotion name', async ({ adminPage }) => {
    await promoPage.openEditForCode(primaryPromotionRow.code);
    await promoPage.nameInput.fill('Giảm 10% tour Đà Nẵng — cập nhật');
    const updateReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/promotions/${primaryPromotionRow.id}`) &&
        res.request().method() === 'PUT'
    );
    await promoPage.submitDrawer();
    await updateReq;
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await expect(promoPage.rowByCode(primaryPromotionRow.code)).toContainText('cập nhật');
  });

  /** TC_AD_PROM_026 */
  test('TC_AD_PROM_026 paginates to page 2', async () => {
    await expect(promoPage.paginationBar).toBeVisible();
    await promoPage.goToPage(2);
    await expect(promoPage.tableRows).toHaveCount(2);
    await expect(promoPage.rowByCode(primaryPromotionRow.code)).toHaveCount(0);
  });

  /** TC_AD_PROM_027 */
  test('TC_AD_PROM_027 shows empty state when list is empty', async ({ adminPage }) => {
    setPromotionListEmpty(true);
    const listReq = promoPage.waitForListResponse();
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await promoPage.heading.waitFor({ state: 'visible' });
    await listReq;
    await expect(promoPage.page.getByText(copy.emptyTitle)).toBeVisible();
  });

  /** TC_AD_PROM_028 */
  test('TC_AD_PROM_028 shows error panel when list API fails', async ({ adminPage }) => {
    resetMockPromotions();
    setPromotionListFail(true);
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockPromotionsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    const failPage = new PromotionsPage(adminPage);
    await adminPage.goto('about:blank');
    const failListReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes('/api/v1/admin/promotions') &&
        res.request().method() === 'GET' &&
        res.status() === 500
    );
    await failPage.goto();
    await failListReq;
    await expect(failPage.listErrorPanel).toBeVisible({ timeout: 15_000 });
    await expect(failPage.listErrorPanel).toContainText(/Không tải được|Could not load/i);
    setPromotionListFail(false);
    const listReq = failPage.waitForListResponse();
    await failPage.listErrorPanel.getByRole('button', { name: /Thử lại|Retry/i }).click();
    await listReq;
    await failPage.waitForTableLoaded();
    await expect(failPage.tableRows).toHaveCount(10);
    setPromotionListFail(false);
    await adminPage.goto('/admin/promotions', { waitUntil: 'domcontentloaded' });
  });

  /** TC_AD_PROM_029 */
  test('TC_AD_PROM_029 closes drawer on cancel', async () => {
    await promoPage.openAddDrawer();
    await promoPage.cancelDrawerButton.click();
    await promoPage.expectDrawerClosed();
  });

  /** TC_AD_PROM_030 */
  test('TC_AD_PROM_030 status toggle API error shows toast', async ({ adminPage }) => {
    setPromotionStatusFailForId(primaryPromotionRow.id);
    await promoPage.goto();
    await expect(promoPage.tableRows.first()).toBeVisible({ timeout: 20_000 });
    const row = promoPage.rowByCode(primaryPromotionRow.code);
    await promoPage.toggleInRow(row).click();
    await expect(adminPage.getByText(/Cập nhật trạng thái thất bại|Failed to update status/i)).toBeVisible();
  });

  /** TC_AD_PROM_031 */
  test('TC_AD_PROM_031 delete API error keeps row', async ({ adminPage }) => {
    setPromotionDeleteFailForId(deletablePromotionRow.id);
    await promoPage.goto();
    await expect(promoPage.tableRows.first()).toBeVisible({ timeout: 20_000 });
    const row = promoPage.rowByCode(deletablePromotionRow.code);
    await promoPage.deleteButtonInRow(row).click();
    await promoPage.confirmDelete();
    await expect(adminPage.getByText(/Không thể xóa mã khuyến mãi|Failed to delete/i)).toBeVisible();
    await expect(promoPage.rowByCode(deletablePromotionRow.code)).toBeVisible();
  });

  /** TC_AD_PROM_032 */
  test('TC_AD_PROM_032 removes status filter via tag X', async () => {
    await promoPage.selectStatusFilter(copy.statusInactive);
    await expect(promoPage.tableRows).toHaveCount(1);
    await expect(promoPage.filterTagsBar).toBeVisible();
    await promoPage.removeFilterTagByKey('status');
    await expect(promoPage.tableRows).toHaveCount(10);
    await expect(promoPage.filterTagsBar).toHaveCount(0);
  });

  /** TC_AD_PROM_033 */
  test('TC_AD_PROM_033 removes valid now filter via tag X', async () => {
    await promoPage.toggleValidNow();
    await expect(promoPage.rowByCode('VIP25')).toHaveCount(0);
    await expect(promoPage.filterTagsBar).toBeVisible();
    await promoPage.removeFilterTagByKey('valid_now');
    await expect(promoPage.tableRows).toHaveCount(10);
    await expect(promoPage.filterTagsBar).toHaveCount(0);
  });

  /** TC_AD_PROM_034 */
  test('TC_AD_PROM_034 disables toggle for expired promotion', async ({ adminPage }) => {
    const row = promoPage.rowByCode(expiredPromotionRow.code);
    await expect(row).toBeVisible();
    const toggle = promoPage.toggleInRow(row);
    await expect(toggle).toBeDisabled();
    let statusPatchCalled = false;
    adminPage.on('request', (req) => {
      if (
        req.method() === 'PATCH' &&
        req.url().includes(`/admin/promotions/${expiredPromotionRow.id}/status`)
      ) {
        statusPatchCalled = true;
      }
    });
    await toggle.click({ force: true });
    expect(statusPatchCalled).toBe(false);
  });

  /** TC_AD_PROM_035 */
  test('TC_AD_PROM_035 changes rows per page to 20', async () => {
    await promoPage.changeLimit(20);
    await expect(promoPage.tableRows).toHaveCount(12);
    await expect(promoPage.rowByCode(primaryPromotionRow.code)).toBeVisible();
    await expect(promoPage.rowByCode('GROUP150K')).toBeVisible();
  });

  /** TC_AD_PROM_036 */
  test('TC_AD_PROM_036 create API error shows toast', async ({ adminPage }) => {
    setPromotionCreateFail(true);
    await promoPage.goto();
    await promoPage.openAddDrawer();
    await promoPage.fillCreatePercentForm({
      code: 'FAILCREATE',
      name: 'Mã tạo lỗi',
      discountValue: '10',
    });
    await promoPage.submitDrawer();
    await expect(adminPage.getByText(copy.createFailed)).toBeVisible({ timeout: 15_000 });
    await expect(promoPage.rowByCode('FAILCREATE')).toHaveCount(0);
    setPromotionCreateFail(false);
  });

  /** TC_AD_PROM_037 */
  test('TC_AD_PROM_037 update API error shows toast', async ({ adminPage }) => {
    setPromotionUpdateFailForId(primaryPromotionRow.id);
    await promoPage.openEditForCode(primaryPromotionRow.code);
    await promoPage.nameInput.fill('Tên cập nhật thất bại');
    await promoPage.submitDrawer();
    await expect(adminPage.getByText(copy.updateFailed)).toBeVisible();
    await expect(promoPage.rowByCode(primaryPromotionRow.code)).not.toContainText('thất bại');
    setPromotionUpdateFailForId(null);
  });
});
