import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import {
  mockBlogCategoryListRows,
  type MockBlogCategoryRow,
} from '../data/blog-categories.data';

const flags = {
  listFail: false,
  listEmpty: false,
  createFail: false,
  updateFailForId: null as number | null,
  deleteFailForId: null as number | null,
  reorderFail: false,
};

let dataset: MockBlogCategoryRow[] = structuredClone(mockBlogCategoryListRows);
let nextId = 100;

export function resetMockBlogCategories() {
  dataset = structuredClone(mockBlogCategoryListRows);
  nextId = 100;
  flags.listFail = false;
  flags.listEmpty = false;
  flags.createFail = false;
  flags.updateFailForId = null;
  flags.deleteFailForId = null;
  flags.reorderFail = false;
}

export function setBlogCategoryListFail(on = true) {
  flags.listFail = on;
}

export function setBlogCategoryListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setBlogCategoryCreateFail(on = true) {
  flags.createFail = on;
}

export function setBlogCategoryUpdateFailForId(id: number | null) {
  flags.updateFailForId = id;
}

export function setBlogCategoryDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

export function setBlogCategoryReorderFail(on = true) {
  flags.reorderFail = on;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isListPath(url: string) {
  return /\/admin\/blog-categories$/.test(pathname(url));
}

function isReorderPath(url: string) {
  return /\/admin\/blog-categories\/reorder$/.test(pathname(url));
}

function isDetailPath(url: string) {
  return /\/admin\/blog-categories\/\d+$/.test(pathname(url));
}

function parseCategoryId(path: string): number | null {
  const m = path.match(/\/admin\/blog-categories\/(\d+)(?:\/|$)/);
  return m ? Number(m[1]) : null;
}

function mapCreateBody(body: Record<string, unknown>, id: number): MockBlogCategoryRow {
  const now = new Date().toISOString();
  const maxOrder = dataset.reduce((max, r) => Math.max(max, r.sort_order), 0);
  return {
    id,
    name: String(body.name ?? ''),
    slug: String(body.slug ?? ''),
    description: body.description == null ? null : String(body.description),
    sort_order: Number(body.sort_order ?? maxOrder + 1),
    posts_count: 0,
    created_at: now,
    updated_at: now,
  };
}

export async function mockBlogCategoriesApi(page: Page) {
  const handler = async (route: Route) => {
    const request = route.request();
    const url = request.url();
    if (!url.includes('/api/v1/admin/blog-categories')) {
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
          body: JSON.stringify(errorEnvelope('List blog categories failed', 500)),
        });
        return;
      }
      const rows = flags.listEmpty ? [] : [...dataset].sort((a, b) => a.sort_order - b.sort_order);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(rows)),
      });
      return;
    }

    if (method === 'POST' && isListPath(url)) {
      if (flags.createFail) {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Create blog category failed', 422)),
        });
        return;
      }
      const body = request.postDataJSON() as Record<string, unknown>;
      const created = mapCreateBody(body, nextId++);
      dataset.push(created);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(created, 'Blog category created successfully')),
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
          body: JSON.stringify(errorEnvelope('Blog category not found', 404)),
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
      const updated: MockBlogCategoryRow = {
        ...row,
        name: String(body.name ?? row.name),
        slug: String(body.slug ?? row.slug),
        description: body.description == null ? null : String(body.description ?? row.description ?? ''),
        updated_at: new Date().toISOString(),
      };
      dataset = dataset.map((r) => (r.id === id ? updated : r));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(updated, 'Blog category updated successfully')),
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
      for (const item of body.items ?? []) {
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
          body: JSON.stringify(errorEnvelope('Blog category not found', 404)),
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
      if (row.posts_count > 0) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Cannot delete category with associated posts', 400)),
        });
        return;
      }
      dataset = dataset.filter((r) => r.id !== id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null, 'Blog category deleted successfully')),
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/admin/blog-categories**', handler);
}
