import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import type { RawBlogPost } from '@/types/blog';
import {
  computeBlogStats,
  mockBlogCategories,
  mockBlogListRows,
} from '../data/blog-list.data';

const flags = {
  listFail: false,
  categoriesFail: false,
  mutationFail: false,
  deleteFailForId: null as number | null,
  statusFailForId: null as number | null,
  listEmpty: false,
  listDelayMs: 0,
  createFail: false,
  createFailStatus: 422,
  createFailMessage: 'Create blog post failed',
  categoryCreateFail: false,
  detailFailForId: null as number | null,
  detailFailStatus: 404,
  updateFail: false,
  updateFailForId: null as number | null,
  detailDelayMs: 0,
};

let uploadCounter = 0;
let lastCreatedBlogId: number | null = null;
let categoryDataset = structuredClone(mockBlogCategories);

let dataset: RawBlogPost[] = structuredClone(mockBlogListRows);

export function resetMockBlogs() {
  dataset = structuredClone(mockBlogListRows);
  categoryDataset = structuredClone(mockBlogCategories);
  flags.listFail = false;
  flags.categoriesFail = false;
  flags.mutationFail = false;
  flags.deleteFailForId = null;
  flags.statusFailForId = null;
  flags.listEmpty = false;
  flags.listDelayMs = 0;
  flags.createFail = false;
  flags.categoryCreateFail = false;
  flags.detailFailForId = null;
  flags.detailFailStatus = 404;
  flags.updateFail = false;
  flags.updateFailForId = null;
  flags.detailDelayMs = 0;
  uploadCounter = 0;
  lastCreatedBlogId = null;
}

export function setBlogListFail(on = true) {
  flags.listFail = on;
}

export function setBlogListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setBlogMutationFail(on = true) {
  flags.mutationFail = on;
}

export function setBlogDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

export function setBlogStatusFailForId(id: number | null) {
  flags.statusFailForId = id;
}

export function setBlogListDelay(ms: number) {
  flags.listDelayMs = ms;
}

export function setBlogCreateFail(on = true, status = 422, message = 'Create blog post failed') {
  flags.createFail = on;
  flags.createFailStatus = status;
  flags.createFailMessage = message;
}

export function setBlogCategoryCreateFail(on = true) {
  flags.categoryCreateFail = on;
}

export function setBlogDetailFailForId(id: number | null, status = 404) {
  flags.detailFailForId = id;
  flags.detailFailStatus = status;
}

export function setBlogUpdateFail(on = true, forId: number | null = null) {
  flags.updateFail = on;
  flags.updateFailForId = forId;
}

export function setBlogDetailDelay(ms: number) {
  flags.detailDelayMs = ms;
}

export function getMockBlogPostAfterUpdate(id: number) {
  return dataset.find((r) => r.id === id);
}

export function getLastCreatedBlogId() {
  return lastCreatedBlogId;
}

export function findMockBlogPostByTitle(title: string) {
  return dataset.find((r) => r.title === title);
}

export function getMockBlogPost(id: number) {
  return dataset.find((r) => r.id === id);
}

export function patchMockBlogPost(id: number, partial: Partial<RawBlogPost>) {
  const row = dataset.find((r) => r.id === id);
  if (row) Object.assign(row, partial);
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isListPath(url: string) {
  return /\/admin\/blog-posts\/?$/.test(pathname(url));
}

function isCategoriesPath(url: string) {
  return /\/admin\/blog-categories\/?$/.test(pathname(url));
}

function isStatusPath(url: string) {
  return /\/admin\/blog-posts\/\d+\/status\/?$/.test(pathname(url));
}

function isDetailPath(url: string) {
  const path = pathname(url);
  return /\/admin\/blog-posts\/\d+\/?$/.test(path) && !path.includes('/status');
}

function isDeletePath(url: string) {
  return isDetailPath(url);
}

function parseBlogId(path: string): number | null {
  const match = path.match(/\/admin\/blog-posts\/(\d+)/);
  return match ? Number(match[1]) : null;
}

function isCheckSlugPath(url: string) {
  return /\/admin\/blog-posts\/check-slug\/?$/.test(pathname(url));
}

function isUploadImagePath(url: string) {
  return /\/upload\/image\/?$/.test(pathname(url));
}

function nextUploadUrl(label: string) {
  uploadCounter += 1;
  return `https://picsum.photos/seed/mock-blog-${label}-${uploadCounter}/1200/630`;
}

function shouldMockRoute(url: string): boolean {
  const path = pathname(url);
  return (
    isListPath(url) ||
    isCategoriesPath(url) ||
    isCheckSlugPath(url) ||
    isUploadImagePath(url) ||
    isStatusPath(url) ||
    isDetailPath(url)
  );
}

function applySearch(rows: RawBlogPost[], search: string) {
  const term = search.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) => row.title.toLowerCase().includes(term));
}

