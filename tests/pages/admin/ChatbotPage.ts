import { expect, type Page } from '@playwright/test';

import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';



export const chatbotCopy = {

  title: /Quản trị Trợ lý AI|AI Assistant Administration/i,

  breadcrumbs: /Trợ lý AI|AI Assistant/i,

  tabDashboard: /Thống kê & Phân tích|Analytics & Charts/i,

  tabLogs: /Lịch sử chat|Chat History/i,

  tabSettings: /Cấu hình & Cache|Settings & Cache/i,

  dashboardLoading: /Đang tải dữ liệu thống kê|Loading Chatbot analytics/i,

  dashboardErrorTitle: /Không thể tải|Could not load statistics/i,

  tryAgain: /Thử lại|Try Again/i,

  refreshData: /Làm mới dữ liệu|Refresh Data/i,

  totalMessages: /Tổng tin nhắn|Total Messages/i,

  cacheHitRate: /Tỷ lệ trúng Cache|Cache Hit Rate/i,

  avgLatency: /Độ trễ trung bình|Average Latency/i,

  llmCost: /Chi phí LLM|LLM Cost/i,

  errorsFailover: /Lỗi & Failover|Errors & Failovers/i,

  latencyTrend: /Latency Trend|Độ trễ Phản hồi/i,

  unknownIntents: /Unknown Intents|Ý định Không thể/i,

  noUnknownIntents: /Không có câu hỏi nào bị trôi|no unknown/i,

  negativeFeedbacks: /Negative Feedbacks|Đánh giá Tiêu cực/i,

  logsSearchPlaceholder: /Tìm kiếm câu hỏi|Search queries/i,

  logsReset: /Đặt lại|Reset/i,

  logsNoData: /Không tìm thấy hội thoại|No conversations found/i,

  logsDialogTitle: /Chi tiết Log hội thoại|Conversation Log Details/i,

  logsRagLink: /Cập nhật tri thức RAG|Update RAG/i,

  cacheTitle: /Semantic Cache|Quản lý Semantic Cache/i,

  noCache: /Chưa có câu hỏi|No cached queries yet/i,
  noCacheSearch: /Không tìm thấy cache|No cache entries match/i,

  clearAllCache: /Xóa tất cả|Clear All/i,

  saveSettings: /Lưu cấu hình hệ thống|Save System Settings/i,

  settingsSaveSuccess: /lưu thành công|saved successfully/i,

  intentTour: /Search Tours|Tìm kiếm Tour/i,

  intentUnknown: /Unknown|Không rõ/i,

  intentHandoff: /Human Handoff|Hỗ trợ người thật/i,

  paginationPrev: /Trước|Prev/i,

  paginationNext: /Sau|Next/i,

  cacheHitLabel: /Cache.*Hit|HIT/i,

  cacheMissLabel: /Miss|MISS/i,

};



const copy = chatbotCopy;



export class ChatbotPage {

  readonly page: Page;



  constructor(page: Page) {

    this.page = page;

  }



  get hub() {

    return this.page.getByTestId('chatbot-hub');

  }



  async goto() {

    const statsResponse = this.page.waitForResponse(

      (res) =>

        res.url().includes('/admin/chatbot/stats') &&

        res.request().method() === 'GET' &&

        res.status() === 200,

      { timeout: 25_000 }

    );



    await this.page.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });

    if (this.page.url().includes('/login')) {

      await ensureAdminSessionOnPage(this.page);

      await this.page.goto('/admin/chatbot', { waitUntil: 'domcontentloaded' });

    }



    await expect(this.page).toHaveURL(/\/admin\/chatbot/, { timeout: 20_000 });

    await this.hub.waitFor({ state: 'visible', timeout: 25_000 });

    await statsResponse;

  }



  async waitForDashboardLoaded() {
    await expect(this.page).toHaveURL(/\/admin\/chatbot/);
    await expect(this.dashboardPanel.getByText(copy.totalMessages)).toBeVisible({ timeout: 20_000 });
  }



  get heading() {

    return this.hub.getByRole('heading', { level: 1, name: copy.title });

  }



  get tabDashboard() {

    return this.page.getByTestId('chatbot-tab-dashboard');

  }



  get tabLogs() {

    return this.page.getByTestId('chatbot-tab-logs');

  }



  get tabSettings() {

    return this.page.getByTestId('chatbot-tab-settings');

  }



  get dashboardPanel() {
    return this.page.getByTestId('chatbot-tabpanel-dashboard');
  }

  get logsPanel() {
    return this.page.getByTestId('chatbot-tabpanel-logs');
  }

  get settingsPanel() {
    return this.page.getByTestId('chatbot-tabpanel-settings');
  }

  async openLogsTab() {
    const logsReq = this.page.waitForResponse(
      (res) => res.url().includes('/admin/chatbot/logs') && res.status() === 200
    );
    await this.tabLogs.click();
    await logsReq;
    await expect(this.logsSearchInput).toBeVisible();
  }

  async openSettingsTab() {
    const cacheReq = this.page.waitForResponse(
      (res) => res.url().includes('/admin/chatbot/cache') && res.status() === 200
    );
    await this.tabSettings.click();
    await cacheReq;
    await expect(this.settingsPanel.getByText(copy.cacheTitle)).toBeVisible();
  }



  get refreshDataButton() {

    return this.hub.getByRole('button', { name: copy.refreshData });

  }



  get tryAgainButton() {

    return this.hub.getByRole('button', { name: copy.tryAgain });

  }



  kpiCard(label: RegExp) {
    return this.dashboardPanel.locator('div.p-6').filter({ hasText: label });
  }

  get logsSearchInput() {
    return this.logsPanel.getByPlaceholder(copy.logsSearchPlaceholder);
  }

  get logsResetButton() {
    return this.logsPanel.getByRole('button', { name: copy.logsReset });
  }

  get logsTableRows() {
    return this.logsPanel.locator('table tbody tr');
  }

  get logsPrevButton() {
    return this.logsPanel.getByRole('button', { name: copy.paginationPrev });
  }

  get logsNextButton() {
    return this.logsPanel.getByRole('button', { name: copy.paginationNext });
  }



  logDetailButtonForQuestion(question: string) {

    return this.logsTableRows.filter({ hasText: question }).getByRole('button').last();

  }



  get logDetailModal() {
    return this.page.getByTestId('chatbot-log-detail-modal');
  }

  get logDetailCloseButton() {
    return this.logDetailModal.getByRole('button', { name: /Đóng|Close/i });
  }



  get cacheSearchInput() {
    return this.settingsPanel.getByPlaceholder(/Search cache|Tìm cache/i);
  }

  get clearAllCacheButton() {
    return this.settingsPanel.getByRole('button', { name: copy.clearAllCache });
  }

  get saveSettingsButton() {
    return this.settingsPanel.getByRole('button', { name: copy.saveSettings });
  }

  get settingsCacheRows() {
    return this.settingsPanel.locator('table tbody tr');
  }



  intentSelectControl() {
    return this.logsPanel.locator('.react-select__control').first();
  }



  async selectIntentOption(label: RegExp) {

    await this.intentSelectControl().click();

    await this.page.getByRole('option', { name: label }).click();

  }

}


