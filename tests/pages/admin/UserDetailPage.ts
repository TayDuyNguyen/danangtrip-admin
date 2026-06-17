import type { Page } from '@playwright/test';

export const userDetailCopy = {
  notFound: /not found|Không tìm thấy/i,
  backToList: /back to list|Quay lại danh sách/i,
  personalInfo: /personal information|Thông tin cá nhân/i,
  bookingsSection: /booking history|Lịch sử đặt tour/i,
  ratingsSection: /Reviews Written|recent reviews|Đánh giá đã viết|Đánh giá gần đây/i,
  actionsSection: /actions|Thao tác/i,
  accountSection: /account|Tài khoản/i,
  block: /^(Khóa|Block)$/i,
  blockAccount: /Block Account|Khóa tài khoản|^Block$/i,
  unblock: /Mở khóa|Unblock/i,
  changeRole: /Đổi vai trò|Change Role/i,
  toggleStatusLabel: /Nhấn để đổi trạng thái|Click to toggle account status/i,
  deleteAction: /^(Xóa|Delete)$/i,
  edit: /Edit|Chỉnh sửa/i,
  editInfo: /Chỉnh sửa thông tin|Edit.*info/i,
  viewBookings: /Xem đơn đặt tour|View.*bookings/i,
  viewRatings: /Xem đánh giá|View Reviews/i,
  viewAllBookings: /View All|Xem tất cả/i,
  viewAllRatings: /View All|Xem tất cả/i,
  youBadge: /YOU|BẠN/i,
  roleDialogTitle: /Change Role|Thay đổi vai trò|Đổi vai trò/i,
  deleteDialogTitle: /delete this account|Xóa tài khoản này/i,
  saveRole: /Save|Lưu/i,
  dialogCancel: /^Hủy$|^Cancel$/i,
  adminRole: /Quản trị viên|ADMIN/i,
  userRole: /Khách du lịch|USER/i,
  noBookings: /no bookings|Chưa có đơn đặt tour/i,
  noRatings: /no reviews|Chưa có đánh giá/i,
  bookingsLoadError: /Không tải được lịch sử đặt tour|Failed to load booking history/i,
  ratingsLoadError: /Không tải được danh sách đánh giá|Failed to load reviews/i,
  retryLoad: /Thử lại|Try again|Retry/i,
  favoritesLabel: /FAVORITES|YÊU THÍCH/i,
  emailVerified: /verified|Đã xác thực/i,
  genderFemale: /^Nữ$|^Female$/i,
  genderMale: /^Nam$|^Male$/i,
  roleElevateWarning: /Caution|Elevating|nâng cấp|Quản trị viên.*Admin/i,
  deleteCascadeWarning: /booking orders|đơn đặt tour|reviews|đánh giá|favorite|yêu thích/i,
  statusError: /Status update failed|Cập nhật trạng thái thất bại/i,
  roleError: /Role update failed|Cập nhật vai trò thất bại/i,
  deleteError: /Delete failed|Xóa tài khoản thất bại/i,
  statusActive: /HOẠT ĐỘNG|ACTIVE/i,
  statusBanned: /BỊ KHÓA|BANNED/i,
  statusPending: /CHỜ KÍCH HOẠT|PENDING/i,
  bookingCompleted: /HOÀN TẤT|completed/i,
  bookingConfirmed: /ĐÃ XÁC NHẬN|confirmed/i,
  bookingPending: /CHỜ XÁC NHẬN|pending/i,
  bookingCancelled: /ĐÃ HỦY|cancelled/i,
  ratingApproved: /ĐÃ DUYỆT|approved/i,
  ratingPending: /CHỜ DUYỆT|pending/i,
  usersBreadcrumb: /Users|Người dùng/i,
};

export class UserDetailPage {
  readonly page: Page;
  private userId: number;

  constructor(page: Page, userId = 3) {
    this.page = page;
    this.userId = userId;
  }

  async goto() {
    await this.page.goto(`/admin/users/detail/${this.userId}`, { waitUntil: 'domcontentloaded' });
    await this.personalInfoCard.waitFor({ state: 'visible', timeout: 20_000 });
    await this.ratingsCard.waitFor({ state: 'visible', timeout: 20_000 });
  }

