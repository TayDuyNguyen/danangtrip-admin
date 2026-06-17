/**
 * Admin Tour Create — extended TC from 03b_tour_create.md backlog
 * Run: npm run test:admin:tour-create
 */
import { test, expect, seedNonAdminSession, seedAdminSession } from '../fixtures/auth.fixture';
import { TourCreatePage, tourCreateCopy } from '../pages/admin/TourCreatePage';
import {
  mockToursApi,
  resetMockTours,
  setTourCategoriesDelay,
  setTourCategoriesBlocked,
  setTourCreateDelay,
} from '../fixtures/api/tours.mock';
import {
  expectedDiscountedPrice,
  invalidDiscountNegative,
  invalidDiscountOver100,
  invalidMinPeopleZero,
  invalidNegativePriceChild,
  invalidNegativePriceInfant,
  sampleExclusions,
  sampleInclusions,
  shortTourName,
  tinyPngBuffer,
  validCreateTour,
} from '../fixtures/data/tour-create.data';

test.describe('Admin Tour Create — Auth @P0', () => {
  /** TC_AD_TCREATE_030 */
  test('TC_AD_TCREATE_030 guest is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/admin/tours/create');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });

  /** TC_AD_TCREATE_031 */
  test('TC_AD_TCREATE_031 non-admin user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    resetMockTours();
    await mockToursApi(page);
    await seedNonAdminSession(page);
    await page.goto('/admin/tours/create');
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    await context.close();
  });
});

