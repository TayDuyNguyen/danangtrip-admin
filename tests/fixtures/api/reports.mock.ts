import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import {
  mockBookingsReport,
  mockLocationsDistribution,
  mockRatingsReport,
  mockRevenuePaymentsList,
  mockRevenuePaymentsSummary,
  mockRevenueTourDetails,
  mockRevenueTrend,
  mockUsersReport,
} from '../data/reports-shared.data';

const MINIMAL_XLSX = Buffer.from(
  'UEsDBBQAAAAIAAAAIQAAAAAAABAAAAAAZGF0YS54bWxQSwECFAAUAAAACAAAACEAAAAAAAAQAAAAAAAAAAAAAAABAAAAZGF0YS54bWxQSwUGAAAAAAEAAQAxAAAAIQAAAAAA',
  'base64'
);

const flags = {
  revenueFail: false,
  revenueDelayMs: 0,
  revenueExportFail: false,
  bookingsFail: false,
  bookingsExportFail: false,
  ratingsFail: false,
  ratingsExportFail: false,
  usersFail: false,
  usersExportFail: false,
  locationsFail: false,
  locationsExportFail: false,
};

export function resetMockReports() {
  flags.revenueFail = false;
  flags.revenueDelayMs = 0;
  flags.revenueExportFail = false;
  flags.bookingsFail = false;
  flags.bookingsExportFail = false;
  flags.ratingsFail = false;
  flags.ratingsExportFail = false;
  flags.usersFail = false;
  flags.usersExportFail = false;
  flags.locationsFail = false;
  flags.locationsExportFail = false;
}

export function setRevenueApiFail(on = true) {
  flags.revenueFail = on;
}

export function setRevenueApiDelay(ms: number) {
  flags.revenueDelayMs = ms;
}

export function setRevenueExportFail(on = true) {
  flags.revenueExportFail = on;
}

export function setBookingsApiFail(on = true) {
  flags.bookingsFail = on;
}

export function setBookingsExportFail(on = true) {
  flags.bookingsExportFail = on;
}

export function setRatingsReportFail(on = true) {
  flags.ratingsFail = on;
}

export function setUsersReportFail(on = true) {
  flags.usersFail = on;
}

export function setLocationsReportFail(on = true) {
  flags.locationsFail = on;
}

