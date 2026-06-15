/**
 * Admin User Create — extended TC from 02b_user_create.md backlog
 * Run: npm run test:admin:user-create
 */
import { test, expect } from '../fixtures/auth.fixture';
import { UserCreatePage, userCreateCopy } from '../pages/admin/UserCreatePage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockUserCreateApi } from '../fixtures/api/users-create.mock';
import {
  validCreateUser,
  existingUserPayload,
  longFullName,
  longUsername,
  longEmail,
  longCity,
  buildOptionalCreateUser,
} from '../fixtures/data/user-create.data';

test.describe('Admin User Create — Validation extended @P2', () => {
  let createPage: UserCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUserCreateApi(adminPage);
    createPage = new UserCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_UCREATE_015 */
  test('TC_AD_UCREATE_015 rejects full_name longer than 100 characters', async () => {
    await createPage.fillForm({ ...validCreateUser, full_name: longFullName });
    await createPage.submit();
    await expect(createPage.errorNearInput('full_name')).toBeVisible();
  });

  /** TC_AD_UCREATE_016 */
  test('TC_AD_UCREATE_016 rejects username longer than 50 characters', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: longUsername,
      email: 'long_username@test.com',
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('username')).toBeVisible();
  });

  /** TC_AD_UCREATE_017 */
  test('TC_AD_UCREATE_017 rejects email longer than 100 characters', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: 'long_email_user',
      email: longEmail,
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('email')).toBeVisible();
  });

  /** TC_AD_UCREATE_018 */
  test('TC_AD_UCREATE_018 rejects city longer than 100 characters', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: 'long_city_user',
      email: 'long_city@test.com',
      city: longCity,
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('city')).toBeVisible();
  });
});

test.describe('Admin User Create — Success extended @P1', () => {
  let createPage: UserCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUserCreateApi(adminPage);
    createPage = new UserCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_UCREATE_019 */
  test('TC_AD_UCREATE_019 creates user with optional fields in POST body', async () => {
    const payload = buildOptionalCreateUser();
    const createReq = createPage.waitForCreatePost();
    await createPage.fillForm(payload);
    await createPage.submit();
    const res = await createReq;
    const body = res.request().postDataJSON() as Record<string, unknown>;
    expect(body.phone).toBe(payload.phone);
    expect(body.birthdate).toBe(payload.birthdate);
    expect(body.gender).toBe(payload.gender);
    expect(body.city).toBe(payload.city);
    expect(res.status()).toBe(201);
  });

  /** TC_AD_UCREATE_020 */
  test('TC_AD_UCREATE_020 shows create_success toast after create', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();
    await createPage.fillForm({
      ...validCreateUser,
      username: 'toast_user',
      email: 'toast_user@test.com',
    });
    await createPage.submit();
    await createReq;
    await expect(adminPage.getByText(userCreateCopy.createSuccess)).toBeVisible();
  });

  /** TC_AD_UCREATE_021 */
  test('TC_AD_UCREATE_021 navigates to list when API omits user id', async ({ adminPage }) => {
    await mockUserCreateApi(adminPage, { omitUserId: true });
    const createReq = createPage.waitForCreatePost();
    await createPage.fillForm({
      ...validCreateUser,
      username: 'no_id_user',
      email: 'no_id_user@test.com',
    });
    await createPage.submit();
    await createReq;
    await expect(adminPage).toHaveURL(/\/admin\/users\/?$/);
  });
});

