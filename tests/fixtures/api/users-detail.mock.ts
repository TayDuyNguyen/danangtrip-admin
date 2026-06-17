import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';
import { shouldRegisterMockRoutes } from '../../helpers/mockRouteOnce';
import type { RawUserItem } from '../data/users.data';
import {
  mockAdminUser,
  mockBannedUser,
  mockCustomerUser,
  mockStaffLikeUser,
  mockSecondaryAdmin,
  mockPendingUser,
} from '../data/users.data';
import {
  mockBookingsForCustomer,
  mockRatingsForCustomer,
} from '../data/users-detail.data';

const usersById = new Map<number, RawUserItem>([
  [1, structuredClone(mockAdminUser)],
  [2, structuredClone(mockStaffLikeUser)],
  [3, structuredClone(mockCustomerUser)],
  [4, structuredClone(mockBannedUser)],
  [5, structuredClone(mockSecondaryAdmin)],
  [6, structuredClone(mockPendingUser)],
]);

export interface MockUserDetailApiOptions {
  detailDelayMs?: number;
  bookingsFail?: boolean;
  ratingsFail?: boolean;
  roleFail?: boolean;
  statusFail?: boolean;
  deleteFail?: boolean;
}

const flags: Required<MockUserDetailApiOptions> = {
  detailDelayMs: 0,
  bookingsFail: false,
  ratingsFail: false,
  roleFail: false,
  statusFail: false,
  deleteFail: false,
};

function parseSubResource(pathname: string): { userId: number; resource: 'bookings' | 'ratings' } | null {
  const match = pathname.match(/\/admin\/users\/(\d+)\/(bookings|ratings)\/?$/);
  if (!match) return null;
  return { userId: Number(match[1]), resource: match[2] as 'bookings' | 'ratings' };
}

function getRoleUserId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/users\/(\d+)\/role\/?$/);
  return match ? Number(match[1]) : null;
}

function getStatusUserId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/users\/(\d+)\/status\/?$/);
  return match ? Number(match[1]) : null;
}

function getDetailUserId(pathname: string): number | null {
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

export async function mockUserDetailApi(page: Page, options: MockUserDetailApiOptions = {}) {
  flags.detailDelayMs = options.detailDelayMs ?? 0;
  flags.bookingsFail = options.bookingsFail ?? false;
  flags.ratingsFail = options.ratingsFail ?? false;
  flags.roleFail = options.roleFail ?? false;
  flags.statusFail = options.statusFail ?? false;
  flags.deleteFail = options.deleteFail ?? false;

  if (!shouldRegisterMockRoutes(page, 'users-detail')) {
    return;
  }

  const handler = async (route: Route) => {
    const type = route.request().resourceType();
    if (type === 'document') {
      await route.continue();
      return;
    }

    const url = route.request().url();
    const method = route.request().method();
    const pathname = new URL(url).pathname;

    const sub = method === 'GET' ? parseSubResource(pathname) : null;
    if (sub) {
      const user = usersById.get(sub.userId);
      if (!user) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
        return;
      }

      if (sub.resource === 'bookings') {
        if (flags.bookingsFail) {
          await route.fulfill(failResponse('Bookings fetch failed'));
          return;
        }
        const rows =
          sub.userId === 3 && (user.bookings_count ?? 0) > 0 ? mockBookingsForCustomer : [];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            successEnvelope({
              data: rows,
              total: sub.userId === 3 ? 10 : 0,
              current_page: 1,
              last_page: sub.userId === 3 ? 2 : 1,
              per_page: 5,
            })
          ),
        });
        return;
      }

      if (flags.ratingsFail) {
        await route.fulfill(failResponse('Ratings fetch failed'));
        return;
      }
      const ratingRows =
        sub.userId === 3 && (user.reviews_count ?? 0) > 0 ? mockRatingsForCustomer : [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            data: ratingRows,
            total: sub.userId === 3 ? 5 : 0,
            current_page: 1,
            last_page: 1,
            per_page: 3,
          })
        ),
      });
      return;
    }

    const roleUserId = method === 'PATCH' ? getRoleUserId(pathname) : null;
    if (roleUserId !== null) {
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
      usersById.set(roleUserId, { ...user, role: body.role ?? user.role });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Role updated')),
      });
      return;
    }

    const statusUserId = method === 'PATCH' ? getStatusUserId(pathname) : null;
    if (statusUserId !== null) {
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
      usersById.set(statusUserId, { ...user, status: body.status ?? user.status });
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
      const deleteId = getDetailUserId(pathname);
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

    const userId = method === 'GET' ? getDetailUserId(pathname) : null;
    if (userId !== null) {
      const user = usersById.get(userId);
      if (!user) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ code: 404, message: 'User not found', data: null }),
        });
        return;
      }
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

    await route.continue();
  };

  await page.route('**/api/v1/admin/users**', handler);
  await page.route('**/admin/users**', handler);
}

export function getMockDetailUser(id: number) {
  return usersById.get(id);
}

export function resetMockDetailUsers() {
  usersById.set(1, structuredClone(mockAdminUser));
  usersById.set(2, structuredClone(mockStaffLikeUser));
  usersById.set(3, structuredClone(mockCustomerUser));
  usersById.set(4, structuredClone(mockBannedUser));
  usersById.set(5, structuredClone(mockSecondaryAdmin));
  usersById.set(6, structuredClone(mockPendingUser));
}
