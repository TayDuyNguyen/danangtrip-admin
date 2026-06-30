/**
 * Admin Contacts — core (09)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { ContactsPage, contactsCopy as copy } from '../pages/admin/ContactsPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  mockContactsApi,
  resetMockContacts,
  setContactDeleteFailForId,
  setContactDetailDelay,
  setContactDetailFailForId,
  setContactExportFail,
  setContactListEmpty,
  setContactListFail,
  setContactReplyFailForId,
} from '../fixtures/api/contacts.mock';
import {
  deletableContact,
  expectedContactStats,
  longSubjectContact,
  mockContactSearchKeyword,
  multilineContact,
  noPhoneContact,
  primaryNewContact,
  readContactWithPhone,
  repliedContact,
  validReplyText,
} from '../fixtures/data/contacts-list.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Contacts @P1', () => {
  let contactsPage: ContactsPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockContacts();
    await adminPage.unroute('**/api/v1/**');
    await mockAdminLayoutApis(adminPage);
    await mockContactsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    contactsPage = new ContactsPage(adminPage);
    await contactsPage.goto();
    await contactsPage.waitForListLoaded();
  });

  /** TC_AD_CNT_001 — ADMIN_CONTACT_DETAIL_002 */
  test('TC_AD_CNT_001 renders stats search tabs and list', async () => {
    await expect(contactsPage.heading).toBeVisible();
    await expect(contactsPage.statsRow).toBeVisible();
    await expect(contactsPage.searchInput).toBeVisible();
    await expect(contactsPage.tab(copy.tabAll)).toBeVisible();
    await expect(contactsPage.tab(copy.tabNew)).toBeVisible();
    await expect(contactsPage.listItems).toHaveCount(10);
    await expect(contactsPage.exportButton).toBeVisible();
  });

  /** TC_AD_CNT_002 — ADMIN_CONTACT_DETAIL_003 */
  test('TC_AD_CNT_002 shows empty detail when no contact selected', async () => {
    await expect(contactsPage.detailPanel.getByText(copy.emptyDetailTitle)).toBeVisible();
    await expect(contactsPage.detailPanel.getByText(copy.emptyDetailSubtitle)).toBeVisible();
  });

  /** TC_AD_CNT_003 — ADMIN_CONTACT_DETAIL_004 */
  test('TC_AD_CNT_003 selects contact and loads detail panel', async ({ adminPage }) => {
    const detailReq = contactsPage.waitForDetailResponse(primaryNewContact.id);
    await contactsPage.selectContact(primaryNewContact.name);
    await detailReq;
    await expect(adminPage).toHaveURL(new RegExp(`id=${primaryNewContact.id}`));
    await expect(contactsPage.detailPanel.getByRole('heading', { level: 2 })).toContainText(
      primaryNewContact.subject
    );
    await expect(contactsPage.detailPanel.getByText(primaryNewContact.message)).toBeVisible();
  });

  /** TC_AD_CNT_004 — ADMIN_CONTACT_DETAIL_005 */
  test('TC_AD_CNT_004 opens direct id in URL', async ({ adminPage }) => {
    await contactsPage.goto(`id=${readContactWithPhone.id}`);
    await contactsPage.waitForListLoaded();
    await expect(adminPage).toHaveURL(new RegExp(`id=${readContactWithPhone.id}`));
    await expect(contactsPage.detailPanel.getByRole('heading', { level: 2 })).toContainText(
      readContactWithPhone.subject
    );
  });

  /** TC_AD_CNT_005 — ADMIN_CONTACT_DETAIL_006 */
  test('TC_AD_CNT_005 shows detail skeleton while API is delayed', async () => {
    setContactDetailDelay(1200);
    await contactsPage.goto(`id=${longSubjectContact.id}`);
    await expect(contactsPage.detailPanel.locator('.animate-pulse').first()).toBeVisible();
    await expect(
      contactsPage.detailPanel.getByRole('heading', { level: 2, name: longSubjectContact.subject })
    ).toBeVisible({ timeout: 10_000 });
    setContactDetailDelay(0);
  });

  /** TC_AD_CNT_006 — ADMIN_CONTACT_DETAIL_007 */
  test('TC_AD_CNT_006 shows detail error on API failure', async ({ adminPage }) => {
    setContactDetailFailForId(primaryNewContact.id);
    const detailReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/contacts/${primaryNewContact.id}`) &&
        !res.url().includes('/reply') &&
        res.request().method() === 'GET' &&
        res.status() === 500
    );
    await contactsPage.listItemByName(primaryNewContact.name).click();
    await detailReq;
    await expect(contactsPage.detailErrorPanel).toBeVisible();
    await expect(contactsPage.detailErrorPanel.getByText(copy.detailLoadFailed)).toBeVisible();
    await expect(contactsPage.detailErrorPanel.getByText(copy.detailLoadFailedDesc)).toBeVisible();
    await expect(contactsPage.retryButton('detail')).toBeVisible();
  });

  /** TC_AD_CNT_007 — ADMIN_CONTACT_DETAIL_008 */
  test('TC_AD_CNT_007 shows list error with retry without crashing detail', async ({ adminPage }) => {
    setContactListFail(true);
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(contactsPage.listErrorPanel).toBeVisible();
    await expect(contactsPage.listErrorPanel.getByText(copy.listLoadFailed)).toBeVisible();
    await expect(contactsPage.statsErrorPanel).toBeVisible();
    await expect(contactsPage.retryButton('list')).toBeVisible();
    await expect(contactsPage.detailPanel.getByText(copy.emptyDetailTitle)).toBeVisible();
  });

  /** TC_AD_CNT_008 — ADMIN_CONTACT_DETAIL_009 */
  test('TC_AD_CNT_008 searches by keyword with debounce and clears id', async ({ adminPage }) => {
    await contactsPage.selectContact(primaryNewContact.name);
    await expect(adminPage).toHaveURL(/id=/);
    await contactsPage.search(mockContactSearchKeyword);
    await expect(contactsPage.searchInput).toHaveValue(mockContactSearchKeyword);
    await expect(adminPage).toHaveURL(/q=/);
    await expect(adminPage).not.toHaveURL(/id=/);
    await expect(contactsPage.listItems).toHaveCount(1);
  });

  /** TC_AD_CNT_009 — ADMIN_CONTACT_DETAIL_010 */
  test('TC_AD_CNT_009 filters list by replied tab and clears selected id', async ({ adminPage }) => {
    await contactsPage.selectContact(primaryNewContact.name);
    await expect(adminPage).toHaveURL(/id=/);
    await contactsPage.tab(copy.tabReplied).click();
    await expect(adminPage).toHaveURL(/status=replied/);
    await expect(adminPage).not.toHaveURL(/id=/);
    await expect(contactsPage.listItemByName(repliedContact.name)).toBeVisible();
    await expect(contactsPage.detailPanel.getByText(copy.emptyDetailTitle)).toBeVisible();
  });

  /** TC_AD_CNT_010 — ADMIN_CONTACT_DETAIL_011 */
  test('TC_AD_CNT_010 paginates to page 2', async ({ adminPage }) => {
    await expect(contactsPage.paginationFooter).toBeVisible();
    await contactsPage.goToNextPage();
    await expect(adminPage).toHaveURL(/page=2/);
    await expect(contactsPage.listItemByName('Hồ Page Hai')).toBeVisible();
  });

  /** TC_AD_CNT_011 — ADMIN_CONTACT_DETAIL_012 */
  test('TC_AD_CNT_011 disables next on last page', async ({ adminPage }) => {
    await contactsPage.goToNextPage();
    await expect(adminPage).toHaveURL(/page=2/);
    await expect(contactsPage.nextPageButton).toBeDisabled();
  });

  /** TC_AD_CNT_012 — ADMIN_CONTACT_DETAIL_013 */
  test('TC_AD_CNT_012 displays sender email and phone links', async () => {
    await contactsPage.selectContact(readContactWithPhone.name);
    const mailLink = contactsPage.detailPanel.locator(`a[href="mailto:${readContactWithPhone.email}"]`);
    const telLink = contactsPage.detailPanel.locator(`a[href="tel:${readContactWithPhone.phone}"]`);
    await expect(mailLink).toBeVisible();
    await expect(telLink).toBeVisible();
    await expect(contactsPage.detailPanel.getByText(readContactWithPhone.name)).toBeVisible();
  });

  /** TC_AD_CNT_013 — ADMIN_CONTACT_DETAIL_014 */
  test('TC_AD_CNT_013 hides phone link when contact has no phone', async () => {
    await contactsPage.selectContact(noPhoneContact.name);
    await expect(contactsPage.detailPanel.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(
      contactsPage.detailPanel.getByRole('link', { name: noPhoneContact.email })
    ).toBeVisible();
  });

  /** TC_AD_CNT_014 — ADMIN_CONTACT_DETAIL_015 */
  test('TC_AD_CNT_014 preserves multiline message formatting', async () => {
    await contactsPage.selectContact(multilineContact.name);
    await expect(contactsPage.detailPanel.locator('.whitespace-pre-wrap')).toContainText('Dòng một');
    await expect(contactsPage.detailPanel.locator('.whitespace-pre-wrap')).toContainText('Dòng hai');
  });

  /** TC_AD_CNT_015 — ADMIN_CONTACT_DETAIL_016 */
  test('TC_AD_CNT_015 shows replied history for replied contact', async () => {
    await contactsPage.selectContact(repliedContact.name);
    await expect(contactsPage.detailPanel.getByText(copy.repliedTitle)).toBeVisible();
    await expect(contactsPage.detailPanel.getByText(repliedContact.reply!)).toBeVisible();
    await expect(contactsPage.detailPanel.getByText(copy.repliedSuccessEmail)).toBeVisible();
    await expect(contactsPage.replyTextarea).toHaveCount(0);
  });

  /** TC_AD_CNT_016 — ADMIN_CONTACT_DETAIL_017 */
  test('TC_AD_CNT_016 shows reply form for new contact', async () => {
    await contactsPage.selectContact(primaryNewContact.name);
    await expect(contactsPage.detailPanel.getByText(copy.replySection)).toBeVisible();
    await expect(contactsPage.replyTextarea).toBeVisible();
    await expect(contactsPage.detailPanel.getByRole('button', { name: copy.sendReply })).toBeVisible();
  });

  /** TC_AD_CNT_017 — ADMIN_CONTACT_DETAIL_018 */
  test('TC_AD_CNT_017 submits valid reply successfully', async ({ adminPage }) => {
    await contactsPage.selectContact(primaryNewContact.name);
    const replyReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/contacts/${primaryNewContact.id}/reply`) &&
        res.request().method() === 'POST' &&
        res.status() === 200
    );
    await contactsPage.submitReply(validReplyText);
    await replyReq;
    await contactsPage.expectToast(copy.replySuccess);
  });

  /** TC_AD_CNT_018 — ADMIN_CONTACT_DETAIL_019 */
  test('TC_AD_CNT_018 blocks empty reply submission', async ({ adminPage }) => {
    await contactsPage.selectContact(primaryNewContact.name);
    await contactsPage.submitReply('');
    await expect(contactsPage.detailPanel.getByText(copy.replyRequired)).toBeVisible();
    await expect(adminPage.getByText(copy.replySuccess)).toHaveCount(0);
  });

  /** TC_AD_CNT_019 — ADMIN_CONTACT_DETAIL_020 */
  test('TC_AD_CNT_019 shows toast when reply API fails', async () => {
    await contactsPage.selectContact(primaryNewContact.name);
    setContactReplyFailForId(primaryNewContact.id);
    await contactsPage.submitReply(validReplyText);
    await contactsPage.expectToast(copy.networkError);
  });

  /** TC_AD_CNT_020 — ADMIN_CONTACT_DETAIL_021 */
  test('TC_AD_CNT_020 opens delete dialog with contact name', async () => {
    await contactsPage.selectContact(deletableContact.name);
    await contactsPage.openDeleteDialog();
    await expect(contactsPage.deleteDialog).toContainText(deletableContact.name);
  });

  /** TC_AD_CNT_021 — ADMIN_CONTACT_DETAIL_022 */
  test('TC_AD_CNT_021 deletes selected contact and clears URL id', async ({ adminPage }) => {
    await contactsPage.selectContact(deletableContact.name);
    await contactsPage.openDeleteDialog();
    const deleteReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/contacts/${deletableContact.id}`) &&
        res.request().method() === 'DELETE' &&
        res.status() === 200
    );
    await contactsPage.confirmDelete();
    await deleteReq;
    await contactsPage.expectToast(copy.deleteSuccess);
    await expect(adminPage).not.toHaveURL(new RegExp(`id=${deletableContact.id}`));
  });

  /** TC_AD_CNT_031 — ADMIN_CONTACT_DETAIL_023 */
  test('TC_AD_CNT_031 deletes contact from list without changing active selection', async ({
    adminPage,
  }) => {
    await contactsPage.selectContact(primaryNewContact.name);
    await expect(adminPage).toHaveURL(new RegExp(`id=${primaryNewContact.id}`));
    await contactsPage.listDeleteButton(deletableContact.id).click();
    await expect(contactsPage.deleteDialog).toContainText(deletableContact.name);
    const deleteReq = adminPage.waitForResponse(
      (res) =>
        res.url().includes(`/admin/contacts/${deletableContact.id}`) &&
        res.request().method() === 'DELETE' &&
        res.status() === 200
    );
    await contactsPage.confirmDelete();
    await deleteReq;
    await contactsPage.expectToast(copy.deleteSuccess);
    await expect(adminPage).toHaveURL(new RegExp(`id=${primaryNewContact.id}`));
    await expect(contactsPage.listItemByName(deletableContact.name)).toHaveCount(0);
    await expect(contactsPage.detailPanel.getByRole('heading', { level: 2 })).toContainText(
      primaryNewContact.subject
    );
  });

  /** TC_AD_CNT_022 — ADMIN_CONTACT_DETAIL_024 */
  test('TC_AD_CNT_022 shows toast when delete API fails', async () => {
    await contactsPage.selectContact(deletableContact.name);
    setContactDeleteFailForId(deletableContact.id);
    await contactsPage.openDeleteDialog();
    await contactsPage.confirmDelete();
    await contactsPage.expectToast(copy.networkError);
  });

  /** TC_AD_CNT_023 — ADMIN_CONTACT_DETAIL_025 */
  test('TC_AD_CNT_023 exports contacts with current filters', async ({ adminPage }) => {
    const exportReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/contacts/export') && res.status() === 200
    );
    await contactsPage.exportButton.click();
    await exportReq;
    await contactsPage.expectToast(copy.exportSuccess);
  });

  /** TC_AD_CNT_024 — ADMIN_CONTACT_DETAIL_026 */
  test('TC_AD_CNT_024 shows toast when export API fails', async () => {
    setContactExportFail(true);
    await contactsPage.exportButton.click();
    await contactsPage.expectToast(copy.networkError);
  });

  /** TC_AD_CNT_025 — ADMIN_CONTACT_DETAIL_027 */
  test('TC_AD_CNT_025 syncs search input from URL q param', async () => {
    await contactsPage.goto(`q=${mockContactSearchKeyword}`);
    await contactsPage.waitForListLoaded();
    await expect(contactsPage.searchInput).toHaveValue(mockContactSearchKeyword);
  });

  /** TC_AD_CNT_026 — ADMIN_CONTACT_DETAIL_028 */
  test('TC_AD_CNT_026 truncates long subject in detail header', async () => {
    await contactsPage.selectContact(longSubjectContact.name);
    const heading = contactsPage.detailPanel.getByRole('heading', { level: 2 });
    await expect(heading).toHaveClass(/truncate/);
    await expect(heading).toContainText(longSubjectContact.subject.slice(0, 20));
    await expect(contactsPage.detailPanel.getByRole('button', { name: copy.deleteButton })).toBeVisible();
  });

  /** TC_AD_CNT_027 — supplement list empty */
  test('TC_AD_CNT_027 shows list empty state', async ({ adminPage }) => {
    setContactListEmpty(true);
    await adminPage.reload({ waitUntil: 'domcontentloaded' });
    await expect(contactsPage.leftPanel.getByText(copy.listEmpty)).toBeVisible();
  });

  /** TC_AD_CNT_028 — supplement cancel delete */
  test('TC_AD_CNT_028 cancels delete without API call', async ({ adminPage }) => {
    await contactsPage.selectContact(deletableContact.name);
    await contactsPage.openDeleteDialog();
    let deleteCalled = false;
    adminPage.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/admin/contacts/')) {
        deleteCalled = true;
      }
    });
    await contactsPage.cancelDelete();
    await expect(contactsPage.deleteDialog).toHaveCount(0);
    expect(deleteCalled).toBe(false);
  });

  /** TC_AD_CNT_029 — data display integrity */
  test('TC_AD_CNT_029 displays contact fields from API in list and detail', async () => {
    await expect(contactsPage.listItemByName(primaryNewContact.name)).toContainText(
      primaryNewContact.subject
    );
    await contactsPage.selectContact(readContactWithPhone.name);
    await expect(contactsPage.detailPanel.getByText(readContactWithPhone.message)).toBeVisible();
    await expect(contactsPage.statCard(/TỔNG LIÊN HỆ|TOTAL CONTACTS/i).locator('span.text-3xl')).toHaveText(
      String(expectedContactStats.total)
    );
  });

  /** TC_AD_CNT_030 — ADMIN_CONTACT_DETAIL_030 regression flow */
  test('TC_AD_CNT_030 full flow search select reply', async ({ adminPage }) => {
    await contactsPage.search('Nguyễn');
    await contactsPage.selectContact(primaryNewContact.name);
    await contactsPage.submitReply(validReplyText);
    await contactsPage.expectToast(copy.replySuccess);
    await expect(adminPage).toHaveURL(new RegExp(`id=${primaryNewContact.id}`));
  });
});