test.describe('Admin User Create — Navigation & UX @P2', () => {
  let createPage: UserCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUserCreateApi(adminPage);
    createPage = new UserCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_UCREATE_022 */
  test('TC_AD_UCREATE_022 admin confirm dialog cancel and backdrop dismiss without POST', async ({
    adminPage,
  }) => {
    let postCount = 0;
    adminPage.on('request', (req) => {
      if (req.method() === 'POST' && /\/admin\/users\/?$/.test(new URL(req.url()).pathname)) {
        postCount += 1;
      }
    });

    await createPage.fillForm({
      ...validCreateUser,
      username: 'admin_dialog_user',
      email: 'admin_dialog@test.com',
    });
    await createPage.selectRole('admin');
    await createPage.submit();
    await expect(createPage.adminConfirmDialog).toBeVisible();

    await createPage.cancelAdminCreate();
    await expect(createPage.adminConfirmDialog).toBeHidden();
    expect(postCount).toBe(0);

    await createPage.submit();
    await expect(createPage.adminConfirmDialog).toBeVisible();
    await createPage.closeAdminDialogBackdrop();
    await expect(createPage.adminConfirmDialog).toBeHidden();
    expect(postCount).toBe(0);
  });

  /** TC_AD_UCREATE_023 */
  test('TC_AD_UCREATE_023 toggles password visibility', async () => {
    await expect(createPage.passwordInput).toHaveAttribute('type', 'password');
    await createPage.passwordToggleButton.click();
    await expect(createPage.passwordInput).toHaveAttribute('type', 'text');
    await createPage.passwordConfirmToggleButton.click();
    await expect(createPage.passwordConfirmInput).toHaveAttribute('type', 'text');
  });

  /** TC_AD_UCREATE_024 */
  test('TC_AD_UCREATE_024 shows username and password helper text', async () => {
    await expect(createPage.usernameHelperText).toBeVisible();
    await expect(createPage.passwordHelperText).toBeVisible();
  });

  /** TC_AD_UCREATE_025 */
  test('TC_AD_UCREATE_025 shows helper card with four bullet items', async () => {
    await expect(createPage.helperCard).toBeVisible();
    await expect(createPage.helperCard.getByText(userCreateCopy.helperCardItem1)).toBeVisible();
    await expect(createPage.helperCard.getByText(userCreateCopy.helperCardItem4)).toBeVisible();
    await expect(createPage.helperCard.locator('li')).toHaveCount(4);
  });

  /** TC_AD_UCREATE_026 */
  test('TC_AD_UCREATE_026 breadcrumb navigates to user list', async ({ adminPage }) => {
    await createPage.breadcrumbListLink.click();
    await expect(adminPage).toHaveURL(/\/admin\/users\/?$/);
  });

  /** TC_AD_UCREATE_027 */
  test('TC_AD_UCREATE_027 back button navigates to user list', async ({ adminPage }) => {
    await createPage.backButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/users\/?$/);
  });

  /** TC_AD_UCREATE_028 */
  test('TC_AD_UCREATE_028 sticky header desktop submit and mobile footer submit', async ({
    adminPage,
  }) => {
    await adminPage.setViewportSize({ width: 1280, height: 720 });
    await expect(createPage.desktopSubmitButton).toBeVisible();

    await adminPage.setViewportSize({ width: 390, height: 844 });
    await expect(createPage.desktopSubmitButton).toBeHidden();
    await expect(createPage.mobileSubmitButton).toBeVisible();
  });

  /** TC_AD_UCREATE_029 */
  test('TC_AD_UCREATE_029 scrolls to first 422 error field on API validation', async ({
    adminPage,
  }) => {
    await adminPage.setViewportSize({ width: 390, height: 500 });
    await adminPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await createPage.fillForm({
      full_name: existingUserPayload.full_name,
      username: 'scroll_dup_user',
      email: existingUserPayload.email,
      password: existingUserPayload.password,
      password_confirmation: existingUserPayload.password_confirmation,
    });
    await createPage.mobileSubmitButton.click();
    await expect(createPage.errorNearInput('email')).toContainText(/already taken|đã được sử dụng/i);
    await expect.poll(() => createPage.isInViewport(createPage.emailInput), { timeout: 8_000 }).toBeTruthy();
  });

  /** TC_AD_UCREATE_030 */
  test('TC_AD_UCREATE_030 shows general error toast on non-422 API failure', async ({
    adminPage,
  }) => {
    await mockUserCreateApi(adminPage, { fail500: true });
    await createPage.fillForm({
      ...validCreateUser,
      username: 'fail500_user',
      email: 'fail500@test.com',
    });
    await createPage.submit();
    await expect(adminPage.getByText(userCreateCopy.serverError)).toBeVisible();
  });

  /** TC_AD_UCREATE_031 */
  test('TC_AD_UCREATE_031 gender select shows Nam Nữ Khác options', async ({ adminPage }) => {
    await adminPage.getByText(userCreateCopy.genderPlaceholder).click();
    await expect(adminPage.getByRole('option', { name: userCreateCopy.genderMale })).toBeVisible();
    await expect(adminPage.getByRole('option', { name: userCreateCopy.genderFemale })).toBeVisible();
    await expect(adminPage.getByRole('option', { name: userCreateCopy.genderOther })).toBeVisible();
  });

  /** TC_AD_UCREATE_032 */
  test('TC_AD_UCREATE_032 role cards show DEFAULT and FULL POWER badges', async ({ adminPage }) => {
    await expect(createPage.userRoleDefaultBadge).toBeVisible();
    await expect(createPage.adminRoleFullPowerBadge).toBeVisible();
    await createPage.selectRole('admin');
    await expect(adminPage.locator('input[type="radio"][value="admin"]')).toBeChecked();
  });
});
