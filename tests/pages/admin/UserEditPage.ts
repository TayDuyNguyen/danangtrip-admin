import type { Locator, Page } from '@playwright/test';

export const userEditCopy = {
  heading: /Edit User|Chỉnh sửa Người dùng/i,
  notFound: /not found|Không tìm thấy/i,
  submit: /Save Changes|Lưu thay đổi/,
  saving: /Saving\.\.\.|Đang lưu\.\.\./i,
  cancel: /Cancel|Hủy/,
  dialogCancel: /^Hủy$|^Cancel$/i,
  fullNamePh: /Enter full name|Nhập họ và tên/i,
  emailPh: /example@email/i,
  phonePh: /0905 xxx xxx/i,
  cityPh: /Da Nang|Đà Nẵng/i,
  usersBreadcrumb: /Users|Người dùng/i,
  lockAccount: /Lock Account|Khóa tài khoản/i,
  unlockAccount: /Unlock Account|Mở khóa tài khoản/i,
  unsavedTitle: /Unsaved Changes|Thay đổi chưa được lưu/i,
  stayOnPage: /Stay|Ở lại/i,
  leavePage: /Leave|Rời đi/i,
  usernameReadonlyBadge: /Cannot change|Không thể thay đổi/i,
  passwordInfo: /Forgot Password|Quên mật khẩu/i,
  genderPlaceholder: /Select gender|Chọn giới tính/i,
  genderMale: /^Male$|^Nam$/i,
  genderFemale: /^Female$|^Nữ$/i,
  viewProfile: /View Profile|Xem hồ sơ/i,
  viewBookings: /View Bookings|Xem đơn hàng/i,
  deleteAccount: /Delete Account|Xóa tài khoản/i,
  deleteDialogTitle: /delete this account|Xóa tài khoản này/i,
  deleteConfirm: /^(Xóa|Delete)$/i,
  emailVerified: /VERIFIED|ĐÃ XÁC THỰC/i,
  joinedDate: /Joined|Ngày tham gia/i,
  lastUpdated: /Last updated|Cập nhật lần cuối/i,
  roleSuccess: /role.*success|vai trò thành công/i,
  roleError: /Role update failed|Cập nhật vai trò thất bại/i,
  statusError: /Status update failed|Cập nhật trạng thái thất bại/i,
  deleteError: /Delete failed|Xóa tài khoản thất bại/i,
  deleteSuccess: /deleted|xóa tài khoản.*thành công/i,
  unlockSuccess: /unblocked|mở khóa.*thành công/i,
};

export class UserEditPage {
  readonly page: Page;
  private userId: number;

  constructor(page: Page, userId = 3) {
    this.page = page;
    this.userId = userId;
  }

  setUserId(userId: number) {
    this.userId = userId;
  }

