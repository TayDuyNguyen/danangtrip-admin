import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import { mockRawSettings } from '../data/settings.data';

const flags = {
  loadFail: false,
  saveFail: false,
  loadDelayMs: 0,
};

let dataset: Record<string, Record<string, unknown>> = structuredClone(mockRawSettings);
let lastPutBody: { settings?: Record<string, unknown> } | null = null;

export function resetMockSettings() {
  dataset = structuredClone(mockRawSettings);
  lastPutBody = null;
  flags.loadFail = false;
  flags.saveFail = false;
  flags.loadDelayMs = 0;
}

export function setSettingsLoadFail(on = true) {
  flags.loadFail = on;
}

export function setSettingsSaveFail(on = true) {
  flags.saveFail = on;
}

export function setSettingsLoadDelay(ms: number) {
  flags.loadDelayMs = ms;
}

export function getLastSettingsPutBody() {
  return lastPutBody;
}

export function getMockSettingsDataset() {
  return dataset;
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isSettingsPath(url: string) {
  return /\/admin\/settings\/?$/.test(pathname(url));
}

async function handleSettingsRoute(route: Route) {
  const method = route.request().method();
  const url = route.request().url();

  if (!isSettingsPath(url)) {
    await route.continue();
    return;
  }

  if (method === 'GET') {
    if (flags.loadDelayMs > 0) {
      await new Promise((r) => setTimeout(r, flags.loadDelayMs));
    }
    if (flags.loadFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Settings load failed')),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(structuredClone(dataset))),
    });
    return;
  }

  if (method === 'PUT') {
    if (flags.saveFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Settings save failed')),
      });
      return;
    }

    const body = route.request().postDataJSON() as {
      settings?: Record<string, Record<string, unknown>>;
    };
    lastPutBody = body;

    if (body?.settings) {
      for (const [group, values] of Object.entries(body.settings)) {
        if (values && typeof values === 'object') {
          dataset[group] = {
            ...(dataset[group] ?? {}),
            ...values,
          };
        }
      }
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(null, 'Settings updated')),
    });
    return;
  }

  await route.continue();
}

/** Intercepts settings + layout polling on the shared api/v1 handler (same pattern as reports.mock). */
export async function mockSettingsApi(page: Page) {
  await page.route('**/api/v1/**', async (route: Route) => {
    const url = route.request().url();
    const path = pathname(url);
    const method = route.request().method();

    if (/\/admin\/settings\/?$/.test(path)) {
      await handleSettingsRoute(route);
      return;
    }

    if (method === 'GET' && /\/admin\/dashboard\/notification-counts\/?$/.test(path)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ unread_total: 0, items: [] })),
      });
      return;
    }

    if (method === 'POST' && /\/upload\/image\/?$/.test(path)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          successEnvelope({
            url: 'https://cdn.example.com/mock-upload.png',
            public_id: 'mock/settings-upload',
          })
        ),
      });
      return;
    }

    if (method === 'DELETE' && /\/upload\/image\/?$/.test(path)) {
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
