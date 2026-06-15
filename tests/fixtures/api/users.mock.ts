import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import type { RawUserItem, RawUserListResponse, UserStats } from '../data/users.data';
import { mockUserListResponse, mockPaginatedUserListResponse } from '../data/users.data';

type UserListHandler = (params: URLSearchParams) => RawUserListResponse;

interface MockUsersApiOptions {
  listHandler?: UserListHandler;
  paginated?: boolean;
  onStatusUpdate?: (id: number, status: string) => void;
  onRoleUpdate?: (id: number, role: string) => void;
  onDelete?: (id: number) => void;
  exportFail?: boolean;
  mutationFail?: boolean;
  exportDelayMs?: number;
  listDelayMs?: number;
}

const flags = {
  exportFail: false,
  mutationFail: false,
  exportDelayMs: 0,
  listDelayMs: 0,
};

let lastExportQuery = '';

export function resetMockUsersFlags() {
  flags.exportFail = false;
  flags.mutationFail = false;
  flags.exportDelayMs = 0;
  flags.listDelayMs = 0;
  lastExportQuery = '';
}

export function setUsersExportFail(on = true) {
  flags.exportFail = on;
}

export function setUsersMutationFail(on = true) {
  flags.mutationFail = on;
}

export function setUsersExportDelay(ms: number) {
  flags.exportDelayMs = ms;
}

export function setUsersListDelay(ms: number) {
  flags.listDelayMs = ms;
}

export function getLastUsersExportQuery() {
  return lastExportQuery;
}

function computeStats(rows: RawUserItem[]): UserStats {
  return {
    total: rows.length,
    active: rows.filter((u) => u.status === 'active').length,
    banned: rows.filter((u) => u.status === 'banned').length,
    admin: rows.filter((u) => u.role === 'admin').length,
  };
}

function filterUsers(params: URLSearchParams, source: RawUserListResponse): RawUserListResponse {
  let rows = [...source.data];
  const q = (params.get('q') || '').trim().toLowerCase();
  const role = params.get('role') || '';
  const status = params.get('status') || '';
  const sortBy = params.get('sort_by') || 'created_at';
  const sortOrder = params.get('sort_order') || 'desc';

  if (q) {
    rows = rows.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    );
  }
  if (role) rows = rows.filter((u) => u.role === role);
  if (status) rows = rows.filter((u) => u.status === status);

  rows.sort((a, b) => {
    const field = sortBy === 'full_name' ? 'full_name' : sortBy === 'email' ? 'email' : 'created_at';
    const av = String(a[field as keyof RawUserItem] ?? '');
    const bv = String(b[field as keyof RawUserItem] ?? '');
    const cmp = av.localeCompare(bv);
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const stats = computeStats(source.data);
  return { ...source, data: rows, total: rows.length, stats };
}

function paginate(params: URLSearchParams, filtered: RawUserListResponse): RawUserListResponse {
  const page = Number(params.get('page')) || 1;
  const perPage = Number(params.get('per_page')) || 10;
  const total = filtered.data.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  return {
    ...filtered,
    data: filtered.data.slice(start, start + perPage),
    current_page: page,
    per_page: perPage,
    last_page: lastPage,
    total,
  };
}

function isUsersListUrl(url: string): boolean {
  return /\/admin\/users\/?$/.test(new URL(url).pathname);
}

function isUsersExportUrl(url: string): boolean {
  return /\/admin\/users\/export\/?$/.test(new URL(url).pathname);
}

function isUserStatusUrl(url: string): { id: number } | null {
  const match = new URL(url).pathname.match(/\/admin\/users\/(\d+)\/status\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function isUserRoleUrl(url: string): { id: number } | null {
  const match = new URL(url).pathname.match(/\/admin\/users\/(\d+)\/role\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function isUserDeleteUrl(url: string): { id: number } | null {
  const match = new URL(url).pathname.match(/\/admin\/users\/(\d+)\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function shouldMockApiRoute(route: Route): boolean {
  const type = route.request().resourceType();
  if (['document', 'stylesheet', 'script', 'image', 'font'].includes(type)) return false;
  const url = route.request().url();
  return (
    isUsersListUrl(url) ||
    isUsersExportUrl(url) ||
    isUserStatusUrl(url) !== null ||
    isUserRoleUrl(url) !== null ||
    isUserDeleteUrl(url) !== null
  );
}

export async function mockUsersApi(page: Page, options: MockUsersApiOptions = {}) {
  resetMockUsersFlags();
  flags.exportFail = options.exportFail ?? false;
  flags.mutationFail = options.mutationFail ?? false;
  flags.exportDelayMs = options.exportDelayMs ?? 0;
  flags.listDelayMs = options.listDelayMs ?? 0;
  const baseSource = options.paginated ? mockPaginatedUserListResponse : mockUserListResponse;
  let dataset = structuredClone(baseSource);

  const buildListPayload = (params: URLSearchParams) => {
    const allRows = {
      ...structuredClone(dataset),
      stats: computeStats(dataset.data),
    };
    const filtered = options.listHandler
      ? options.listHandler(params)
      : filterUsers(params, allRows);
    return paginate(params, filtered);
  };

  const handler = async (route: Route) => {
    if (!shouldMockApiRoute(route)) {
      await route.continue();
      return;
    }

    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && isUsersExportUrl(url)) {
      lastExportQuery = new URL(url).search;
      if (flags.exportDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.exportDelayMs));
      }
      if (flags.exportFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Export failed', 500)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers: { 'Content-Disposition': 'attachment; filename="users-report.xlsx"' },
        body: Buffer.from('mock-xlsx-content'),
      });
      return;
    }

    if (method === 'GET' && isUsersListUrl(url)) {
      if (flags.listDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.listDelayMs));
      }
      const params = new URL(url).searchParams;
      const payload = buildListPayload(params);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(payload)),
      });
      return;
    }

    if (method === 'PATCH' && isUserStatusUrl(url)) {
      if (flags.mutationFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Status update failed', 500)),
        });
        return;
      }
      const match = isUserStatusUrl(url)!;
      const body = route.request().postDataJSON() as { status?: string };
      dataset = {
        ...dataset,
        data: dataset.data.map((row) =>
          row.id === match.id ? { ...row, status: body.status as RawUserItem['status'] } : row
        ),
      };
      options.onStatusUpdate?.(match.id, body.status!);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Status updated')),
      });
      return;
    }

    if (method === 'PATCH' && isUserRoleUrl(url)) {
      if (flags.mutationFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Role update failed', 500)),
        });
        return;
      }
      const match = isUserRoleUrl(url)!;
      const body = route.request().postDataJSON() as { role?: string };
      dataset = {
        ...dataset,
        data: dataset.data.map((row) =>
          row.id === match.id ? { ...row, role: body.role as RawUserItem['role'] } : row
        ),
      };
      options.onRoleUpdate?.(match.id, body.role!);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Role updated')),
      });
      return;
    }

    if (method === 'DELETE' && isUserDeleteUrl(url)) {
      if (flags.mutationFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Delete failed', 500)),
        });
        return;
      }
      const match = isUserDeleteUrl(url)!;
      dataset = { ...dataset, data: dataset.data.filter((row) => row.id !== match.id) };
      options.onDelete?.(match.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Deleted')),
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/admin/users**', handler);
  await page.route('**/admin/users**', handler);
}
