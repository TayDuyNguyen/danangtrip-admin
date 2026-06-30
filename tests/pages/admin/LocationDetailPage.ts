import type { Locator, Page, Response } from '@playwright/test';

export const locationDetailCopy = {
  tabInfo: /Thông tin chi tiết|^Details$/i,
  tabReviews: /Đánh giá của khách|Guest Reviews/i,
  tabMap: /Vị trí & Bản đồ|Location & Map/i,
  editButton: /Chỉnh sửa|^Edit$/i,
  deleteButton: /Xóa địa điểm|Delete location/i,
  backTitle: /Quay lại danh sách|Back to list/i,
  statsViews: /Lượt xem|Views/i,
  statsFavorites: /Yêu thích|Favorites/i,
  managementTitle: /Quản lý & Cấu hình|Management & Configuration/i,
  statusActive: /^Đang hoạt động$|^Active$/i,
  statusInactive: /^Tạm dừng$|^Inactive$/i,
  featuredLabel: /Nổi bật trên trang chủ|Featured on homepage/i,
  dangerZone: /Khu vực nguy hiểm|Danger [Zz]one/i,
  descriptionHeading: /^Mô tả$|^Description$/i,
  reviewsEmpty: /Chưa có đánh giá nào cho địa điểm này|No reviews yet for this location/i,
  allReviews: /Tất cả đánh giá|All reviews/i,
  mapCoordinates: /Tọa độ|Coordinates/i,
  mapNoCoordinates: /Địa điểm này chưa có tọa độ bản đồ|does not have map coordinates/i,
  mapDirections: /Mở chỉ đường|Open directions/i,
  heroNoImages: /Chưa có hình ảnh|No images available/i,
  loadError: /Không thể tải chi tiết địa điểm|Unable to load location details/i,
  notFoundTitle: /Không tìm thấy địa điểm|Location not found/i,
  notFoundDesc: /Địa điểm không tồn tại hoặc đã bị xóa|does not exist or has been removed/i,
  reviewsLoadError: /Không thể tải đánh giá|Unable to load reviews/i,
  retryButton: /Thử lại|Retry/i,
  backToListButton: /Quay lại danh sách|Back to list/i,
  confirmDeleteTitle: /Xóa địa điểm này|Delete this location/i,
  confirmDeleteButton: /^Xóa$|^Delete$/i,
  cancelDeleteButton: /^Hủy$|^Cancel$/i,
  updateSuccess: /Cập nhật thành công|Updated successfully/i,
  updateError: /Cập nhật thất bại|Update failed/i,
  bulkPartialError: /Một số mục không thể cập nhật|Some items could not be updated/i,
  deleteSuccess: /Xóa địa điểm thành công|Location deleted successfully/i,
};

const copy = locationDetailCopy;

export class LocationDetailPage {
  readonly page: Page;
  readonly locationId: number;

  constructor(page: Page, locationId: number) {
    this.page = page;
    this.locationId = locationId;
  }

  async goto() {
    await this.page.goto(`/admin/locations/detail/${this.locationId}`, { waitUntil: 'domcontentloaded' });
    await Promise.race([
      this.pageHeading.waitFor({ state: 'visible', timeout: 25_000 }),
      this.errorWidget.waitFor({ state: 'visible', timeout: 25_000 }),
      this.notFoundTitle.waitFor({ state: 'visible', timeout: 25_000 }),
      this.skeletonRoot.waitFor({ state: 'visible', timeout: 25_000 }),
    ]);
  }

  async gotoAndWaitLoaded() {
    await this.goto();
    await this.pageHeading.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get stickyHeader() {
    return this.page.locator('main .sticky.top-0').first();
  }

  get skeletonRoot() {
    return this.page.locator('main .animate-in.fade-in').filter({ has: this.page.locator('.rounded-3xl') }).first();
  }

  get pageHeading() {
    return this.stickyHeader.locator('h1').first();
  }

  get backButton() {
    return this.stickyHeader.locator('button[aria-label]').first();
  }

  get stickyContextBadge() {
    return this.stickyHeader.locator('span.rounded-full').filter({ hasText: /Chi tiết|^Details$/i });
  }

  async scrollMainContent(pixels = 250) {
    await this.page.locator('main').evaluate((el, y) => {
      el.scrollTop = y;
    }, pixels);
  }

  get breadcrumbListLink() {
    return this.page.getByRole('link', { name: /Danh sách Địa điểm|Location List/i }).first();
  }

  async goBackToList() {
    await this.backButton.click();
  }

  get editButton() {
    return this.page.getByRole('button', { name: copy.editButton });
  }

  get headerDeleteButton() {
    return this.stickyHeader.getByRole('button', { name: copy.deleteButton });
  }

  get heroImage() {
    return this.page.locator('.aspect-video img').first();
  }

  get tabsNav() {
    return this.page.locator('.flex.items-center.gap-1.p-1.bg-slate-100\\/50.rounded-2xl');
  }

  get tabInfoButton() {
    return this.tabsNav.getByRole('button').nth(0);
  }

  get tabReviewsButton() {
    return this.tabsNav.getByRole('button').nth(1);
  }

  get tabMapButton() {
    return this.tabsNav.getByRole('button').nth(2);
  }

  get managementCard() {
    return this.page.locator('.bg-white.rounded-\\[32px\\]').filter({ hasText: copy.managementTitle });
  }

  get featuredToggle() {
    return this.managementCard.locator('button.rounded-full').first();
  }

  get dangerDeleteButton() {
    return this.page.locator('.bg-red-50\\/30').getByRole('button', { name: copy.deleteButton });
  }

  get deleteModal() {
    return this.page.locator('.fixed.inset-0').filter({ hasText: copy.confirmDeleteTitle });
  }

  get deleteConfirmButton() {
    return this.deleteModal.getByRole('button', { name: copy.confirmDeleteButton }).last();
  }

  get deleteCancelButton() {
    return this.deleteModal.getByRole('button', { name: copy.cancelDeleteButton });
  }

  get notFoundTitle() {
    return this.page.getByRole('heading', { name: copy.notFoundTitle, level: 2 });
  }

  get returnToListButton() {
    return this.page.getByRole('button', { name: copy.backToListButton });
  }

  get errorWidget() {
    return this.page.getByText(copy.loadError);
  }

  get retryButton() {
    return this.page.getByRole('button', { name: copy.retryButton });
  }

  get errorBackButton() {
    return this.page.getByRole('button', { name: copy.backToListButton });
  }

  statCard(label: RegExp): Locator {
    return this.page
      .locator('div.rounded-3xl')
      .filter({ has: this.page.getByText(label) })
      .locator('h3, .text-2xl, .text-xl')
      .first();
  }

  async selectStatus(option: RegExp) {
    const statusBlock = this.managementCard
      .locator('.space-y-2')
      .filter({ hasText: /Trạng thái|Status/i })
      .first();
    await statusBlock.locator('[class*="control"]').click();
    await this.page.getByRole('option', { name: option }).click();
  }

  waitForDetailGet(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        new RegExp(`/admin/locations/${this.locationId}/?$`).test(
          new URL(res.url()).pathname.replace(/\/$/, '')
        )
    );
  }

  waitForFeaturedPatch(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/locations/${this.locationId}/featured`)
    );
  }

  waitForStatusPatch(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/admin/locations/${this.locationId}/status`)
    );
  }

  waitForDelete(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        res.url().includes(`/admin/locations/${this.locationId}`)
    );
  }
}