test.describe('Admin Tour Create — Validation backlog @P1', () => {
  let createPage: TourCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    createPage = new TourCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_TCREATE_018 */
  test('TC_AD_TCREATE_018 rejects tour name shorter than 3 characters', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({ name: shortTourName });
    await createPage.submit();

    await expect(createPage.fieldError('name')).toBeVisible();
    await expect(createPage.fieldError('name')).toContainText(tourCreateCopy.minLengthError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** TC_AD_TCREATE_020 */
  test('TC_AD_TCREATE_020 rejects discount percent over 100', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({ discountPercent: invalidDiscountOver100 });
    await createPage.submit();

    await expect(createPage.fieldError('discount_percent')).toBeVisible();
    await expect(createPage.fieldError('discount_percent')).toContainText(tourCreateCopy.maxPercentError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  test('TC_AD_TCREATE_020b rejects negative discount percent', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({ discountPercent: invalidDiscountNegative });
    await createPage.submit();

    await expect(createPage.fieldError('discount_percent')).toBeVisible();
    await expect(createPage.fieldError('discount_percent')).toContainText(tourCreateCopy.positiveError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  test('TC_AD_TCREATE_008b cannot remove the only itinerary day', async () => {
    await createPage.fillForm({
      itineraryTitle: validCreateTour.itineraryTitle,
      itineraryContent: validCreateTour.itineraryContent,
    });

    await expect(createPage.itineraryRemoveButton(0)).toBeDisabled();
    await expect(createPage.fieldBlock('itinerary').getByText(/Ngày 1|Day 1/i)).toBeVisible();
  });

  /** TC_AD_TCREATE_024 */
  test('TC_AD_TCREATE_024 currency inputs reject negative digits at input level', async () => {
    await createPage.priceChildInput.click();
    await createPage.priceChildInput.fill('');
    await createPage.page.keyboard.type(invalidNegativePriceChild);
    await expect(createPage.priceChildInput).toHaveValue('100');

    await createPage.priceInfantInput.click();
    await createPage.priceInfantInput.fill('');
    await createPage.page.keyboard.type(invalidNegativePriceInfant);
    await expect(createPage.priceInfantInput).toHaveValue('50');
  });

  /** TC_AD_TCREATE_025 */
  test('TC_AD_TCREATE_025 rejects min people zero or less', async ({ adminPage }) => {
    await createPage.prepareValidSubmit({ minPeople: invalidMinPeopleZero });
    await createPage.submit();

    await expect(createPage.fieldError('min_people')).toBeVisible();
    await expect(createPage.fieldError('min_people')).toContainText(tourCreateCopy.positiveError);
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });

  /** TC_AD_TCREATE_029 */
  test('TC_AD_TCREATE_029 shows thumbnail required error in DOM on submit', async ({ adminPage }) => {
    await createPage.prepareValidSubmitWithoutThumbnail();
    await createPage.submit();

    await expect(createPage.fieldError('thumbnail')).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/create/);
  });
});

test.describe('Admin Tour Create — Media & checklist @P1', () => {
  let createPage: TourCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    createPage = new TourCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_TCREATE_026 */
  test('TC_AD_TCREATE_026 sends inclusions and exclusions in create payload', async () => {
    const createReq = createPage.waitForCreatePost();

    await createPage.prepareValidSubmit({
      inclusions: sampleInclusions,
      exclusions: sampleExclusions,
    });
    await createPage.submit();

    const res = await createReq;
    const body = res.request().postDataJSON() as {
      inclusions?: string[];
      exclusions?: string[];
    };
    expect(body.inclusions).toEqual(expect.arrayContaining(['Xe đưa đón', 'Hướng dẫn viên', 'Bữa trưa']));
    expect(body.exclusions).toEqual(expect.arrayContaining(['Chi phí cá nhân', 'Tip']));
    expect(res.status()).toBe(201);

    await expect(createPage.checklistItem(tourCreateCopy.checklistInclusions)).toHaveClass(/line-through/);
  });
});

test.describe('Admin Tour Create — UX polish @P2', () => {
  let createPage: TourCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    createPage = new TourCreatePage(adminPage);
  });

  /** TC_AD_TCREATE_019 */
  test('TC_AD_TCREATE_019 updates discounted price in realtime', async () => {
    await createPage.goto();
    await createPage.priceAdultInput.fill('1000000');
    await createPage.discountInput.fill('10');

    await expect(createPage.priceAfterDiscountDisplay).toContainText(
      expectedDiscountedPrice(1_000_000, 10)
    );
    await expect(createPage.priceAfterDiscountDisplay).toContainText(/VNĐ|VND|đ/i);
  });

  /** TC_AD_TCREATE_021 */
  test('TC_AD_TCREATE_021 shows category error banner and recovers on retry', async ({ browser }) => {
    resetMockTours();
    setTourCategoriesBlocked(true);

    const context = await browser.newContext();
    const page = await context.newPage();
    await seedAdminSession(page);
    await mockToursApi(page);

    const localCreatePage = new TourCreatePage(page);
    await localCreatePage.goto();

    await expect(localCreatePage.categoryErrorBanner).toBeVisible({ timeout: 15_000 });
    await expect(localCreatePage.categoryRetryButton).toBeVisible();

    setTourCategoriesBlocked(false);
    await localCreatePage.categoryRetryButton.click();
    await expect(localCreatePage.categorySelectControl).toBeVisible({ timeout: 15_000 });
    await expect(localCreatePage.categoryErrorBanner).toBeHidden();

    await context.close();
  });

  /** TC_AD_TCREATE_022 */
  test('TC_AD_TCREATE_022 shows category loading state before options appear', async () => {
    setTourCategoriesDelay(900);
    await createPage.goto();

    await expect(createPage.categoryLoadingBanner).toBeVisible();
    await expect(createPage.categorySelectControl).toBeVisible({ timeout: 15_000 });
    await expect(createPage.categoryLoadingBanner).toBeHidden();
  });

  /** TC_AD_TCREATE_023 */
  test('TC_AD_TCREATE_023 sidebar checklist completion percent increases as fields fill', async () => {
    await createPage.goto();

    await expect(createPage.completionPercentLabel).toContainText(/0\s*%/);

    await createPage.nameInput.fill(validCreateTour.name!);
    await expect(createPage.completionPercentLabel).toContainText(/11\s*%/);

    await createPage.selectCategory(validCreateTour.categoryLabel!);
    await createPage.shortDescInput.fill(validCreateTour.shortDesc!);
    await expect(createPage.completionPercentLabel).toContainText(/3[0-9]\s*%/);
  });

  /** TC_AD_TCREATE_027 */
  test('TC_AD_TCREATE_027 collapses sticky header on scroll', async () => {
    await createPage.goto();

    await expect(createPage.stickyCreateBadge).toBeHidden();
    await createPage.scrollMainContent(250);
    await expect(createPage.stickyCreateBadge).toBeVisible();
  });

  /** TC_AD_TCREATE_028 */
  test('TC_AD_TCREATE_028 disables submit and shows spinner while create is pending', async () => {
    setTourCreateDelay(5000);
    await createPage.goto();
    await createPage.prepareValidSubmit();

    const createReq = createPage.waitForCreatePost();
    await createPage.submitButton.click({ noWaitAfter: true });

    await expect(createPage.submitButton).toBeDisabled();
    await expect(createPage.submitButton).toContainText(tourCreateCopy.creatingLabel);
    await expect(createPage.sidebarSaveButton).toBeDisabled();
    await expect(createPage.sidebarSaveButton).toContainText(tourCreateCopy.savingLabel);

    await createReq;
  });
});