export function setRevenueExportFailFlag(on = true) {
  flags.revenueExportFail = on;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function paginatePayments(url: string) {
  const params = new URL(url).searchParams;
  const page = Math.max(1, Number(params.get('page') || 1));
  const perPage = Math.max(1, Number(params.get('per_page') || 10));
  let rows = [...mockRevenuePaymentsList];
  const gateway = params.get('payment_gateway');
  if (gateway) {
    rows = rows.filter((r) => r.payment_gateway === gateway);
  }
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const offset = (page - 1) * perPage;
  return {
    data: rows.slice(offset, offset + perPage),
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
  };
}

async function maybeDelay() {
  if (flags.revenueDelayMs > 0) {
    await new Promise((r) => setTimeout(r, flags.revenueDelayMs));
  }
}

export async function mockReportsApi(page: Page) {
  await page.route('**/api/v1/**', async (route: Route) => {
    const url = route.request().url();
    const path = pathname(url);
    const method = route.request().method();

    if (method === 'GET' && /\/admin\/dashboard\/revenue\/?$/.test(path)) {
      if (flags.revenueFail) {
        await maybeDelay();
        await route.fulfill({ status: 500, json: errorEnvelope('Revenue trend failed') });
        return;
      }
      await maybeDelay();
      await route.fulfill({ status: 200, json: successEnvelope(mockRevenueTrend) });
      return;
    }

    if (method === 'GET' && /\/admin\/reports\/revenue-detail\/?$/.test(path)) {
      if (flags.revenueFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Revenue detail failed') });
        return;
      }
      await route.fulfill({ status: 200, json: successEnvelope(mockRevenueTourDetails) });
      return;
    }

    if (method === 'GET' && /\/admin\/reports\/revenue-payments-summary\/?$/.test(path)) {
      if (flags.revenueFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Revenue payments summary failed') });
        return;
      }
      await route.fulfill({ status: 200, json: successEnvelope(mockRevenuePaymentsSummary) });
      return;
    }

    if (method === 'GET' && /\/admin\/payments\/export\/?$/.test(path)) {
      if (flags.revenueExportFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Export failed') });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers: {
          'content-disposition': 'attachment; filename="bao-cao-doanh-thu.xlsx"',
        },
        body: MINIMAL_XLSX,
      });
      return;
    }

    if (method === 'GET' && /\/admin\/payments\/?$/.test(path)) {
      if (flags.revenueFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Payments list failed') });
        return;
      }
      await route.fulfill({ status: 200, json: successEnvelope(paginatePayments(url)) });
      return;
    }

    if (method === 'GET' && /\/admin\/reports\/bookings\/?$/.test(path)) {
      if (flags.bookingsFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Bookings report failed') });
        return;
      }
      await route.fulfill({ status: 200, json: successEnvelope(mockBookingsReport) });
      return;
    }

    if (method === 'GET' && /\/admin\/bookings\/export\/?$/.test(path)) {
      if (flags.bookingsExportFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Export failed') });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: MINIMAL_XLSX,
      });
      return;
    }

    if (method === 'GET' && /\/admin\/reports\/ratings\/?$/.test(path)) {
      if (flags.ratingsFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Ratings report failed') });
        return;
      }
      await route.fulfill({ status: 200, json: successEnvelope(mockRatingsReport) });
      return;
    }

    if (method === 'GET' && /\/admin\/ratings\/export\/?$/.test(path)) {
      if (flags.ratingsExportFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Export failed') });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: MINIMAL_XLSX,
      });
      return;
    }

    if (method === 'GET' && /\/admin\/reports\/users\/?$/.test(path)) {
      if (flags.usersFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Users report failed') });
        return;
      }
      await route.fulfill({ status: 200, json: successEnvelope(mockUsersReport) });
      return;
    }

    if (method === 'GET' && /\/admin\/users\/export\/?$/.test(path)) {
      if (flags.usersExportFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Export failed') });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: MINIMAL_XLSX,
      });
      return;
    }

    if (method === 'GET' && /\/admin\/reports\/locations\/?$/.test(path)) {
      if (flags.locationsFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Locations report failed') });
        return;
      }
      await route.fulfill({ status: 200, json: successEnvelope(mockLocationsDistribution) });
      return;
    }

    if (method === 'GET' && /\/admin\/locations\/export\/?$/.test(path)) {
      if (flags.locationsExportFail) {
        await route.fulfill({ status: 500, json: errorEnvelope('Export failed') });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: MINIMAL_XLSX,
      });
      return;
    }

    if (method === 'GET' && /\/admin\/locations\/stats\/?$/.test(path)) {
      await route.fulfill({
        status: 200,
        json: successEnvelope({
          total: 57,
          active: 48,
          draft: 9,
          featured: 12,
          total_views: 125_000,
        }),
      });
      return;
    }

    if (method === 'GET' && /\/admin\/locations\/?$/.test(path) && !path.includes('/export')) {
      await route.fulfill({
        status: 200,
        json: successEnvelope({
          data: [
            {
              id: 1,
              name: 'Bãi biển Mỹ Khê',
              district: 'Sơn Trà',
              status: 'active',
              favorite_count: 120,
              view_count: 4500,
              average_rating: 4.8,
            },
          ],
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1,
        }),
      });
      return;
    }

    if (method === 'GET' && /\/admin\/dashboard\/top-locations\/?$/.test(path)) {
      await route.fulfill({
        status: 200,
        json: successEnvelope([
          { id: 1, name: 'Bãi biển Mỹ Khê', district: 'Sơn Trà', favorite_count: 120 },
        ]),
      });
      return;
    }

    if (method === 'GET' && /\/admin\/location-categories\/?$/.test(path)) {
      await route.fulfill({
        status: 200,
        json: successEnvelope([{ id: 1, name: 'Bãi biển' }]),
      });
      return;
    }

    if (method === 'GET' && /\/admin\/locations\/filter-districts\/?$/.test(path)) {
      await route.fulfill({
        status: 200,
        json: successEnvelope(['Sơn Trà', 'Hải Châu', 'Ngũ Hành Sơn']),
      });
      return;
    }

    await route.continue();
  });
}

export default mockReportsApi;
