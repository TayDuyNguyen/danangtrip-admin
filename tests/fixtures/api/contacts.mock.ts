import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import type { RawContactItem } from '@/dataHelper/contact.dataHelper';
import { mockContactListRows } from '../data/contacts-list.data';

const flags = {
  listFail: false,
  listEmpty: false,
  exportFail: false,
  detailFailForId: null as number | null,
  detailDelayMs: 0,
  replyFailForId: null as number | null,
  deleteFailForId: null as number | null,
};

let dataset: RawContactItem[] = structuredClone(mockContactListRows);

export function resetMockContacts() {
  dataset = structuredClone(mockContactListRows);
  flags.listFail = false;
  flags.listEmpty = false;
  flags.exportFail = false;
  flags.detailFailForId = null;
  flags.detailDelayMs = 0;
  flags.replyFailForId = null;
  flags.deleteFailForId = null;
}

export function setContactListFail(on = true) {
  flags.listFail = on;
}

export function setContactListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setContactExportFail(on = true) {
  flags.exportFail = on;
}

export function setContactDetailFailForId(id: number | null) {
  flags.detailFailForId = id;
}

export function setContactDetailDelay(ms: number) {
  flags.detailDelayMs = ms;
}

export function setContactReplyFailForId(id: number | null) {
  flags.replyFailForId = id;
}

export function setContactDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function parseContactId(path: string): number | null {
  const m = path.match(/\/admin\/contacts\/(\d+)/);
  return m ? Number(m[1]) : null;
}

function isContactsListPath(url: string) {
  return /\/admin\/contacts\/?$/.test(pathname(url));
}

function isContactsExportPath(url: string) {
  return /\/admin\/contacts\/export\/?$/.test(pathname(url));
}

function isContactDetailPath(url: string) {
  return /\/admin\/contacts\/\d+\/?$/.test(pathname(url));
}

function isContactReplyPath(url: string) {
  return /\/admin\/contacts\/\d+\/reply\/?$/.test(pathname(url));
}

function filterRows(url: string) {
  const params = new URL(url).searchParams;
  let rows = [...dataset].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const q = params.get('q')?.trim().toLowerCase();
  const status = params.get('status');
  const page = Math.max(1, Number(params.get('page') || 1));
  const perPage = Math.max(1, Number(params.get('per_page') || 10));

  if (q) {
    rows = rows.filter((row) => {
      const haystack = [row.name, row.email, row.subject, row.message, row.phone ?? '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (status) {
    rows = rows.filter((row) => row.status === status);
  }

  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const data = rows.slice(start, start + perPage);

  return {
    data,
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    stats: {
      total: dataset.length,
      new: dataset.filter((r) => r.status === 'new').length,
      read: dataset.filter((r) => r.status === 'read').length,
      replied: dataset.filter((r) => r.status === 'replied').length,
    },
  };
}

function findById(id: number) {
  return dataset.find((row) => row.id === id);
}

const MINIMAL_XLSX = Buffer.from(
  'UEsDBBQAAAAIAAAAIQAAAAAAABAAAAAAZGF0YS54bWxQSwECFAAUAAAACAAAACEAAAAAAAAQAAAAAAAAAAAAAAABAAAAZGF0YS54bWxQSwUGAAAAAAEAAQAxAAAAIQAAAAAA',
  'base64'
);

export async function mockContactsApi(page: Page) {
  await page.route('**/api/v1/admin/contacts**', async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();
    const path = pathname(url);

    if (method === 'GET' && isContactsExportPath(url)) {
      if (flags.exportFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Export failed')),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: MINIMAL_XLSX,
        headers: {
          'Content-Disposition': 'attachment; filename="contacts-export.xlsx"',
        },
      });
      return;
    }

    if (method === 'GET' && isContactsListPath(url)) {
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
              stats: { total: 0, new: 0, read: 0, replied: 0 },
            })
          ),
        });
        return;
      }
      const payload = filterRows(url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(payload)),
      });
      return;
    }

    if (method === 'GET' && isContactDetailPath(url)) {
      const id = parseContactId(path);
      if (id == null) {
        await route.continue();
        return;
      }
      if (flags.detailFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Detail failed')),
        });
        return;
      }
      const item = findById(id);
      if (!item) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Not found')),
        });
        return;
      }
      if (flags.detailDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.detailDelayMs));
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(item)),
      });
      return;
    }

    if (method === 'POST' && isContactReplyPath(url)) {
      const replyPath = path.replace(/\/reply\/?$/, '');
      const id = parseContactId(replyPath);
      if (id == null) {
        await route.continue();
        return;
      }
      if (flags.replyFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Reply failed')),
        });
        return;
      }
      const body = route.request().postDataJSON() as { reply?: string };
      const idx = dataset.findIndex((row) => row.id === id);
      if (idx >= 0) {
        const now = new Date().toISOString();
        dataset[idx] = {
          ...dataset[idx],
          status: 'replied',
          reply: body.reply ?? '',
          replied_by: 1,
          replied_at: now,
          replier: { id: 1, full_name: 'Admin Demo', username: 'admin' },
          updated_at: now,
        };
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    if (method === 'DELETE' && isContactDetailPath(url)) {
      const id = parseContactId(path);
      if (id == null) {
        await route.continue();
        return;
      }
      if (flags.deleteFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Delete failed')),
        });
        return;
      }
      dataset = dataset.filter((row) => row.id !== id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    await route.continue();
  });
}