  async gotoExpectNotFound() {
    await this.page.goto(`/admin/users/detail/${this.userId}`, { waitUntil: 'domcontentloaded' });
    await this.notFoundHeading.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get pageHeading() {
    return this.page.locator('.sticky.top-0 h1.text-xl');
  }

  get stickyHeader() {
    return this.page.locator('.sticky.top-0');
  }

  get actionsPanel() {
    return this.page
      .getByRole('heading', { name: userDetailCopy.actionsSection })
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]');
  }

  get notFoundHeading() {
    return this.page.getByRole('heading', { name: userDetailCopy.notFound });
  }

  get backToListButton() {
    return this.page.getByRole('button', { name: userDetailCopy.backToList });
  }

  get headerBackButton() {
    return this.stickyHeader.locator('button.rounded-full.w-10.h-10').first();
  }

  get personalInfoPanel() {
    return this.personalInfoCard.locator('xpath=ancestor::div[contains(@class,"rounded-3xl")][1]');
  }

  get bookingsPanel() {
    return this.bookingsCard.locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]');
  }

  get ratingsPanel() {
    return this.ratingsCard.locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]');
  }

  get breadcrumbUsersLink() {
    return this.stickyHeader.getByRole('link', { name: userDetailCopy.usersBreadcrumb });
  }

  get headerEditLink() {
    return this.stickyHeader.getByRole('link', { name: userDetailCopy.edit });
  }

  get actionsEditLink() {
    return this.actionsPanel.getByRole('link', { name: userDetailCopy.editInfo });
  }

  get personalInfoCard() {
    return this.page.getByRole('heading', { name: userDetailCopy.personalInfo });
  }

  get bookingsCard() {
    return this.page.getByRole('heading', { name: userDetailCopy.bookingsSection });
  }

  get ratingsCard() {
    return this.page.getByRole('heading', { name: userDetailCopy.ratingsSection });
  }

  get bookingsLoadError() {
    return this.bookingsCard
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]')
      .getByText(userDetailCopy.bookingsLoadError);
  }

  get ratingsLoadError() {
    return this.ratingsCard
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]')
      .getByText(userDetailCopy.ratingsLoadError);
  }

  get bookingsRetryButton() {
    return this.bookingsCard
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]')
      .getByRole('button', { name: userDetailCopy.retryLoad });
  }

  get ratingsRetryButton() {
    return this.ratingsCard
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]')
      .getByRole('button', { name: userDetailCopy.retryLoad });
  }

  get actionsCard() {
    return this.page.getByRole('heading', { name: userDetailCopy.actionsSection });
  }

  get accountSidebar() {
    return this.page.getByRole('heading', { name: userDetailCopy.accountSection });
  }

  get headerBlockButton() {
    return this.stickyHeader.getByRole('button', { name: userDetailCopy.block }).last();
  }

  get headerUnblockButton() {
    return this.stickyHeader.getByRole('button', { name: userDetailCopy.unblock }).last();
  }

  get headerRoleBadge() {
    return this.stickyHeader.getByRole('button', { name: userDetailCopy.changeRole });
  }

  get headerStatusBadge() {
    return this.stickyHeader.getByRole('button', { name: userDetailCopy.toggleStatusLabel });
  }

  get actionsChangeRoleButton() {
    return this.actionsPanel.getByRole('button', { name: userDetailCopy.changeRole });
  }

  get actionsDeleteButton() {
    return this.actionsPanel.getByRole('button', { name: userDetailCopy.deleteAction });
  }

  get actionsViewBookingsLink() {
    return this.actionsPanel.getByRole('link', { name: userDetailCopy.viewBookings });
  }

  get actionsViewRatingsLink() {
    return this.actionsPanel.getByRole('link', { name: userDetailCopy.viewRatings });
  }

  get actionsBlockButton() {
    return this.actionsPanel.getByRole('button', { name: userDetailCopy.blockAccount });
  }

  get actionsUnblockButton() {
    return this.actionsPanel.getByRole('button', { name: userDetailCopy.unblock });
  }

  get viewAllBookingsLink() {
    return this.bookingsCard
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]')
      .getByRole('link', { name: userDetailCopy.viewAllBookings });
  }

  get viewAllRatingsLink() {
    return this.ratingsCard
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]')
      .getByRole('link', { name: userDetailCopy.viewAllRatings });
  }

  get favoritesStatValue() {
    return this.page
      .getByText(userDetailCopy.favoritesLabel)
      .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]')
      .locator('.text-\\[18px\\]');
  }

  get youBadge() {
    return this.page.getByText(userDetailCopy.youBadge);
  }

  get roleDialog() {
    return this.page.locator('div.fixed.inset-0').filter({ hasText: userDetailCopy.roleDialogTitle });
  }

  get deleteDialog() {
    return this.page.locator('div.fixed.inset-0').filter({ hasText: userDetailCopy.deleteDialogTitle });
  }

  get pageSkeletonBlocks() {
    return this.page.locator('.sticky.top-0 .animate-pulse.rounded-md, .max-w-\\[1600px\\] .animate-pulse.rounded-md');
  }

  get stickySidebar() {
    return this.page.locator('.lg\\:sticky.lg\\:top-24');
  }

  emailMailtoLink(email: string) {
    return this.page.locator(`a[href="mailto:${email}"]`);
  }

  avatarInitial(letter: string) {
    return this.personalInfoPanel
      .locator('.w-24.h-24.rounded-full')
      .filter({ hasText: new RegExp(`^${letter}$`) });
  }

  get firstBookingLink() {
    return this.page.locator('table tbody a').first();
  }

  bookingCodeLink(code: string) {
    return this.page.getByRole('link', { name: new RegExp(code) });
  }

  async openChangeRoleDialog() {
    await this.actionsChangeRoleButton.click();
    await this.roleDialog.waitFor({ state: 'visible' });
  }

  async openChangeRoleDialogFromHeader() {
    await this.headerRoleBadge.click();
    await this.roleDialog.waitFor({ state: 'visible' });
  }

  async selectAdminRoleInDialog() {
    await this.roleDialog.getByRole('button', { name: /^ADMIN\b/i }).click();
  }

  async selectUserRoleInDialog() {
    await this.roleDialog.getByRole('button', { name: /^USER\b/i }).click();
  }

  async confirmRoleChange() {
    await this.roleDialog.getByRole('button', { name: userDetailCopy.saveRole }).click();
  }

  async cancelRoleDialog() {
    await this.roleDialog.getByRole('button', { name: userDetailCopy.dialogCancel }).click();
  }

  get roleDialogSaveButton() {
    return this.roleDialog.getByRole('button', { name: userDetailCopy.saveRole });
  }

  get roleDialogAdminWarning() {
    return this.roleDialog.getByText(userDetailCopy.roleElevateWarning);
  }

  async openDeleteDialog() {
    await this.actionsDeleteButton.click();
    await this.deleteDialog.waitFor({ state: 'visible' });
  }

  async confirmDelete() {
    await this.deleteDialog.getByRole('button', { name: userDetailCopy.deleteAction }).click();
  }

  async cancelDeleteDialog() {
    await this.deleteDialog.getByRole('button', { name: userDetailCopy.dialogCancel }).click();
  }

  get deleteCascadeWarning() {
    return this.deleteDialog.getByText(userDetailCopy.deleteCascadeWarning);
  }

  waitForStatusPatch() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        new RegExp(`/admin/users/${this.userId}/status/?$`).test(new URL(res.url()).pathname)
    );
  }

  waitForRolePatch() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        new RegExp(`/admin/users/${this.userId}/role/?$`).test(new URL(res.url()).pathname)
    );
  }

  waitForDelete() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'DELETE' &&
        new RegExp(`/admin/users/${this.userId}/?$`).test(new URL(res.url()).pathname)
    );
  }

  waitForUserDetailGet() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'GET' &&
        new RegExp(`/admin/users/${this.userId}/?$`).test(new URL(res.url()).pathname)
    );
  }
}
