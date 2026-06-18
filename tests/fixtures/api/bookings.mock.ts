import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import {
  computeBookingStatusCounts,
  mockBookingListRows,
  type MockBookingListRow,
} from '../data/bookings.data';
import {
  buildDetailStore,
  type MockBookingDetailRecord,
} from '../data/booking-detail.data';

const flags = {
  listFail: false,
  statsFail: false,
  exportFail: false,
  mutationFail: false,
  listEmpty: false,
  detailFail: false,
  invoiceFail: false,
};

let dataset: MockBookingListRow[] = structuredClone(mockBookingListRows);
let detailStore: Record<number, MockBookingDetailRecord> = buildDetailStore();

export function resetMockBookings() {
  dataset = structuredClone(mockBookingListRows);
  detailStore = buildDetailStore();
  flags.listFail = false;
  flags.statsFail = false;
  flags.exportFail = false;
  flags.mutationFail = false;
  flags.listEmpty = false;
  flags.detailFail = false;
  flags.invoiceFail = false;
}

export function setBookingListFail(on = true) {
  flags.listFail = on;
}

export function setBookingStatsFail(on = true) {
  flags.statsFail = on;
}

export function setBookingListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setBookingExportFail(on = true) {
  flags.exportFail = on;
}

export function setBookingMutationFail(on = true) {
  flags.mutationFail = on;
}

export function setBookingDetailFail(on = true) {
  flags.detailFail = on;
}

export function setBookingInvoiceFail(on = true) {
  flags.invoiceFail = on;
}

export function getMockBookingDetail(id: number) {
  return detailStore[id];
}

