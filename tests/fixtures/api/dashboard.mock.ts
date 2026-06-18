import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';
import {
  mockBookingRows,
  mockBookingRowsEmptyNames,
  mockBookingRowsPage2,
  mockBookingStatusCounts,
  mockBookingStatusCountsZero,
  mockBookingTrendSeries,
  mockDashboardStats,
  mockDashboardStatsLegacyEnvelope,
  mockGlobalSearchTourHit,
  mockNotificationCounts,
  mockRevenueSeries,
  mockSearchTrends,
  mockSearchTrendsEmpty,
  mockTopTours,
  mockUserGrowthSeries,
} from '../data/dashboard.data';

export interface DashboardMockFlags {
  statsFail: boolean;
  statusCountsFail: boolean;
  exportFail: boolean;
  revenueFail: boolean;
  revenueEmpty: boolean;
  bookingTrendFail: boolean;
  bookingTrendEmpty: boolean;
  userGrowthFail: boolean;
  userGrowthEmpty: boolean;
  searchTrendsFail: boolean;
  searchTrendsEmpty: boolean;
  topToursFail: boolean;
  topToursEmpty: boolean;
  bookingsFail: boolean;
  bookingsEmpty: boolean;
  notificationsFail: boolean;
  globalSearchFail: boolean;
  globalSearchEmpty: boolean;
  statsLegacyEnvelope: boolean;
  useEmptyNameBookings: boolean;
  useZeroStatusCounts: boolean;
}

const defaultFlags = (): DashboardMockFlags => ({
  statsFail: false,
  statusCountsFail: false,
  exportFail: false,
  revenueFail: false,
  revenueEmpty: false,
  bookingTrendFail: false,
  bookingTrendEmpty: false,
  userGrowthFail: false,
  userGrowthEmpty: false,
  searchTrendsFail: false,
  searchTrendsEmpty: false,
  topToursFail: false,
  topToursEmpty: false,
  bookingsFail: false,
  bookingsEmpty: false,
  notificationsFail: false,
  globalSearchFail: false,
  globalSearchEmpty: false,
  statsLegacyEnvelope: false,
  useEmptyNameBookings: false,
  useZeroStatusCounts: false,
});

let flags: DashboardMockFlags = defaultFlags();

export function resetMockDashboard() {
  flags = defaultFlags();
}

export function setDashboardStatsFail(on = true) {
  flags.statsFail = on;
}

export function setDashboardExportFail(on = true) {
  flags.exportFail = on;
}

export function setDashboardStatusCountsFail(on = true) {
  flags.statusCountsFail = on;
}

export function setDashboardRevenueFail(on = true) {
  flags.revenueFail = on;
}

export function setDashboardRevenueEmpty(on = true) {
  flags.revenueEmpty = on;
}

export function setDashboardBookingTrendFail(on = true) {
  flags.bookingTrendFail = on;
}

export function setDashboardBookingTrendEmpty(on = true) {
  flags.bookingTrendEmpty = on;
}

export function setDashboardUserGrowthFail(on = true) {
  flags.userGrowthFail = on;
}

export function setDashboardUserGrowthEmpty(on = true) {
  flags.userGrowthEmpty = on;
}

export function setDashboardSearchTrendsFail(on = true) {
  flags.searchTrendsFail = on;
}

export function setDashboardSearchTrendsEmpty(on = true) {
  flags.searchTrendsEmpty = on;
}

export function setDashboardTopToursFail(on = true) {
  flags.topToursFail = on;
}

export function setDashboardTopToursEmpty(on = true) {
  flags.topToursEmpty = on;
}

export function setDashboardBookingsFail(on = true) {
  flags.bookingsFail = on;
}

export function setDashboardBookingsEmpty(on = true) {
  flags.bookingsEmpty = on;
}

export function setDashboardNotificationsFail(on = true) {
  flags.notificationsFail = on;
}

export function setDashboardGlobalSearchFail(on = true) {
  flags.globalSearchFail = on;
}

export function setDashboardGlobalSearchEmpty(on = true) {
  flags.globalSearchEmpty = on;
}

