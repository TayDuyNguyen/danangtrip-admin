import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import type { RawLocation } from '@/types/location';
import {
  computeLocationStats,
  mockLocationCategories,
  mockLocationDistricts,
  mockLocationListRows,
} from '../data/locations.data';
import { mockLocationAmenities, mockLocationTags } from '../data/location-create.data';
import {
  emptyReviewsLocationId,
  mockLocationRatings,
  mockLocationRatingStats,
} from '../data/location-detail.data';

const flags = {
  listFail: false,
  statsFail: false,
  categoriesFail: false,
  districtsFail: false,
  mutationFail: false,
  exportFail: false,
  deleteFailForId: null as number | null,
  featuredFailForId: null as number | null,
  statusFailForId: null as number | null,
  listEmpty: false,
  listDelayMs: 0,
  createFail: false,
  createFailStatus: 422,
  createFailMessage: 'Duplicate location slug',
  detailFailForId: null as number | null,
  detailFailStatus: 404,
  updateFail: false,
  updateFailStatus: 500,
  updateFailMessage: 'Update failed',
  detailDelayMs: 0,
  ratingsFailForId: null as number | null,
};

let uploadCounter = 0;
let lastCreatedLocationId: number | null = null;

let dataset: RawLocation[] = structuredClone(mockLocationListRows);

export function resetMockLocations() {
  dataset = structuredClone(mockLocationListRows);
  flags.listFail = false;
  flags.statsFail = false;
  flags.categoriesFail = false;
  flags.districtsFail = false;
  flags.mutationFail = false;
  flags.exportFail = false;
  flags.deleteFailForId = null;
  flags.featuredFailForId = null;
  flags.statusFailForId = null;
  flags.listEmpty = false;
  flags.listDelayMs = 0;
  flags.createFail = false;
  flags.detailFailForId = null;
  flags.detailFailStatus = 404;
  flags.updateFail = false;
  flags.detailDelayMs = 0;
  flags.ratingsFailForId = null;
  uploadCounter = 0;
  lastCreatedLocationId = null;
}

export function setLocationListFail(on = true) {
  flags.listFail = on;
}

export function setLocationStatsFail(on = true) {
  flags.statsFail = on;
}

export function setLocationListEmpty(on = true) {
  flags.listEmpty = on;
}

export function setLocationMutationFail(on = true) {
  flags.mutationFail = on;
}

export function setLocationExportFail(on = true) {
  flags.exportFail = on;
}

export function setLocationDeleteFailForId(id: number | null) {
  flags.deleteFailForId = id;
}

export function setLocationFeaturedFailForId(id: number | null) {
  flags.featuredFailForId = id;
}

export function setLocationListDelay(ms: number) {
  flags.listDelayMs = ms;
}

export function setLocationCreateFail(on = true, status = 422, message = 'Duplicate location slug') {
  flags.createFail = on;
  flags.createFailStatus = status;
  flags.createFailMessage = message;
}

export function setLocationDetailFailForId(id: number | null, status = 404) {
  flags.detailFailForId = id;
  flags.detailFailStatus = status;
}

export function setLocationUpdateFail(on = true, status = 500, message = 'Update failed') {
  flags.updateFail = on;
  flags.updateFailStatus = status;
  flags.updateFailMessage = message;
}

export function patchMockLocation(id: number, partial: Partial<RawLocation>) {
  const row = dataset.find((r) => r.id === id);
  if (row) Object.assign(row, partial);
}

export function getMockLocationAfterUpdate(id: number) {
  return dataset.find((r) => r.id === id);
}

export function setLocationDetailDelay(ms: number) {
  flags.detailDelayMs = ms;
}

export function setLocationRatingsFailForId(id: number | null) {
  flags.ratingsFailForId = id;
}

export function getMockLocation(id: number) {
  return dataset.find((r) => r.id === id);
}

export function getLastCreatedLocationId() {
  return lastCreatedLocationId;
}

export function findMockLocationByName(name: string) {
  return dataset.find((row) => row.name === name);
}

export function setLocationStatusFailForId(id: number | null) {
  flags.statusFailForId = id;
}

function parsePublicLocationSubResource(path: string): { id: number; kind: 'ratings' | 'rating-stats' } | null {
  const match = path.match(/\/locations\/(\d+)\/(ratings|rating-stats)\/?$/);
  if (!match) return null;
  return {
    id: Number(match[1]),
    kind: match[2] === 'rating-stats' ? 'rating-stats' : 'ratings',
  };
}

