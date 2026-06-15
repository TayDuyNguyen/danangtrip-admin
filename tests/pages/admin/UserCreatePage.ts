import type { Locator, Page, Response } from '@playwright/test';

export const userCreateCopy = {
  heading: /Create New User|Tạo Người dùng mới/i,
  submit: /Create User|Tạo người dùng/,
  cancel: /Cancel|Hủy/,
  fullNamePh: /Enter full name|Nhập họ và tên/i,
  usernamePh: /nguyenvanan/i,
  emailPh: /example@email/i,
  phonePh: /0905 xxx xxx/i,
  cityPh: /Da Nang|Đà Nẵng/i,
  settingsHeading: /Account Settings|Cài đặt tài khoản/i,
  activateLabel: /Activate Now|Kích hoạt ngay/i,
  breadcrumbUsers: /Users|Người dùng/i,
  helperUsername: /Only lowercase letters|Chỉ dùng chữ thường/i,
  helperPassword: /Minimum 8 characters|Tối thiểu 8 ký tự/i,
  helperCardTitle: /Important Notes|Lưu ý/i,
  helperCardItem1: /Username must be unique|Username phải là duy nhất/i,
  helperCardItem4: /Consider carefully|Cân nhắc kỹ lưỡng/i,
  genderPlaceholder: /Select gender|Chọn giới tính/i,
  genderMale: /^Male$|^Nam$/i,
  genderFemale: /^Female$|^Nữ$/i,
  genderOther: /^Other$|^Khác$/i,
  createSuccess: /New user created successfully|Tạo người dùng mới thành công/i,
  networkError: /Network connection error|Lỗi kết nối mạng/i,
  serverError: /Internal Server Error|System server error|Lỗi máy chủ|temporarily busy|Hệ thống đang bận/i,
  showPassword: /Show password|Hiện mật khẩu/i,
  hidePassword: /Hide password|Ẩn mật khẩu/i,
};

export interface CreateUserFormData {
  full_name?: string;
  username?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  birthdate?: string;
  gender?: 'male' | 'female' | 'other';
  city?: string;
}

export class UserCreatePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/users/create', { waitUntil: 'domcontentloaded' });
    await this.page.locator('#user-create-form').waitFor({ state: 'visible', timeout: 20_000 });
  }

  get heading() {
    return this.page.getByRole('heading', { name: userCreateCopy.heading });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: userCreateCopy.submit }).first();
  }

  get desktopSubmitButton() {
    return this.page.locator('.sticky.top-0').getByRole('button', { name: userCreateCopy.submit });
  }

  get mobileSubmitButton() {
    return this.page.locator('#user-create-form').getByRole('button', { name: userCreateCopy.submit });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: userCreateCopy.cancel }).last();
  }

  get backButton() {
    return this.page.getByRole('button', { name: userCreateCopy.cancel }).first();
  }

  get breadcrumbListLink() {
    return this.page.getByRole('link', { name: userCreateCopy.breadcrumbUsers });
  }

  get fullNameInput() {
    return this.page.getByPlaceholder(userCreateCopy.fullNamePh);
  }

  get usernameInput() {
    return this.page.getByPlaceholder(userCreateCopy.usernamePh);
  }

  get emailInput() {
    return this.page.getByPlaceholder(userCreateCopy.emailPh);
  }

  get phoneInput() {
    return this.page.getByPlaceholder(userCreateCopy.phonePh);
  }

  get cityInput() {
    return this.page.locator('input[name="city"]');
  }

  get birthdateInput() {
    return this.page.locator('input[name="birthdate"]');
  }

  get passwordInput() {
    return this.page.locator('input[name="password"]');
  }

  get passwordConfirmInput() {
    return this.page.locator('input[name="password_confirmation"]');
  }

  get passwordToggleButton() {
    return this.passwordInput
      .locator('..')
      .locator('..')
      .getByRole('button', { name: userCreateCopy.showPassword });
  }

  get passwordConfirmToggleButton() {
    return this.passwordConfirmInput
      .locator('..')
      .locator('..')
      .getByRole('button', { name: userCreateCopy.showPassword });
  }

  get usernameHelperText() {
    return this.page.getByText(userCreateCopy.helperUsername);
  }

  get passwordHelperText() {
    return this.page.getByText(userCreateCopy.helperPassword);
  }

  get helperCard() {
    return this.page.getByText(userCreateCopy.helperCardTitle).locator('xpath=ancestor::div[contains(@class,"rounded-3xl")][1]');
  }

  get userRoleDefaultBadge() {
    return this.page.getByText('DEFAULT');
  }

  get adminRoleFullPowerBadge() {
    return this.page.getByText('FULL POWER');
  }

  get statusToggle() {
    return this.page
      .locator('#user-create-form')
      .getByRole('heading', { name: userCreateCopy.settingsHeading })
      .locator('xpath=ancestor::div[contains(@class,"rounded-3xl")][1]')
      .locator('button.rounded-full');
  }

  async fillForm(data: CreateUserFormData) {
    if (data.full_name !== undefined) await this.fullNameInput.fill(data.full_name);
    if (data.username !== undefined) await this.usernameInput.fill(data.username);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
    if (data.password_confirmation !== undefined) {
      await this.passwordConfirmInput.fill(data.password_confirmation);
    }
    if (data.phone !== undefined) await this.phoneInput.fill(data.phone);
    if (data.birthdate !== undefined) await this.birthdateInput.fill(data.birthdate);
    if (data.city !== undefined) await this.cityInput.fill(data.city);
    if (data.gender !== undefined) await this.selectGender(data.gender);
  }

  async selectGender(gender: 'male' | 'female' | 'other') {
    const labels: Record<'male' | 'female' | 'other', RegExp> = {
      male: userCreateCopy.genderMale,
      female: userCreateCopy.genderFemale,
      other: userCreateCopy.genderOther,
    };
    await this.page.getByText(userCreateCopy.genderPlaceholder).click();
    await this.page.getByRole('option', { name: labels[gender] }).click();
  }

  async selectRole(role: 'admin' | 'user') {
    await this.page.locator(`input[type="radio"][value="${role}"]`).check();
  }

  async deactivateStatus() {
    await this.statusToggle.click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async confirmAdminCreate() {
    await this.page.getByTestId('create-admin-dialog-confirm').click();
  }

  async cancelAdminCreate() {
    await this.adminConfirmDialog.getByRole('button', { name: userCreateCopy.cancel }).click();
  }

  async closeAdminDialogBackdrop() {
    await this.adminConfirmDialog.locator('.absolute.inset-0').click({ position: { x: 10, y: 10 }, force: true });
  }

  get adminConfirmDialog() {
    return this.page.getByTestId('create-admin-dialog');
  }

  async cancel() {
    await this.cancelButton.click();
  }

  waitForCreatePost(): Promise<Response> {
    return this.page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/admin\/users\/?$/.test(new URL(res.url()).pathname)
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
