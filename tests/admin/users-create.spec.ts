/**
 * Admin User Create — mapped from 02b_user_create.md
 * Run: npx playwright test tests/admin/users-create.spec.ts
 */
import { test, expect, seedNonAdminSession } from '../fixtures/auth.fixture';
import { UserCreatePage } from '../pages/admin/UserCreatePage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockUserCreateApi } from '../fixtures/api/users-create.mock';
import {
  validCreateUser,
  invalidEmail,
  existingUserPayload,
  invalidUsername,
  duplicateUsername,
  shortPassword,
  invalidPhone,
  numbersOnlyPassword,
} from '../fixtures/data/user-create.data';

test.describe('Admin User Create @P1', () => {
  let createPage: UserCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    await mockAdminLayoutApis(adminPage);
    await mockUserCreateApi(adminPage);
    createPage = new UserCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_UCREATE_001 */
  test('TC_AD_UCREATE_001 shows validation errors on empty submit', async () => {
    await createPage.submit();
    await expect(createPage.errorNearInput('full_name')).toBeVisible();
    await expect(createPage.errorNearInput('username')).toBeVisible();
    await expect(createPage.errorNearInput('email')).toBeVisible();
    await expect(createPage.errorNearInput('password')).toBeVisible();
    await expect(createPage.errorNearInput('password_confirmation')).toBeVisible();
  });

  /** TC_AD_UCREATE_002 */
  test('TC_AD_UCREATE_002 rejects invalid email format', async () => {
    await createPage.fillForm({
      full_name: 'Test User',
      username: 'test_user',
      email: invalidEmail,
      password: 'Pass1234',
      password_confirmation: 'Pass1234',
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('email')).toBeVisible();
  });

  /** TC_AD_UCREATE_003 */
  test('TC_AD_UCREATE_003 shows duplicate email error from API', async ({ adminPage }) => {
    await createPage.fillForm({
      full_name: existingUserPayload.full_name,
      username: 'another_user',
      email: existingUserPayload.email,
      password: existingUserPayload.password,
      password_confirmation: existingUserPayload.password_confirmation,
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('email')).toContainText(/already taken|đã được sử dụng/i);
    await expect(adminPage).toHaveURL(/\/admin\/users\/create/);
  });

  /** TC_AD_UCREATE_004 */
  test('TC_AD_UCREATE_004 creates user successfully', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();
    await createPage.fillForm(validCreateUser);
    await createPage.submit();
    const res = await createReq;
    expect(res.status()).toBe(201);
    await expect(adminPage).toHaveURL(/\/admin\/users\/detail\/99/);
  });

  /** TC_AD_UCREATE_005 */
  test('TC_AD_UCREATE_005 rejects invalid username format', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: invalidUsername,
      email: 'unique_user@test.com',
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('username')).toBeVisible();
  });

  /** TC_AD_UCREATE_006 */
  test('TC_AD_UCREATE_006 rejects password confirmation mismatch', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: 'mismatch_user',
      email: 'mismatch@test.com',
      password_confirmation: 'Different1',
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('password_confirmation')).toBeVisible();
  });

  /** TC_AD_UCREATE_008 */
  test('TC_AD_UCREATE_008 creates user with ADMIN role after confirmation', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();
    await createPage.fillForm({
      ...validCreateUser,
      username: 'admin_new_user',
      email: 'admin_new@test.com',
    });
    await createPage.selectRole('admin');
    await createPage.submit();
    await expect(createPage.adminConfirmDialog).toBeVisible();
    await createPage.confirmAdminCreate();
    const res = await createReq;
    const body = res.request().postDataJSON() as { role?: string };
    expect(body.role).toBe('admin');
    expect(res.status()).toBe(201);
    await expect(adminPage).toHaveURL(/\/admin\/users\/detail\/99/);
  });

  /** TC_AD_UCREATE_009 */
  test('TC_AD_UCREATE_009 shows duplicate username error from API', async ({ adminPage }) => {
    await createPage.fillForm({
      ...validCreateUser,
      username: duplicateUsername,
      email: 'new_email@test.com',
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('username')).toContainText(/already taken|đã được sử dụng/i);
    await expect(adminPage).toHaveURL(/\/admin\/users\/create/);
  });

  /** TC_AD_UCREATE_010 */
  test('TC_AD_UCREATE_010 rejects password shorter than 8 characters', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: 'short_pw_user',
      email: 'short_pw@test.com',
      password: shortPassword,
      password_confirmation: shortPassword,
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('password')).toBeVisible();
  });

  /** TC_AD_UCREATE_010b — password without letters */
  test('TC_AD_UCREATE_010b rejects password with numbers only', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: 'nums_only_user',
      email: 'nums_only@test.com',
      password: numbersOnlyPassword,
      password_confirmation: numbersOnlyPassword,
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('password')).toBeVisible();
  });

  /** TC_AD_UCREATE_011 */
  test('TC_AD_UCREATE_011 rejects invalid phone format', async () => {
    await createPage.fillForm({
      ...validCreateUser,
      username: 'phone_user',
      email: 'phone@test.com',
      phone: invalidPhone,
    });
    await createPage.submit();
    await expect(createPage.errorNearInput('phone')).toBeVisible();
  });

  /** TC_AD_UCREATE_012 */
  test('TC_AD_UCREATE_012 cancel navigates back to user list', async ({ adminPage }) => {
    await createPage.cancel();
    await expect(adminPage).toHaveURL(/\/admin\/users\/?$/);
  });

  /** TC_AD_UCREATE_013 */
  test('TC_AD_UCREATE_013 creates user with banned status', async () => {
    const createReq = createPage.waitForCreatePost();
    await createPage.fillForm({
      ...validCreateUser,
      username: 'banned_user',
      email: 'banned@test.com',
    });
    await createPage.deactivateStatus();
    await createPage.submit();
    const res = await createReq;
    const body = res.request().postDataJSON() as { status?: string };
    expect(body.status).toBe('banned');
    expect(res.status()).toBe(201);
  });
});

test.describe('Admin User Create — Auth @P0', () => {
  test('TC_AD_UCREATE_007 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/users/create');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_UCREATE_014 */
  test('TC_AD_UCREATE_014 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedNonAdminSession(page);
    await page.goto('/admin/users/create');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});