  async goto() {
    await this.page.goto(`/admin/users/edit/${this.userId}`, { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor({ state: 'visible', timeout: 20_000 });
    await this.fullNameInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async gotoWithSearch(query: string) {
    await this.page.goto(`/admin/users/edit/${this.userId}${query}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async gotoExpectNotFound() {
    await this.page.goto(`/admin/users/edit/${this.userId}`, { waitUntil: 'domcontentloaded' });
    await this.notFoundHeading.waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { name: userEditCopy.heading });
  }

  get notFoundHeading() {
    return this.page.getByRole('heading', { name: userEditCopy.notFound });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: userEditCopy.submit }).first();
  }

  get desktopHeaderSubmit() {
    return this.page.locator('.sticky.top-0').getByRole('button', { name: userEditCopy.submit });
  }

  get mobileSubmitButton() {
    return this.page.locator('#user-edit-form').getByRole('button', { name: userEditCopy.submit });
  }

  get fullNameInput() {
    return this.page.getByPlaceholder(userEditCopy.fullNamePh);
  }

  get emailInput() {
    return this.page.getByPlaceholder(userEditCopy.emailPh);
  }

  get phoneInput() {
    return this.page.getByPlaceholder(userEditCopy.phonePh);
  }

  get cityInput() {
    return this.page.locator('input[name="city"]');
  }

  get birthdateInput() {
    return this.page.locator('input[name="birthdate"]');
  }

  get adminRoleRadio() {
    return this.page.locator('input[type="radio"][value="admin"]');
  }

  get userRoleRadio() {
    return this.page.locator('input[type="radio"][value="user"]');
  }

  get lockAccountButton() {
    return this.page.getByRole('button', { name: userEditCopy.lockAccount });
  }

  get unlockAccountButton() {
    return this.page.getByRole('button', { name: userEditCopy.unlockAccount });
  }

  get statusToggle() {
    return this.page.getByTestId('user-edit-status-toggle').locator('button');
  }

  get usersBreadcrumbLink() {
    return this.page.locator('.sticky.top-0').getByRole('link', { name: userEditCopy.usersBreadcrumb });
  }

  get usernameReadonlyBadge() {
    return this.page.getByText(userEditCopy.usernameReadonlyBadge);
  }

  get passwordInfoBox() {
    return this.page.getByText(userEditCopy.passwordInfo);
  }

  get viewProfileButton() {
    return this.page.getByRole('button', { name: userEditCopy.viewProfile });
  }

  get viewBookingsButton() {
    return this.page.getByRole('button', { name: userEditCopy.viewBookings });
  }

  get deleteAccountButton() {
    return this.page.getByRole('button', { name: userEditCopy.deleteAccount });
  }

  get deleteDialog() {
    return this.page.locator('div.fixed.inset-0').filter({ hasText: userEditCopy.deleteDialogTitle });
  }

  get formSkeletonBlocks() {
    return this.page.locator('.animate-pulse.rounded-lg');
  }

  get roleGroup() {
    return this.page.getByTestId('user-edit-role-group');
  }

  get roleSpinner() {
    return this.page.getByTestId('user-edit-role-group').locator('..').locator('.animate-spin');
  }

  get statusSpinner() {
    return this.page.getByTestId('user-edit-status-toggle').locator('.animate-spin');
  }

  get unsavedChangesDialog() {
    return this.page.getByRole('dialog').filter({
      has: this.page.getByRole('heading', { name: userEditCopy.unsavedTitle }),
    });
  }

  get leavePageButton() {
    return this.page.getByRole('button', { name: userEditCopy.leavePage });
  }

  get stayOnPageButton() {
    return this.page.getByRole('button', { name: userEditCopy.stayOnPage });
  }

  async selectRole(role: 'admin' | 'user') {
    await this.page.locator(`input[type="radio"][name="user-edit-role"][value="${role}"]`).click();
  }

  async selectGender(gender: 'male' | 'female' | 'other') {
    const labels: Record<'male' | 'female' | 'other', RegExp> = {
      male: userEditCopy.genderMale,
      female: userEditCopy.genderFemale,
      other: /^Other$|^Khác$/i,
    };
    const genderSection = this.page
      .locator('#user-edit-form')
      .getByText(/^Gender$|^Giới tính$/i)
      .locator('xpath=ancestor::div[contains(@class,"space-y-2")][1]');
    await genderSection.scrollIntoViewIfNeeded();
    await genderSection.locator('[class*="control"]').click();
    await this.page.getByRole('option', { name: labels[gender] }).click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async confirmAdminRole() {
    await this.page.getByTestId('create-admin-dialog-confirm').click();
  }

  async cancelAdminRoleDialog() {
    await this.adminConfirmDialog.getByRole('button', { name: userEditCopy.dialogCancel }).click();
  }

  get adminConfirmDialog() {
    return this.page.getByTestId('create-admin-dialog');
  }

  async openDeleteDialog() {
    await this.deleteAccountButton.click();
    await this.deleteDialog.waitFor({ state: 'visible' });
  }

  async confirmDelete() {
    await this.deleteDialog.getByRole('button', { name: userEditCopy.deleteConfirm }).click();
  }

  waitForUpdatePut() {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        new RegExp(`/admin/users/${this.userId}/?$`).test(new URL(res.url()).pathname)
    );
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

  errorNearInput(name: string) {
    return this.page
      .locator(`input[name="${name}"]`)
      .locator('xpath=ancestor::div[contains(@class,"space-y-2")][1]//p[contains(@class,"text-red")]');
  }

  async isInViewport(locator: Locator): Promise<boolean> {
    return locator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const viewHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewWidth = window.innerWidth || document.documentElement.clientWidth;
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= viewHeight && rect.right <= viewWidth;
    });
  }
}
