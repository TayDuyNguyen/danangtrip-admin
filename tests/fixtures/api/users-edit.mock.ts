import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';
import type { RawUserItem } from '../data/users.data';
import {
  mockAdminUser,
  mockCustomerUser,
  mockStaffLikeUser,
  mockBannedUser,
  mockSecondaryAdmin,
} from '../data/users.data';

const usersById = new Map<number, RawUserItem>([
  [1, structuredClone(mockAdminUser)],
  [2, structuredClone(mockStaffLikeUser)],
  [3, structuredClone(mockCustomerUser)],
  [4, structuredClone(mockBannedUser)],
  [5, structuredClone(mockSecondaryAdmin)],
]);

export interface MockUserEditApiOptions {
  detailDelayMs?: number;
  putDelayMs?: number;
  patchDelayMs?: number;
  roleFail?: boolean;
  statusFail?: boolean;
  deleteFail?: boolean;
  putFail?: boolean;
}

const flags: Required<MockUserEditApiOptions> = {
  detailDelayMs: 0,
  putDelayMs: 0,
  patchDelayMs: 0,
  roleFail: false,
  statusFail: false,
  deleteFail: false,
  putFail: false,
};

function getUserIdFromPath(pathname: string): number | null {
  const match = pathname.match(/\/admin\/users\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function getRoleUserId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/users\/(\d+)\/role\/?$/);
  return match ? Number(match[1]) : null;
}

function getStatusUserId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/users\/(\d+)\/status\/?$/);
  return match ? Number(match[1]) : null;
}

function getDeleteUserId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/users\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function failResponse(message: string, status = 500) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify({ code: status, message, data: null }),
  };
}

export async function mockUserEditApi(page: Page, options: MockUserEditApiOptions = {}) {
  flags.detailDelayMs = options.detailDelayMs ?? 0;
  flags.putDelayMs = options.putDelayMs ?? 0;
  flags.patchDelayMs = options.patchDelayMs ?? 0;
  flags.roleFail = options.roleFail ?? false;
  flags.statusFail = options.statusFail ?? false;
  flags.deleteFail = options.deleteFail ?? false;
  flags.putFail = options.putFail ?? false;

  const handler = async (route: Route) => {
    const type = route.request().resourceType();
    if (type === 'document') {
      await route.continue();
      return;
    }

    const url = route.request().url();
    const method = route.request().method();
    const pathname = new URL(url).pathname;

    const roleUserId = method === 'PATCH' ? getRoleUserId(pathname) : null;
    if (roleUserId !== null) {
      if (flags.patchDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.patchDelayMs));
      }
      if (flags.roleFail) {
        await route.fulfill(failResponse('Role update failed'));
        return;
      }
      const user = usersById.get(roleUserId);
      if (!user) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
        return;
      }
      const body = route.request().postDataJSON() as { role?: RawUserItem['role'] };
      const updated = { ...user, role: body.role ?? user.role };
      usersById.set(roleUserId, updated);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Role updated')),
      });
      return;
    }

    const statusUserId = method === 'PATCH' ? getStatusUserId(pathname) : null;
    if (statusUserId !== null) {
      if (flags.patchDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.patchDelayMs));
      }
      if (flags.statusFail) {
        await route.fulfill(failResponse('Status update failed'));
        return;
      }
      const user = usersById.get(statusUserId);
      if (!user) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
        return;
      }
      const body = route.request().postDataJSON() as { status?: RawUserItem['status'] };
      const updated = { ...user, status: body.status ?? user.status };
      usersById.set(statusUserId, updated);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Status updated')),
      });
      return;
    }

    if (method === 'DELETE') {
      if (flags.deleteFail) {
        await route.fulfill(failResponse('Delete failed'));
        return;
      }
      const deleteId = getDeleteUserId(pathname);
      if (deleteId && usersById.has(deleteId)) {
        usersById.delete(deleteId);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope(null, 'Deleted')),
        });
        return;
      }
    }

    const userId = method === 'GET' || method === 'PUT' ? getUserIdFromPath(pathname) : null;
    if (!userId) {
      await route.continue();
      return;
    }

    const user = usersById.get(userId);
    if (!user) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ code: 404, message: 'User not found', data: null }),
      });
      return;
    }

    if (method === 'GET') {
      if (flags.detailDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.detailDelayMs));
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(user)),
      });
      return;
    }

    if (flags.putDelayMs > 0) {
      await new Promise((r) => setTimeout(r, flags.putDelayMs));
    }
    if (flags.putFail) {
      await route.fulfill(failResponse('Update failed'));
      return;
    }

    const body = route.request().postDataJSON() as Partial<RawUserItem>;
    if (body.email) {
      const duplicate = [...usersById.values()].find(
        (row) => row.id !== userId && row.email === body.email
      );
      if (duplicate) {
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
    }

    const updated: RawUserItem = {
      ...user,
      full_name: body.full_name ?? user.full_name,
      email: body.email ?? user.email,
      phone: body.phone ?? user.phone,
      birthdate: body.birthdate ?? user.birthdate,
      gender: body.gender ?? user.gender,
      city: body.city ?? user.city,
      role: (body.role as RawUserItem['role']) ?? user.role,
      status: (body.status as RawUserItem['status']) ?? user.status,
      updated_at: new Date().toISOString(),
    };
    usersById.set(userId, updated);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope({ user: updated }, 'User updated successfully')),
    });
  };

  await page.route('**/api/v1/admin/users**', handler);
  await page.route('**/admin/users**', handler);
}

export function getMockEditedUser(id: number) {
  return usersById.get(id);
}

export function resetMockEditUsers() {
  usersById.set(1, structuredClone(mockAdminUser));
  usersById.set(2, structuredClone(mockStaffLikeUser));
  usersById.set(3, structuredClone(mockCustomerUser));
  usersById.set(4, structuredClone(mockBannedUser));
  usersById.set(5, structuredClone(mockSecondaryAdmin));
}
