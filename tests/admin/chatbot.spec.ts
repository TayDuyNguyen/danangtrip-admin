/**
 * Admin Chatbot Hub — core (19)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { ChatbotPage, chatbotCopy as copy } from '../pages/admin/ChatbotPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockChatbotApi,
  resetMockChatbot,
  setChatbotLogsEmpty,
  setChatbotStatsFail,
  setChatbotStatsVariant,
} from '../fixtures/api/chatbot.mock';
import { mockSettingsApi, resetMockSettings } from '../fixtures/api/settings.mock';
import {
  mockChatbotDetailLog,
  mockChatbotSearchKeyword,
  mockChatbotStatsBase,
} from '../fixtures/data/chatbot.data';

test.describe.configure({ retries: 1 });

async function setupChatbotMocks(adminPage: import('@playwright/test').Page) {
  resetMockChatbot();
  resetMockSettings();
  await adminPage.unroute('**/api/v1/**');
  await mockAdminLayoutApis(adminPage);
  await mockSettingsApi(adminPage);
  await mockChatbotApi(adminPage);
  await mockAuthRefreshApi(adminPage);
}

test.describe('Admin Chatbot — navigation @P0', () => {
  let chatPage: ChatbotPage;

  test.beforeEach(async ({ adminPage }) => {
    await setupChatbotMocks(adminPage);
    chatPage = new ChatbotPage(adminPage);
    await chatPage.goto();
    await chatPage.waitForDashboardLoaded();
  });

  /** TC_AD_CHAT_004 */
  test('TC_AD_CHAT_004 shows breadcrumb and title', async () => {
    await expect(chatPage.heading).toBeVisible();
    await expect(chatPage.page.getByTestId('chatbot-breadcrumbs')).toBeVisible();
  });

  /** TC_AD_CHAT_005 */
  test('TC_AD_CHAT_005 switches to logs tab', async ({ adminPage }) => {
    await chatPage.openLogsTab();
    await expect(adminPage).toHaveURL(/tab=logs/);
    await expect(chatPage.logsSearchInput).toBeVisible();
    await expect(chatPage.dashboardPanel).toBeHidden();
  });

  /** TC_AD_CHAT_006 */
  test('TC_AD_CHAT_006 switches to settings tab', async ({ adminPage }) => {
    await chatPage.openSettingsTab();
    await expect(adminPage).toHaveURL(/tab=settings/);
    await expect(chatPage.settingsPanel.getByText(copy.cacheTitle)).toBeVisible();
    await expect(chatPage.saveSettingsButton).toBeVisible();
  });

  /** TC_AD_CHAT_007 */
  test('TC_AD_CHAT_007 reload preserves active tab from URL', async ({ adminPage }) => {
    await chatPage.openLogsTab();
    await expect(adminPage).toHaveURL(/tab=logs/);
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(adminPage).toHaveURL(/tab=logs/);
    chatPage = new ChatbotPage(adminPage);
    await chatPage.hub.waitFor({ state: 'visible' });
    await expect(chatPage.logsSearchInput).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Admin Chatbot — dashboard @P1', () => {
  let chatPage: ChatbotPage;

  test.beforeEach(async ({ adminPage }) => {
    await setupChatbotMocks(adminPage);
    chatPage = new ChatbotPage(adminPage);
    await chatPage.goto();
    await chatPage.waitForDashboardLoaded();
  });

  /** TC_AD_CHAT_011 */
  test('TC_AD_CHAT_011 shows stats error and retry', async ({ adminPage }) => {
    setChatbotStatsFail(true);
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockSettingsApi(adminPage);
    await mockChatbotApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await adminPage.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByTestId('chatbot-hub').getByText(copy.dashboardErrorTitle)).toBeVisible({
      timeout: 20_000,
    });
    setChatbotStatsFail(false);
    const statsReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/chatbot/stats') && res.status() === 200
    );
    await adminPage.getByTestId('chatbot-hub').getByRole('button', { name: copy.tryAgain }).click();
    await statsReq;
    chatPage = new ChatbotPage(adminPage);
    await chatPage.waitForDashboardLoaded();
  });

  /** TC_AD_CHAT_013 */
  test('TC_AD_CHAT_013 renders five KPI cards', async () => {
    await expect(chatPage.kpiCard(copy.totalMessages)).toBeVisible();
    await expect(chatPage.kpiCard(copy.cacheHitRate)).toBeVisible();
    await expect(chatPage.kpiCard(copy.avgLatency)).toBeVisible();
    await expect(chatPage.kpiCard(copy.llmCost)).toBeVisible();
    await expect(chatPage.kpiCard(copy.errorsFailover)).toBeVisible();
  });

  /** TC_AD_CHAT_014 */
  test('TC_AD_CHAT_014 KPI values match mock stats', async () => {
    const kpis = mockChatbotStatsBase.kpis;
    await expect(chatPage.kpiCard(copy.totalMessages).locator('h4')).toHaveText(/1[,.]284/);
    await expect(chatPage.kpiCard(copy.cacheHitRate)).toContainText(`${kpis.cache_hit_rate}%`);
    await expect(chatPage.kpiCard(copy.avgLatency)).toContainText(`${kpis.avg_latency}`);
  });

  /** TC_AD_CHAT_015 */
  test('TC_AD_CHAT_015 highlights errors card when system_errors > 0', async ({ adminPage }) => {
    setChatbotStatsVariant('with_errors');
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockSettingsApi(adminPage);
    await mockChatbotApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await adminPage.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });
    await adminPage.getByTestId('chatbot-hub').waitFor({ state: 'visible' });
    chatPage = new ChatbotPage(adminPage);
    await chatPage.waitForDashboardLoaded();
    const errorsCard = chatPage.kpiCard(copy.errorsFailover);
    await expect(errorsCard).toContainText('3');
    await expect(errorsCard.locator('.animate-pulse')).toBeVisible();
  });

  /** TC_AD_CHAT_016 */
  test('TC_AD_CHAT_016 refresh data refetches stats', async ({ adminPage }) => {
    const statsReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/chatbot/stats') && res.request().method() === 'GET'
    );
    await chatPage.refreshDataButton.click();
    await statsReq;
  });

  /** TC_AD_CHAT_020 */
  test('TC_AD_CHAT_020 renders technical chart sections', async () => {
    await expect(chatPage.dashboardPanel.getByText(copy.latencyTrend)).toBeVisible();
    await expect(
      chatPage.dashboardPanel.getByRole('heading', { name: /Cache efficiency|Semantic Cache Performance|Hiệu quả Semantic Cache/i })
    ).toBeVisible();
  });

  /** TC_AD_CHAT_030 */
  test('TC_AD_CHAT_030 renders intent distribution section', async () => {
    await expect(
      chatPage.hub.getByRole('heading', { name: /Intent Distribution|Phân bố Ý định/i })
    ).toBeVisible();
  });

  /** TC_AD_CHAT_031 */
  test('TC_AD_CHAT_031 shows empty intent state', async ({ adminPage }) => {
    setChatbotStatsVariant('empty_intents');
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockSettingsApi(adminPage);
    await mockChatbotApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await adminPage.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });
    await expect(adminPage.getByTestId('chatbot-hub').getByText(/no intent|Không có dữ liệu ý định/i)).toBeVisible();
  });

  /** TC_AD_CHAT_040 */
  test('TC_AD_CHAT_040 shows unknown intents table row', async () => {
    await expect(chatPage.dashboardPanel.getByText(copy.unknownIntents)).toBeVisible();
    await expect(chatPage.dashboardPanel.getByText('Có tour đi Lý Sơn không?')).toBeVisible();
  });

  /** TC_AD_CHAT_042 */
  test('TC_AD_CHAT_042 shows negative feedback list', async () => {
    await expect(chatPage.dashboardPanel.getByText(copy.negativeFeedbacks)).toBeVisible();
    await expect(chatPage.dashboardPanel.getByText('Giá tour Bà Nà bao nhiêu?')).toBeVisible();
  });
});

