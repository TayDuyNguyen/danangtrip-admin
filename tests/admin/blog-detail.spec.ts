/**
 * Admin Blog Detail — core (06d)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BlogDetailPage, blogDetailCopy as copy } from '../pages/admin/BlogDetailPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockBlogPost,
  mockBlogsApi,
  patchMockBlogPost,
  resetMockBlogs,
  setBlogDeleteFailForId,
  setBlogDetailDelay,
  setBlogStatusFailForId,
} from '../fixtures/api/blogs.mock';
import {
  archivedDetailBlogId,
  defaultDetailBlogId,
  deleteDetailBlogId,
  draftDetailBlogId,
  expectedDetailContentSnippet,
  expectedDetailExcerpt,
  expectedDetailSlug,
  mockDetailBlog,
  notFoundDetailBlogId,
  scheduledDetailBlogId,
} from '../fixtures/data/blog-detail.data';

test.describe('Admin Blog Detail @P1', () => {
  let detailPage: BlogDetailPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    detailPage = new BlogDetailPage(adminPage, defaultDetailBlogId);
  });

  /** TC_AD_BLOGDET_003 */
  test('TC_AD_BLOGDET_003 loads published post with full header content and sidebar', async () => {
    await detailPage.gotoAndWaitLoaded();

    await expect(detailPage.pageHeading).toBeVisible();
    await expect(detailPage.headerPostTitle).toContainText(mockDetailBlog.title);
    await expect(detailPage.postTitleHeading).toContainText(mockDetailBlog.title);
    await expect(detailPage.statusDropdownButton).toContainText(copy.statusPublishedBadge);
    await expect(detailPage.quickActionsCard).toBeVisible();
    await expect(detailPage.publishStatusCard).toBeVisible();
    await expect(detailPage.authorCard).toBeVisible();
    await expect(detailPage.infoCard).toBeVisible();
  });

  /** TC_AD_BLOGDET_004 */
  test('TC_AD_BLOGDET_004 draft post shows draft status and disabled preview', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, draftDetailBlogId);
    await detailPage.gotoAndWaitLoaded();

    await expect(detailPage.statusDropdownButton).toContainText(copy.statusDraftBadge);
    await expect(detailPage.publishStatusCard).toContainText(copy.statusDraftBadge);
    await expect(detailPage.sidebarPreviewButton).toBeDisabled();
  });

  /** TC_AD_BLOGDET_005 */
  test('TC_AD_BLOGDET_005 archived post shows archived status badge', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, archivedDetailBlogId);
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.statusDropdownButton).toContainText(copy.statusArchivedBadge);
    await expect(detailPage.sidebarPreviewButton).toBeDisabled();
  });

  /** TC_AD_BLOGDET_045 */
  test('TC_AD_BLOGDET_045 scheduled post shows scheduled badge and disabled preview', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, scheduledDetailBlogId);
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.statusDropdownButton).toContainText(copy.statusScheduledBadge);
    await expect(detailPage.publishStatusCard).toContainText(copy.statusScheduledBadge);
    await expect(detailPage.sidebarPreviewButton).toBeDisabled();
  });

  /** TC_AD_BLOGDET_006 */
  test('TC_AD_BLOGDET_006 shows skeleton while detail API is delayed', async ({ adminPage }) => {
    setBlogDetailDelay(1200);
    await detailPage.goto();
    await expect(detailPage.skeletonRoot).toBeVisible();
    await expect(detailPage.postTitleHeading).toBeVisible({ timeout: 15_000 });
  });

  /** TC_AD_BLOGDET_007 */
  test('TC_AD_BLOGDET_007 shows not found when blog id does not exist', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, notFoundDetailBlogId);
    await detailPage.goto();

    await expect(detailPage.notFoundTitle).toBeVisible();
    await expect(adminPage.getByText(copy.notFoundDesc)).toBeVisible();
  });

  /** TC_AD_BLOGDET_008 */
  test('TC_AD_BLOGDET_008 not found back button navigates to blog list', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, notFoundDetailBlogId);
    await detailPage.goto();
    await detailPage.notFoundBackButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGDET_010 */
  test('TC_AD_BLOGDET_010 back button navigates to blog list', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.goBackToList();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGDET_011 */
  test('TC_AD_BLOGDET_011 opens status dropdown with draft published archived options', async () => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.openStatusDropdown();

    await expect(detailPage.statusMenu.getByRole('button', { name: copy.statusDraftOption })).toBeVisible();
    await expect(detailPage.statusMenu.getByRole('button', { name: copy.statusPublishedOption })).toBeVisible();
    await expect(detailPage.statusMenu.getByRole('button', { name: copy.statusArchivedOption })).toBeVisible();
  });

  /** TC_AD_BLOGDET_012 */
  test('TC_AD_BLOGDET_012 closes status dropdown when clicking outside', async () => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.openStatusDropdown();
    await detailPage.postTitleHeading.click();
    await expect(detailPage.statusMenu).toBeHidden();
  });

  /** TC_AD_BLOGDET_013 */
  test('TC_AD_BLOGDET_013 changes status to draft and shows success toast', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    const statusReq = detailPage.waitForStatusPatch();
    await detailPage.selectStatus('draft');
    await statusReq;

    await expect(adminPage.getByText(copy.statusSuccess)).toBeVisible();
    await expect(detailPage.statusDropdownButton).toContainText(copy.statusDraftBadge);
    await expect(detailPage.publishStatusCard).toContainText(copy.statusDraftBadge);
  });

  /** TC_AD_BLOGDET_014 */
  test('TC_AD_BLOGDET_014 changes draft status to published and enables preview', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, draftDetailBlogId);
    await detailPage.gotoAndWaitLoaded();
    const statusReq = detailPage.waitForStatusPatch();
    await detailPage.selectStatus('published');
    await statusReq;
    await expect(detailPage.statusDropdownButton).toContainText(copy.statusPublishedBadge);
    await expect(detailPage.sidebarPreviewButton).toBeEnabled();
  });

  /** TC_AD_BLOGDET_015 */
  test('TC_AD_BLOGDET_015 changes published status to archived', async () => {
    await detailPage.gotoAndWaitLoaded();
    const statusReq = detailPage.waitForStatusPatch();
    await detailPage.selectStatus('archived');
    await statusReq;
    await expect(detailPage.statusDropdownButton).toContainText(copy.statusArchivedBadge);
    await expect(detailPage.sidebarPreviewButton).toBeDisabled();
  });

  /** TC_AD_BLOGDET_017 */
  test('TC_AD_BLOGDET_017 shows error toast when status update fails', async ({ adminPage }) => {
    setBlogStatusFailForId(defaultDetailBlogId);
    await detailPage.gotoAndWaitLoaded();
    await detailPage.selectStatus('draft');
    await expect(adminPage.getByText(copy.statusError)).toBeVisible();
  });

  /** TC_AD_BLOGDET_018 */
  test('TC_AD_BLOGDET_018 header preview opens public blog in new tab on desktop', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 1280, height: 800 });
    await detailPage.gotoAndWaitLoaded();
    const popupPromise = adminPage.waitForEvent('popup');
    await detailPage.headerPreviewButton.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(new RegExp(`/blog/${expectedDetailSlug}`));
    await popup.close();
  });

  /** TC_AD_BLOGDET_019 */
  test('TC_AD_BLOGDET_019 draft post preview button is disabled in sidebar', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, draftDetailBlogId);
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.sidebarPreviewButton).toBeDisabled();
  });

  /** TC_AD_BLOGDET_020 */
  test('TC_AD_BLOGDET_020 sidebar preview opens public blog in new tab', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    const popupPromise = adminPage.waitForEvent('popup');
    await detailPage.sidebarPreviewButton.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(new RegExp(`/blog/${expectedDetailSlug}`));
    await popup.close();
  });

  /** TC_AD_BLOGDET_021 */
  test('TC_AD_BLOGDET_021 header edit button navigates to edit page', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.headerEditButton.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${defaultDetailBlogId}(/)?$`));
  });

  /** TC_AD_BLOGDET_022 */
  test('TC_AD_BLOGDET_022 sidebar edit button navigates to edit page', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.sidebarEditButton.click();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${defaultDetailBlogId}(/)?$`));
  });

  /** TC_AD_BLOGDET_024 */
  test('TC_AD_BLOGDET_024 duplicate flow opens confirm modal and navigates to create', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.sidebarDuplicateButton.click();
    await expect(detailPage.duplicateModal).toBeVisible();
    await detailPage.duplicateConfirmButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/create/);
    await expect(adminPage.getByText(copy.duplicateSuccess)).toBeVisible();
  });

  /** TC_AD_BLOGDET_026 */
  test('TC_AD_BLOGDET_026 duplicate modal can be cancelled', async () => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.sidebarDuplicateButton.click();
    await detailPage.duplicateModal.getByRole('button', { name: copy.cancelButton }).click();
    await expect(detailPage.duplicateModal).toBeHidden();
  });

  /** TC_AD_BLOGDET_029 */
  test('TC_AD_BLOGDET_029 sidebar delete confirms and navigates to list', async ({ adminPage }) => {
    detailPage = new BlogDetailPage(adminPage, deleteDetailBlogId);
    await detailPage.gotoAndWaitLoaded();
    await detailPage.sidebarDeleteButton.click();
    await expect(detailPage.deleteModal).toBeVisible();
    const deleteReq = detailPage.waitForDelete();
    await detailPage.deleteConfirmButton.click();
    await deleteReq;
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGDET_030 */
  test('TC_AD_BLOGDET_030 shows error toast when delete fails', async ({ adminPage }) => {
    setBlogDeleteFailForId(deleteDetailBlogId);
    detailPage = new BlogDetailPage(adminPage, deleteDetailBlogId);
    await detailPage.gotoAndWaitLoaded();
    await detailPage.sidebarDeleteButton.click();
    await detailPage.deleteConfirmButton.click();
    await expect(adminPage.getByText(copy.statusError)).toBeVisible();
  });

  /** TC_AD_BLOGDET_032 */
  test('TC_AD_BLOGDET_032 displays featured hero image', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.heroImage).toBeVisible();
    await expect(detailPage.heroImage).toHaveAttribute('src', /.+/);
  });

  /** TC_AD_BLOGDET_033 */
  test('TC_AD_BLOGDET_033 shows fallback when featured image missing', async () => {
    patchMockBlogPost(defaultDetailBlogId, { featured_image: null });
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.heroFallback).toBeVisible();
  });

  /** TC_AD_BLOGDET_035 */
  test('TC_AD_BLOGDET_035 copy slug shows success toast', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    await detailPage.copySlugButton.click();
    await expect(adminPage.getByText(copy.copySlugSuccess)).toBeVisible();
    await expect(detailPage.slugCode).toHaveText(expectedDetailSlug);
  });

  /** TC_AD_BLOGDET_036 */
  test('TC_AD_BLOGDET_036 displays excerpt block', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.contentCard.getByText(copy.excerptLabel)).toBeVisible();
    await expect(detailPage.contentCard.getByText(expectedDetailExcerpt)).toBeVisible();
  });

  /** TC_AD_BLOGDET_038 */
  test('TC_AD_BLOGDET_038 renders HTML content preview', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.contentHtmlBlock).toBeVisible();
    await expect(detailPage.contentHtmlBlock).toContainText(expectedDetailContentSnippet);
  });

  /** TC_AD_BLOGDET_039 */
  test('TC_AD_BLOGDET_039 shows empty content message when content is blank', async () => {
    patchMockBlogPost(defaultDetailBlogId, { content: '' });
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.contentCard.getByText(copy.noContent)).toBeVisible();
  });

  /** TC_AD_BLOGDET_041 */
  test('TC_AD_BLOGDET_041 sidebar shows author profile', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.authorCard.getByText(/Admin DaNangTrip/i)).toBeVisible();
  });

  /** TC_AD_BLOGDET_042 */
  test('TC_AD_BLOGDET_042 info card shows created updated and view count', async ({ adminPage }) => {
    await detailPage.gotoAndWaitLoaded();
    const post = getMockBlogPost(defaultDetailBlogId)!;
    await expect(adminPage.getByText(String(post.view_count))).toBeVisible();
    await expect(detailPage.infoCard).toContainText(/\d{2}\/\d{2}\/\d{4}/);
  });

  /** TC_AD_BLOGDET_043 */
  test('TC_AD_BLOGDET_043 published post shows published date in sidebar', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.publishStatusCard.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  });

  /** TC_AD_BLOGDET_044 */
  test('TC_AD_BLOGDET_044 content meta shows author date and views', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.contentCard.getByText(/Admin DaNangTrip/i)).toBeVisible();
    await expect(detailPage.contentCard.getByText(/8[,.]?420/)).toBeVisible();
  });

  /** TC_AD_BLOGDET_046 */
  test('TC_AD_BLOGDET_046 hero overlay shows category tags', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.categoryBadge('Ẩm thực')).toBeVisible();
  });

  /** TC_AD_BLOGDET_048 */
  test('TC_AD_BLOGDET_048 info card lists category tags', async () => {
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.infoCard.getByText('Ẩm thực')).toBeVisible();
  });

  /** TC_AD_BLOGDET_049 */
  test('TC_AD_BLOGDET_049 mobile viewport shows sticky footer actions', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.mobileFooter).toBeVisible();
    await expect(detailPage.mobilePreviewButton).toBeVisible();
    await expect(detailPage.mobileEditButton).toBeVisible();
    await expect(detailPage.mobileDeleteButton).toBeVisible();
  });

  /** TC_AD_BLOGDET_050 */
  test('TC_AD_BLOGDET_050 mobile viewport edit icon button is visible in header', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await detailPage.gotoAndWaitLoaded();
    await expect(detailPage.headerEditButton).toBeVisible();
  });
});
