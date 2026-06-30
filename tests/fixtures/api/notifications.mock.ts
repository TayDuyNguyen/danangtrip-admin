import type { Page, Route } from '@playwright/test';
import type { RawNotificationItem } from '@/types/notification';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import { mockNotificationListRows } from '../data/notifications.data';
import { mockPaginatedUserListResponse } from '../data/users.data';

const flags = {
  listFail: false,
  listEmpty: false,
  listDelayMs: 0,
  deleteFailForId: null as number | null,
  sendFail: false,
  sendAllFail: false,
  sendDelayMs: 0,
};

let dataset: RawNotificationItem[] = structuredClone(mockNotificationListRows);
let lastListQuery: Record<string, string> = {};
let lastSendBody: Record<string, unknown> | null = null;
let lastSendAllBody: Record<string, unknown> | null = null;

export function resetMockNotifications() {
  dataset = structuredClone(mockNotificationListRows);
  flags.listFail = false;
  flags.listEmpty = false;
  flags.listDelayMs = 0;
  flags.deleteFailForId = null;
  flags.sendFail = false;
  flags.sendAllFail = false;
  flags.sendDelayMs = 0;
  lastListQuery = {};
  lastSendBody = null;
  lastSendAllBody = null;
}

export function setNotificationListFail(on = true) {
  flags.listFail = on;
}

export function setNotificationListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setNotificationListDelay(ms: number) {
  flags.listDelayMs = ms;
}

export function setNotificationDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

export function setNotificationSendFail(on = true) {
  flags.sendFail = on;
}

export function setNotificationSendAllFail(on = true) {
  flags.sendAllFail = on;
}

export function setNotificationSendDelay(ms: number) {
  flags.sendDelayMs = ms;
}

export function getLastNotificationListQuery() {
  return lastListQuery;
}

export function getLastNotificationSendBody() {
  return lastSendBody;
}

export function getLastNotificationSendAllBody() {
  return lastSendAllBody;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isNotificationsListPath(path: string) {
  return /\/admin\/notifications\/?$/.test(path);
}

function isNotificationsSendPath(path: string) {
  return /\/admin\/notifications\/send\/?$/.test(path);
}

function isNotificationsSendAllPath(path: string) {
  return /\/admin\/notifications\/send-all\/?$/.test(path);
}

function parseNotificationId(path: string): number | null {
  const m = path.match(/\/admin\/notifications\/(\d+)$/);
  return m ? Number(m[1]) : null;
}

function filterRows(url: string) {
  const params = new URL(url).searchParams;
  lastListQuery = Object.fromEntries(params.entries());

  let rows = [...dataset].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const search = params.get('search')?.trim().toLowerCase();
  const type = params.get('type');
  const isRead = params.get('is_read');
  const userId = params.get('user_id');
  const sortBy = params.get('sort_by') || 'created_at';
  const sortOrder = params.get('sort_order') || 'desc';
  const page = Math.max(1, Number(params.get('page') || 1));
  const perPage = Math.max(1, Number(params.get('per_page') || 10));

  if (search) {
    rows = rows.filter((row) => {
      const haystack = [row.title, row.content, row.user?.email ?? '', row.user?.full_name ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (type) {
    rows = rows.filter((row) => row.type === type);
  }

  if (isRead === '1') {
    rows = rows.filter((row) => row.is_read);
  } else if (isRead === '0') {
    rows = rows.filter((row) => !row.is_read);
  }

  if (userId) {
    rows = rows.filter((row) => String(row.user_id) === userId);
  }

  rows.sort((a, b) => {
    const av = sortBy === 'created_at' ? new Date(a.created_at).getTime() : a.id;
    const bv = sortBy === 'created_at' ? new Date(b.created_at).getTime() : b.id;
    return sortOrder === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });

  const total = rows.length;
  const read = rows.filter((r) => r.is_read).length;
  const unread = rows.filter((r) => !r.is_read).length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const data = rows.slice(start, start + perPage);

  return {
    data,
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    stats: { total, read, unread },
  };
}

async function handleNotificationsRoute(route: Route) {
  const url = route.request().url();
  const path = pathname(url);
  const method = route.request().method();

  if (method === 'GET' && isNotificationsListPath(path)) {
    if (flags.listDelayMs > 0) {
      await new Promise((r) => setTimeout(r, flags.listDelayMs));
    }
    if (flags.listFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('List failed')),
      });
      return;
    }
    if (flags.listEmpty) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            stats: { total: 0, read: 0, unread: 0 },
          })
        ),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(filterRows(url))),
    });
    return;
  }

  const notifId = parseNotificationId(path);
  if (method === 'DELETE' && notifId !== null) {
    if (flags.deleteFailForId === notifId) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Delete failed')),
      });
      return;
    }
    dataset = dataset.filter((row) => row.id !== notifId);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(null)),
    });
    return;
  }

  if (method === 'POST' && isNotificationsSendPath(path)) {
    if (flags.sendDelayMs > 0) {
      await new Promise((r) => setTimeout(r, flags.sendDelayMs));
    }
    if (flags.sendFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Send failed')),
      });
      return;
    }
    lastSendBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope({ id: 999, ...lastSendBody })),
    });
    return;
  }

  if (method === 'POST' && isNotificationsSendAllPath(path)) {
    if (flags.sendDelayMs > 0) {
      await new Promise((r) => setTimeout(r, flags.sendDelayMs));
    }
    if (flags.sendAllFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Send all failed')),
      });
      return;
    }
    lastSendAllBody = route.request().postDataJSON() as Record<string, unknown>;
    const sentCount = mockPaginatedUserListResponse.data.filter((u) => u.status === 'active').length + 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope({ sent_count: sentCount })),
    });
    return;
  }

  await route.fallback();
}

export async function mockNotificationsApi(page: Page) {
  await page.route('**/api/v1/admin/notifications**', handleNotificationsRoute);
}
