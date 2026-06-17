import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';
import { shouldRegisterMockRoutes } from '../../helpers/mockRouteOnce';
import {
  initialMockTours,
  mockSchedulesForTour1,
  mockTourCategories,
  type RawScheduleRow,
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
let scheduleListFail = false;
let scheduleListReturnEmpty = false;
let scheduleStatsFail = false;
let nextCreatedTourId = 100;
let tourCreateFailStatus: number | null = null;
let tourCreateFailMessage = 'Validation failed';

let listDelayMs = 0;
let statsDelayMs = 0;
let exportFail = false;
let exportDelayMs = 0;
let featuredFailForTourId: number | null = null;
let hotFailForTourId: number | null = null;
let deleteFailForTourId: number | null = null;
let deleteDelayMs = 0;
let categoryDelayMs = 0;
let categoryFail = false;
let categoryFailOnce = false;
let categoryFailOnceUsed = false;
let categoryBlockRequests = false;
let tourCreateDelayMs = 0;
let tourDetailFailForId: number | null = null;
let tourDetailDelayMs = 0;
let tourUpdateFailForId: number | null = null;
let tourUpdateFailStatus = 422;
let tourUpdateFailMessage = 'Update failed';
let tourUpdateDelayMs = 0;
let scheduleCreateFailForTourId: number | null = null;
let scheduleCreateFailStatus = 500;
let scheduleCreateFailMessage = 'Failed to create schedule';
let scheduleCreateDelayMs = 0;
let scheduleDetailFailForId: number | null = null;
let scheduleDetailFailStatus = 500;
let scheduleDetailFailMessage = 'Schedule fetch failed';
let scheduleDetailDelayMs = 0;
let scheduleUpdateFailForId: number | null = null;
let scheduleUpdateFailStatus = 500;
let scheduleUpdateFailMessage = 'Update failed';
let scheduleUpdateDelayMs = 0;
let scheduleDeleteFailForId: number | null = null;
let lastScheduleUpdateBody: Record<string, unknown> | null = null;
let nextCreatedScheduleId = 200;

let schedulesStore: typeof mockSchedulesForTour1 = structuredClone(mockSchedulesForTour1);

function isStatsCountRequest(params: URLSearchParams): boolean {
  if (Number(params.get('per_page')) !== 1 || params.get('page')) return false;
  const filterKeys = [...params.keys()].filter((k) => k !== 'per_page');
  if (filterKeys.length === 0) return true;
  if (filterKeys.length === 1) {
    return ['status', 'is_featured', 'booking_availability'].includes(filterKeys[0]!);
  }
  return false;
}

export function resetMockTours() {
  toursById = new Map(initialMockTours.map((t) => [t.id, structuredClone(t)]));
  scheduleFailOnceForTourId = null;
  scheduleFailCount = 0;
  scheduleErrorTourIds.clear();
  scheduleDelayMs = 0;
  scheduleEmptyTourIds.clear();
  scheduleListFail = false;
  scheduleListReturnEmpty = false;
  scheduleStatsFail = false;
  nextCreatedTourId = 100;
  tourCreateFailStatus = null;
  tourCreateFailMessage = 'Validation failed';
  listDelayMs = 0;
  statsDelayMs = 0;
  exportFail = false;
  exportDelayMs = 0;
  featuredFailForTourId = null;
  hotFailForTourId = null;
  deleteFailForTourId = null;
  deleteDelayMs = 0;
  categoryDelayMs = 0;
  categoryFail = false;
  categoryFailOnce = false;
  categoryFailOnceUsed = false;
  categoryBlockRequests = false;
  tourCreateDelayMs = 0;
  tourDetailFailForId = null;
  tourDetailDelayMs = 0;
  tourUpdateFailForId = null;
  tourUpdateFailStatus = 422;
  tourUpdateFailMessage = 'Update failed';
  tourUpdateDelayMs = 0;
  scheduleCreateFailForTourId = null;
  scheduleCreateFailStatus = 500;
  scheduleCreateFailMessage = 'Failed to create schedule';
  scheduleCreateDelayMs = 0;
  scheduleDetailFailForId = null;
  scheduleDetailFailStatus = 500;
  scheduleDetailFailMessage = 'Schedule fetch failed';
  scheduleDetailDelayMs = 0;
  scheduleUpdateFailForId = null;
  scheduleUpdateFailStatus = 500;
  scheduleUpdateFailMessage = 'Update failed';
  scheduleUpdateDelayMs = 0;
  scheduleDeleteFailForId = null;
  lastScheduleUpdateBody = null;
  nextCreatedScheduleId = 200;
  schedulesStore = structuredClone(mockSchedulesForTour1);
}

export function setTourListDelay(ms: number) {
  listDelayMs = ms;
}

export function setTourStatsDelay(ms: number) {
  statsDelayMs = ms;
}

export function setTourExportFail(fail = true) {
  exportFail = fail;
}

export function setTourExportDelay(ms: number) {
  exportDelayMs = ms;
}

export function setFeaturedFailForTour(tourId: number) {
  featuredFailForTourId = tourId;
}

export function setHotFailForTour(tourId: number) {
  hotFailForTourId = tourId;
}

export function setDeleteFailForTour(tourId: number) {
  deleteFailForTourId = tourId;
}

export function setDeleteDelay(ms: number) {
  deleteDelayMs = ms;
}

export function setTourCategoriesDelay(ms: number) {
  categoryDelayMs = ms;
}

export function setTourCategoriesFail(fail = true) {
  categoryFail = fail;
}

export function setTourCategoriesFailOnce() {
  categoryFailOnce = true;
  categoryFailOnceUsed = false;
}

export function setTourCategoriesBlocked(block = true) {
  categoryBlockRequests = block;
}

export function setTourCreateDelay(ms: number) {
  tourCreateDelayMs = ms;
}

export function setTourDetailFail(tourId: number) {
  tourDetailFailForId = tourId;
}

export function setTourDetailDelay(ms: number) {
  tourDetailDelayMs = ms;
}

export function clearTourDetailFail() {
  tourDetailFailForId = null;
}

export function setTourUpdateFail(tourId: number, status = 422, message = 'Update failed') {
  tourUpdateFailForId = tourId;
  tourUpdateFailStatus = status;
  tourUpdateFailMessage = message;
}

export function setTourUpdateDelay(ms: number) {
  tourUpdateDelayMs = ms;
}

export function getMockTourAfterUpdate(id: number) {
  return toursById.get(id);
}

export function appendMockTours(extraCount: number, startId?: number) {
  const baseId = startId ?? Math.max(...toursById.keys(), 0) + 1;
  for (let i = 0; i < extraCount; i++) {
    const id = baseId + i;
    toursById.set(
      id,
      structuredClone(
        initialMockTours[0]!
      )
    );
    const row = toursById.get(id)!;
    row.id = id;
    row.name = `Tour Extra ${id}`;
    row.slug = `tour-extra-${id}`;
    row.is_featured = false;
    row.is_hot = false;
    row.status = 'active';
    row.booking_availability = 'open';
  }
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

export function setScheduleListFail(fail = true) {
  scheduleListFail = fail;
}

export function setScheduleListReturnEmpty(empty = true) {
  scheduleListReturnEmpty = empty;
}

export function setScheduleStatsFail(fail = true) {
  scheduleStatsFail = fail;
}

export function setScheduleCreateFail(tourId: number, status = 500, message = 'Failed to create schedule') {
  scheduleCreateFailForTourId = tourId;
  scheduleCreateFailStatus = status;
  scheduleCreateFailMessage = message;
}

export function setScheduleCreateDelay(ms: number) {
  scheduleCreateDelayMs = ms;
}

export function getLastCreatedScheduleId() {
  return nextCreatedScheduleId - 1;
}

export function getMockSchedule(id: number) {
  return schedulesStore.find((s) => s.id === id);
}

export function patchMockSchedule(id: number, partial: Partial<RawScheduleRow>) {
  const idx = schedulesStore.findIndex((s) => s.id === id);
  if (idx >= 0) {
    schedulesStore[idx] = { ...schedulesStore[idx]!, ...partial };
  }
}

export function setScheduleDetailFail(id: number, status = 500, message = 'Schedule fetch failed') {
  scheduleDetailFailForId = id;
  scheduleDetailFailStatus = status;
  scheduleDetailFailMessage = message;
}

export function setScheduleDetailDelay(ms: number) {
  scheduleDetailDelayMs = ms;
}

export function setScheduleUpdateFail(
  id: number,
  status = 500,
  message = 'Update failed'
) {
  scheduleUpdateFailForId = id;
  scheduleUpdateFailStatus = status;
  scheduleUpdateFailMessage = message;
}

export function setScheduleUpdateDelay(ms: number) {
  scheduleUpdateDelayMs = ms;
}

export function setScheduleDeleteFail(id: number) {
  scheduleDeleteFailForId = id;
}

export function getLastScheduleUpdateBody() {
  return lastScheduleUpdateBody;
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

function isTourDetailPutUrl(url: string, method: string): boolean {
  return method === 'PUT' && /\/admin\/tours\/\d+\/?$/.test(new URL(url).pathname);
}

function isScheduleDeleteUrl(url: string, method: string): boolean {
  return method === 'DELETE' && /\/admin\/tour-schedules\/\d+\/?$/.test(new URL(url).pathname);
}

function isScheduleDetailGetUrl(url: string, method: string): boolean {
  return method === 'GET' && /\/admin\/tour-schedules\/\d+\/?$/.test(new URL(url).pathname);
}

function isScheduleUpdatePutUrl(url: string, method: string): boolean {
  return method === 'PUT' && /\/admin\/tour-schedules\/\d+\/?$/.test(new URL(url).pathname);
}

function parseScheduleId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/tour-schedules\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function isTourDetailGetUrl(url: string, method: string): boolean {
  return method === 'GET' && /\/admin\/tours\/\d+\/?$/.test(new URL(url).pathname);
}

function isScheduleCreatePostUrl(url: string, method: string): boolean {
  return method === 'POST' && /\/admin\/tours\/\d+\/schedules\/?$/.test(new URL(url).pathname);
}

function parseScheduleCreateTourId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/tours\/(\d+)\/schedules\/?$/);
  return match ? Number(match[1]) : null;
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

function isScheduleStatusCountsUrl(url: string): boolean {
  return /\/admin\/tour-schedules\/status-counts\/?$/.test(new URL(url).pathname);
}

function parseScheduleStatusPatchId(pathname: string): number | null {
  const match = pathname.match(/\/admin\/tour-schedules\/(\d+)\/status\/?$/);
  return match ? Number(match[1]) : null;
}

function enrichScheduleRow(row: (typeof schedulesStore)[number]) {
  const tour = toursById.get(row.tour_id);
  const category = mockTourCategories.find((c) => c.id === tour?.tour_category_id);
  return {
    ...row,
    tour: tour
      ? {
          id: tour.id,
          name: tour.name,
          thumbnail: tour.thumbnail,
          category: category ? { name: category.name } : undefined,
        }
      : undefined,
  };
}

function filterSchedules(params: URLSearchParams) {
  if (scheduleListReturnEmpty) {
    return [];
  }

  let rows = [...schedulesStore];
  const tourId = params.get('tour_id');
  if (tourId) {
    rows = rows.filter((s) => s.tour_id === Number(tourId));
  }

  const q = (params.get('q') || '').trim().toLowerCase();
  if (q) {
    rows = rows.filter((s) => {
      const tour = toursById.get(s.tour_id);
      return tour?.name.toLowerCase().includes(q) ?? false;
    });
  }

  const status = params.get('status');
  if (status) {
    rows = rows.filter((s) => s.status === status);
  }

  const bookingAvailability = params.get('booking_availability');
  if (bookingAvailability) {
    rows = rows.filter((s) => s.booking_availability === bookingAvailability);
  }

  const from = params.get('from');
  const to = params.get('to');
  if (from) {
    rows = rows.filter((s) => s.start_date >= from);
  }
  if (to) {
    rows = rows.filter((s) => s.start_date <= to);
  }

  const sort = params.get('sort') || 'start_date';
  const order = params.get('order') || 'desc';
  rows.sort((a, b) => {
    const av = sort === 'start_date' ? a.start_date : String(a.id);
    const bv = sort === 'start_date' ? b.start_date : String(b.id);
    const cmp = String(av).localeCompare(String(bv));
    return order === 'asc' ? cmp : -cmp;
  });

  return rows;
}

function paginateSchedules(params: URLSearchParams, rows: (typeof schedulesStore)[number][]) {
  const page = Number(params.get('page')) || 1;
  const perPage = Number(params.get('per_page')) || 10;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;

  return {
    data: rows.slice(start, start + perPage).map(enrichScheduleRow),
    total,
    current_page: page,
    per_page: perPage,
    last_page: lastPage,
  };
}

function computeScheduleStats(rows: (typeof schedulesStore)[number][]) {
  return {
    total_schedules: rows.length,
    available_schedules: rows.filter((s) => s.status === 'available').length,
    full_schedules: rows.filter((s) => s.booking_availability === 'sold_out').length,
    cancelled_schedules: rows.filter((s) => s.status === 'cancelled').length,
  };
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
    isScheduleStatusCountsUrl(url) ||
    isUploadImageUrl(url, route.request().method()) ||
    isUploadImagesUrl(url, route.request().method()) ||
    isUploadDeleteUrl(url, route.request().method()) ||
    isTourCreatePostUrl(url, route.request().method()) ||
    isScheduleCreatePostUrl(url, route.request().method()) ||
    isTourDetailGetUrl(url, route.request().method()) ||
    isTourDetailPutUrl(url, route.request().method()) ||
    isScheduleDeleteUrl(url, route.request().method()) ||
    isScheduleDetailGetUrl(url, route.request().method()) ||
    isScheduleUpdatePutUrl(url, route.request().method()) ||
    /\/admin\/tour-schedules\/\d+\/status\/?$/.test(new URL(url).pathname) ||
    /\/admin\/tours\/\d+\/(status|featured|hot)\/?$/.test(new URL(url).pathname) ||
    /\/admin\/tours\/\d+\/?$/.test(new URL(url).pathname)
  );
}

export async function mockToursApi(page: Page) {
  uploadCounter = 0;

  if (!shouldRegisterMockRoutes(page, 'tours')) {
    return;
  }

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
      if (categoryDelayMs > 0) {
        await new Promise((r) => setTimeout(r, categoryDelayMs));
      }

      const shouldFailCategory =
        categoryBlockRequests ||
        categoryFail ||
        (categoryFailOnce && !categoryFailOnceUsed);
      if (shouldFailCategory) {
        if (categoryFailOnce) categoryFailOnceUsed = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Category load failed', data: null }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(mockTourCategories)),
      });
      return;
    }

    if (method === 'GET' && isScheduleStatusCountsUrl(url)) {
      if (scheduleStatsFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Stats failed', data: null }),
        });
        return;
      }

      const filtered = filterSchedules(params);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(computeScheduleStats(filtered))),
      });
      return;
    }

    if (method === 'GET' && isScheduleDetailGetUrl(url, method)) {
      const scheduleId = parseScheduleId(pathname);
      if (scheduleDetailDelayMs > 0) {
        await new Promise((r) => setTimeout(r, scheduleDetailDelayMs));
      }
      if (scheduleId != null && scheduleDetailFailForId === scheduleId) {
        await route.fulfill({
          status: scheduleDetailFailStatus,
          contentType: 'application/json',
          body: JSON.stringify({
            code: scheduleDetailFailStatus,
            message: scheduleDetailFailMessage,
            data: null,
          }),
        });
        return;
      }
      const row = scheduleId != null ? schedulesStore.find((s) => s.id === scheduleId) : undefined;
      if (!row) {
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
        body: JSON.stringify(successEnvelope(enrichScheduleRow(row))),
      });
      return;
    }

    if (method === 'PUT' && isScheduleUpdatePutUrl(url, method)) {
      const scheduleId = parseScheduleId(pathname);
      const idx =
        scheduleId != null ? schedulesStore.findIndex((s) => s.id === scheduleId) : -1;
      if (idx === -1) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
        });
        return;
      }
      if (scheduleUpdateDelayMs > 0) {
        await new Promise((r) => setTimeout(r, scheduleUpdateDelayMs));
      }
      if (scheduleId != null && scheduleUpdateFailForId === scheduleId) {
        await route.fulfill({
          status: scheduleUpdateFailStatus,
          contentType: 'application/json',
          body: JSON.stringify({
            code: scheduleUpdateFailStatus,
            message: scheduleUpdateFailMessage,
            data: null,
          }),
        });
        return;
      }
      const body = route.request().postDataJSON() as Record<string, unknown>;
      lastScheduleUpdateBody = body;
      const current = schedulesStore[idx]!;
      if (body.max_people != null && Number(body.max_people) < current.booked_people) {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 422,
            message: 'Max people cannot be less than booked count',
            data: null,
          }),
        });
        return;
      }
      const nextStatus =
        body.status != null ? String(body.status).toLowerCase() : current.status;
      const updated = {
        ...current,
        start_date: body.start_date != null ? String(body.start_date) : current.start_date,
        end_date: body.end_date != null ? String(body.end_date) : current.end_date,
        max_people: body.max_people != null ? Number(body.max_people) : current.max_people,
        status: nextStatus,
        departure_code:
          body.departure_code !== undefined ? (body.departure_code as string | null) : current.departure_code,
        departure_place:
          body.departure_place !== undefined
            ? (body.departure_place as string | null)
            : current.departure_place,
        booking_deadline:
          body.booking_deadline !== undefined
            ? (body.booking_deadline as string | null)
            : current.booking_deadline,
        price_adult: body.price_adult !== undefined ? body.price_adult : current.price_adult,
        price_child: body.price_child !== undefined ? body.price_child : current.price_child,
        price_infant: body.price_infant !== undefined ? body.price_infant : current.price_infant,
      };
      schedulesStore[idx] = updated;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(enrichScheduleRow(updated))),
      });
      return;
    }

    if (method === 'GET' && isSchedulesListUrl(url)) {
      const tourId = Number(params.get('tour_id'));

      if (scheduleDelayMs > 0) {
        await new Promise((r) => setTimeout(r, scheduleDelayMs));
      }

      if (scheduleListFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Server error', data: null }),
        });
        return;
      }

      if (tourId && scheduleErrorTourIds.has(tourId)) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Server error', data: null }),
        });
        return;
      }

      if (tourId && scheduleFailOnceForTourId === tourId && scheduleFailCount === 0) {
        scheduleFailCount += 1;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Server error', data: null }),
        });
        return;
      }

      if (tourId && scheduleEmptyTourIds.has(tourId)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            successEnvelope({
              data: [],
              total: 0,
              current_page: 1,
              per_page: Number(params.get('per_page')) || 10,
              last_page: 1,
            })
          ),
        });
        return;
      }

      const payload = paginateSchedules(params, filterSchedules(params));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(payload)),
      });
      return;
    }

    if (method === 'GET' && isToursExportUrl(url)) {
      if (exportDelayMs > 0) {
        await new Promise((r) => setTimeout(r, exportDelayMs));
      }
      if (exportFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Export failed', data: null }),
        });
        return;
      }
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

    if (method === 'POST' && isScheduleCreatePostUrl(url, method)) {
      const tourId = parseScheduleCreateTourId(pathname);
      if (scheduleCreateDelayMs > 0) {
        await new Promise((r) => setTimeout(r, scheduleCreateDelayMs));
      }
      if (tourId != null && scheduleCreateFailForTourId === tourId) {
        await route.fulfill({
          status: scheduleCreateFailStatus,
          contentType: 'application/json',
          body: JSON.stringify({
            code: scheduleCreateFailStatus,
            message: scheduleCreateFailMessage,
            data: null,
          }),
        });
        return;
      }
      const tour = tourId != null ? toursById.get(tourId) : undefined;
      if (!tour || tourId == null) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ code: 404, message: 'Tour not found', data: null }),
        });
        return;
      }
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const newId = nextCreatedScheduleId++;
      const row = {
        id: newId,
        tour_id: tourId,
        start_date: String(body.start_date ?? ''),
        end_date: String(body.end_date ?? body.start_date ?? ''),
        max_people: Number(body.max_people) || 20,
        booked_people: 0,
        status: String(body.status ?? 'available').toLowerCase(),
        booking_availability: 'open',
        departure_code: body.departure_code != null ? String(body.departure_code) : null,
        departure_place: body.departure_place != null ? String(body.departure_place) : null,
        booking_deadline: body.booking_deadline != null ? String(body.booking_deadline) : null,
        price_adult: body.price_adult ?? null,
        price_child: body.price_child ?? null,
        price_infant: body.price_infant ?? null,
      };
      schedulesStore.push(row);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(row)),
      });
      return;
    }

    if (method === 'POST' && isTourCreatePostUrl(url, method)) {
      if (tourCreateDelayMs > 0) {
        await new Promise((r) => setTimeout(r, tourCreateDelayMs));
      }

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
      if (tourDetailDelayMs > 0) {
        await new Promise((r) => setTimeout(r, tourDetailDelayMs));
      }
      if (tourId != null && tourDetailFailForId === tourId) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, message: 'Tour fetch failed', data: null }),
        });
        return;
      }
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

    if (method === 'PUT' && isTourDetailPutUrl(url, method)) {
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
      if (tourUpdateDelayMs > 0) {
        await new Promise((r) => setTimeout(r, tourUpdateDelayMs));
      }
      if (tourId != null && tourUpdateFailForId === tourId) {
        await route.fulfill({
          status: tourUpdateFailStatus,
          contentType: 'application/json',
          body: JSON.stringify({
            code: tourUpdateFailStatus,
            message: tourUpdateFailMessage,
            data: null,
          }),
        });
        return;
      }
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const updated: RawTourRow = {
        ...tour,
        ...body,
        id: tour.id,
        updated_at: new Date().toISOString(),
      } as RawTourRow;
      if (Array.isArray(body.itinerary)) {
        updated.itinerary = body.itinerary as RawTourRow['itinerary'];
      }
      if (Array.isArray(body.inclusions)) {
        updated.inclusions = (body.inclusions as string[]).join('\n');
      }
      if (Array.isArray(body.exclusions)) {
        updated.exclusions = (body.exclusions as string[]).join('\n');
      }
      if (body.name != null) updated.name = String(body.name);
      if (body.price_adult != null) updated.price_adult = Number(body.price_adult);
      if (body.status === 'active' || body.status === 'inactive') {
        updated.status = body.status;
      }
      if (body.is_featured != null) updated.is_featured = Boolean(body.is_featured);
      if (body.is_hot != null) updated.is_hot = Boolean(body.is_hot);
      toursById.set(tour.id, updated);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(updated)),
      });
      return;
    }

    if (method === 'GET' && isToursListUrl(url)) {
      const perPage = Number(params.get('per_page')) || 10;
      const statsRequest = isStatsCountRequest(params);

      if (statsRequest && statsDelayMs > 0) {
        await new Promise((r) => setTimeout(r, statsDelayMs));
      }
      if (!statsRequest && listDelayMs > 0) {
        await new Promise((r) => setTimeout(r, listDelayMs));
      }

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
      const scheduleStatusId = parseScheduleStatusPatchId(pathname);
      const body = route.request().postDataJSON() as Record<string, unknown>;

      if (scheduleStatusId != null) {
        const idx = schedulesStore.findIndex((s) => s.id === scheduleStatusId);
        if (idx === -1) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
          });
          return;
        }
        const nextStatus = String(body.status ?? 'available');
        schedulesStore[idx] = { ...schedulesStore[idx]!, status: nextStatus };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ id: scheduleStatusId, status: nextStatus })),
        });
        return;
      }

      const statusId = parseTourIdFromPath(pathname, '/status');
      const featuredId = parseTourIdFromPath(pathname, '/featured');
      const hotId = parseTourIdFromPath(pathname, '/hot');

      if (statusId != null) {
        const tour = toursById.get(statusId);
        if (!tour) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
          });
          return;
        }
        if (body.status === 'active' || body.status === 'inactive') {
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
        if (!tour) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
          });
          return;
        }
        if (featuredFailForTourId === featuredId) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ code: 500, message: 'Featured update failed', data: null }),
          });
          return;
        }
        tour.is_featured = Boolean(body.is_featured);
        toursById.set(featuredId, tour);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ id: featuredId, is_featured: body.is_featured })),
        });
        return;
      }

      if (hotId != null) {
        const tour = toursById.get(hotId);
        if (!tour) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
          });
          return;
        }
        if (hotFailForTourId === hotId) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ code: 500, message: 'Hot update failed', data: null }),
          });
          return;
        }
        tour.is_hot = Boolean(body.is_hot);
        toursById.set(hotId, tour);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ id: hotId, is_hot: body.is_hot })),
        });
        return;
      }
    }

    if (method === 'DELETE') {
      const scheduleDeleteId = parseScheduleId(pathname);
      if (scheduleDeleteId != null && isScheduleDeleteUrl(url, method)) {
        const idx = schedulesStore.findIndex((s) => s.id === scheduleDeleteId);
        if (idx === -1) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
          });
          return;
        }
        if (scheduleDeleteFailForId === scheduleDeleteId) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ code: 500, message: 'Delete failed', data: null }),
          });
          return;
        }
        const row = schedulesStore[idx]!;
        if (row.booked_people > 0) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 400,
              message: 'Cannot delete schedule with existing bookings',
              data: null,
            }),
          });
          return;
        }
        schedulesStore.splice(idx, 1);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope({ deleted: true })),
        });
        return;
      }

      const deleteMatch = pathname.match(/\/admin\/tours\/(\d+)\/?$/);
      if (deleteMatch) {
        const id = Number(deleteMatch[1]);
        const tour = toursById.get(id);
        if (!tour) {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ code: 404, message: 'Not found', data: null }),
          });
          return;
        }
        if (deleteDelayMs > 0) {
          await new Promise((r) => setTimeout(r, deleteDelayMs));
        }
        if (deleteFailForTourId === id) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ code: 500, message: 'Delete failed', data: null }),
          });
          return;
        }
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