function filterPosts(params: URLSearchParams, source: RawBlogPost[]) {
  let rows = [...source];

  const search = params.get('search') || '';
  rows = applySearch(rows, search);

  const categoryId = params.get('category_id');
  if (categoryId) {
    rows = rows.filter((row) => row.categories?.some((c) => c.id === Number(categoryId)));
  }

  const status = params.get('status');
  if (status) {
    rows = rows.filter((row) => row.status === status);
  }

  const sort = params.get('sort') || 'created_at';
  const order = params.get('order') || 'desc';
  const dir = order === 'asc' ? 1 : -1;

  rows.sort((a, b) => {
    if (sort === 'view_count') return (a.view_count - b.view_count) * dir;
    if (sort === 'created_at') {
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    }
    return 0;
  });

  return rows;
}

function paginate(params: URLSearchParams, rows: RawBlogPost[]) {
  const page = Number(params.get('page')) || 1;
  const perPage = Number(params.get('per_page')) || 10;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  return {
    data: rows.slice(start, start + perPage),
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    from: total > 0 ? start + 1 : null,
    to: total > 0 ? Math.min(start + perPage, total) : null,
  };
}

export async function mockBlogsApi(page: Page) {
  const handler = async (route: Route) => {
    const type = route.request().resourceType();
    if (['document', 'stylesheet', 'script', 'image', 'font'].includes(type)) {
      await route.continue();
      return;
    }

    const url = route.request().url();
    if (!shouldMockRoute(url)) {
      await route.continue();
      return;
    }

    const method = route.request().method();
    const params = new URL(url).searchParams;
    const path = pathname(url);

    if (method === 'GET' && isCategoriesPath(url)) {
      if (flags.categoriesFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Categories failed', 500)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(categoryDataset)),
      });
      return;
    }

    if (method === 'POST' && isCategoriesPath(url)) {
      if (flags.categoryCreateFail || flags.mutationFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Category create failed', 500)),
        });
        return;
      }
      const body = route.request().postDataJSON() as { name?: string; slug?: string };
      const nextId = Math.max(0, ...categoryDataset.map((c) => c.id)) + 1;
      const row = {
        id: nextId,
        name: String(body.name ?? `Category ${nextId}`),
        slug: String(body.slug ?? `category-${nextId}`),
        description: null,
        sort_order: nextId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        posts_count: 0,
      };
      categoryDataset = [...categoryDataset, row];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(row)),
      });
      return;
    }

    if (method === 'GET' && isCheckSlugPath(url)) {
      const slug = params.get('slug') || '';
      const exists = dataset.some((r) => r.slug === slug);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ exists })),
      });
      return;
    }

    if (method === 'POST' && isUploadImagePath(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({ url: nextUploadUrl('feat'), public_id: `mock/blog-${uploadCounter}` })
        ),
      });
      return;
    }

    if (method === 'POST' && isListPath(url)) {
      if (flags.createFail || flags.mutationFail) {
        await route.fulfill({
          status: flags.createFailStatus,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope(flags.createFailMessage, flags.createFailStatus)),
        });
        return;
      }
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const nextId = Math.max(0, ...dataset.map((r) => r.id)) + 1;
      lastCreatedBlogId = nextId;
      const categoryIds = (body.category_ids as number[]) ?? [];
      const categories = categoryDataset.filter((c) => categoryIds.includes(c.id));
      const row: RawBlogPost = {
        id: nextId,
        title: String(body.title ?? `Blog ${nextId}`),
        slug: String(body.slug ?? `blog-${nextId}`),
        excerpt: String(body.excerpt ?? ''),
        content: String(body.content ?? ''),
        featured_image: (body.featured_image as string) ?? null,
        author_id: 1,
        view_count: 0,
        status: (body.status as RawBlogPost['status']) ?? 'draft',
        published_at: (body.published_at as string) ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: { id: 1, full_name: 'Admin DaNangTrip', avatar: null },
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          sort_order: c.sort_order,
          created_at: c.created_at,
          updated_at: c.updated_at,
        })),
      };
      dataset = [row, ...dataset];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(row)),
      });
      return;
    }

    if (method === 'GET' && isListPath(url)) {
      if (flags.listDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.listDelayMs));
      }
      if (flags.listFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Blog list failed', 500)),
        });
        return;
      }
      const source = flags.listEmpty ? [] : dataset;
      const filtered = filterPosts(params, source);
      const pagePayload = paginate(params, filtered);
      const stats = computeBlogStats(source);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            ...pagePayload,
            stats,
          })
        ),
      });
      return;
    }

    if (method === 'PATCH' && isStatusPath(url)) {
      const id = parseBlogId(path);
      if (id == null) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify(errorEnvelope('Not found', 404)) });
        return;
      }
      if (flags.mutationFail || flags.statusFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Status update failed', 500)),
        });
        return;
      }
      let body: { status?: string } = {};
      try {
        body = route.request().postDataJSON() as { status?: string };
      } catch {
        body = {};
      }
      const row = dataset.find((r) => r.id === id);
      if (row && body.status) {
        row.status = body.status as RawBlogPost['status'];
        if (body.status === 'published' && !row.published_at) {
          row.published_at = new Date().toISOString();
        }
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    if (method === 'GET' && isDetailPath(url)) {
      const id = parseBlogId(path);
      if (id == null) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Blog post not found', 404)),
        });
        return;
      }
      if (flags.detailFailForId === id) {
        await route.fulfill({
          status: flags.detailFailStatus,
          contentType: 'application/json',
          body: JSON.stringify(
            errorEnvelope(
              flags.detailFailStatus === 404 ? 'Blog post not found' : 'Blog detail failed',
              flags.detailFailStatus
            )
          ),
        });
        return;
      }
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Blog post not found', 404)),
        });
        return;
      }
      if (flags.detailDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.detailDelayMs));
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(row)),
      });
      return;
    }

    if (method === 'PUT' && isDetailPath(url)) {
      const id = parseBlogId(path);
      if (id == null) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Blog post not found', 404)),
        });
        return;
      }
      if (flags.updateFail || flags.mutationFail || flags.updateFailForId === id) {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Update blog post failed', 422)),
        });
        return;
      }
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Blog post not found', 404)),
        });
        return;
      }
      let body: Record<string, unknown> = {};
      try {
        body = route.request().postDataJSON() as Record<string, unknown>;
      } catch {
        body = {};
      }
      const categoryIds = (body.category_ids as number[]) ?? row.categories?.map((c) => c.id) ?? [];
      const categories = categoryDataset.filter((c) => categoryIds.includes(c.id));
      if (body.title != null) row.title = String(body.title);
      if (body.content != null) row.content = String(body.content);
      if (body.excerpt !== undefined) row.excerpt = body.excerpt == null ? null : String(body.excerpt);
      if (body.featured_image !== undefined) row.featured_image = (body.featured_image as string) ?? null;
      if (body.status != null) row.status = body.status as RawBlogPost['status'];
      if (body.published_at !== undefined) {
        row.published_at = body.published_at == null ? null : String(body.published_at);
      }
      row.updated_at = new Date().toISOString();
      row.categories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        sort_order: c.sort_order,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(row)),
      });
      return;
    }

    if (method === 'DELETE' && isDeletePath(url)) {
      const id = parseBlogId(path);
      if (id == null) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify(errorEnvelope('Not found', 404)) });
        return;
      }
      if (flags.mutationFail || flags.deleteFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Delete failed', 500)),
        });
        return;
      }
      dataset = dataset.filter((r) => r.id !== id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/*', handler);
  await page.route('**/api/v1/upload/**', handler);
  await page.route('**/upload/**', handler);
}
