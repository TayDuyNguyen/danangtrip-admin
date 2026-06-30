import { expect, type Locator, type Page } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const settingsCopy = {
  heading: /Cấu hình Website|Website Configuration|Website Settings/i,
  tabGeneral: /Thông tin chung|General Info|General Information/i,
  tabBrand: /Thương hiệu|Branding|Brand/i,
  tabSocial: /Mạng xã hội|Social Media|Social/i,
  tabPayment: /Cổng thanh toán|Payment Gateways|Payment/i,
  tabPolicy: /Chính sách|Policies & Terms|Policy/i,
  tabSeo: /SEO mặc định|SEO Defaults|Default SEO/i,
  sectionGeneral: /Support Contact Information|Thông tin liên hệ hỗ trợ/i,
  sectionBrand: /Brand Assets & Visual Identity|Tài nguyên thương hiệu/i,
  sectionSocial: /Social Networking Channels|Kênh truyền thông & Mạng xã hội/i,
  sectionPayment: /Integrated Payment Gateways|Tích hợp cổng thanh toán/i,
  sectionPolicy: /Policy & Legal Regulations|Chính sách & Điều khoản pháp lý/i,
  sectionSeo: /Global Search Engine Optimization|Tối ưu hóa công cụ tìm kiếm/i,
  hotlineLabel: /Hotline Hỗ trợ|Support Hotline/i,
  emailLabel: /Email Hỗ trợ|Support Email/i,
  facebookLabel: /Facebook|Liên kết Facebook/i,
  metaTitleLabel: /Meta Title|Default Meta Title/i,
  websiteNameLabel: /Tên Website|Website Name/i,
  sepayTitle: /SePay VietQR Gateway|Cổng SePay VietQR/i,
  codTitle: /Bank Transfer \/ Cash \(COD\)|Chuyển khoản \/ Tiền mặt \(COD\)/i,
  vnpayTitle: /VNPay Portal|Cổng VNPay/i,
  saveBarTitle: /Thay đổi chưa lưu|Unsaved Changes|Unsaved changes/i,
  discardButton: /^Hủy bỏ$|^Discard$/i,
  saveButton: /Lưu thay đổi|Save Changes|Save changes/i,
  saveSuccess:
    /Cấu hình website đã được lưu thành công|Website configurations saved successfully|Website settings saved successfully/i,
  saveFailed:
    /Lỗi cập nhật cấu hình website|Failed to update website configurations|Failed to update website settings/i,
  loadFailed:
    /Không tải được cấu hình website|Failed to load website configurations|Failed to load configurations/i,
  loadFailedDesc:
    /Dữ liệu cấu hình tạm thời không khả dụng|Configuration data is temporarily unavailable/i,
  retryButton: /^Thử lại$|^Retry$/i,
  emailInvalid: /email không đúng định dạng|Invalid email address format|Invalid email/i,
  hotlineInvalid: /Hotline hoặc số điện thoại|Invalid hotline/i,
  urlInvalid: /URL không hợp lệ|Invalid URL format/i,
  metaTitleMin: /Meta title phải chứa ít nhất|Meta title must be at least/i,
  paymentRequired: /ít nhất một cổng thanh toán|At least one payment gateway/i,
  loading: /Đang tải cấu hình|Loading configurations|Saving configurations/i,
};

const copy = settingsCopy;

export class SettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get main() {
    return this.page.getByRole('main');
  }

  get heading() {
    return this.main.getByRole('heading', { level: 1, name: copy.heading });
  }

  get saveBar() {
    return this.page.getByTestId('settings-save-bar');
  }

  get discardButton() {
    return this.page.getByTestId('settings-discard-button');
  }

  get saveButton() {
    return this.page.getByTestId('settings-save-button');
  }

  get loadErrorPanel() {
    return this.page.getByTestId('settings-load-error');
  }

  get retryButton() {
    return this.page.getByTestId('settings-retry-button');
  }

  tab(name: RegExp) {
    return this.page.getByTestId('settings-tab-list').getByRole('button', { name });
  }

  tabErrorDot(tabKey: string) {
    return this.page.getByTestId(`settings-tab-error-${tabKey}`);
  }

  paymentRow(id: string) {
    return this.page.getByTestId(`settings-payment-row-${id}`);
  }

  async goto() {
    const loadRes = this.waitForLoadResponse();
    await this.page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login')) {
      await ensureAdminSessionOnPage(this.page);
      const retryLoad = this.waitForLoadResponse();
      await this.page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });
      await retryLoad;
    } else {
      await loadRes;
    }
  }

  async waitForLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 25_000 });
    await expect(this.tab(copy.tabGeneral)).toBeVisible();
    await expect(this.inputByLabel(copy.hotlineLabel)).toBeVisible();
  }

  sectionHeading(name: RegExp) {
    return this.main.getByRole('heading', { level: 3, name });
  }

  async selectTab(tabName: RegExp) {
    await this.tab(tabName).click();
  }

  inputByLabel(label: RegExp): Locator {
    return this.main.locator('div.space-y-2').filter({ hasText: label }).locator('input').first();
  }

  textareaByLabel(label: RegExp): Locator {
    return this.main.locator('div.space-y-2').filter({ hasText: label }).locator('textarea').first();
  }

  async togglePaymentGateway(title: RegExp) {
    const row = this.main
      .getByRole('heading', { level: 4, name: title })
      .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
    await row.getByRole('switch').click();
  }

  async clickSave() {
    await expect(this.saveBar).toBeVisible();
    await this.saveButton.click();
  }

  async fillHotline(value: string) {
    const input = this.inputByLabel(copy.hotlineLabel);
    await input.clear();
    await input.fill(value);
  }

  async fillEmail(value: string) {
    const input = this.inputByLabel(copy.emailLabel);
    await input.clear();
    await input.fill(value);
  }

  async fillFacebook(value: string) {
    const input = this.inputByLabel(copy.facebookLabel);
    await input.clear();
    await input.fill(value);
  }

  async fillMetaTitle(value: string) {
    const input = this.inputByLabel(copy.metaTitleLabel);
    await input.clear();
    await input.fill(value);
  }

  async fillWebsiteName(value: string) {
    const input = this.inputByLabel(copy.websiteNameLabel);
    await input.clear();
    await input.fill(value);
  }

  logoFileInput() {
    return this.main.getByTestId('settings-image-uploader').first().locator('input[type="file"]');
  }

  async expectSaveBarVisible(visible = true) {
    if (visible) {
      await expect(this.saveBar).toBeVisible();
      await expect(this.saveButton).toBeVisible();
    } else {
      await expect(this.saveBar).toHaveCount(0);
    }
  }

  waitForUpdateResponse() {
    return this.page.waitForResponse(
      (res) => res.request().method() === 'PUT' && res.url().includes('/admin/settings'),
      { timeout: 15_000 }
    );
  }

  waitForUploadResponse() {
    return this.page.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().includes('/upload/image'),
      { timeout: 15_000 }
    );
  }

  waitForLoadResponse() {
    return this.page.waitForResponse(
      (res) => res.request().method() === 'GET' && res.url().includes('/admin/settings'),
      { timeout: 15_000 }
    );
  }
}
