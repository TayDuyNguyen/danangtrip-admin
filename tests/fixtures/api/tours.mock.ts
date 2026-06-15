import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';
import {
  initialMockTours,
  mockSchedulesForTour1,
  mockTourCategories,
  type RawTourRow,
} from '../data/tours.data';

let toursById = new Map<number, RawTourRow>(
  initialMockTours.map((t) => [t.id, structuredClone(t)])
);

let scheduleFailOnceForTourId: number | null = null;
let scheduleFailCount = 0;

const scheduleErrorTourIds = new Set<number>();
let scheduleDelayMs = 0;
const scheduleEmptyTourIds = new Set<number>();
let nextCreatedTourId = 100;
let tourCreateFailStatus: number | null = null;
let tourCreateFailMessage = 'Validation failed';

export function resetMockTours() {
  toursById = new Map(initialMockTours.map((t) => [t.id, structuredClone(t)]));
  scheduleFailOnceForTourId = null;
  scheduleFailCount = 0;
  scheduleErrorTourIds.clear();
  scheduleDelayMs = 0;
  scheduleEmptyTourIds.clear();
  nextCreatedTourId = 100;
  tourCreateFailStatus = null;
  tourCreateFailMessage = 'Validation failed';
}

export function setTourCreateFail(status: number, message = 'Validation failed') {
  tourCreateFailStatus = status;
  tourCreateFailMessage = message;
}

export function getLastCreatedTourId() {
  return nextCreatedTourId - 1;
}

export function findMockTourByName(name: string) {
  return [...toursById.values()].find((t) => t.name === name);
}

export function setScheduleErrorForTour(tourId: number) {
  scheduleErrorTourIds.add(tourId);
}

export function releaseScheduleErrorForTour(tourId: number) {
  scheduleErrorTourIds.delete(tourId);
}

export function getMockTour(id: number) {
  return toursById.get(id);
}

export function setScheduleFailOnceForTour(tourId: number) {
  scheduleFailOnceForTourId = tourId;
  scheduleFailCount = 0;
}

export function setScheduleDelay(ms: number) {
  scheduleDelayMs = ms;
}

export function setScheduleEmptyForTour(tourId: number) {
  scheduleEmptyTourIds.add(tourId);
}

export function patchMockTour(id: number, partial: Partial<RawTourRow>) {
  const tour = toursById.get(id);
  if (tour) toursById.set(id, { ...tour, ...partial });
}

function isToursListUrl(url: string): boolean {
  const { pathname } = new URL(url);
  return /\/admin\/tours\/?$/.test(pathname);
}

function isToursExportUrl(url: string): boolean {
  return /\/admin\/tours\/export\/?$/.test(new URL(url).pathname);
}

function isTourCategoriesUrl(url: string): boolean {
  const { pathname } = new URL(url);
  return pathname === '/api/v1/tour-categories' || pathname.endsWith('/tour-categories');
}

function isTourCreatePostUrl(url: string, method: string): boolean {
  return method === 'POST' && /\/admin\/tours\/?$/.test(new URL(url).pathname);
}

function isTourDetailGetUrl(url: string, method: string): boolean {
  return method === 'GET' && /\/admin\/tours\/\d+\/?$/.test(new URL(url).pathname);
}

function isUploadImageUrl(url: string, method: string): boolean {
  const { pathname } = new URL(url);
  return method === 'POST' && pathname.endsWith('/upload/image');
}

function isUploadImagesUrl(url: string, method: string): boolean {
  const { pathname } = new URL(url);
  return method === 'POST' && pathname.endsWith('/upload/images');
}

function isUploadDeleteUrl(url: string, method: string): boolean {
  const { pathname } = new URL(url);
  return method === 'DELETE' && pathname.endsWith('/upload/image');
}

function parseTourDetailId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/tours\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function buildTourRowFromCreateBody(body: Record<string, unknown>, id: number): RawTourRow {
  const now = new Date().toISOString();
  return {
    id,
    name: String(body.name ?? ''),
    slug: String(body.slug ?? `tour-${id}`),
    tour_category_id: Number(body.tour_category_id) || 1,
    description: String(body.description ?? ''),
    short_desc: body.short_desc != null ? String(body.short_desc) : null,
    itinerary: Array.isArray(body.itinerary)
      ? (body.itinerary as RawTourRow['itinerary'])
      : null,
    inclusions: Array.isArray(body.inclusions)
      ? (body.inclusions as string[]).join('\n')
      : String(body.inclusions ?? ''),
    exclusions: Array.isArray(body.exclusions)
      ? (body.exclusions as string[]).join('\n')
      : String(body.exclusions ?? ''),
    price_adult: Number(body.price_adult) || 0,
    price_child: body.price_child != null ? Number(body.price_child) : 0,
    price_infant: body.price_infant != null ? Number(body.price_infant) : 0,
    discount_percent: Number(body.discount_percent) || 0,
    duration: String(body.duration ?? ''),
    start_time: body.start_time != null ? String(body.start_time) : null,
    meeting_point: body.meeting_point != null ? String(body.meeting_point) : null,
    max_people: body.max_people != null ? Number(body.max_people) : 10,
    min_people: body.min_people != null ? Number(body.min_people) : 1,
    available_from: body.available_from != null ? String(body.available_from) : null,
    available_to: body.available_to != null ? String(body.available_to) : null,
    thumbnail: body.thumbnail != null ? String(body.thumbnail) : null,
    images: Array.isArray(body.images) ? (body.images as string[]) : [],
    video_url: body.video_url != null ? String(body.video_url) : null,
    status: body.status === 'inactive' ? 'inactive' : 'active',
    booking_availability: 'open',
    is_featured: Boolean(body.is_featured),
    is_hot: Boolean(body.is_hot),
    view_count: 0,
    booking_count: 0,
    schedules_count: 0,
    created_at: now,
    updated_at: now,
  };
}

