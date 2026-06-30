import { expect, type Page } from '@playwright/test';

export const loginCopy = {
  title: /^ĐĂNG NHẬP$|^LOGIN$/i,
  emailPlaceholder: /^Email$/i,
  passwordPlaceholder: /^Mật khẩu$|^Password$/i,
  submitButton: /^ĐĂNG NHẬP$|^LOGIN$/i,
  rememberMe: /Ghi nhớ đăng nhập|Remember me/i,
  forgotPassword: /Quên mật khẩu|Forgot password/i,
  emailRequired: /Email là bắt buộc|Email is required/i,
  passwordRequired: /Mật khẩu là bắt buộc|Password is required/i,
  emailInvalid: /Email không hợp lệ|Invalid email format/i,
  passwordMin: /Mật khẩu phải có ít nhất 6 ký tự|Password must be at least 6 characters/i,
  incorrectCredentials:
    /Email hoặc mật khẩu|Incorrect email or password|The email or password you entered is incorrect/i,
  noAdminPermission:
    /không có quyền truy cập vào trang quản trị|do not have permission to access the admin portal/i,
  loginSuccess: /Đăng nhập thành công|Login success/i,
  loginErrorToast: /Đăng nhập thất bại|Login error/i,
  loggingIn: /Đang đăng nhập|Logging in/i,
  serverError:
    /Lỗi server|Server error|Hệ thống đang bận|system is temporarily busy|System server error/i,
};

const copy = loginCopy;

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(this.title).toBeVisible({ timeout: 15_000 });
  }

  get title() {
    return this.page.getByText(copy.title).first();
  }

  get emailInput() {
    return this.page.getByPlaceholder(copy.emailPlaceholder);
  }

  get passwordInput() {
    return this.page.getByPlaceholder(copy.passwordPlaceholder);
  }

  get submitButton() {
    return this.page.getByTestId('login-submit');
  }

  get rememberMeCheckbox() {
    return this.page.getByTestId('login-remember-me');
  }

  get forgotPasswordHint() {
    return this.page.getByTestId('login-forgot-password');
  }

  get inlineError() {
    return this.page.getByTestId('login-error');
  }

  get emailError() {
    return this.page.getByText(copy.emailRequired);
  }

  get passwordError() {
    return this.page.getByText(copy.passwordRequired);
  }

  async fillEmail(value: string) {
    await this.emailInput.fill(value);
  }

  async fillPassword(value: string) {
    await this.passwordInput.fill(value);
  }

  async submit() {
    await this.submitButton.click();
  }

  async setRememberMe(checked: boolean) {
    const box = this.rememberMeCheckbox;
    if (checked !== (await box.isChecked())) {
      await box.click();
    }
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    const loginReq = this.page.waitForResponse(
      (res) => res.url().includes('/auth/login') && res.request().method() === 'POST'
    );
    await this.submit();
    return loginReq;
  }

  async expectInlineError(pattern: RegExp) {
    await expect(this.inlineError).toBeVisible();
    await expect(this.inlineError).toHaveText(pattern);
  }

  async expectStoredToken() {
    await expect
      .poll(async () =>
        this.page.evaluate(() => {
          const fromStorage = localStorage.getItem('access_token');
          const fromCookie = document.cookie.match(/access_token=([^;]+)/)?.[1] ?? null;
          return fromStorage || fromCookie;
        })
      )
      .not.toBeNull();
  }

  async expectNoStoredToken() {
    await expect
      .poll(async () =>
        this.page.evaluate(() => ({
          storage: localStorage.getItem('access_token'),
          cookie: document.cookie.includes('access_token='),
        }))
      )
      .toEqual({ storage: null, cookie: false });
  }

  async expectRememberMePersistedToken() {
    await expect
      .poll(async () =>
        this.page.evaluate(() => ({
          token: localStorage.getItem('access_token'),
          remember: localStorage.getItem('remember_me'),
        }))
      )
      .toMatchObject({ remember: 'true' });
    await expect
      .poll(async () => this.page.evaluate(() => localStorage.getItem('access_token')))
      .not.toBeNull();
  }
}
