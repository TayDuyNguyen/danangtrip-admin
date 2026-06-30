import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import {
  expectedLocationCategoryStats,
  mockLocationCategoryListRows,
  type MockLocationCategoryRow,
} from '../data/location-categories.data';

const flags = {
  listFail: false,
  listEmpty: false,
  createFail: false,
  updateFailForId: null as number | null,
  statusFailForId: null as number | null,
  deleteFailForId: null as number | null,
  reorderFail: false,
};

let dataset: MockLocationCategoryRow[] = structuredClone(mockLocationCategoryListRows);
let nextId = 100;

export function resetMockLocationCategories() {
  dataset = structuredClone(mockLocationCategoryListRows);
  nextId = 100;
  flags.listFail = false;
  flags.listEmpty = false;
  flags.createFail = false;
  flags.updateFailForId = null;
  flags.statusFailForId = null;
  flags.deleteFailForId = null;
  flags.reorderFail = false;
}

export function setLocationCategoryListFail(on = true) {
  flags.listFail = on;
}

export function setLocationCategoryListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setLocationCategoryCreateFail(on = true) {
  flags.createFail = on;
}

export function setLocationCategoryUpdateFailForId(id: number | null) {
  flags.updateFailForId = id;
}

export function setLocationCategoryStatusFailForId(id: number | null) {
  flags.statusFailForId = id;
}

export function setLocationCategoryDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

export function setLocationCategoryReorderFail(on = true) {
  flags.reorderFail = on;
}

export function getMockLocationCategoryById(id: number) {
  return dataset.find((r) => r.id === id);
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isListPath(url: string) {
  return /\/admin\/categories$/.test(pathname(url));
}

function isReorderPath(url: string) {
  return /\/admin\/categories\/reorder$/.test(pathname(url));
}

function parseCategoryId(path: string): number | null {
  const m = path.match(/\/admin\/categories\/(\d+)(?:\/|$)/);
  return m ? Number(m[1]) : null;
}

function isStatusPath(url: string) {
  return /\/admin\/categories\/\d+\/status$/.test(pathname(url));
}

function isDetailPath(url: string) {
  const path = pathname(url);
  return /\/admin\/categories\/\d+$/.test(path) && !path.includes('/status');
}

function filterCategories(url: string) {
  const params = new URL(url).searchParams;
  let rows = [...dataset].sort((a, b) => a.sort_order - b.sort_order);

  const search = params.get('search')?.trim().toLowerCase();
  const status = params.get('status');

  if (search) {
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.slug.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search)
    );
  }

  if (status === 'active' || status === 'inactive') {
    rows = rows.filter((r) => r.status === status);
  }

  return rows;
}

function buildListPayload(url: string) {
  const rows = filterCategories(url);
  const withStats = new URL(url).searchParams.get('with_stats') === 'true';

  const categories = {
    data: rows,
    current_page: 1,
    last_page: 1,
    per_page: rows.length || 1,
    total: rows.length,
  };

  if (!withStats) {
    return categories;
  }

  return {
    categories,
    stats: {
      total_categories: expectedLocationCategoryStats.total,
      active_categories: expectedLocationCategoryStats.active,
      inactive_categories: expectedLocationCategoryStats.inactive,
    },
  };
}

function mapCreateBody(body: Record<string, unknown>, id: number): MockLocationCategoryRow {
  const now = new Date().toISOString();
  const maxOrder = dataset.reduce((max, r) => Math.max(max, r.sort_order), 0);
  return {
    id,
    name: String(body.name ?? ''),
    slug: String(body.slug ?? ''),
    description: String(body.description ?? ''),
    icon: String(body.icon ?? 'Map'),
    sort_order: Number(body.sort_order ?? maxOrder + 1),
    status: (body.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    locations_count: 0,
    icon_background: String(body.icon_background ?? '#E0F2FE'),
    created_at: now,
    updated_at: now,
  };
}

export async function mockLocationCategoriesApi(page: Page) {
  const handler = async (route: Route) => {
    const request = route.request();
    const url = request.url();
    if (!url.includes('/api/v1/admin/categories')) {
      await route.continue();
      return;
    }

    const method = request.method();
    const path = pathname(url);

    if (method === 'GET' && isListPath(url)) {
      if (flags.listFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('List categories failed', 500)),
        });
        return;
      }

      const payload = flags.listEmpty
        ? {
            categories: { data: [], current_page: 1, last_page: 1, per_page: 1, total: 0 },
            stats: {
              total_categories: 0,
              active_categories: 0,
              inactive_categories: 0,
            },
          }
        : buildListPayload(url);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(payload)),
      });
      return;
    }

    if (method === 'POST' && isListPath(url)) {
      if (flags.createFail) {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Create category failed', 422)),
        });
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      const created = mapCreateBody(body, nextId++);
      dataset.push(created);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ category: created }, 'Category created successfully')),
      });
      return;
    }

    if (method === 'PUT' && isDetailPath(url)) {
      const id = parseCategoryId(path);
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Category not found', 404)),
        });
        return;
      }
      if (flags.updateFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Update failed', 500)),
        });
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      const updated: MockLocationCategoryRow = {
        ...row,
        name: String(body.name ?? row.name),
        slug: String(body.slug ?? row.slug),
        description: String(body.description ?? row.description),
        icon: String(body.icon ?? row.icon),
        icon_background: String(body.icon_background ?? row.icon_background),
        status: (body.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
        updated_at: new Date().toISOString(),
      };
      dataset = dataset.map((r) => (r.id === id ? updated : r));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ category: updated }, 'Category updated successfully')),
      });
      return;
    }

    if (method === 'PATCH' && isStatusPath(url)) {
      const id = parseCategoryId(path);
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Category not found', 404)),
        });
        return;
      }
      if (flags.statusFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Status update failed', 500)),
        });
        return;
      }
      const body = request.postDataJSON() as { status?: string };
      const nextStatus = body.status === 'inactive' ? 'inactive' : 'active';
      dataset = dataset.map((r) =>
        r.id === id ? { ...r, status: nextStatus, updated_at: new Date().toISOString() } : r
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Category status updated successfully')),
      });
      return;
    }

    if (method === 'PATCH' && isReorderPath(url)) {
      if (flags.reorderFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Reorder failed', 500)),
        });
        return;
      }
      const body = request.postDataJSON() as { items?: { id: number; sort_order: number }[] };
      const items = body.items ?? [];
      for (const item of items) {
        dataset = dataset.map((r) =>
          r.id === item.id ? { ...r, sort_order: item.sort_order } : r
        );
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Categories reordered successfully')),
      });
      return;
    }

    if (method === 'DELETE' && isDetailPath(url)) {
      const id = parseCategoryId(path);
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Category not found', 404)),
        });
        return;
      }
      if (flags.deleteFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Delete failed', 500)),
        });
        return;
      }
      if (row.locations_count > 0) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify(
            errorEnvelope('Cannot delete category because it has locations', 400)
          ),
        });
        return;
      }
      dataset = dataset.filter((r) => r.id !== id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Category deleted successfully')),
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/admin/categories**', handler);
}
