/**
 * Admin Ratings — core (08)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { RatingsPage, ratingsCopy as copy } from '../pages/admin/RatingsPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockRatingsApi,
  resetMockRatings,
  setRatingDeleteFailForId,
  setRatingExportFail,
  setRatingListEmpty,
  setRatingMarkViewedFailForId,
  setRatingRejectFailForId,
} from '../fixtures/api/ratings.mock';
import {
  deletableRatingRow,
  expectedRatingStats,
  hiddenRatingRow,
  mockRatingSearchKeyword,
  primaryRatingRow,
  viewedRatingRow,
} from '../fixtures/data/ratings-list.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Ratings @P1', () => {
  let ratingsPage: RatingsPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockRatings();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockRatingsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    ratingsPage = new RatingsPage(adminPage);
    await ratingsPage.goto();
    await ratingsPage.waitForTableLoaded();
  });

  /** TC_AD_RAT_001 */
  test('TC_AD_RAT_001 renders heading stats filters and table', async () => {
    await expect(ratingsPage.heading).toBeVisible();
    await expect(ratingsPage.statsGrid).toBeVisible();
    await expect(ratingsPage.searchInput).toBeVisible();
    await expect(ratingsPage.exportHeaderButton).toBeVisible();
    await expect(ratingsPage.tableRows).toHaveCount(10);
  });

  /** TC_AD_RAT_002 */
  test('TC_AD_RAT_002 displays customer target score and comment from API', async () => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await expect(row).toBeVisible();
    await expect(row).toContainText('Tour Bà Nà Hills 1 ngày');
    await expect(row).toContainText(mockRatingSearchKeyword);
    await expect(row).toContainText('5.0 / 5.0');
    await expect(row.getByText(copy.statusNew)).toBeVisible();
  });

  /** TC_AD_RAT_003 */
  test('TC_AD_RAT_003 shows stats cards from report response', async () => {
    await expect(ratingsPage.statCard(copy.statsTotal).locator('h3')).toHaveText(
      String(expectedRatingStats.total)
    );
    await expect(ratingsPage.statCard(copy.statsNew).locator('h3')).toHaveText(
      String(expectedRatingStats.new)
    );
    await expect(ratingsPage.statCard(copy.statsViewed).locator('h3')).toHaveText(
      String(expectedRatingStats.viewed)
    );
    await expect(ratingsPage.statCard(copy.statsHidden).locator('h3')).toHaveText(
      String(expectedRatingStats.rejected)
    );
  });

  /** TC_AD_RAT_004 */
  test('TC_AD_RAT_004 searches by keyword with debounce', async () => {
    await ratingsPage.search(mockRatingSearchKeyword);
    await expect(ratingsPage.tableRows).toHaveCount(1);
    await expect(ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!)).toBeVisible();
  });

  /** TC_AD_RAT_005 */
  test('TC_AD_RAT_005 filters by tour type', async () => {
    await ratingsPage.selectFilterOption(0, copy.typeTour);
    await expect(ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!)).toBeVisible();
    await expect(ratingsPage.rowByUserName(viewedRatingRow.user!.full_name!)).toHaveCount(0);
  });

  /** TC_AD_RAT_006 */
  test('TC_AD_RAT_006 filters by new read status', async () => {
    await ratingsPage.selectFilterOption(1, copy.statusNew);
    await expect(ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!)).toBeVisible();
    await expect(ratingsPage.rowByUserName(viewedRatingRow.user!.full_name!)).toHaveCount(0);
  });

  /** TC_AD_RAT_007 */
  test('TC_AD_RAT_007 filters by hidden status', async () => {
    await ratingsPage.selectFilterOption(1, copy.statusHidden);
    await expect(ratingsPage.rowByUserName(hiddenRatingRow.user!.full_name!)).toBeVisible();
    await expect(ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!)).toHaveCount(0);
  });

  /** TC_AD_RAT_008 */
  test('TC_AD_RAT_008 resets filters and clears selection', async ({ adminPage }) => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.selectRow(row);
    await ratingsPage.search(mockRatingSearchKeyword);
    await expect(ratingsPage.tableRows).toHaveCount(1);
    await ratingsPage.resetFilters();
    await expect(ratingsPage.searchInput).toHaveValue('');
    await expect(ratingsPage.tableRows).toHaveCount(10);
    await expect(adminPage.getByText(copy.resetSuccess)).toBeVisible();
    await expect(ratingsPage.selectedCountBadge).toHaveCount(0);
  });

  /** TC_AD_RAT_009 */
  test('TC_AD_RAT_009 paginates to page 2', async () => {
    await ratingsPage.goToPage(2);
    await expect(ratingsPage.tableRows).toHaveCount(2);
    await expect(ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!)).toHaveCount(0);
  });

  /** TC_AD_RAT_010 */
  test('TC_AD_RAT_010 changes rows per page to 20', async () => {
    await ratingsPage.changeLimit(20);
    await expect(ratingsPage.tableRows).toHaveCount(12);
  });

  /** TC_AD_RAT_011 */
  test('TC_AD_RAT_011 selects one row checkbox', async () => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.selectRow(row);
    await expect(ratingsPage.selectedCountBadge).toBeVisible();
    await expect(ratingsPage.selectedCountBadge).toContainText('1');
  });

  /** TC_AD_RAT_012 */
  test('TC_AD_RAT_012 selects all rows on current page', async () => {
    await ratingsPage.selectAllOnPage();
    await expect(ratingsPage.selectedCountBadge).toContainText('10');
  });

  /** TC_AD_RAT_013 */
  test('TC_AD_RAT_013 unselects all rows on current page', async () => {
    await ratingsPage.selectAllOnPage();
    await ratingsPage.unselectAllOnPage();
    await expect(ratingsPage.selectedCountBadge).toHaveCount(0);
  });

  /** TC_AD_RAT_014 */
  test('TC_AD_RAT_014 marks new rating as viewed', async ({ adminPage }) => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.markViewedInRow(row).click();
    await expect(adminPage.getByText(copy.markViewedSuccess)).toBeVisible({ timeout: 15_000 });
    await expect(ratingsPage.markViewedInRow(row)).toHaveCount(0);
  });

  /** TC_AD_RAT_015 */
  test('TC_AD_RAT_015 mark viewed API error shows toast', async ({ adminPage }) => {
    setRatingMarkViewedFailForId(primaryRatingRow.id);
    await ratingsPage.goto();
    await ratingsPage.waitForTableLoaded();
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.markViewedInRow(row).click();
    await ratingsPage.expectToast(copy.markViewedError);
  });

  /** TC_AD_RAT_016 */
  test('TC_AD_RAT_016 opens reject dialog for rating', async () => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.hideButtonInRow(row).click();
    await expect(ratingsPage.rejectDialog).toBeVisible();
    await expect(ratingsPage.rejectDialog).toContainText(primaryRatingRow.user!.full_name!);
  });

  /** TC_AD_RAT_017 */
  test('TC_AD_RAT_017 hides rating with valid reason', async ({ adminPage }) => {
    const row = ratingsPage.rowByUserName(viewedRatingRow.user!.full_name!);
    await ratingsPage.hideButtonInRow(row).click();
    await ratingsPage.rejectReasonInput.fill('Nội dung không phù hợp quy định cộng đồng');
    await ratingsPage.submitRejectDialog();
    await expect(adminPage.getByText(copy.hideSuccess)).toBeVisible({ timeout: 15_000 });
    await ratingsPage.selectFilterOption(1, copy.statusHidden);
    await expect(ratingsPage.rowByUserName(viewedRatingRow.user!.full_name!)).toBeVisible();
  });

  /** TC_AD_RAT_018 */
  test('TC_AD_RAT_018 rejects empty hide reason', async () => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.hideButtonInRow(row).click();
    await ratingsPage.submitRejectDialog();
    await expect(ratingsPage.rejectDialog.getByText(copy.reasonRequired)).toBeVisible();
  });

  /** TC_AD_RAT_019 */
  test('TC_AD_RAT_019 cancels reject dialog without API call', async ({ adminPage }) => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.hideButtonInRow(row).click();
    let rejectCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/reject')) rejectCalled = true;
    });
    await ratingsPage.cancelRejectDialog();
    await ratingsPage.expectRejectDialogClosed();
    expect(rejectCalled).toBe(false);
  });

  /** TC_AD_RAT_020 */
  test('TC_AD_RAT_020 bulk hides selected ratings', async ({ adminPage }) => {
    await ratingsPage.selectRow(ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!));
    await ratingsPage.selectRow(ratingsPage.rowByUserName(viewedRatingRow.user!.full_name!));
    await ratingsPage.bulkHideButton.click();
    await expect(ratingsPage.rejectDialog).toContainText('2');
    await ratingsPage.rejectReasonInput.fill('Ẩn hàng loạt do vi phạm nội dung');
    await ratingsPage.submitRejectDialog();
    await ratingsPage.expectToast(/Đã ẩn thành công|Successfully hid/i);
    await expect(ratingsPage.selectedCountBadge).toHaveCount(0);
  });

  /** TC_AD_RAT_021 */
  test('TC_AD_RAT_021 opens delete dialog for rating', async () => {
    const row = ratingsPage.rowByUserName(deletableRatingRow.user!.full_name!);
    await ratingsPage.deleteButtonInRow(row).click();
    await expect(ratingsPage.deleteDialog).toBeVisible();
    await expect(ratingsPage.deleteDialog).toContainText(deletableRatingRow.user!.full_name!);
  });

  /** TC_AD_RAT_022 */
  test('TC_AD_RAT_022 deletes rating after confirmation', async ({ adminPage }) => {
    const row = ratingsPage.rowByUserName(deletableRatingRow.user!.full_name!);
    await ratingsPage.deleteButtonInRow(row).click();
    const deleteReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/ratings/${deletableRatingRow.id}`) &&
        res.request().method() === 'DELETE'
    );
    await ratingsPage.confirmDelete();
    await deleteReq;
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    await expect(ratingsPage.rowByUserName(deletableRatingRow.user!.full_name!)).toHaveCount(0);
  });

  /** TC_AD_RAT_023 */
  test('TC_AD_RAT_023 cancels delete dialog without API call', async ({ adminPage }) => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.deleteButtonInRow(row).click();
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/ratings/')) deleteCalled = true;
    });
    await ratingsPage.cancelDelete();
    await ratingsPage.expectDeleteDialogClosed();
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_RAT_024 */
  test('TC_AD_RAT_024 delete API error keeps row', async ({ adminPage }) => {
    setRatingDeleteFailForId(deletableRatingRow.id);
    await ratingsPage.goto();
    await ratingsPage.waitForTableLoaded();
    const row = ratingsPage.rowByUserName(deletableRatingRow.user!.full_name!);
    await ratingsPage.deleteButtonInRow(row).click();
    await ratingsPage.confirmDelete();
    await ratingsPage.expectToast(copy.deleteError);
    await expect(ratingsPage.rowByUserName(deletableRatingRow.user!.full_name!)).toBeVisible();
  });

  /** TC_AD_RAT_025 */
  test('TC_AD_RAT_025 bulk deletes selected ratings', async ({ adminPage }) => {
    await ratingsPage.selectRow(ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!));
    await ratingsPage.selectRow(ratingsPage.rowByUserName(viewedRatingRow.user!.full_name!));
    await ratingsPage.bulkDeleteButton.click();
    await expect(ratingsPage.bulkDeleteDialog).toBeVisible();
    await ratingsPage.confirmBulkDelete();
    await ratingsPage.expectToast(copy.deleteBulkSuccess);
    await expect(ratingsPage.selectedCountBadge).toHaveCount(0);
  });

  /** TC_AD_RAT_026 */
  test('TC_AD_RAT_026 closes bulk delete via backdrop keeping selection', async () => {
    const row = ratingsPage.rowByUserName(primaryRatingRow.user!.full_name!);
    await ratingsPage.selectRow(row);
    await ratingsPage.bulkDeleteButton.click();
    await ratingsPage.cancelBulkDeleteViaBackdrop();
    await expect(ratingsPage.bulkDeleteDialog).toHaveCount(0);
    await expect(ratingsPage.selectedCountBadge).toBeVisible();
  });

  /** TC_AD_RAT_027 */
  test('TC_AD_RAT_027 shows empty state when list is empty', async ({ adminPage }) => {
    setRatingListEmpty(true);
    const listReq = ratingsPage.waitForListResponse();
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await ratingsPage.heading.waitFor({ state: 'visible' });
    await listReq;
    await expect(ratingsPage.page.getByText(copy.emptyTitle)).toBeVisible();
  });

  /** TC_AD_RAT_028 */
  test('TC_AD_RAT_028 exports excel from header button', async ({ adminPage }) => {
    await ratingsPage.exportHeaderButton.click();
    await ratingsPage.expectToast(copy.exportSuccess);
  });

  /** TC_AD_RAT_029 */
  test('TC_AD_RAT_029 export API error shows toast', async ({ adminPage }) => {
    setRatingExportFail(true);
    await ratingsPage.exportHeaderButton.click();
    await ratingsPage.expectToast(copy.exportFailed);
    setRatingExportFail(false);
  });

  /** TC_AD_RAT_030 */
  test('TC_AD_RAT_030 reject API error shows toast', async () => {
    setRatingRejectFailForId(viewedRatingRow.id);
    await ratingsPage.goto();
    await ratingsPage.waitForTableLoaded();
    const row = ratingsPage.rowByUserName(viewedRatingRow.user!.full_name!);
    await ratingsPage.hideButtonInRow(row).click();
    await ratingsPage.rejectReasonInput.fill('Lý do ẩn thử nghiệm lỗi API');
    await ratingsPage.submitRejectDialog();
    await ratingsPage.expectToast(copy.hideError);
  });
});
