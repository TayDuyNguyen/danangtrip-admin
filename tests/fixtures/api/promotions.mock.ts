import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import type { Promotion, PromotionFormInput, PromotionStatus } from '@/types/promotion.types';
import { mockPromotionListRows } from '../data/promotions-list.data';

const flags = {
  listFail: false,
  listEmpty: false,
  listDelayMs: 0,
  createFail: false,
  updateFail: false,
  updateFailForId: null as number | null,
  statusFailForId: null as number | null,
  deleteFailForId: null as number | null,
};

let dataset: Promotion[] = structuredClone(mockPromotionListRows);
let nextId = 100;

export function resetMockPromotions() {
  dataset = structuredClone(mockPromotionListRows);
  nextId = 100;
  flags.listFail = false;
  flags.listEmpty = false;
  flags.listDelayMs = 0;
  flags.createFail = false;
  flags.updateFail = false;
  flags.updateFailForId = null;
  flags.statusFailForId = null;
  flags.deleteFailForId = null;
}

export function setPromotionListFail(on = true) {
  flags.listFail = on;
}

export function setPromotionListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setPromotionCreateFail(on = true) {
  flags.createFail = on;
}

export function setPromotionStatusFailForId(id: number | null) {
  flags.statusFailForId = id;
}

export function setPromotionDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

export function setPromotionUpdateFailForId(id: number | null) {
  flags.updateFail = id !== null;
  flags.updateFailForId = id;
}

export function getMockPromotionByCode(code: string) {
  return dataset.find((r) => r.code === code);
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isListPath(url: string) {
  return /\/admin\/promotions\/?$/.test(pathname(url));
}

function parsePromotionId(path: string): number | null {
  const m = path.match(/\/admin\/promotions\/(\d+)(?:\/|$)/);
  return m ? Number(m[1]) : null;
}

function isStatusPath(url: string) {
  return /\/admin\/promotions\/\d+\/status\/?$/.test(pathname(url));
}

function isDetailPath(url: string) {
  const path = pathname(url);
  return /\/admin\/promotions\/\d+\/?$/.test(path) && !path.includes('/status');
}

function filterAndPaginate(url: string) {
  const params = new URL(url).searchParams;
  let rows = [...dataset].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const search = params.get('search')?.trim().toLowerCase();
  const status = params.get('status');
  const validNow = params.get('valid_now') === 'true' || params.get('valid_now') === '1';
  const page = Math.max(1, Number(params.get('page') || 1));
  const perPage = Math.max(1, Number(params.get('per_page') || 10));

  if (search) {
    rows = rows.filter(
      (r) =>
        r.code.toLowerCase().includes(search) ||
        r.name.toLowerCase().includes(search) ||
        (r.description ?? '').toLowerCase().includes(search)
    );
  }

  if (status) {
    rows = rows.filter((r) => r.status === status);
  }

  if (validNow) {
    const now = new Date('2026-06-15T12:00:00Z');
    rows = rows.filter((r) => {
      if (r.status !== 'active') return false;
      const start = r.starts_at ? new Date(r.starts_at) : null;
      const end = r.ends_at ? new Date(r.ends_at) : null;
      if (start && now < start) return false;
      if (end && now > end) return false;
      return true;
    });
  }

  const total = rows.length;
  const last_page = Math.max(1, Math.ceil(total / perPage));
  const current_page = Math.min(page, last_page);
  const start = (current_page - 1) * perPage;
  const data = rows.slice(start, start + perPage);

  return {
    data,
    current_page,
    last_page,
    per_page: perPage,
    total,
  };
}

function mapFormToPromotion(id: number, data: PromotionFormInput, existing?: Promotion): Promotion {
  const now = new Date().toISOString();
  return {
    id,
    code: data.code,
    name: data.name,
    description: data.description ?? null,
    discount_type: data.discount_type,
    discount_value: String(data.discount_value),
    max_discount_amount:
      data.max_discount_amount != null ? String(data.max_discount_amount) : null,
    min_order_amount: String(data.min_order_amount ?? 0),
    usage_limit: data.usage_limit ?? null,
    usage_per_user: data.usage_per_user ?? 1,
    used_count: existing?.used_count ?? 0,
    starts_at: data.starts_at ?? null,
    ends_at: data.ends_at ?? null,
    status: data.status ?? existing?.status ?? 'active',
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

export async function mockPromotionsApi(page: Page) {
  const handler = async (route: Route) => {
    const request = route.request();
    const url = request.url();
    if (!url.includes('/api/v1/admin/promotions')) {
      await route.continue();
      return;
    }

    const method = request.method();
    const path = pathname(url);

    if (method === 'GET' && isListPath(url)) {
      if (flags.listDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.listDelayMs));
      }
      if (flags.listFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('List promotions failed', 500)),
        });
        return;
      }
      const payload = flags.listEmpty
        ? { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 }
        : filterAndPaginate(url);
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
          body: JSON.stringify(errorEnvelope('Create promotion failed', 422)),
        });
        return;
      }
      const body = request.postDataJSON() as PromotionFormInput;
      const created = mapFormToPromotion(nextId++, body);
      dataset.unshift(created);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(created)),
      });
      return;
    }

    if (method === 'PUT' && isDetailPath(url)) {
      const id = parsePromotionId(path);
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Not found', 404)),
        });
        return;
      }
      if (flags.updateFail && (flags.updateFailForId === null || flags.updateFailForId === id)) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Update failed', 500)),
        });
        return;
      }
      const body = request.postDataJSON() as PromotionFormInput;
      Object.assign(row, mapFormToPromotion(id!, body, row));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(row)),
      });
      return;
    }

    if (method === 'PATCH' && isStatusPath(url)) {
      const id = parsePromotionId(path);
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Not found', 404)),
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
      const body = request.postDataJSON() as { status: PromotionStatus };
      row.status = body.status;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    if (method === 'DELETE' && isDetailPath(url)) {
      const id = parsePromotionId(path);
      if (flags.deleteFailForId === id) {
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

  await page.route('**/api/v1/**', handler);
}
