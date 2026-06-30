/**
 * Admin Login — core (12)
 */
import { test, expect } from '@playwright/test';
import { LoginPage, loginCopy as copy } from '../pages/admin/LoginPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import {
  getLastLoginBody,
  mockLoginApi,
  resetMockLogin,
  setLoginApiFail,
  setLoginDelay,
} from '../fixtures/api/login.mock';
import { mockDashboardApi, resetMockDashboard } from '../fixtures/api/dashboard.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { loginCredentials, loginValidationSamples } from '../fixtures/data/login.data';
import { mockAdminUser } from '../fixtures/data/users.data';

test.describe.configure({ retries: 1 });

async function seedGuestPage(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'access_token=; path=/; max-age=0';
  });
  resetMockLogin();
  resetMockDashboard();
  await page.unroute('**/api/v1/**');
  await page.unroute('**/api/v1/auth/login');
  await mockLoginApi(page);
}

async function mockPostLoginApis(page: import('@playwright/test').Page) {
  await mockDashboardApi(page);
  await mockAuthRefreshApi(page);
  await mockLoginApi(page);
}

test.describe('Admin Login @P1', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await seedGuestPage(page);
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  /** TC_AD_LOGIN_001 */
  test('TC_AD_LOGIN_001 shows validation when submitting empty form', async () => {
    await loginPage.submit();
    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
  });

  /** TC_AD_LOGIN_002 */
  test('TC_AD_LOGIN_002 shows error for incorrect credentials', async () => {
    await loginPage.login(loginCredentials.wrong.email, loginCredentials.wrong.password);
    await loginPage.expectInlineError(copy.incorrectCredentials);
    await expect(loginPage.page).toHaveURL(/\/login$/);
  });

  /** TC_AD_LOGIN_003 */
  test('TC_AD_LOGIN_003 admin login stores token and redirects to dashboard', async ({
    page,
  }) => {
    await mockPostLoginApis(page);

    const loginRes = await loginPage.login(
      loginCredentials.admin.email,
      loginCredentials.admin.password
    );
    expect(loginRes.ok()).toBeTruthy();
    expect(getLastLoginBody()?.email).toBe(loginCredentials.admin.email);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await loginPage.expectStoredToken();

    const dash = new DashboardPage(page);
    await dash.waitForLoaded();
    await expect(dash.welcomeHeading).toContainText(mockAdminUser.full_name);
  });

  /** TC_AD_LOGIN_004 */
  test('TC_AD_LOGIN_004 blocks customer account without admin access', async ({ page }) => {
    await loginPage.login(loginCredentials.customer.email, loginCredentials.customer.password);
    await loginPage.expectInlineError(copy.noAdminPermission);
    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectNoStoredToken();
  });

  /** TC_AD_LOGIN_006 */
  test('TC_AD_LOGIN_006 staff login redirects to dashboard', async ({ page }) => {
    await mockPostLoginApis(page);

    await loginPage.login(loginCredentials.staff.email, loginCredentials.staff.password);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await loginPage.expectStoredToken();
  });

  /** TC_AD_LOGIN_007 — remember me persists token in localStorage */
  test('TC_AD_LOGIN_007 remember me stores token in localStorage', async ({ page }) => {
    await mockPostLoginApis(page);
    await loginPage.setRememberMe(true);
    await loginPage.login(loginCredentials.admin.email, loginCredentials.admin.password);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await loginPage.expectRememberMePersistedToken();
  });

  /** TC_AD_LOGIN_008 */
  test('TC_AD_LOGIN_008 rejects invalid email format without API call', async () => {
    await loginPage.fillEmail(loginValidationSamples.invalidEmail);
    await loginPage.fillPassword(loginValidationSamples.validPasswordForInvalidEmail);
    await loginPage.submit();
    await expect(loginPage.page.getByText(copy.emailInvalid)).toBeVisible();
    expect(getLastLoginBody()).toBeNull();
  });

  /** TC_AD_LOGIN_009 */
  test('TC_AD_LOGIN_009 rejects short password without API call', async () => {
    await loginPage.fillEmail(loginCredentials.admin.email);
    await loginPage.fillPassword(loginValidationSamples.shortPassword);
    await loginPage.submit();
    await expect(loginPage.page.getByText(copy.passwordMin)).toBeVisible();
    expect(getLastLoginBody()).toBeNull();
  });

  /** TC_AD_LOGIN_011 */
  test('TC_AD_LOGIN_011 shows loading state while login request is pending', async ({ page }) => {
    setLoginDelay(1500);
    await mockPostLoginApis(page);

    await loginPage.fillEmail(loginCredentials.admin.email);
    await loginPage.fillPassword(loginCredentials.admin.password);
    await loginPage.submit();

    await expect(loginPage.submitButton).toBeDisabled();
    await expect(page.getByText(copy.loggingIn)).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  /** TC_AD_LOGIN_012 */
  test('TC_AD_LOGIN_012 shows server error when login API fails', async ({ page }) => {
    setLoginApiFail(true);
    await mockLoginApi(page);

    await loginPage.login(loginCredentials.admin.email, loginCredentials.admin.password);
    await loginPage.expectInlineError(copy.serverError);
    await expect(page.getByText(copy.loginErrorToast)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  /** TC_AD_LOGIN_013 — forgot password is disabled placeholder */
  test('TC_AD_LOGIN_013 forgot password is non-navigating placeholder', async () => {
    await expect(loginPage.forgotPasswordHint).toBeVisible();
    await expect(loginPage.forgotPasswordHint).toHaveAttribute('aria-disabled', 'true');
    await expect(loginPage.forgotPasswordHint).toHaveAttribute('title', /.+/);
  });
});

test.describe('Admin Login — route guard @P0', () => {
  /** TC_AD_LOGIN_005 */
  test('TC_AD_LOGIN_005 guest accessing dashboard is redirected to login', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByText(copy.title).first()).toBeVisible();
    await context.close();
  });
});
