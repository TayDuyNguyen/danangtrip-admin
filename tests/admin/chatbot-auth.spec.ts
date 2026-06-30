/**
 * Admin Chatbot — auth (19)
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { ChatbotPage, chatbotCopy as copy } from '../pages/admin/ChatbotPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import { mockChatbotApi, resetMockChatbot } from '../fixtures/api/chatbot.mock';

test.describe('Admin Chatbot — auth @P0', () => {
  /** TC_AD_CHAT_001 */
  test('TC_AD_CHAT_001 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const page = await context.newPage();
    await mockAdminLayoutApis(page);
    await page.route('**/api/v1/auth/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthenticated' }),
      });
    });
    await page.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_CHAT_002 */
  test('TC_AD_CHAT_002 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockChatbot();
    await mockAdminLayoutApis(page);
    await mockChatbotApi(page);
    await mockAuthRefreshApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_CHAT_003 */
  test('TC_AD_CHAT_003 admin can access chatbot hub with dashboard tab', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockChatbot();
    await mockAdminLayoutApis(page);
    await mockChatbotApi(page);
    await mockAuthRefreshApi(page);
    await seedAdminSession(page);
    const chatPage = new ChatbotPage(page);
    await chatPage.goto();
    await chatPage.waitForDashboardLoaded();
    await expect(chatPage.tabDashboard).toBeVisible();
    await expect(page.getByText(copy.totalMessages)).toBeVisible();
    await context.close();
  });
});
