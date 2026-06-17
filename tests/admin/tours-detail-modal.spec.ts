/**
 * Admin Tour Detail Modal — mapped from 03d_tour_detail_modal.md
 */
import { test, expect } from '../fixtures/auth.fixture';
import { TourListPage } from '../pages/admin/TourListPage';
import { TourDetailModalPage, tourDetailModalCopy } from '../pages/admin/TourDetailModalPage';
import {
  mockToursApi,
  resetMockTours,
  patchMockTour,
  setScheduleDelay,
  setScheduleEmptyForTour,
  setScheduleErrorForTour,
  releaseScheduleErrorForTour,
} from '../fixtures/api/tours.mock';
import { mockFeaturedTour, searchKeyword } from '../fixtures/data/tours.data';

test.describe('Admin Tour Detail Modal @P1', () => {
  let listPage: TourListPage;
  let modalPage: TourDetailModalPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockTours();
    await mockToursApi(adminPage);
    listPage = new TourListPage(adminPage);
    modalPage = new TourDetailModalPage(listPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
  });

  /** ADMIN_TOUR_MODAL_001 / TC_AD_TMOD_001 */
  test('TC_AD_TMOD_001 opens modal with tour title overlay', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel).toBeVisible();
    await expect(modalPage.panel.getByRole('heading', { name: mockFeaturedTour.name })).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_002 / TC_AD_TMOD_002 */
  test('TC_AD_TMOD_002 closes modal via header X and preserves filters', async () => {
    await listPage.search(searchKeyword);
    await expect(listPage.rowByTourName(mockFeaturedTour.name)).toBeVisible({ timeout: 10_000 });
    await modalPage.open(mockFeaturedTour.name);
    await modalPage.closeByX();
    await expect(modalPage.panel).toBeHidden();
    await expect(listPage.searchInput).toHaveValue(searchKeyword);
    await expect(listPage.rowByTourName(mockFeaturedTour.name)).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_003 / TC_AD_TMOD_003 */
  test('TC_AD_TMOD_003 closes modal via footer close button', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await modalPage.closeByFooter();
    await expect(modalPage.panel).toBeHidden();
  });

  /** ADMIN_TOUR_MODAL_004 / TC_AD_TMOD_004 */
  test('TC_AD_TMOD_004 shows status and booking availability badges', async () => {
    await modalPage.open('Tour Lăng Bác');
    await expect(modalPage.panel.locator('span').filter({ hasText: tourDetailModalCopy.active }).first()).toBeVisible();
    await expect(modalPage.panel.getByText(tourDetailModalCopy.soldOut).first()).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_005 / TC_AD_TMOD_005 */
  test('TC_AD_TMOD_005 shows padded tour code for id 7', async () => {
    await modalPage.open('Tour Đà Nẵng về đêm');
    await expect(modalPage.panel.getByText(/TOUR-007/i)).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_006 / TC_AD_TMOD_006 */
  test('TC_AD_TMOD_006 renders thumbnail with aspect video', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.thumbnailArea.locator('img')).toBeVisible();
    await expect(modalPage.thumbnailArea).toHaveClass(/aspect-video/);
  });

  /** ADMIN_TOUR_MODAL_007 / TC_AD_TMOD_007 */
  test('TC_AD_TMOD_007 shows fallback when thumbnail is missing', async () => {
    await modalPage.open('Tour Tam Kỳ');
    await expect(modalPage.thumbnailArea.getByText(tourDetailModalCopy.noData)).toBeVisible();
    await expect(modalPage.thumbnailArea.locator('img')).toHaveCount(0);
  });

  /** ADMIN_TOUR_MODAL_008 / TC_AD_TMOD_008 */
  test('TC_AD_TMOD_008 caps gallery preview at four images', async () => {
    await modalPage.open('Tour Cù Lao Chàm');
    await expect(modalPage.galleryImages).toHaveCount(4);
  });

  /** ADMIN_TOUR_MODAL_009 / TC_AD_TMOD_009 */
  test('TC_AD_TMOD_009 formats adult price with currency', async () => {
    await modalPage.open('Tour Huế 1 ngày');
    await expect(modalPage.panel.getByText(/1\.500\.000|1,500,000/)).toBeVisible();
    await expect(modalPage.panel.getByText(/VND|₫/i).first()).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_010 / TC_AD_TMOD_010 */
  test('TC_AD_TMOD_010 displays zero price without NaN', async () => {
    await listPage.goToPage(2);
    await modalPage.open('Tour dù lượn');
    await expect(modalPage.panel.getByText(/^0\s/).first()).toBeVisible();
    await expect(modalPage.panel.getByText(/NaN/i)).toHaveCount(0);
  });

  /** ADMIN_TOUR_MODAL_011 / TC_AD_TMOD_011 */
  test('TC_AD_TMOD_011 shows duration or no_data fallback', async () => {
    await modalPage.open('Tour Đà Nẵng về đêm');
    await expect(modalPage.panel.getByText('2N1Đ', { exact: true })).toBeVisible();

    await modalPage.closeByFooter();
    await modalPage.open('Tour Tam Kỳ');
    await expect(modalPage.panel.getByText(tourDetailModalCopy.noData).nth(1)).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_012 / TC_AD_TMOD_012 */
  test('TC_AD_TMOD_012 shows max people with unit', async () => {
    await modalPage.open('Tour Đà Nẵng về đêm');
    await expect(modalPage.panel.getByText(/30/).first()).toBeVisible();
    await expect(modalPage.panel.getByText(/người|people/i).first()).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_013 / TC_AD_TMOD_013 */
  test('TC_AD_TMOD_013 truncates long meeting point text', async () => {
    await modalPage.open('Tour Đà Nẵng về đêm');
    const meeting = modalPage.panel.locator('p.truncate.max-w-\\[200px\\]');
    await expect(meeting).toBeVisible();
    await expect(meeting).toHaveClass(/truncate/);
  });

  /** ADMIN_TOUR_MODAL_014 / TC_AD_TMOD_014 */
  test('TC_AD_TMOD_014 shows featured and hot badges when enabled', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByText(tourDetailModalCopy.featured).first()).toBeVisible();
    await expect(modalPage.panel.getByText(tourDetailModalCopy.hot).first()).toBeVisible();

    await modalPage.closeByFooter();
    await modalPage.open('Tour Hội An cổ kính');
    await expect(modalPage.panel.getByText(tourDetailModalCopy.featured)).toHaveCount(0);
    await expect(modalPage.panel.getByText(tourDetailModalCopy.hot)).toHaveCount(0);
  });

  /** ADMIN_TOUR_MODAL_015 / TC_AD_TMOD_015 */
  test('TC_AD_TMOD_015 renders description HTML content', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.locator('.prose strong')).toHaveText('Bà Nà Hills');
  });

  /** ADMIN_TOUR_MODAL_016 / TC_AD_TMOD_016 */
  test('TC_AD_TMOD_016 shows no_data when description is missing', async () => {
    await modalPage.open('Tour Tam Kỳ');
    const descriptionBlock = modalPage.panel.locator('.prose');
    await expect(descriptionBlock.getByText(tourDetailModalCopy.noData)).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_017b — legacy DB shape time/title/description */
  test('TC_AD_TMOD_017b renders legacy itinerary fields from API', async () => {
    patchMockTour(1, {
      itinerary: [
        {
          time: '07:30',
          title: 'Đón khách tại trung tâm Đà Nẵng',
          description: 'Xe và hướng dẫn viên đón khách tại khách sạn.',
        },
        {
          time: '09:00',
          title: 'Đến ga cáp treo Bà Nà Hills',
          description: 'Trải nghiệm cáp treo dài nhất thế giới.',
        },
      ],
    });
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await modalPage.open(mockFeaturedTour.name);
    await expect(
      modalPage.panel.getByRole('heading', { name: 'Đón khách tại trung tâm Đà Nẵng' })
    ).toBeVisible();
    await expect(modalPage.panel.getByText('Xe và hướng dẫn viên đón khách tại khách sạn.')).toBeVisible();
    await expect(
      modalPage.panel.getByRole('heading', { name: 'Đến ga cáp treo Bà Nà Hills' })
    ).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_017 / TC_AD_TMOD_017 */
  test('TC_AD_TMOD_017 renders itinerary timeline items', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByRole('heading', { name: 'Khởi hành' })).toBeVisible();
    await expect(modalPage.panel.getByRole('heading', { name: 'Cáp treo' })).toBeVisible();
    await expect(modalPage.panel.getByRole('heading', { name: 'Vui chơi' })).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_018 / TC_AD_TMOD_018 */
  test('TC_AD_TMOD_018 shows empty itinerary state', async () => {
    await modalPage.open('Tour Tam Kỳ');
    await expect(modalPage.panel.getByText(tourDetailModalCopy.noScheduleItinerary)).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_019 / TC_AD_TMOD_019 */
  test('TC_AD_TMOD_019 shows loading state while schedules fetch', async () => {
    setScheduleDelay(1200);
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByText(tourDetailModalCopy.loading)).toBeVisible();
    await expect(modalPage.panel.getByText('10/30').first()).toBeVisible({ timeout: 10_000 });
  });

  /** ADMIN_TOUR_MODAL_020 / TC_AD_TMOD_020 */
  test('TC_AD_TMOD_020 lists schedules with slots and status', async () => {
    await modalPage.open(mockFeaturedTour.name);
    const scheduleItems = modalPage.panel.locator('ul[aria-label] li');
    await expect(scheduleItems).toHaveCount(3, { timeout: 10_000 });
    await expect(scheduleItems.nth(0).getByText('10/30')).toBeVisible();
    await expect(scheduleItems.nth(1).getByText('25/25')).toBeVisible();
    await expect(scheduleItems.nth(2).getByText('5/20')).toBeVisible();
    await expect(scheduleItems.nth(0).getByText(/Đang hoạt động|Active/i)).toBeVisible();
    await expect(scheduleItems.nth(1).getByText(tourDetailModalCopy.scheduleFull)).toBeVisible();
    await expect(scheduleItems.nth(2).getByText(/Đã hủy|Cancelled/i)).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_021 / TC_AD_TMOD_021 */
  test('TC_AD_TMOD_021 shows schedules empty state', async () => {
    setScheduleEmptyForTour(10);
    await modalPage.open('Tour Tam Kỳ');
    await expect(modalPage.panel.getByText(tourDetailModalCopy.schedulesNoData)).toBeVisible({ timeout: 10_000 });
  });

  /** ADMIN_TOUR_MODAL_022 / TC_AD_TMOD_022 */
  test('TC_AD_TMOD_022 shows schedules error alert with retry', async () => {
    setScheduleErrorForTour(1);
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByRole('alert')).toBeVisible({ timeout: 10_000 });
    await expect(modalPage.panel.getByText(tourDetailModalCopy.loadError)).toBeVisible();
    await expect(modalPage.retryButton).toBeVisible();
  });

  /** ADMIN_TOUR_MODAL_023 / TC_AD_TMOD_023 */
  test('TC_AD_TMOD_023 retries schedules after error', async ({ adminPage }) => {
    setScheduleErrorForTour(1);
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByRole('alert')).toBeVisible({ timeout: 10_000 });
    releaseScheduleErrorForTour(1);
    const retryReq = adminPage.waitForResponse(
      (res) => res.url().includes('/admin/tour-schedules') && res.status() === 200
    );
    await modalPage.retryButton.click();
    await retryReq;
    await expect(modalPage.panel.getByText('10/30').first()).toBeVisible({ timeout: 10_000 });
  });

  /** ADMIN_TOUR_MODAL_024 / TC_AD_TMOD_024 */
  test('TC_AD_TMOD_024 edit button navigates to tour edit page', async ({ adminPage }) => {
    await modalPage.open(mockFeaturedTour.name);
    await modalPage.editButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/tours\/edit\/1/);
    await expect(modalPage.panel).toBeHidden();
  });

  /** ADMIN_TOUR_MODAL_025 / TC_AD_TMOD_025 */
  test('TC_AD_TMOD_025 modal is usable on mobile viewport', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 375, height: 667 });
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel).toBeVisible();
    await expect(modalPage.editButton).toBeVisible();
    await modalPage.scrollBody.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(modalPage.panel.getByRole('heading', { name: 'Vui chơi' })).toBeVisible();
  });

  /** TC_AD_TMOD_028 */
  test('TC_AD_TMOD_028 closes modal via Escape and backdrop click', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await modalPage.closeByEscape();
    await expect(modalPage.panel).toBeHidden();

    await modalPage.open(mockFeaturedTour.name);
    await modalPage.closeByBackdrop();
    await expect(modalPage.panel).toBeHidden();
  });

  /** TC_AD_TMOD_030 */
  test('TC_AD_TMOD_030 fetches schedules only after modal opens', async ({ adminPage }) => {
    let scheduleGetCount = 0;
    adminPage.on('request', (req) => {
      if (req.method() === 'GET' && req.url().includes('/admin/tour-schedules')) {
        scheduleGetCount += 1;
      }
    });

    await listPage.goto();
    await listPage.waitForTableLoaded();
    await adminPage.waitForTimeout(400);
    expect(scheduleGetCount).toBe(0);

    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByText('10/30').first()).toBeVisible({ timeout: 10_000 });
    expect(scheduleGetCount).toBeGreaterThan(0);
  });

  /** TC_AD_TMOD_026 */
  test('TC_AD_TMOD_026 shows open booking availability badge', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByText(tourDetailModalCopy.openBooking).first()).toBeVisible();
  });

  /** TC_AD_TMOD_027 */
  test('TC_AD_TMOD_027 shows inactive status badge', async () => {
    await modalPage.open('Tour Mỹ Sơn thánh địa');
    await expect(modalPage.panel.getByText(tourDetailModalCopy.inactive).first()).toBeVisible();
  });

  /** TC_AD_TMOD_031 — legacy status=full maps to FULL → Đầy chỗ / Full label */
  test('TC_AD_TMOD_031 shows Full for legacy full schedule row', async () => {
    await modalPage.open(mockFeaturedTour.name);
    const fullRow = modalPage.scheduleItems().nth(1);
    await expect(fullRow.getByText('25/25')).toBeVisible({ timeout: 10_000 });
    await expect(fullRow.getByText(tourDetailModalCopy.scheduleFull)).toBeVisible();
    await expect(fullRow.getByText(tourDetailModalCopy.active)).toHaveCount(0);
  });

  /** TC_AD_TMOD_032 */
  test('TC_AD_TMOD_032 does not display min_people field in modal scope', async () => {
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.panel.getByText(tourDetailModalCopy.minPeopleLabel)).toHaveCount(0);
  });

  /** TC_AD_TMOD_029 */
  test('TC_AD_TMOD_029 shows thumbnail only when images array is empty', async () => {
    patchMockTour(mockFeaturedTour.id, { images: [] });
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await modalPage.open(mockFeaturedTour.name);
    await expect(modalPage.thumbnailArea.locator('img')).toBeVisible();
    await expect(modalPage.galleryImages).toHaveCount(0);
  });
});
