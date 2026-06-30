import { expect, type Page } from '@playwright/test';
import { ensureAdminSessionOnPage } from '../../fixtures/auth.fixture';

export const notificationSendCopy = {
  title: /Gửi Thông báo|Send Notification/i,
  subtitle: /Gửi thông báo đến người dùng|sent to users/i,
  modeIndividual: /Gửi cá nhân|Individual/i,
  modeBulk: /Gửi hàng loạt|Bulk|Send to all/i,
  labelTitle: /Tiêu đề|Title/i,
  labelContent: /Nội dung|Content/i,
  labelRecipient: /Người nhận|Recipient/i,
  labelLink: /Link đích|Destination link|Target link/i,
  labelType: /Loại thông báo|Notification type/i,
  placeholderTitle: /Nhập tiêu đề|Enter.*title/i,
  placeholderContent: /Nhập nội dung|Enter.*content/i,
  placeholderSearchUser: /Tìm theo tên, email|Search.*name, email/i,
  placeholderLink: /profile\/bookings|danangtrip\.vn/i,
  submitButton: /Gửi thông báo|Send Notification/i,
  sendingButton: /Đang gửi|Sending/i,
  cancelButton: /^Hủy$|^Cancel$/i,
  validationTitle: /Tiêu đề là bắt buộc|Title is required/i,
  validationTitleMax: /Tiêu đề không quá 100|Title must not exceed 100/i,
  validationContent: /Nội dung là bắt buộc|Content is required/i,
  validationContentMax: /Nội dung không quá 500|Content must not exceed 500/i,
  validationUser: /chọn người nhận|Please select a recipient|select.*recipient/i,
  validationLink: /Link phải bắt đầu|must start with/i,
  bulkDialogTitle: /Xác nhận gửi hàng loạt|Confirm bulk send/i,
  bulkConfirm: /Xác nhận gửi|Confirm send/i,
  bulkCancel: /^Hủy$|^Cancel$/i,
  sendIndividualSuccess: /Đã gửi thông báo thành công|sent successfully/i,
  sendBulkSuccess: /Đã gửi đến tất cả.*thành công|sent to all.*successfully/i,
  sendFailed: /Có lỗi xảy ra khi gửi|An error occurred while sending the notification/i,
  previewTitle: /Xem trước|Preview/i,
  previewEmptyTitle: /Tiêu đề thông báo|Notification title/i,
  previewEmptyContent: /Nội dung thông báo sẽ hiển thị|Notification content will appear/i,
  previewNoUser: /Chưa chọn người nhận|No recipient selected/i,
  previewToAll: /Tất cả.*người dùng|All.*users/i,
  breadcrumbList: /^Thông báo$|^Notifications$/i,
  breadcrumbSend: /^Gửi Thông báo$|^Send Notification$/i,
  typeSystem: /HỆ THỐNG|SYSTEM/i,
  typeBooking: /ĐẶT TOUR|BOOKING/i,
  typePromotion: /KHUYẾN MÃI|PROMOTION/i,
  typeRating: /ĐÁNH GIÁ|RATING/i,
  guideItem1: /Tiêu đề nên ngắn gọn|Title should be short/i,
  guideItem2: /hàng loạt không thể hoàn tác|Bulk notifications cannot be undone/i,
  guideItem3: /Link đích là tùy chọn|Target link is optional/i,
  guideItem4: /app và email|in-app and via email/i,
};

const copy = notificationSendCopy;

export class NotificationSendPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/notifications/send', { waitUntil: 'domcontentloaded' });
    if (this.page.url().includes('/login') || this.page.url().includes('/dashboard')) {
      await ensureAdminSessionOnPage(this.page);
      await this.page.goto('/admin/notifications/send', { waitUntil: 'domcontentloaded' });
    }
    await this.pageHeading.waitFor({ state: 'visible', timeout: 25_000 });
  }

  get pageHeading() {
    return this.page.getByRole('heading', { level: 2, name: copy.title });
  }

  get modeIndividualButton() {
    return this.page.getByTestId('notification-send-mode-individual');
  }

  get modeBulkButton() {
    return this.page.getByTestId('notification-send-mode-bulk');
  }

  get titleField() {
    return this.page.getByTestId('notification-send-title');
  }

  get contentField() {
    return this.page.getByTestId('notification-send-content');
  }

  get recipientSearch() {
    return this.page.getByTestId('notification-recipient-search');
  }

  get linkToggle() {
    return this.page.getByTestId('notification-send-link-toggle');
  }

  get linkField() {
    return this.page.getByTestId('notification-send-link');
  }

  get submitButton() {
    return this.headerSubmitButton;
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: copy.cancelButton }).first();
  }

  get headerSubmitButton() {
    return this.page
      .locator('.select-none')
      .locator('button[form="notification-send-form"][type="submit"]');
  }

  get mobileFooter() {
    return this.page.locator('div.md\\:hidden').filter({
      has: this.page.locator('button[form="notification-send-form"]'),
    });
  }

  get previewCard() {
    return this.page.locator('.bg-white.rounded-3xl').filter({ hasText: copy.previewTitle });
  }

  get formColumn() {
    return this.page.locator('.lg\\:max-w-\\[65\\%\\]');
  }

  get sidebarColumn() {
    return this.page.locator('.lg\\:w-\\[35\\%\\]');
  }

  get bulkDialog() {
    return this.page.getByTestId('notification-bulk-send-dialog');
  }

  async expandLinkField() {
    if (!(await this.linkField.isVisible())) {
      await this.linkToggle.click();
    }
    await expect(this.linkField).toBeVisible();
  }

  async collapseLinkField() {
    if (await this.linkField.isVisible()) {
      await this.linkToggle.click();
    }
    await expect(this.linkField).toHaveCount(0);
  }

  get breadcrumbListLink() {
    return this.page
      .locator('main')
      .locator('.select-none')
      .getByRole('link', { name: copy.breadcrumbList });
  }

  get breadcrumbTrail() {
    return this.page.locator('main').locator('.select-none');
  }

  async selectType(option: RegExp) {
    await this.page.locator('#notification-send-form').locator('div[class*="-control"]').first().click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async selectRecipientByEmail(email: string) {
    await this.recipientSearch.fill(email);
    await this.page.getByRole('listbox').getByText(email).first().click();
  }

  async selectRecipientByName(name: string) {
    await this.recipientSearch.fill(name);
    await this.page.getByRole('listbox').getByText(name).first().click();
  }

  async fillForm(data: { title: string; content: string; link?: string }) {
    await this.titleField.fill(data.title);
    await this.contentField.fill(data.content);
    if (data.link) {
      await this.expandLinkField();
      await this.linkField.fill(data.link);
    }
  }

  async submitOnly() {
    await this.submitButton.click();
  }

  async confirmBulkSend() {
    await this.page.getByTestId('notification-bulk-send-confirm').click();
  }

  async cancelBulkSend() {
    await this.page.getByTestId('notification-bulk-send-cancel').click();
  }

  async expectToast(pattern: RegExp) {
    await expect(this.page.getByText(pattern).first()).toBeVisible({ timeout: 15_000 });
  }
}

export default NotificationSendPage;