let uploadCounter = 0;

function nextUploadUrl(label: string) {
  uploadCounter += 1;
  return `https://picsum.photos/seed/mock-${label}-${uploadCounter}/400/300`;
}

function isSchedulesListUrl(url: string): boolean {
  return /\/admin\/tour-schedules\/?$/.test(new URL(url).pathname);
}

function parseTourIdFromPath(pathname: string, suffix: string): number | null {
  const match = pathname.match(new RegExp(`/admin/tours/(\\d+)${suffix}/?$`));
  return match ? Number(match[1]) : null;
}

function filterTours(params: URLSearchParams): RawTourRow[] {
  let rows = [...toursById.values()];
  const search = (params.get('search') || '').trim().toLowerCase();
  const categoryId = params.get('tour_category_id');
  const status = params.get('status');
  const bookingAvailability = params.get('booking_availability');
  const isFeatured = params.get('is_featured');
  const isHot = params.get('is_hot');

  if (search) {
    rows = rows.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.slug.toLowerCase().includes(search) ||
        `tour-${String(t.id).padStart(3, '0')}`.includes(search)
    );
  }
  if (categoryId) rows = rows.filter((t) => t.tour_category_id === Number(categoryId));
  if (status) rows = rows.filter((t) => t.status === status);
  if (bookingAvailability) rows = rows.filter((t) => t.booking_availability === bookingAvailability);
  if (isFeatured === '1') rows = rows.filter((t) => t.is_featured);
  if (isFeatured === '0' && isHot === '0') rows = rows.filter((t) => !t.is_featured && !t.is_hot);
  if (isHot === '1') rows = rows.filter((t) => t.is_hot);

  const sortBy = params.get('sort_by') || 'created_at';
  const sortOrder = params.get('sort_order') || 'desc';
  rows.sort((a, b) => {
    const av = sortBy === 'name' ? a.name : a.created_at;
    const bv = sortBy === 'name' ? b.name : b.created_at;
    const cmp = String(av).localeCompare(String(bv));
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return rows;
}

function paginate(params: URLSearchParams, rows: RawTourRow[]) {
  const page = Number(params.get('page')) || 1;
  const perPage = Number(params.get('per_page')) || 10;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  return {
    data: rows.slice(start, start + perPage),
    total,
    current_page: page,
    per_page: perPage,
    last_page: lastPage,
  };
}

function countTours(params: URLSearchParams): number {
  return filterTours(params).length;
}

function shouldMockApiRoute(route: Route): boolean {
  const type = route.request().resourceType();
  if (['document', 'stylesheet', 'script', 'image', 'font'].includes(type)) return false;
  const url = route.request().url();
  if (!url.includes('/api/v1/')) return false;

  return (
    isToursListUrl(url) ||
    isToursExportUrl(url) ||
    isTourCategoriesUrl(url) ||
    isSchedulesListUrl(url) ||
    isUploadImageUrl(url, route.request().method()) ||
    isUploadImagesUrl(url, route.request().method()) ||
    isUploadDeleteUrl(url, route.request().method()) ||
    isTourCreatePostUrl(url, route.request().method()) ||
    isTourDetailGetUrl(url, route.request().method()) ||
    /\/admin\/tours\/\d+\/(status|featured|hot)\/?$/.test(new URL(url).pathname) ||
    /\/admin\/tours\/\d+\/?$/.test(new URL(url).pathname)
  );
}

export async function mockToursApi(page: Page) {
  uploadCounter = 0;

  const handler = async (route: Route) => {
    const type = route.request().resourceType();
    if (type === 'document') {
      await route.continue();
      return;
    }

    const url = route.request().url();
    if (url.includes('/admin/dashboard/notification-counts')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ unread_total: 0, items: [] })),
      });
      return;
    }

    if (!shouldMockApiRoute(route)) {
      await route.continue();
      return;
    }

    const method = route.request().method();
    const { pathname } = new URL(url);
    const params = new URL(url).searchParams;

    if (method === 'GET' && isTourCategoriesUrl(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(mockTourCategories)),
      });
      return;
    }

    if (method === 'GET' && isSchedulesListUrl(url)) {
      const tourId = Number(params.get('tour_id'));

      if (scheduleDelayMs > 0) {
        await new Promise((r) => setTimeout(r, scheduleDelayMs));
      }

      if (scheduleErrorTourIds.has(tourId)) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Server error', data: null }),
        });
        return;
      }

      if (scheduleFailOnceForTourId === tourId && scheduleFailCount === 0) {
        scheduleFailCount += 1;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Server error', data: null }),
        });
        return;
      }

      const rows =
        scheduleEmptyTourIds.has(tourId)
          ? []
          : tourId === 1
            ? mockSchedulesForTour1
            : mockSchedulesForTour1.filter((s) => s.tour_id === tourId);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            data: rows,
            total: rows.length,
            current_page: 1,
            per_page: 5,
            last_page: 1,
          })
        ),
      });
      return;
    }

    if (method === 'GET' && isToursExportUrl(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('mock-export'),
        headers: {
          'Content-Disposition': 'attachment; filename="danh-sach-tour.xlsx"',
        },
      });
      return;
    }

    if (method === 'POST' && isUploadImageUrl(url, method)) {
      const urlOut = nextUploadUrl('thumb');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({ url: urlOut, public_id: `mock/thumb-${uploadCounter}`, asset_id: `a-${uploadCounter}` })
        ),
      });
      return;
    }

    if (method === 'POST' && isUploadImagesUrl(url, method)) {
      const count = Math.max(1, (route.request().postData() || '').split('images[]').length - 1);
      const items = Array.from({ length: count }, (_, i) => {
        const urlOut = nextUploadUrl(`gal-${i}`);
        return { url: urlOut, public_id: `mock/gal-${uploadCounter}-${i}`, asset_id: `g-${uploadCounter}-${i}` };
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(items)),
      });
      return;
    }

    if (method === 'DELETE' && isUploadDeleteUrl(url, method)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ deleted: true })),
      });
      return;
    }

    if (method === 'POST' && isTourCreatePostUrl(url, method)) {
      if (tourCreateFailStatus != null) {
        await route.fulfill({
          status: tourCreateFailStatus,
          contentType: 'application/json',
          body: JSON.stringify({
            code: tourCreateFailStatus,
            message: tourCreateFailMessage,
            data: null,
          }),
        });
        return;
      }
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const id = nextCreatedTourId++;
      const row = buildTourRowFromCreateBody(body, id);
      toursById.set(id, row);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ tour: { id, name: row.name, slug: row.slug } })),
      });
      return;
    }

    if (method === 'GET' && isTourDetailGetUrl(url, method)) {
      const tourId = parseTourDetailId(pathname);
      const tour = tourId != null ? toursById.get(tourId) : undefined;
      if (!tour) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(tour)),
      });
      return;
    }

    if (method === 'GET' && isToursListUrl(url)) {
      const perPage = Number(params.get('per_page')) || 10;
      if (perPage === 1 && !params.get('page') && params.toString()) {
        const total = countTours(params);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            successEnvelope({
              data: [],
              total,
              current_page: 1,
              per_page: 1,
              last_page: Math.max(1, total),
            })
          ),
        });
        return;
      }

      const payload = paginate(params, filterTours(params));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(payload)),
      });
      return;
    }

    if (method === 'PATCH') {
      const statusId = parseTourIdFromPath(pathname, '/status');
      const featuredId = parseTourIdFromPath(pathname, '/featured');
      const hotId = parseTourIdFromPath(pathname, '/hot');
      const body = route.request().postDataJSON() as Record<string, unknown>;

      if (statusId != null) {
        const tour = toursById.get(statusId);
        if (tour && (body.status === 'active' || body.status === 'inactive')) {
          tour.status = body.status;
          toursById.set(statusId, tour);
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ id: statusId, status: body.status })),
        });
        return;
      }

      if (featuredId != null) {
        const tour = toursById.get(featuredId);
        if (tour) {
          tour.is_featured = Boolean(body.is_featured);
          toursById.set(featuredId, tour);
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ id: featuredId, is_featured: body.is_featured })),
        });
        return;
      }

      if (hotId != null) {
        const tour = toursById.get(hotId);
        if (tour) {
          tour.is_hot = Boolean(body.is_hot);
          toursById.set(hotId, tour);
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ id: hotId, is_hot: body.is_hot })),
        });
        return;
      }
    }

    if (method === 'DELETE') {
      const deleteMatch = pathname.match(/\/admin\/tours\/(\d+)\/?$/);
      if (deleteMatch) {
        const id = Number(deleteMatch[1]);
        toursById.delete(id);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ deleted: true })),
        });
        return;
      }
    }

    await route.continue();
  };

  await page.route('**/api/v1/**', handler);
}
