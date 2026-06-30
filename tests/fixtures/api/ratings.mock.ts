import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import type { RawRating } from '@/dataHelper/rating.dataHelper';
import type { RawRatingsReport } from '@/dataHelper/report.dataHelper';
import { expectedRatingStats, mockRatingListRows } from '../data/ratings-list.data';

const flags = {
  listFail: false,
  listEmpty: false,
  reportFail: false,
  exportFail: false,
  markViewedFailForId: null as number | null,
  rejectFailForId: null as number | null,
  deleteFailForId: null as number | null,
};

let dataset: RawRating[] = structuredClone(mockRatingListRows);

export function resetMockRatings() {
  dataset = structuredClone(mockRatingListRows);
  flags.listFail = false;
  flags.listEmpty = false;
  flags.reportFail = false;
  flags.exportFail = false;
  flags.markViewedFailForId = null;
  flags.rejectFailForId = null;
  flags.deleteFailForId = null;
}

export function setRatingListFail(on = true) {
  flags.listFail = on;
}

export function setRatingListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setRatingReportFail(on = true) {
  flags.reportFail = on;
}

export function setRatingExportFail(on = true) {
  flags.exportFail = on;
}

export function setRatingMarkViewedFailForId(id: number | null) {
  flags.markViewedFailForId = id;
}

export function setRatingRejectFailForId(id: number | null) {
  flags.rejectFailForId = id;
}

export function setRatingDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function parseRatingId(path: string): number | null {
  const m = path.match(/\/admin\/ratings\/(\d+)/);
  return m ? Number(m[1]) : null;
}

function isRatingsListPath(url: string) {
  return /\/admin\/ratings\/?$/.test(pathname(url));
}

function isRatingsExportPath(url: string) {
  return /\/admin\/ratings\/export\/?$/.test(pathname(url));
}

function isRatingsReportPath(url: string) {
  return /\/admin\/reports\/ratings\/?$/.test(pathname(url));
}

function filterRows(url: string) {
  const params = new URL(url).searchParams;
  let rows = [...dataset].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const search = params.get('search')?.trim().toLowerCase();
  const status = params.get('status');
  const type = params.get('type');
  const score = params.get('score');
  const isNewRaw = params.get('is_new');
  const page = Math.max(1, Number(params.get('page') || 1));
  const perPage = Math.max(1, Number(params.get('per_page') || 10));

  if (search) {
    rows = rows.filter((r) => {
      const userName = r.user?.full_name?.toLowerCase() ?? '';
      const comment = (r.comment ?? '').toLowerCase();
      const tourName = r.tour?.name?.toLowerCase() ?? '';
      const locName = r.location?.name?.toLowerCase() ?? '';
      return (
        userName.includes(search) ||
        comment.includes(search) ||
        tourName.includes(search) ||
        locName.includes(search)
      );
    });
  }

  if (status && status !== 'all') {
    rows = rows.filter((r) => r.status === status);
  }

  if (type && type !== 'all') {
    rows = rows.filter((r) => (type === 'tour' ? !!r.tour_id : !!r.location_id));
  }

  if (score) {
    rows = rows.filter((r) => r.score === Number(score));
  }

  if (isNewRaw === '1' || isNewRaw === 'true') {
    rows = rows.filter((r) => r.is_new);
  } else if (isNewRaw === '0' || isNewRaw === 'false') {
    rows = rows.filter((r) => !r.is_new);
  }

  const total = rows.length;
  const last_page = Math.max(1, Math.ceil(total / perPage));
  const current_page = Math.min(page, last_page);
  const start = (current_page - 1) * perPage;
  const data = rows.slice(start, start + perPage);

  return { data, current_page, last_page, per_page: perPage, total };
}

function buildReportPayload(filteredTotal?: number): RawRatingsReport {
  const rows = dataset;
  const rejected = rows.filter((r) => r.status === 'rejected').length;
  const pending = rows.filter((r) => r.status === 'pending').length;
  const approved = rows.filter((r) => r.status === 'approved').length;
  const newCount = rows.filter((r) => r.is_new).length;
  const total = filteredTotal ?? rows.length;

  return {
    summary: {
      total_count: total,
      pending_count: pending,
      approved_count: approved,
      rejected_count: rejected,
      new_count: newCount,
      viewed_count: Math.max(0, total - newCount),
      average_score: 4.1,
      status_distribution: {
        approved,
        pending,
        rejected,
      },
      star_distribution: { 5: 3, 4: 4, 3: 3, 2: 1, 1: 1 },
      type_distribution: {
        location: { count: rows.filter((r) => r.location_id).length, average: 3.5 },
        tour: { count: rows.filter((r) => r.tour_id).length, average: 4.2 },
      },
      trend_chart: [],
    },
    ratings_list: {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    },
  };
}

export async function mockRatingsApi(page: Page) {
  const handler = async (route: Route) => {
    const request = route.request();
    const url = request.url();
    if (!url.includes('/api/v1/')) {
      await route.continue();
      return;
    }

    const method = request.method();
    const path = pathname(url);

    if (method === 'GET' && isRatingsReportPath(url)) {
      if (flags.reportFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Report failed', 500)),
        });
        return;
      }
      const listPreview = filterRows(url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(buildReportPayload(listPreview.total || expectedRatingStats.total))),
      });
      return;
    }

    if (method === 'GET' && isRatingsExportPath(url)) {
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
        body: Buffer.from('PK\x03\x04mock-ratings-export'),
        headers: {
          'content-disposition': 'attachment; filename="ratings_export.xlsx"',
        },
      });
      return;
    }

    if (method === 'GET' && isRatingsListPath(url)) {
      if (flags.listFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('List ratings failed', 500)),
        });
        return;
      }
      const payload = flags.listEmpty
        ? { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0 }
        : filterRows(url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(payload)),
      });
      return;
    }

    if (method === 'PATCH' && /\/admin\/ratings\/\d+\/mark-viewed\/?$/.test(path)) {
      const id = parseRatingId(path);
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Not found', 404)),
        });
        return;
      }
      if (flags.markViewedFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Mark viewed failed', 500)),
        });
        return;
      }
      row.is_new = false;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    if (method === 'PATCH' && /\/admin\/ratings\/\d+\/reject\/?$/.test(path)) {
      const id = parseRatingId(path);
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Not found', 404)),
        });
        return;
      }
      if (flags.rejectFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Reject failed', 500)),
        });
        return;
      }
      const body = request.postDataJSON() as { rejected_reason?: string };
      row.status = 'rejected';
      row.rejected_reason = body?.rejected_reason ?? 'Hidden by admin';
      row.is_new = false;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    if (method === 'DELETE' && /\/admin\/ratings\/\d+\/?$/.test(path) && !path.includes('/export')) {
      const id = parseRatingId(path);
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

export { expectedRatingStats };
