import type { Page } from '@playwright/test';

const copy = {
  notFound: /not found|Không tìm thấy/i,
  backToList: /back to list|Quay lại danh sách/i,
  personalInfo: /personal information|Thông tin cá nhân/i,
  bookingsSection: /booking history|Lịch sử đặt tour/i,
  ratingsSection: /recent reviews|Đánh giá đã viết|Đánh giá gần đây/i,
  actionsSection: /actions|Thao tác/i,
  block: /Khóa|Block/i,
  blockAccount: /Khóa tài khoản/i,
  unblock: /Mở khóa|Unblock/i,
  changeRole: /Đổi vai trò|Change Role/i,
  deleteAction: /^(Xóa|Delete)$/i,
  edit: /Edit|Chỉnh sửa/i,
  viewBookings: /Xem đơn đặt tour|View.*bookings/i,
  viewRatings: /Xem đánh giá|View Reviews/i,
  youBadge: /YOU|BẠN/i,
  roleDialogTitle: /Change Role|Thay đổi vai trò|Đổi vai trò/i,
  deleteDialogTitle: /delete this account|Xóa tài khoản này/i,
  saveRole: /Save Changes|Lưu thay đổi/i,
  adminRole: /Quản trị viên|ADMIN/i,
  noBookings: /no bookings|Chưa có đơn đặt tour/i,
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
  }

  async gotoExpectNotFound() {
    await this.page.goto(`/admin/users/detail/${this.userId}`, { waitUntil: 'domcontentloaded' });
    await this.notFoundHeading.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get pageHeading() {
    return this.page.locator('.sticky.top-0 h1.text-xl');
  }

  get actionsPanel() {
    return this.page
      .getByRole('heading', { name: copy.actionsSection })
      .locator('xpath=ancestor::div[contains(@class,"rounded-[23px]")][1]');
  }

  get notFoundHeading() {
    return this.page.getByRole('heading', { name: copy.notFound });
  }

  get backToListButton() {
    return this.page.getByRole('button', { name: copy.backToList });
  }

  get personalInfoCard() {
    return this.page.getByRole('heading', { name: copy.personalInfo });
  }

  get bookingsCard() {
    return this.page.getByRole('heading', { name: copy.bookingsSection });
  }

  get ratingsCard() {
    return this.page.getByRole('heading', { name: copy.ratingsSection });
  }

  get actionsCard() {
    return this.page.getByRole('heading', { name: copy.actionsSection });
  }

  get headerBlockButton() {
    return this.page.getByRole('button', { name: copy.block }).first();
  }

  get headerUnblockButton() {
    return this.page.getByRole('button', { name: copy.unblock }).first();
  }

  get actionsChangeRoleButton() {
    return this.actionsPanel.getByRole('button', { name: copy.changeRole });
  }

  get actionsDeleteButton() {
    return this.actionsPanel.getByRole('button', { name: copy.deleteAction });
  }

  get actionsViewBookingsLink() {
    return this.actionsPanel.getByRole('link', { name: copy.viewBookings });
  }

  get actionsViewRatingsLink() {
    return this.actionsPanel.getByRole('link', { name: copy.viewRatings });
  }

  get actionsBlockButton() {
    return this.actionsPanel.getByRole('button', { name: copy.blockAccount });
  }

  get youBadge() {
    return this.page.getByText(copy.youBadge);
  }

  get roleDialog() {
    return this.page.locator('div.fixed.inset-0').filter({ hasText: copy.roleDialogTitle });
  }

  get deleteDialog() {
    return this.page.locator('div.fixed.inset-0').filter({ hasText: copy.deleteDialogTitle });
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

  async selectAdminRoleInDialog() {
    await this.roleDialog.getByRole('button').filter({ hasText: copy.adminRole }).click();
  }

  async confirmRoleChange() {
    await this.roleDialog.getByRole('button', { name: copy.saveRole }).click();
  }

  async openDeleteDialog() {
    await this.actionsDeleteButton.click();
    await this.deleteDialog.waitFor({ state: 'visible' });
  }

  async confirmDelete() {
    await this.deleteDialog.getByRole('button', { name: copy.deleteAction }).click();
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
}