export function getMockBooking(id: number) {
  return dataset.find((row) => row.id === id);
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isBookingsListPath(path: string) {
  return /\/admin\/bookings\/?$/.test(path);
}

function isBookingsExportPath(path: string) {
  return /\/admin\/bookings\/export\/?$/.test(path);
}

function isBookingsStatsPath(path: string) {
  return /\/admin\/bookings\/status-counts\/?$/.test(path);
}

function isBookingStatusPath(path: string): { id: number } | null {
  const match = path.match(/\/admin\/bookings\/(\d+)\/status\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function isBookingConfirmPaymentPath(path: string): { id: number } | null {
  const match = path.match(/\/admin\/bookings\/(\d+)\/confirm-payment\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function isBookingRefundPreviewPath(path: string): { id: number } | null {
  const match = path.match(/\/admin\/bookings\/(\d+)\/refund-preview\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function isBookingDetailPath(path: string): { id: number } | null {
  const match = path.match(/\/admin\/bookings\/(\d+)\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function isBookingInvoicePath(path: string): { id: number } | null {
  const match = path.match(/\/admin\/bookings\/(\d+)\/invoice\/?$/);
  return match ? { id: Number(match[1]) } : null;
}

function buildRefundPreview(id: number) {
  const detail = detailStore[id];
  const row = getMockBooking(id);
  const paidAmount = detail?.final_amount ?? row?.total_amount ?? 0;
  const refundPercent = 80;
  const refundAmount = Math.round((paidAmount * refundPercent) / 100);
  return {
    paid_amount: paidAmount,
    refund_percent: refundPercent,
    refund_amount: refundAmount,
    cancellation_fee: Math.max(0, paidAmount - refundAmount),
    policy_code: 'mock_policy',
    grace_period_applied: false,
  };
}

function syncDetailFromListRow(id: number) {
  const row = getMockBooking(id);
  const detail = detailStore[id];
  if (!row || !detail) return;
  detail.booking_status = row.booking_status;
  detail.payment_status = row.payment_status;
  detail.cancellation_reason = row.cancellation_reason ?? detail.cancellation_reason ?? null;
  if (row.booking_status === 'confirmed' && !detail.confirmed_at) {
    detail.confirmed_at = new Date().toISOString();
  }
  if (row.booking_status === 'completed') {
    detail.completed_at = detail.completed_at ?? new Date().toISOString();
  }
  if (row.booking_status === 'cancelled') {
    detail.cancelled_at = detail.cancelled_at ?? new Date().toISOString();
  }
  if (row.payment_status === 'success' || row.payment_status === 'paid') {
    detail.payment_status = 'success';
  }
}

function shouldMockRoute(url: string): boolean {
  const path = pathname(url);
  return (
    isBookingsListPath(path) ||
    isBookingsExportPath(path) ||
    isBookingsStatsPath(path) ||
    isBookingDetailPath(path) !== null ||
    isBookingRefundPreviewPath(path) !== null ||
    isBookingInvoicePath(path) !== null ||
    isBookingStatusPath(path) !== null ||
    isBookingConfirmPaymentPath(path) !== null
  );
}

function applySearch(rows: MockBookingListRow[], search: string) {
  const term = search.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter(
    (row) =>
      row.booking_code.toLowerCase().includes(term) ||
      row.customer_name.toLowerCase().includes(term) ||
      row.customer_email.toLowerCase().includes(term) ||
      row.tour_name.toLowerCase().includes(term)
  );
}

function applyDateBounds(rows: MockBookingListRow[], fromDate?: string | null, toDate?: string | null) {
  let next = rows;
  if (fromDate) {
    const from = new Date(`${fromDate}T00:00:00`);
    next = next.filter((row) => new Date(row.booked_at) >= from);
  }
  if (toDate) {
    const to = new Date(`${toDate}T23:59:59`);
    next = next.filter((row) => new Date(row.booked_at) <= to);
  }
  return next;
}

function filterBookings(params: URLSearchParams, source: MockBookingListRow[]) {
  let rows = [...source];

  const userId = params.get('user_id');
  if (userId) {
    rows = rows.filter((row) => row.user_id === Number(userId));
  }

  const scheduleId = params.get('tour_schedule_id');
  if (scheduleId) {
    rows = rows.filter((row) => row.tour_schedule_id === Number(scheduleId));
  }

  const status = params.get('booking_status') || params.get('status') || '';
  if (status && status !== 'all') {
    rows = rows.filter((row) => row.booking_status === status);
  }

  const paymentStatus = params.get('payment_status') || '';
  if (paymentStatus && paymentStatus !== 'all') {
    rows = rows.filter((row) => {
      if (paymentStatus === 'success') {
        return row.payment_status === 'success' || row.payment_status === 'paid';
      }
      return row.payment_status === paymentStatus;
    });
  }

  rows = applySearch(rows, params.get('search') || '');
  rows = applyDateBounds(rows, params.get('from_date'), params.get('to_date'));

  const sortByRaw = params.get('sort_by') || params.get('sort') || 'booked_at';
  const sortBy = sortByRaw === 'amount' ? 'total_amount' : sortByRaw;
  const sortOrder = (params.get('sort_order') || params.get('order') || 'desc').toLowerCase();

  const allowed = ['id', 'booking_code', 'total_amount', 'booked_at', 'created_at', 'booking_status', 'payment_status'];
  const field = allowed.includes(sortBy) ? sortBy : 'booked_at';

  rows.sort((a, b) => {
    const av = a[field as keyof MockBookingListRow];
    const bv = b[field as keyof MockBookingListRow];
    if (field === 'total_amount') {
      const cmp = Number(av) - Number(bv);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    if (field === 'booked_at') {
      const cmp = new Date(String(av)).getTime() - new Date(String(bv)).getTime();
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    const cmp = String(av ?? '').localeCompare(String(bv ?? ''));
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return rows;
}

function paginate(params: URLSearchParams, rows: MockBookingListRow[]) {
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
  };
}

function statsSource(params: URLSearchParams) {
  let rows = [...dataset];
  const userId = params.get('user_id');
  if (userId) rows = rows.filter((row) => row.user_id === Number(userId));
  rows = applySearch(rows, params.get('search') || '');
  rows = applyDateBounds(rows, params.get('from_date'), params.get('to_date'));
  return rows;
}

export async function mockBookingsApi(page: Page) {
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
    const path = pathname(url);
    const params = new URL(url).searchParams;

    if (method === 'GET' && isBookingsStatsPath(path)) {
      if (flags.statsFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Stats failed', 500)),
        });
        return;
      }
      const counts = computeBookingStatusCounts(statsSource(params));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(counts)),
      });
      return;
    }

    if (method === 'GET' && isBookingsExportPath(path)) {
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
        headers: { 'Content-Disposition': 'attachment; filename="bookings-export.xlsx"' },
        body: Buffer.from('mock-bookings-xlsx'),
      });
      return;
    }

    if (method === 'GET' && isBookingInvoicePath(path)) {
      const match = isBookingInvoicePath(path)!;
      if (flags.invoiceFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Invoice failed', 500)),
        });
        return;
      }
      if (!detailStore[match.id]) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Booking not found', 404)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': `attachment; filename="hoa_don_${detailStore[match.id].booking_code}.pdf"`,
        },
        body: Buffer.from('%PDF-mock-invoice'),
      });
      return;
    }

    if (method === 'GET' && isBookingRefundPreviewPath(path)) {
      const match = isBookingRefundPreviewPath(path)!;
      const detail = detailStore[match.id];
      if (!detail) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Booking not found', 404)),
        });
        return;
      }
      if (detail.booking_status === 'cancelled' || detail.booking_status === 'completed') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Booking cannot be cancelled', 400)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(buildRefundPreview(match.id))),
      });
      return;
    }

    if (method === 'GET' && isBookingDetailPath(path)) {
      const match = isBookingDetailPath(path)!;
      if (flags.detailFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Detail failed', 500)),
        });
        return;
      }
      const detail = detailStore[match.id];
      if (!detail) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Booking not found', 404)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(detail)),
      });
      return;
    }

    if (method === 'GET' && isBookingsListPath(path)) {
      if (flags.listFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('List failed', 500)),
        });
        return;
      }
      const filtered = flags.listEmpty ? [] : filterBookings(params, dataset);
      const payload = paginate(params, filtered);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(payload)),
      });
      return;
    }

    if (method === 'PATCH' && isBookingStatusPath(path)) {
      if (flags.mutationFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Update failed', 500)),
        });
        return;
      }
      const match = isBookingStatusPath(path)!;
      const body = route.request().postDataJSON() as {
        booking_status?: string;
        cancellation_reason?: string;
      };
      dataset = dataset.map((row) =>
        row.id === match.id
          ? {
              ...row,
              booking_status: (body.booking_status as MockBookingListRow['booking_status']) ?? row.booking_status,
              cancellation_reason: body.cancellation_reason ?? row.cancellation_reason,
            }
          : row
      );
      syncDetailFromListRow(match.id);
      const updated = getMockBooking(match.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(updated)),
      });
      return;
    }

    if (method === 'PATCH' && isBookingConfirmPaymentPath(path)) {
      if (flags.mutationFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Payment confirm failed', 500)),
        });
        return;
      }
      const match = isBookingConfirmPaymentPath(path)!;
      dataset = dataset.map((row) =>
        row.id === match.id
          ? {
              ...row,
              payment_status: 'success',
              booking_status: row.booking_status === 'pending' ? 'confirmed' : row.booking_status,
            }
          : row
      );
      syncDetailFromListRow(match.id);
      const updated = getMockBooking(match.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(updated)),
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/admin/bookings**', handler);
  await page.route('**/admin/bookings**', handler);
}
