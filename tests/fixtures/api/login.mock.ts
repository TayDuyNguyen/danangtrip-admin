import type { Page, Route } from '@playwright/test';
import { createAdminToken, createStaffToken, createUserRoleToken } from '../../../utils/jwt';
import { successEnvelope } from '../../../helpers/apiResponse';
import { mockAdminUser } from '../data/users.data';
import {
  loginCredentials,
  mockCustomerLoginUser,
  mockStaffLoginUser,
} from '../data/login.data';

export interface LoginMockFlags {
  apiFail: boolean;
  delayMs: number;
}

let flags: LoginMockFlags = { apiFail: false, delayMs: 0 };
let lastLoginBody: { email?: string; password?: string } | null = null;

export function resetMockLogin() {
  flags = { apiFail: false, delayMs: 0 };
  lastLoginBody = null;
}

export function setLoginApiFail(fail: boolean) {
  flags.apiFail = fail;
}

export function setLoginDelay(ms: number) {
  flags.delayMs = ms;
}

export function getLastLoginBody() {
  return lastLoginBody;
}

export async function mockLoginApi(page: Page) {
  const handler = async (route: Route) => {
    const url = route.request().url();
    if (!url.includes('/api/v1/auth/login') || route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    if (flags.apiFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'Server error',
          error_key: 'server.error',
          data: null,
        }),
      });
      return;
    }

    if (flags.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, flags.delayMs));
    }

    const body = route.request().postDataJSON() as { email?: string; password?: string };
    lastLoginBody = body ?? null;
    const email = body?.email ?? '';
    const password = body?.password ?? '';

    if (
      email === loginCredentials.admin.email &&
      password === loginCredentials.admin.password
    ) {
      const token = createAdminToken(mockAdminUser.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            token,
            user: {
              ...mockAdminUser,
              point_balance: 0,
            },
          })
        ),
      });
      return;
    }

    if (
      email === loginCredentials.staff.email &&
      password === loginCredentials.staff.password
    ) {
      const token = createStaffToken(mockStaffLoginUser.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            token,
            user: mockStaffLoginUser,
          })
        ),
      });
      return;
    }

    if (
      email === loginCredentials.customer.email &&
      password === loginCredentials.customer.password
    ) {
      const token = createUserRoleToken(mockCustomerLoginUser.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            token,
            user: mockCustomerLoginUser,
          })
        ),
      });
      return;
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 401,
        message: 'Unauthorized',
        error_key: 'auth.invalid_credentials',
        data: null,
      }),
    });
  };

  await page.route('**/api/v1/auth/login', handler);
}
