import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';
import { duplicateEmail, duplicateUsername } from '../data/user-create.data';

const knownEmails = new Set<string>([duplicateEmail]);
const knownUsernames = new Set<string>([duplicateUsername]);

export interface UserCreateMockOptions {
  omitUserId?: boolean;
  fail500?: boolean;
  passwordComplexity422?: boolean;
}

function isCreateUserPost(url: string, method: string): boolean {
  return method === 'POST' && /\/admin\/users\/?$/.test(new URL(url).pathname);
}

export async function mockUserCreateApi(page: Page, options: UserCreateMockOptions = {}) {
  const handler = async (route: Route) => {
    const type = route.request().resourceType();
    if (type === 'document') {
      await route.continue();
      return;
    }

    const url = route.request().url();
    const method = route.request().method();

    if (!isCreateUserPost(url, method)) {
      await route.continue();
      return;
    }

    const body = route.request().postDataJSON() as {
      email?: string;
      username?: string;
      full_name?: string;
      role?: string;
      status?: string;
      password?: string;
    };

    if (options.fail500) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'Internal Server Error',
        }),
      });
      return;
    }

    if (options.passwordComplexity422) {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 422,
          message: 'Validation failed',
          errors: {
            password: ['Password must contain letters and numbers.'],
          },
        }),
      });
      return;
    }

    if (body.email && knownEmails.has(body.email)) {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 422,
          message: 'Validation failed',
          errors: {
            email: ['This email address is already taken. (Địa chỉ email này đã được sử dụng.)'],
          },
        }),
      });
      return;
    }

    if (body.username && knownUsernames.has(body.username)) {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 422,
          message: 'Validation failed',
          errors: {
            username: ['This username is already taken. (Tên người dùng này đã được sử dụng.)'],
          },
        }),
      });
      return;
    }

    const createdId = 99;
    if (body.email) knownEmails.add(body.email);
    if (body.username) knownUsernames.add(body.username);

    const userPayload = options.omitUserId
      ? {
          full_name: body.full_name,
          email: body.email,
          username: body.username,
          role: body.role ?? 'user',
          status: body.status ?? 'active',
        }
      : {
          id: createdId,
          full_name: body.full_name,
          email: body.email,
          username: body.username,
          role: body.role ?? 'user',
          status: body.status ?? 'active',
        };

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope({ user: userPayload }, 'User created successfully')),
    });
  };

  await page.route('**/api/v1/admin/users', handler);
  await page.route('**/admin/users', handler);
}
