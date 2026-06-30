import { test as base, type Page } from '@playwright/test';
import { createAdminToken, createUserRoleToken, createStaffToken } from '../../utils/jwt';
import { mockAdminUser } from './data/users.data';

export interface AdminAuthFixtures {
  adminPage: Page;
}

const adminUserState = {
  id: mockAdminUser.id,
  username: mockAdminUser.username,
  email: mockAdminUser.email,
  full_name: mockAdminUser.full_name,
  avatar: mockAdminUser.avatar,
  phone: mockAdminUser.phone,
  birthdate: mockAdminUser.birthdate,
  gender: mockAdminUser.gender,
  city: mockAdminUser.city,
  point_balance: 0,
  role: 'admin' as const,
  status: 'active' as const,
  last_login_at: mockAdminUser.last_login_at,
  created_at: mockAdminUser.created_at,
  updated_at: mockAdminUser.updated_at,
};

async function seedSession(
  page: Page,
  token: string,
  persistedUser: typeof adminUserState
) {
  await page.addInitScript(
    ({ accessToken, user }) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem(
        'user-storage',
        JSON.stringify({ state: { user }, version: 0 })
      );
      localStorage.setItem('language', 'vi');
      globalThis.document.cookie = `access_token=${accessToken}; path=/`;
    },
    { accessToken: token, user: persistedUser }
  );
}

export async function seedAdminSession(page: Page, userId = 1) {
  const token = createAdminToken(userId);
  await seedSession(page, token, { ...adminUserState, id: userId });
}

/** Re-apply session on the live page (use in beforeEach before goto when tests mutate auth). */
export async function ensureAdminSessionOnPage(page: Page, userId = 1) {
  const token = createAdminToken(userId);
  const user = { ...adminUserState, id: userId };
  await page.evaluate(
    ({ accessToken, persistedUser }) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem(
        'user-storage',
        JSON.stringify({ state: { user: persistedUser }, version: 0 })
      );
      document.cookie = `access_token=${accessToken}; path=/`;
    },
    { accessToken: token, persistedUser: user }
  );
}

export async function seedStaffSession(page: Page, userId = 3) {
  const token = createStaffToken(userId);
  await seedSession(page, token, {
    ...adminUserState,
    id: userId,
    role: 'staff',
    email: 'staff@test.com',
    username: 'staff_user',
    full_name: 'Staff User',
  });
}

export async function seedNonAdminSession(page: Page, userId = 2) {
  const token = createUserRoleToken(userId);
  await seedSession(page, token, {
    ...adminUserState,
    id: userId,
    role: 'user',
    email: 'customer@test.com',
    username: 'customer_user',
    full_name: 'Customer User',
  });
}

export const test = base.extend<AdminAuthFixtures>({
  adminPage: async ({ page }, use) => {
    await seedAdminSession(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from '@playwright/test';