export function setDashboardStatsLegacyEnvelope(on = true) {
  flags.statsLegacyEnvelope = on;
}

export function setDashboardEmptyNameBookings(on = true) {
  flags.useEmptyNameBookings = on;
}

export function setDashboardZeroStatusCounts(on = true) {
  flags.useZeroStatusCounts = on;
}

export function setDashboardAllWidgetsFail(on = true) {
  if (!on) {
    resetMockDashboard();
    return;
  }
  flags = {
    ...defaultFlags(),
    statsFail: true,
    statusCountsFail: true,
    revenueFail: true,
    bookingTrendFail: true,
    userGrowthFail: true,
    searchTrendsFail: true,
    topToursFail: true,
    bookingsFail: true,
    notificationsFail: true,
  };
}

function isDashboardApi(url: string): boolean {
  return url.includes('/api/v1/');
}

function pathname(url: string): string {
  return new URL(url).pathname.replace(/\/api\/v1/, '') || '/';
}

function fulfillJson(route: Route, data: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(successEnvelope(data)),
  });
}

function fulfillError(route: Route, status = 500) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify({ code: status, message: 'Server error', data: null }),
  });
}

function filterBookings(status: string | null) {
  const source = flags.useEmptyNameBookings ? mockBookingRowsEmptyNames : mockBookingRows;
  const all = [...source, ...mockBookingRowsPage2];
  if (!status) return all;
  return all.filter((b) => b.booking_status === status);
}

function isGlobalSearchRequest(path: string, params: URLSearchParams): boolean {
  if (path === '/admin/tours' && (params.get('search') || params.get('q'))) return true;
  if (path === '/admin/locations' && (params.get('q') || params.get('search'))) return true;
  if (path === '/admin/bookings' && params.get('search')) return true;
  if (path === '/admin/users' && (params.get('q') || params.get('search'))) return true;
  if (path === '/admin/blog-posts' && params.get('search')) return true;
  return false;
}

function emptySearchPage() {
  return { data: [], current_page: 1, last_page: 1, total: 0 };
}

function normalizeGlobalSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function matchesGlobalTourSearch(tour: { name: string; slug: string }, search: string): boolean {
  if (!search) return true;
  const haystack = normalizeGlobalSearchText(`${tour.name} ${tour.slug}`);
  const needle = normalizeGlobalSearchText(search);
  if (haystack.includes(needle)) return true;
  const words = needle.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.every((word) => haystack.includes(word));
}

function fulfillGlobalSearch(route: Route, path: string, params: URLSearchParams) {
  if (flags.globalSearchFail) {
    return fulfillError(route);
  }
  if (flags.globalSearchEmpty) {
    return fulfillJson(route, emptySearchPage());
  }

  const search = (params.get('search') || params.get('q') || '').trim().toLowerCase();
  const perPage = Number(params.get('per_page')) || 3;

  if (path === '/admin/tours') {
    const matches = matchesGlobalTourSearch(mockGlobalSearchTourHit, search);
    const hits = matches ? [mockGlobalSearchTourHit] : [];
    return fulfillJson(route, {
      data: hits,
      current_page: 1,
      last_page: 1,
      total: hits.length,
    });
  }

  if (path === '/admin/bookings') {
    const source = [...mockBookingRows, ...mockBookingRowsPage2];
    const hits = source
      .filter((row) => {
        if (!search) return true;
        return (
          row.booking_code.toLowerCase().includes(search) ||
          row.customer_name.toLowerCase().includes(search) ||
          (row.tour_name || '').toLowerCase().includes(search)
        );
      })
      .slice(0, perPage);
    return fulfillJson(route, {
      data: hits,
      current_page: 1,
      last_page: 1,
      total: hits.length,
    });
  }

  return fulfillJson(route, emptySearchPage());
}