test.describe('Admin Chatbot — logs @P1', () => {
  let chatPage: ChatbotPage;

  test.beforeEach(async ({ adminPage }) => {
    await setupChatbotMocks(adminPage);
    chatPage = new ChatbotPage(adminPage);
    await chatPage.goto();
    await chatPage.openLogsTab();
    await expect(chatPage.logsTableRows.first()).toBeVisible({ timeout: 20_000 });
  });

  /** TC_AD_CHAT_050 */
  test('TC_AD_CHAT_050 loads logs page 1', async () => {
    await expect(chatPage.logsTableRows).toHaveCount(15);
  });

  /** TC_AD_CHAT_051 */
  test('TC_AD_CHAT_051 search filters logs via API', async ({ adminPage }) => {
    const logsReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes('/admin/chatbot/logs') &&
        res.url().includes('search=') &&
        res.status() === 200
    );
    await chatPage.logsSearchInput.fill('giá bao nhiêu');
    await logsReq;
    await expect(chatPage.logsTableRows).toHaveCount(1);
    await expect(chatPage.logsTableRows.first()).toContainText(mockChatbotDetailLog.question);
  });

  /** TC_AD_CHAT_055 */
  test('TC_AD_CHAT_055 reset clears active filters', async () => {
    await chatPage.logsSearchInput.fill(mockChatbotSearchKeyword);
    await expect(chatPage.logsResetButton).toBeVisible();
    await chatPage.logsResetButton.click();
    await expect(chatPage.logsSearchInput).toHaveValue('');
    await expect(chatPage.logsTableRows).toHaveCount(15);
  });

  /** TC_AD_CHAT_056 */
  test('TC_AD_CHAT_056 shows empty logs state', async ({ adminPage }) => {
    setChatbotLogsEmpty(true);
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockSettingsApi(adminPage);
    await mockChatbotApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    const logsReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/chatbot/logs') && res.status() === 200
    );
    await adminPage.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });
    chatPage = new ChatbotPage(adminPage);
    await chatPage.hub.waitFor({ state: 'visible' });
    await chatPage.openLogsTab();
    await logsReq;
    await expect(chatPage.logsPanel.getByText(copy.logsNoData)).toBeVisible();
    setChatbotLogsEmpty(false);
  });

  /** TC_AD_CHAT_058 */
  test('TC_AD_CHAT_058 renders unknown intent badge', async () => {
    await expect(chatPage.logsTableRows.filter({ hasText: copy.intentUnknown })).toBeVisible();
  });

  /** TC_AD_CHAT_059 */
  test('TC_AD_CHAT_059 shows cache hit and miss indicators', async () => {
    await expect(chatPage.logsPanel.getByText(copy.cacheHitLabel).first()).toBeVisible();
    await expect(chatPage.logsPanel.getByText(copy.cacheMissLabel).first()).toBeVisible();
  });

  /** TC_AD_CHAT_065 */
  test('TC_AD_CHAT_065 paginates logs when multiple pages', async () => {
    await expect(chatPage.logsNextButton).toBeEnabled();
    await chatPage.logsNextButton.click();
    await expect(chatPage.logsTableRows).toHaveCount(5);
    await expect(chatPage.logsPrevButton).toBeEnabled();
  });

  /** TC_AD_CHAT_066 */
  test('TC_AD_CHAT_066 disables prev on first page', async () => {
    await expect(chatPage.logsPrevButton).toBeDisabled();
  });

  /** TC_AD_CHAT_067 */
  test('TC_AD_CHAT_067 opens log detail modal', async () => {
    await chatPage.logDetailButtonForQuestion(mockChatbotDetailLog.question).click();
    await expect(chatPage.logDetailModal).toBeVisible();
    await expect(chatPage.logDetailModal).toContainText(mockChatbotDetailLog.session_id);
  });

  /** TC_AD_CHAT_070 */
  test('TC_AD_CHAT_070 shows guardrail warnings in modal', async () => {
    await chatPage.logDetailButtonForQuestion(mockChatbotDetailLog.question).click();
    await expect(chatPage.logDetailModal.getByText(/guardrail|Guardrail|cảnh báo/i)).toBeVisible();
    await expect(chatPage.logDetailModal.getByText('Low confidence on price range')).toBeVisible();
  });

  /** TC_AD_CHAT_072 */
  test('TC_AD_CHAT_072 closes log modal', async () => {
    await chatPage.logDetailButtonForQuestion(mockChatbotDetailLog.question).click();
    await chatPage.logDetailCloseButton.click();
    await expect(chatPage.logDetailModal).toHaveCount(0);
  });

  /** TC_AD_CHAT_073 */
  test('TC_AD_CHAT_073 RAG link points to blog posts', async () => {
    await chatPage.logDetailButtonForQuestion(mockChatbotDetailLog.question).click();
    const ragLink = chatPage.logDetailModal.getByRole('link', { name: copy.logsRagLink });
    await expect(ragLink).toHaveAttribute('href', '/admin/blog-posts');
    await expect(ragLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Admin Chatbot — settings @P1', () => {
  let chatPage: ChatbotPage;

  test.beforeEach(async ({ adminPage }) => {
    await setupChatbotMocks(adminPage);
    chatPage = new ChatbotPage(adminPage);
    await chatPage.goto();
    await chatPage.openSettingsTab();
    await expect(chatPage.settingsCacheRows.first()).toBeVisible({ timeout: 20_000 });
  });

  /** TC_AD_CHAT_080 */
  test('TC_AD_CHAT_080 loads semantic cache list', async () => {
    await expect(chatPage.settingsCacheRows).toHaveCount(4);
  });

  /** TC_AD_CHAT_083 */
  test('TC_AD_CHAT_083 filters cache locally by search', async () => {
    await chatPage.cacheSearchInput.fill('gia tour');
    await expect(chatPage.settingsCacheRows).toHaveCount(1);
    await expect(chatPage.page.getByText('gia tour ba na bao nhieu')).toBeVisible();
  });

  /** TC_AD_CHAT_087 */
  test('TC_AD_CHAT_087 shows clear all when cache has entries', async () => {
    await expect(chatPage.clearAllCacheButton).toBeVisible();
  });

  /** TC_AD_CHAT_085 */
  test('TC_AD_CHAT_085 deletes single cache entry after confirm', async ({ adminPage }) => {
    const row = chatPage.settingsPanel.locator('tr', { hasText: 'cache entry to delete' });
    await row.locator('button').click();
    await adminPage.getByTestId('chatbot-cache-confirm-dialog').waitFor({ state: 'visible' });
    await adminPage.getByTestId('chatbot-cache-confirm-submit').click();
    await expect(chatPage.settingsPanel.locator('tr', { hasText: 'cache entry to delete' })).toHaveCount(0);
  });

  /** TC_AD_CHAT_090 */
  test('TC_AD_CHAT_090 loads chatbot settings form fields', async () => {
    await expect(chatPage.saveSettingsButton).toBeEnabled();
    await expect(chatPage.page.locator('input[type="number"]').first()).toHaveValue('2');
  });

  /** TC_AD_CHAT_097 */
  test('TC_AD_CHAT_097 saves chatbot settings via PUT', async ({ adminPage }) => {
    const putReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes('/admin/settings') &&
        res.request().method() === 'PUT' &&
        res.status() === 200
    );
    await chatPage.saveSettingsButton.click();
    const res = await putReq;
    const body = res.request().postDataJSON() as { settings?: { chatbot?: unknown } };
    expect(body.settings?.chatbot).toBeTruthy();
    await expect(adminPage.getByText(copy.settingsSaveSuccess)).toBeVisible();
  });
});
