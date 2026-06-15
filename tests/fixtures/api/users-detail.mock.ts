import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';
import type { RawUserItem } from '../data/users.data';
import {
  mockAdminUser,
  mockBannedUser,
  mockCustomerUser,
  mockStaffLikeUser,
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
]);

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

export async function mockUserDetailApi(page: Page) {
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
}