export async function mockDashboardApi(page: Page) {
  const handler = async (route: Route) => {
    const type = route.request().resourceType();
    if (type === 'document') {
      await route.continue();
      return;
    }

    const url = route.request().url();
    if (!isDashboardApi(url)) {
      await route.continue();
      return;
    }

    const method = route.request().method();
    const path = pathname(url);
    const params = new URL(url).searchParams;

    if (method === 'POST' && path === '/auth/logout') {
      await fulfillJson(route, { message: 'ok' });
      return;
    }

    if (isGlobalSearchRequest(path, params)) {
      await fulfillGlobalSearch(route, path, params);
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/notification-counts') {
      if (flags.notificationsFail) {
        await fulfillError(route);
        return;
      }
      await fulfillJson(route, mockNotificationCounts);
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/stats') {
      if (flags.statsFail) {
        await fulfillError(route);
        return;
      }
      if (flags.statsLegacyEnvelope) {
        await fulfillJson(route, mockDashboardStatsLegacyEnvelope);
        return;
      }
      await fulfillJson(route, mockDashboardStats);
      return;
    }

    if (method === 'GET' && path === '/admin/bookings/status-counts') {
      if (flags.statusCountsFail) {
        await fulfillError(route);
        return;
      }
      const counts = flags.useZeroStatusCounts ? mockBookingStatusCountsZero : mockBookingStatusCounts;
      await fulfillJson(route, counts);
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/revenue') {
      if (flags.revenueFail) {
        await fulfillError(route);
        return;
      }
      await fulfillJson(route, {
        period: params.get('period') ?? 'day',
        from: params.get('from'),
        to: params.get('to'),
        stats: flags.revenueEmpty ? [] : mockRevenueSeries,
      });
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/booking-trend') {
      if (flags.bookingTrendFail) {
        await fulfillError(route);
        return;
      }
      await fulfillJson(route, {
        days: params.get('days') ?? '30',
        stats: flags.bookingTrendEmpty ? [] : mockBookingTrendSeries,
      });
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/user-growth') {
      if (flags.userGrowthFail) {
        await fulfillError(route);
        return;
      }
      await fulfillJson(route, {
        year: params.get('year') ?? String(new Date().getFullYear()),
        stats: flags.userGrowthEmpty ? [] : mockUserGrowthSeries,
      });
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/top-tours') {
      if (flags.topToursFail) {
        await fulfillError(route);
        return;
      }
      await fulfillJson(route, flags.topToursEmpty ? [] : mockTopTours);
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/search-trends') {
      if (flags.searchTrendsFail) {
        await fulfillError(route);
        return;
      }
      await fulfillJson(route, flags.searchTrendsEmpty ? mockSearchTrendsEmpty : mockSearchTrends);
      return;
    }

    if (method === 'GET' && path === '/admin/dashboard/export') {
      if (flags.exportFail) {
        await fulfillError(route);
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('mock-dashboard-export'),
        headers: {
          'Content-Disposition': 'attachment; filename="dashboard-report.xlsx"',
        },
      });
      return;
    }

    if (method === 'GET' && path === '/admin/bookings') {
      if (flags.bookingsFail) {
        await fulfillError(route);
        return;
      }
      const pageNum = Number(params.get('page')) || 1;
      const perPage = Number(params.get('per_page')) || 8;
      const status = params.get('booking_status') || params.get('status') || '';
      const filtered = flags.bookingsEmpty ? [] : filterBookings(status || null);
      const total = filtered.length;
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      const start = (pageNum - 1) * perPage;
      const slice = filtered.slice(start, start + perPage);

      await fulfillJson(route, {
        data: slice,
        current_page: pageNum,
        last_page: lastPage,
        per_page: perPage,
        total,
      });
      return;
    }

    if (method === 'GET' && (path === '/admin/ratings' || path.startsWith('/admin/ratings'))) {
      await fulfillJson(route, {
        data: [],
        total: mockDashboardStats.pending_ratings,
        meta: { total: mockDashboardStats.pending_ratings },
      });
      return;
    }

    if (method === 'GET' && (path === '/admin/contacts' || path.startsWith('/admin/contacts'))) {
      await fulfillJson(route, {
        data: [],
        total: mockDashboardStats.new_contacts,
        meta: { total: mockDashboardStats.new_contacts },
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/**', handler);
}
