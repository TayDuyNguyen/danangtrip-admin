import type { Page, Route } from '@playwright/test';
import type { AdminRawPaymentItem } from '@/dataHelper/payment.dataHelper';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import { mockPaymentListRows } from '../data/payments.data';

const flags = {
  listFail: false,
  listEmpty: false,
  listDelayMs: 0,
  exportFail: false,
  detailFailForId: null as number | null,
  detailDelayMs: 0,
  detailNotFoundForId: null as number | null,
  refundFailForId: null as number | null,
  refundDelayMs: 0,
};

let dataset: AdminRawPaymentItem[] = structuredClone(mockPaymentListRows);
let lastListQuery: Record<string, string> = {};
let lastRefundBody: Record<string, unknown> | null = null;

export function resetMockPayments() {
  dataset = structuredClone(mockPaymentListRows);
  flags.listFail = false;
  flags.listEmpty = false;
  flags.listDelayMs = 0;
  flags.exportFail = false;
  flags.detailFailForId = null;
  flags.detailDelayMs = 0;
  flags.detailNotFoundForId = null;
  flags.refundFailForId = null;
  flags.refundDelayMs = 0;
  lastListQuery = {};
  lastRefundBody = null;
}

export function setPaymentListFail(on = true) {
  flags.listFail = on;
}

export function setPaymentListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setPaymentListDelay(ms: number) {
  flags.listDelayMs = ms;
}

export function setPaymentExportFail(on = true) {
  flags.exportFail = on;
}

export function setPaymentDetailFailForId(id: number | null) {
  flags.detailFailForId = id;
}

export function setPaymentDetailNotFoundForId(id: number | null) {
  flags.detailNotFoundForId = id;
}

export function setPaymentDetailDelay(ms: number) {
  flags.detailDelayMs = ms;
}

export function setPaymentRefundFailForId(id: number | null) {
  flags.refundFailForId = id;
}

export function setPaymentRefundDelay(ms: number) {
  flags.refundDelayMs = ms;
}

export function getLastListQuery() {
  return lastListQuery;
}

export function getLastRefundBody() {
  return lastRefundBody;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isPaymentsListPath(url: string) {
  return /\/admin\/payments\/?$/.test(pathname(url));
}

function isPaymentsExportPath(url: string) {
  return /\/admin\/payments\/export\/?$/.test(pathname(url));
}

function parsePaymentId(path: string): number | null {
  const m = path.match(/\/admin\/payments\/(\d+)$/);
  return m ? Number(m[1]) : null;
}

function parseRefundId(path: string): number | null {
  const m = path.match(/\/admin\/payments\/(\d+)\/refund$/);
  return m ? Number(m[1]) : null;
}

function findById(id: number) {
  return dataset.find((row) => row.id === id);
}

function filterRows(url: string) {
  const params = new URL(url).searchParams;
  lastListQuery = Object.fromEntries(params.entries());

  let rows = [...dataset].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const search = params.get('search')?.trim().toLowerCase();
  const status = params.get('payment_status');
  const gateway = params.get('payment_gateway');
  const refundStatus = params.get('refund_status');
  const dateFrom = params.get('date_from');
  const dateTo = params.get('date_to');
  const page = Math.max(1, Number(params.get('page') || 1));
  const perPage = Math.max(1, Number(params.get('per_page') || 10));

  if (search) {
    rows = rows.filter((row) => {
      const haystack = [
        row.transaction_code,
        row.booking?.booking_code ?? '',
        row.booking?.customer_name ?? '',
        row.booking?.customer_email ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (status) {
    rows = rows.filter((row) => {
      const effective =
        row.reconciliation_status === 'partial' ? 'partially_paid' : row.payment_status;
      return effective === status || row.payment_status === status;
    });
  }

  if (gateway) {
    rows = rows.filter((row) => row.payment_method === gateway);
  }

  if (refundStatus) {
    rows = rows.filter((row) => row.latest_refund_request?.status === refundStatus);
  }

  if (dateFrom) {
    rows = rows.filter((row) => row.created_at.slice(0, 10) >= dateFrom);
  }
  if (dateTo) {
    rows = rows.filter((row) => row.created_at.slice(0, 10) <= dateTo);
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
  };
}

const MINIMAL_XLSX = Buffer.from(
  'UEsDBBQAAAAIAAAAIQAAAAAAABAAAAAAZGF0YS54bWxQSwECFAAUAAAACAAAACEAAAAAAAAQAAAAAAAAAAAAAAABAAAAZGF0YS54bWxQSwUGAAAAAAEAAQAxAAAAIQAAAAAA',
  'base64'
);

export async function mockPaymentsApi(page: Page) {
  await page.route('**/api/v1/admin/payments**', async (route: Route) => {
    const url = route.request().url();
    const method = route.request().method();
    const path = pathname(url);

    if (method === 'GET' && isPaymentsExportPath(url)) {
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
          'Content-Disposition': 'attachment; filename="payments-export.xlsx"',
        },
      });
      return;
    }

    if (method === 'GET' && isPaymentsListPath(url)) {
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
            })
          ),
        });
        return;
      }
      const pageData = filterRows(url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(pageData)),
      });
      return;
    }

    const detailId = parsePaymentId(path);
    if (method === 'GET' && detailId !== null) {
      if (flags.detailDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.detailDelayMs));
      }
      if (flags.detailFailForId === detailId) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Detail failed')),
        });
        return;
      }
      if (flags.detailNotFoundForId === detailId) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Payment not found', 404)),
        });
        return;
      }
      const item = findById(detailId);
      if (!item) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Payment not found', 404)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(item)),
      });
      return;
    }

    const refundId = parseRefundId(path);
    if (method === 'POST' && refundId !== null) {
      if (flags.refundDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.refundDelayMs));
      }
      lastRefundBody = route.request().postDataJSON() as Record<string, unknown>;
      if (flags.refundFailForId === refundId) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Refund failed')),
        });
        return;
      }
      const item = findById(refundId);
      if (!item) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Payment not found', 404)),
        });
        return;
      }
      item.payment_status = 'refunded';
      item.refunded_at = new Date().toISOString();
      item.refund_reason = String(lastRefundBody?.refund_reason ?? 'Refunded');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(item)),
      });
      return;
    }
  });
}
