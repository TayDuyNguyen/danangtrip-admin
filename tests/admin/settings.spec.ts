/**
 * Admin Website Settings — core (11)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { SettingsPage, settingsCopy as copy } from '../pages/admin/SettingsPage';
import { mockAuthRefreshApi } from '../fixtures/api/auth.mock';
import {
  getLastSettingsPutBody,
  mockSettingsApi,
  resetMockSettings,
  setSettingsLoadDelay,
  setSettingsLoadFail,
  setSettingsSaveFail,
} from '../fixtures/api/settings.mock';
import {
  mockRawSettings,
  updatedBrandName,
  updatedGeneralContact,
} from '../fixtures/data/settings.data';

test.describe.configure({ retries: 1 });

test.describe('Admin Website Settings @P1', () => {
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockSettings();
    await adminPage.unroute('**/api/v1/**');
    await adminPage.unroute('**/api/v1/auth/**');
    await mockSettingsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    settingsPage = new SettingsPage(adminPage);
    await settingsPage.goto();
    await settingsPage.waitForLoaded();
  });

  /** TC_AD_SET_005 */
  test('TC_AD_SET_005 renders heading tabs and prefilled general fields', async () => {
    await expect(settingsPage.heading).toBeVisible();
    await expect(settingsPage.tab(copy.tabGeneral)).toBeVisible();
    await expect(settingsPage.tab(copy.tabBrand)).toBeVisible();
    await expect(settingsPage.tab(copy.tabSocial)).toBeVisible();
    await expect(settingsPage.tab(copy.tabPayment)).toBeVisible();
    await expect(settingsPage.tab(copy.tabPolicy)).toBeVisible();
    await expect(settingsPage.tab(copy.tabSeo)).toBeVisible();
    await expect(settingsPage.sectionHeading(copy.sectionGeneral)).toBeVisible();
    await expect(settingsPage.inputByLabel(copy.hotlineLabel)).toHaveValue(
      mockRawSettings.general.hotline as string
    );
    await expect(settingsPage.inputByLabel(copy.emailLabel)).toHaveValue(
      mockRawSettings.general.email as string
    );
  });

  /** TC_AD_SET_006 */
  test('TC_AD_SET_006 navigates all settings tabs', async () => {
    await settingsPage.selectTab(copy.tabBrand);
    await expect(settingsPage.sectionHeading(copy.sectionBrand)).toBeVisible();

    await settingsPage.selectTab(copy.tabSocial);
    await expect(settingsPage.sectionHeading(copy.sectionSocial)).toBeVisible();

    await settingsPage.selectTab(copy.tabPayment);
    await expect(settingsPage.sectionHeading(copy.sectionPayment)).toBeVisible();

    await settingsPage.selectTab(copy.tabPolicy);
    await expect(settingsPage.sectionHeading(copy.sectionPolicy)).toBeVisible();

    await settingsPage.selectTab(copy.tabSeo);
    await expect(settingsPage.sectionHeading(copy.sectionSeo)).toBeVisible();
  });

  /** TC_AD_SET_001 — doc: đổi hotline + email */
  test('TC_AD_SET_001 saves updated hotline and email', async ({ adminPage }) => {
    await settingsPage.fillHotline(updatedGeneralContact.hotline);
    await settingsPage.fillEmail(updatedGeneralContact.email);
    await settingsPage.expectSaveBarVisible(true);

    const updateRes = settingsPage.waitForUpdateResponse();
    await settingsPage.clickSave();
    await updateRes;

    await expect(adminPage.getByText(copy.saveSuccess)).toBeVisible({ timeout: 10_000 });
    const body = getLastSettingsPutBody();
    expect(body?.settings?.general).toMatchObject(updatedGeneralContact);
    await settingsPage.expectSaveBarVisible(false);
  });

  /** TC_AD_SET_002 — doc: tắt cổng thanh toán (SePay, COD vẫn bật) */
  test('TC_AD_SET_002 toggles off SePay gateway and saves', async ({ adminPage }) => {
    await settingsPage.selectTab(copy.tabPayment);
    await settingsPage.togglePaymentGateway(copy.sepayTitle);
    await settingsPage.expectSaveBarVisible(true);

    const updateRes = settingsPage.waitForUpdateResponse();
    await settingsPage.clickSave();
    await updateRes;

    await expect(adminPage.getByText(copy.saveSuccess)).toBeVisible({ timeout: 10_000 });
    const body = getLastSettingsPutBody();
    expect(body?.settings?.payment).toMatchObject({ sepay: false, cod: true });
  });

  /** TC_AD_SET_007 */
  test('TC_AD_SET_007 shows save bar on dirty and discard resets', async () => {
    const original = mockRawSettings.general.hotline as string;
    await settingsPage.fillHotline('1900 9999');
    await settingsPage.expectSaveBarVisible(true);

    await settingsPage.discardButton.click();
    await settingsPage.expectSaveBarVisible(false);
    await expect(settingsPage.inputByLabel(copy.hotlineLabel)).toHaveValue(original);
  });

  /** TC_AD_SET_008 */
  test('TC_AD_SET_008 blocks save on invalid email', async ({ adminPage }) => {
    await settingsPage.fillEmail('not-an-email');
    await settingsPage.clickSave();

    await expect(settingsPage.page.getByText(copy.emailInvalid)).toBeVisible();
    await expect(adminPage.getByText(copy.saveSuccess)).toHaveCount(0);
    await settingsPage.expectSaveBarVisible(true);
  });

  /** TC_AD_SET_009 */
  test('TC_AD_SET_009 requires at least one payment gateway enabled', async ({ adminPage }) => {
    await settingsPage.selectTab(copy.tabPayment);
    await settingsPage.togglePaymentGateway(copy.sepayTitle);
    await settingsPage.togglePaymentGateway(copy.codTitle);
    await settingsPage.expectSaveBarVisible(true);
    await settingsPage.clickSave();

    await expect(settingsPage.main.getByText(copy.paymentRequired)).toBeVisible();
    await expect(adminPage.getByText(copy.saveSuccess)).toHaveCount(0);
  });

  /** TC_AD_SET_010 */
  test('TC_AD_SET_010 shows error state and retry reloads settings', async ({ adminPage }) => {
    await adminPage.unroute('**/api/v1/**');
    setSettingsLoadFail(true);
    await mockSettingsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await settingsPage.goto();

    await expect(settingsPage.loadErrorPanel).toBeVisible({ timeout: 15_000 });
    await expect(settingsPage.page.getByText(copy.loadFailedDesc)).toBeVisible();
    await expect(settingsPage.retryButton).toBeVisible();

    setSettingsLoadFail(false);
    const reloadRes = settingsPage.waitForLoadResponse();
    await settingsPage.retryButton.click();
    await reloadRes;
    await settingsPage.waitForLoaded();
  });

  /** TC_AD_SET_011 */
  test('TC_AD_SET_011 shows toast when save API fails', async ({ adminPage }) => {
    setSettingsSaveFail(true);
    await settingsPage.fillHotline('1900 7777');
    await settingsPage.clickSave();
    await expect(adminPage.getByText(copy.saveFailed)).toBeVisible({ timeout: 10_000 });
  });

  /** TC_AD_SET_012 */
  test('TC_AD_SET_012 saves brand website name from brand tab', async ({ adminPage }) => {
    await settingsPage.selectTab(copy.tabBrand);
    await settingsPage.fillWebsiteName(updatedBrandName);

    const updateRes = settingsPage.waitForUpdateResponse();
    await settingsPage.clickSave();
    await updateRes;

    await expect(adminPage.getByText(copy.saveSuccess)).toBeVisible({ timeout: 10_000 });
    const body = getLastSettingsPutBody();
    expect(body?.settings?.brand).toMatchObject({ website_name: updatedBrandName });
  });

  /** TC_AD_SET_013 */
  test('TC_AD_SET_013 shows loading state while fetching settings', async ({ adminPage }) => {
    await adminPage.unroute('**/api/v1/**');
    setSettingsLoadDelay(1500);
    await mockSettingsApi(adminPage);
    await mockAuthRefreshApi(adminPage);
    await settingsPage.goto();
    await expect(adminPage.getByTestId('settings-loading')).toBeVisible();
    await settingsPage.waitForLoaded();
  });

  /** TC_AD_SET_014 */
  test('TC_AD_SET_014 shows tab error indicator for invalid general field', async () => {
    await settingsPage.fillEmail('not-an-email');
    await settingsPage.clickSave();
    await expect(settingsPage.page.getByText(copy.emailInvalid)).toBeVisible();

    await settingsPage.selectTab(copy.tabBrand);
    await expect(settingsPage.tabErrorDot('general')).toBeVisible();
  });

  /** TC_AD_SET_015 */
  test('TC_AD_SET_015 blocks save on invalid hotline', async ({ adminPage }) => {
    await settingsPage.fillHotline('12345');
    await settingsPage.clickSave();

    await expect(settingsPage.page.getByText(copy.hotlineInvalid)).toBeVisible();
    await expect(adminPage.getByText(copy.saveSuccess)).toHaveCount(0);
    await settingsPage.expectSaveBarVisible(true);
  });

  /** TC_AD_SET_016 */
  test('TC_AD_SET_016 blocks save on invalid social URL', async ({ adminPage }) => {
    await settingsPage.selectTab(copy.tabSocial);
    await settingsPage.fillFacebook('not-a-valid-url');
    await settingsPage.clickSave();

    await expect(settingsPage.page.getByText(copy.urlInvalid)).toBeVisible();
    await expect(adminPage.getByText(copy.saveSuccess)).toHaveCount(0);
    await expect(settingsPage.tabErrorDot('social')).toBeVisible();
  });

  /** TC_AD_SET_017 */
  test('TC_AD_SET_017 blocks save on short SEO meta title', async ({ adminPage }) => {
    await settingsPage.selectTab(copy.tabSeo);
    await settingsPage.fillMetaTitle('short');
    await settingsPage.clickSave();

    await expect(settingsPage.page.getByText(copy.metaTitleMin)).toBeVisible();
    await expect(adminPage.getByText(copy.saveSuccess)).toHaveCount(0);
    await expect(settingsPage.tabErrorDot('seo')).toBeVisible();
  });

  /** TC_AD_SET_018 */
  test('TC_AD_SET_018 disables reserved payment gateway toggles', async () => {
    await settingsPage.selectTab(copy.tabPayment);
    await expect(settingsPage.paymentRow('vnpay').getByRole('switch')).toBeDisabled();
    await expect(settingsPage.paymentRow('momo').getByRole('switch')).toBeDisabled();
    await expect(settingsPage.paymentRow('zalopay').getByRole('switch')).toBeDisabled();
    await expect(settingsPage.paymentRow('sepay').getByRole('switch')).toBeEnabled();
  });

  /** TC_AD_SET_019 */
  test('TC_AD_SET_019 uploads brand logo and marks form dirty', async () => {
    await settingsPage.selectTab(copy.tabBrand);
    const uploadRes = settingsPage.waitForUploadResponse();
    await settingsPage.logoFileInput().setInputFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      ),
    });
    await uploadRes;
    await settingsPage.expectSaveBarVisible(true);
    await expect(settingsPage.main.locator('img[src*="mock-upload"]')).toBeVisible();
  });
});