function ratingsForLocation(id: number) {
  if (id === emptyReviewsLocationId) return [];
  return mockLocationRatings;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isCategoriesPath(url: string) {
  const path = pathname(url);
  return /\/categories\/?$/.test(path) && !path.includes('/admin/categories');
}

function isDistrictsPath(url: string) {
  return /\/admin\/locations\/districts\/?$/.test(pathname(url));
}

function isStatsPath(url: string) {
  return /\/admin\/locations\/stats\/?$/.test(pathname(url));
}

function isListPath(url: string) {
  const path = pathname(url);
  return /\/admin\/locations\/?$/.test(path);
}

function isDetailPath(url: string) {
  return /\/admin\/locations\/\d+\/?$/.test(pathname(url));
}

function isExportPath(url: string) {
  return /\/admin\/locations\/export\/?$/.test(pathname(url));
}

function isTagsPath(url: string) {
  const path = pathname(url);
  return /\/tags\/?$/.test(path);
}

function isAmenitiesPath(url: string) {
  return /\/amenities\/?$/.test(pathname(url));
}

function isUploadImagePath(url: string) {
  return /\/upload\/image\/?$/.test(pathname(url));
}

function isUploadImagesPath(url: string) {
  return /\/upload\/images\/?$/.test(pathname(url));
}

function shouldMockRoute(url: string): boolean {
  return (
    isListPath(url) ||
    isStatsPath(url) ||
    isDistrictsPath(url) ||
    isExportPath(url) ||
    isCategoriesPath(url) ||
    isTagsPath(url) ||
    isAmenitiesPath(url) ||
    isUploadImagePath(url) ||
    isUploadImagesPath(url) ||
    isDetailPath(url) ||
    parsePublicLocationSubResource(pathname(url)) != null ||
    /\/admin\/locations\/\d+(\/featured|\/status)?\/?$/.test(pathname(url))
  );
}

function nextUploadUrl(label: string) {
  uploadCounter += 1;
  return `https://picsum.photos/seed/mock-loc-${label}-${uploadCounter}/400/300`;
}

function applySearch(rows: RawLocation[], q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter(
    (row) =>
      row.name.toLowerCase().includes(term) ||
      row.address.toLowerCase().includes(term) ||
      (row.short_description ?? '').toLowerCase().includes(term) ||
      (row.district ?? '').toLowerCase().includes(term)
  );
}

function filterLocations(params: URLSearchParams, source: RawLocation[]) {
  let rows = [...source];

  const q = params.get('q') || '';
  rows = applySearch(rows, q);

  const categoryId = params.get('category_id');
  if (categoryId) {
    rows = rows.filter((row) => row.category_id === Number(categoryId));
  }

  const district = params.get('district');
  if (district) {
    rows = rows.filter((row) => row.district === district);
  }

  const priceLevel = params.get('price_level');
  if (priceLevel) {
    rows = rows.filter((row) => Number(row.price_level) === Number(priceLevel));
  }

  const status = params.get('status');
  if (status && status !== 'all') {
    rows = rows.filter((row) => row.status === status);
  }

  return rows;
}

function paginate(params: URLSearchParams, rows: RawLocation[]) {
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

function parseLocationId(path: string): number | null {
  const match = path.match(/\/admin\/locations\/(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function mockLocationsApi(page: Page) {
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
        body: JSON.stringify(successEnvelope(mockLocationCategories)),
      });
      return;
    }

    if (method === 'GET' && isDistrictsPath(url)) {
      if (flags.districtsFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Districts failed', 500)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(mockLocationDistricts)),
      });
      return;
    }

    if (method === 'GET' && isExportPath(url)) {
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
        headers: { 'Content-Disposition': 'attachment; filename="locations-export.xlsx"' },
        body: Buffer.from('mock-locations-xlsx'),
      });
      return;
    }

    if (method === 'GET' && isStatsPath(url)) {
      if (flags.statsFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Stats failed', 500)),
        });
        return;
      }
      const stats = computeLocationStats(flags.listEmpty ? [] : dataset);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(stats)),
      });
      return;
    }

    if (method === 'GET' && isDetailPath(url)) {
      if (flags.detailDelayMs > 0) {
        await new Promise((r) => setTimeout(r, flags.detailDelayMs));
      }
      const id = parseLocationId(path);
      if (id != null && flags.detailFailForId === id) {
        await route.fulfill({
          status: flags.detailFailStatus,
          contentType: 'application/json',
          body: JSON.stringify(
            errorEnvelope(
              flags.detailFailStatus === 404 ? 'Location not found' : 'Location detail failed',
              flags.detailFailStatus
            )
          ),
        });
        return;
      }
      const row = id != null ? dataset.find((r) => r.id === id) : undefined;
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Location not found', 404)),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(row)),
      });
      return;
    }

    const publicSub = parsePublicLocationSubResource(path);
    if (method === 'GET' && publicSub) {
      if (flags.ratingsFailForId === publicSub.id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Ratings failed', 500)),
        });
        return;
      }
      if (publicSub.kind === 'rating-stats') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(successEnvelope(mockLocationRatingStats)),
        });
        return;
      }
      const rows = ratingsForLocation(publicSub.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            current_page: 1,
            data: rows,
            last_page: 1,
            per_page: 10,
            total: rows.length,
          })
        ),
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
          body: JSON.stringify(errorEnvelope('List failed', 500)),
        });
        return;
      }
      const source = flags.listEmpty ? [] : dataset;
      const filtered = filterLocations(params, source);
      const pagePayload = paginate(params, filtered);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(pagePayload)),
      });
      return;
    }

    if (method === 'GET' && isTagsPath(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(mockLocationTags)),
      });
      return;
    }

    if (method === 'GET' && isAmenitiesPath(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(mockLocationAmenities)),
      });
      return;
    }

    if (method === 'POST' && isUploadImagePath(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({ url: nextUploadUrl('thumb'), public_id: `mock/thumb-${uploadCounter}` })
        ),
      });
      return;
    }

    if (method === 'POST' && isUploadImagesPath(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope([{ url: nextUploadUrl('gal'), public_id: `mock/gal-${uploadCounter}` }])
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
      lastCreatedLocationId = nextId;
      const categoryId = Number(body.category_id) || 1;
      const category = mockLocationCategories.find((c) => c.id === categoryId) ?? mockLocationCategories[0]!;
      const row: RawLocation = {
        id: nextId,
        name: String(body.name ?? `Location ${nextId}`),
        slug: String(body.slug ?? `location-${nextId}`),
        category_id: categoryId,
        address: String(body.address ?? ''),
        description: String(body.description ?? ''),
        short_description: String(body.short_description ?? ''),
        price_level: Number(body.price_level ?? 2),
        price_min: body.price_min != null ? Number(body.price_min) : undefined,
        price_max: body.price_max != null ? Number(body.price_max) : undefined,
        thumbnail: String(body.thumbnail ?? ''),
        images: (body.images as string[]) ?? [],
        status: (body.status as 'active' | 'inactive') ?? 'active',
        is_featured: !!body.is_featured,
        view_count: 0,
        favorite_count: 0,
        avg_rating: 0,
        review_count: 0,
        district: String(body.district ?? ''),
        category: { id: category.id, name: category.name },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dataset = [row, ...dataset];
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ id: nextId })),
      });
      return;
    }

    if (method === 'PUT' && isDetailPath(url)) {
      const id = parseLocationId(path);
      if (id == null) {
        await route.continue();
        return;
      }
      if (flags.mutationFail || flags.updateFail) {
        await route.fulfill({
          status: flags.updateFailStatus,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope(flags.updateFailMessage, flags.updateFailStatus)),
        });
        return;
      }
      const row = dataset.find((r) => r.id === id);
      if (!row) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Location not found', 404)),
        });
        return;
      }
      const body = route.request().postDataJSON() as Record<string, unknown>;
      Object.assign(row, body, { updated_at: new Date().toISOString() });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    if (method === 'DELETE' && /\/admin\/locations\/\d+\/?$/.test(path)) {
      const id = parseLocationId(path)!;
      if (flags.mutationFail || flags.deleteFailForId === id) {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Cannot delete location linked to tours', 422)),
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

    if (method === 'PATCH' && /\/featured$/.test(path)) {
      const id = parseLocationId(path)!;
      if (flags.mutationFail || flags.featuredFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Featured update failed', 500)),
        });
        return;
      }
      const body = route.request().postDataJSON() as { is_featured?: boolean };
      const row = dataset.find((r) => r.id === id);
      if (row) row.is_featured = !!body.is_featured;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    if (method === 'PATCH' && /\/status$/.test(path)) {
      const id = parseLocationId(path)!;
      if (flags.mutationFail || flags.statusFailForId === id) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(errorEnvelope('Status update failed', 500)),
        });
        return;
      }
      const body = route.request().postDataJSON() as { status?: 'active' | 'inactive' };
      const row = dataset.find((r) => r.id === id);
      if (row && body.status) row.status = body.status;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope(null)),
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/locations/*/ratings**', handler);
  await page.route('**/locations/*/ratings**', handler);
  await page.route('**/api/v1/locations/*/rating-stats**', handler);
  await page.route('**/locations/*/rating-stats**', handler);
  await page.route('**/api/v1/admin/locations**', handler);
  await page.route('**/admin/locations**', handler);
  await page.route('**/api/v1/categories**', handler);
  await page.route('**/categories**', handler);
  await page.route('**/api/v1/tags**', handler);
  await page.route('**/tags**', handler);
  await page.route('**/api/v1/amenities**', handler);
  await page.route('**/amenities**', handler);
  await page.route('**/api/v1/upload/**', handler);
  await page.route('**/upload/**', handler);
}
