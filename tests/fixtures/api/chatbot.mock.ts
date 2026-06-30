import type { Page, Route } from '@playwright/test';
import { errorEnvelope, successEnvelope } from '../../../helpers/apiResponse';
import {
  LOGS_PER_PAGE,
  mockChatbotCacheRows,
  mockChatbotLogRows,
  mockChatbotStatsBase,
  mockChatbotStatsEmptyIntents,
  mockChatbotStatsWithErrors,
  type MockChatbotStatsVariant,
} from '../data/chatbot.data';
import type { ChatCacheItem, ChatLog } from '@/api/chatbotApi';

const flags = {
  statsFail: false,
  logsFail: false,
  logsEmpty: false,
  cacheFail: false,
  statsVariant: 'default' as MockChatbotStatsVariant,
};

let statsDataset = structuredClone(mockChatbotStatsBase);
let logsDataset: ChatLog[] = structuredClone(mockChatbotLogRows);
let cacheDataset: ChatCacheItem[] = structuredClone(mockChatbotCacheRows);

export function resetMockChatbot() {
  statsDataset = structuredClone(mockChatbotStatsBase);
  logsDataset = structuredClone(mockChatbotLogRows);
  cacheDataset = structuredClone(mockChatbotCacheRows);
  flags.statsFail = false;
  flags.logsFail = false;
  flags.logsEmpty = false;
  flags.cacheFail = false;
  flags.statsVariant = 'default';
}

export function setChatbotStatsFail(on = true) {
  flags.statsFail = on;
}

export function setChatbotLogsFail(on = true) {
  flags.logsFail = on;
}

export function setChatbotLogsEmpty(on = true) {
  flags.logsEmpty = on;
}

export function setChatbotCacheFail(on = true) {
  flags.cacheFail = on;
}

export function setChatbotStatsVariant(variant: MockChatbotStatsVariant) {
  flags.statsVariant = variant;
  if (variant === 'with_errors') {
    statsDataset = structuredClone(mockChatbotStatsWithErrors);
  } else if (variant === 'empty_intents') {
    statsDataset = structuredClone(mockChatbotStatsEmptyIntents);
  } else {
    statsDataset = structuredClone(mockChatbotStatsBase);
  }
}

function pathname(url: string) {
  return new URL(url).pathname.replace(/\/$/, '');
}

function isChatbotPath(url: string) {
  return /\/admin\/chatbot/.test(pathname(url));
}

function filterLogs(params: URLSearchParams): ChatLog[] {
  let rows = [...logsDataset];
  const search = params.get('search')?.trim().toLowerCase();
  const intent = params.get('intent');
  const cacheHit = params.get('cache_hit');
  const rating = params.get('rating');

  if (search) {
    rows = rows.filter(
      (row) =>
        row.question.toLowerCase().includes(search) ||
        row.answer.toLowerCase().includes(search)
    );
  }
  if (intent) {
    rows = rows.filter((row) => row.intent === intent);
  }
  if (cacheHit !== null && cacheHit !== '') {
    const hit = cacheHit === 'true';
    rows = rows.filter((row) => row.cache_hit === hit);
  }
  if (rating) {
    rows = rows.filter((row) => row.metadata?.rating === rating);
  }
  return rows;
}

async function handleChatbotRoute(route: Route) {
  const url = route.request().url();
  if (!isChatbotPath(url)) {
    await route.continue();
    return;
  }

  const path = pathname(url);
  const method = route.request().method();
  const params = new URL(url).searchParams;

  if (method === 'GET' && /\/admin\/chatbot\/stats$/.test(path)) {
    if (flags.statsFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Stats failed', 500)),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(structuredClone(statsDataset))),
    });
    return;
  }

  if (method === 'GET' && /\/admin\/chatbot\/logs$/.test(path)) {
    if (flags.logsFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Logs failed', 500)),
      });
      return;
    }
    const filtered = flags.logsEmpty ? [] : filterLogs(params);
    const page = Math.max(1, Number(params.get('page') || 1));
    const perPage = LOGS_PER_PAGE;
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const data = filtered.slice(start, start + perPage);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        successEnvelope({
          data,
          current_page: page,
          last_page: lastPage,
          per_page: perPage,
          total,
        })
      ),
    });
    return;
  }

  if (method === 'GET' && /\/admin\/chatbot\/cache$/.test(path)) {
    if (flags.cacheFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Cache failed', 500)),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(structuredClone(cacheDataset))),
    });
    return;
  }

  if (method === 'DELETE' && /\/admin\/chatbot\/cache\/[^/]+$/.test(path)) {
    const hash = path.split('/').pop()!;
    const exists = cacheDataset.some((c) => c.question_hash === hash);
    if (!exists) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify(errorEnvelope('Cache not found', 404)),
      });
      return;
    }
    cacheDataset = cacheDataset.filter((c) => c.question_hash !== hash);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(null, 'Cache entry deleted')),
    });
    return;
  }

  if (method === 'DELETE' && /\/admin\/chatbot\/cache$/.test(path)) {
    cacheDataset = [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successEnvelope(null, 'All cache cleared')),
    });
    return;
  }

  await route.continue();
}

export async function mockChatbotApi(page: Page) {
  await page.route('**/api/v1/admin/chatbot/**', handleChatbotRoute);
}
