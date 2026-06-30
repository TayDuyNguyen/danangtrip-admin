/**
 * Admin Blog Edit — core (06c)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BlogEditPage, blogEditCopy as copy } from '../pages/admin/BlogEditPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  getMockBlogPost,
  getMockBlogPostAfterUpdate,
  mockBlogsApi,
  resetMockBlogs,
  setBlogDetailFailForId,
  setBlogUpdateFail,
} from '../fixtures/api/blogs.mock';
import { mockBlogCategories } from '../fixtures/data/blog-list.data';
import {
  archivedEditBlogId,
  defaultEditBlogId,
  deleteEditBlogId,
  draftEditBlogId,
  inlineCategoryName,
  longBlogExcerpt,
  longBlogTitle,
  mockEditBlog,
  notFoundBlogId,
  scheduledDate,
  scheduledEditBlogId,
  scheduledTime,
  slugChangeTitle,
  updatedBlogContent,
  updatedBlogTitle,
  validationMessages,
} from '../fixtures/data/blog-edit.data';

test.describe('Admin Blog Edit @P1', () => {
  let editPage: BlogEditPage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    editPage = new BlogEditPage(adminPage, defaultEditBlogId);
  });

  /** TC_AD_BLOGEDIT_001 */
  test('TC_AD_BLOGEDIT_001 preloads form with existing blog post data', async () => {
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.titleInput).toHaveValue(mockEditBlog.title);
    await expect(editPage.excerptTextarea).toHaveValue(mockEditBlog.excerpt ?? '');
    await expect(editPage.contentEditor).toHaveValue(mockEditBlog.content);
    await expect(editPage.categoryCheckbox('Ẩm thực')).toBeChecked();
    await expect(editPage.page.locator('img[alt="Featured"]')).toBeVisible();
    await expect(editPage.headerPostTitle).toContainText(mockEditBlog.title);
  });

  /** TC_AD_BLOGEDIT_002 */
  test('TC_AD_BLOGEDIT_002 renders heading publish options info and quick actions', async () => {
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.heading).toBeVisible();
    await expect(editPage.formSidebar.getByText(copy.draftOption)).toBeVisible();
    await expect(editPage.formSidebar.getByText(copy.publishedOption)).toBeVisible();
    await expect(editPage.formSidebar.getByText(copy.scheduledOption)).toBeVisible();
    await expect(editPage.formSidebar.getByText(copy.archivedOption)).toBeVisible();
    await expect(editPage.page.getByText(copy.infoSection)).toBeVisible();
    await expect(editPage.quickActionsCard).toBeVisible();
    await expect(editPage.viewPostQuickButton).toBeVisible();
    await expect(editPage.duplicateQuickButton).toBeVisible();
    await expect(editPage.deleteQuickButton).toBeVisible();
  });

  /** TC_AD_BLOGEDIT_003 */
  test('TC_AD_BLOGEDIT_003 shows author and view count in info section', async () => {
    await editPage.gotoAndWaitLoaded();

    await expect(editPage.page.getByText(/Admin DaNangTrip/i)).toBeVisible();
    await expect(editPage.page.getByText(/8[,.]?420/)).toBeVisible();
  });

  /** TC_AD_BLOGEDIT_004 */
  test('TC_AD_BLOGEDIT_004 draft post preselects draft publish option', async ({ adminPage }) => {
    editPage = new BlogEditPage(adminPage, draftEditBlogId);
    await editPage.gotoAndWaitLoaded();
    await expect(editPage.publishOption('draft')).toBeChecked();
  });

  /** TC_AD_BLOGEDIT_005 */
  test('TC_AD_BLOGEDIT_005 archived post preselects archived publish option', async ({ adminPage }) => {
    editPage = new BlogEditPage(adminPage, archivedEditBlogId);
    await editPage.gotoAndWaitLoaded();
    await expect(editPage.publishOption('archived')).toBeChecked();
  });

  /** TC_AD_BLOGEDIT_006 */
  test('TC_AD_BLOGEDIT_006 scheduled post shows prefilled schedule date', async ({ adminPage }) => {
    editPage = new BlogEditPage(adminPage, scheduledEditBlogId);
    await editPage.gotoAndWaitLoaded();
    await expect(editPage.publishOption('scheduled')).toBeChecked();
    await expect(editPage.scheduleDateInput).toHaveValue('2099-12-31');
  });

  /** TC_AD_BLOGEDIT_007 */
  test('TC_AD_BLOGEDIT_007 rejects empty title on submit', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.titleInput.fill('');
    await editPage.submit();
    await expect(adminPage.getByText(validationMessages.titleRequired)).toBeVisible();
  });

  /** TC_AD_BLOGEDIT_008 */
  test('TC_AD_BLOGEDIT_008 rejects title longer than 255 characters', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.titleInput.fill(longBlogTitle);
    await editPage.submit();
    await expect(adminPage.getByText(validationMessages.titleMax)).toBeVisible();
  });

  /** TC_AD_BLOGEDIT_009 */
  test('TC_AD_BLOGEDIT_009 rejects excerpt longer than 500 characters', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.excerptTextarea.fill(longBlogExcerpt);
    await editPage.submit();
    await expect(adminPage.getByText(validationMessages.excerptMax)).toBeVisible();
  });

  /** TC_AD_BLOGEDIT_010 */
  test('TC_AD_BLOGEDIT_010 shows slug warning when title changes slug', async () => {
    await editPage.gotoAndWaitLoaded();
    await editPage.titleInput.fill(slugChangeTitle);
    await expect(editPage.slugWarning).toBeVisible();
  });

  /** TC_AD_BLOGEDIT_011 */
  test('TC_AD_BLOGEDIT_011 updates title and content then redirects to detail', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.titleInput.fill(updatedBlogTitle);
    await editPage.contentEditor.fill(updatedBlogContent);
    await editPage.submit();

    const res = await updateReq;
    expect(res.status()).toBe(200);
    const body = res.request().postDataJSON() as { title?: string; content?: string };
    expect(body.title).toBe(updatedBlogTitle);
    expect(body.content).toBe(updatedBlogContent);
    await expect(adminPage.getByText(copy.updateSuccess)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/${defaultEditBlogId}(/)?$`));
    expect(getMockBlogPostAfterUpdate(defaultEditBlogId)?.title).toBe(updatedBlogTitle);
  });

  /** TC_AD_BLOGEDIT_012 */
  test('TC_AD_BLOGEDIT_012 uploads new featured image in update payload', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.uploadFeaturedImage();
    await editPage.submit();

    const res = await updateReq;
    const body = res.request().postDataJSON() as { featured_image?: string };
    expect(body.featured_image).toMatch(/picsum\.photos/);
    expect(getMockBlogPostAfterUpdate(defaultEditBlogId)?.featured_image).toMatch(/picsum\.photos/);
  });

  /** TC_AD_BLOGEDIT_013 */
  test('TC_AD_BLOGEDIT_013 changes status to archived in PUT payload', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.selectPublishOption('archived');
    await editPage.submit();

    const res = await updateReq;
    const body = res.request().postDataJSON() as { status?: string };
    expect(body.status).toBe('archived');
    expect(getMockBlogPostAfterUpdate(defaultEditBlogId)?.status).toBe('archived');
  });

  /** TC_AD_BLOGEDIT_014 */
  test('TC_AD_BLOGEDIT_014 schedules publish with future date in PUT payload', async () => {
    await editPage.gotoAndWaitLoaded();
    const updateReq = editPage.waitForUpdatePut();

    await editPage.selectPublishOption('scheduled');
    await editPage.scheduleDateInput.fill(scheduledDate);
    await editPage.scheduleTimeInput.fill(scheduledTime);
    await editPage.submit();

    const res = await updateReq;
    const body = res.request().postDataJSON() as { status?: string; published_at?: string };
    expect(body.status).toBe('published');
    expect(body.published_at).toContain(scheduledDate);
  });

  /** TC_AD_BLOGEDIT_014b */
  test('TC_AD_BLOGEDIT_014b requires schedule date when scheduled option selected', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.selectPublishOption('scheduled');
    await editPage.scheduleDateInput.fill('');
    await editPage.submit();
    await expect(adminPage.getByText(validationMessages.scheduleDateRequired)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${defaultEditBlogId}`));
  });

  /** TC_AD_BLOGEDIT_015 */
  test('TC_AD_BLOGEDIT_015 creates inline category and auto-selects it', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.addCategoryToggle.click();
    await editPage.newCategoryInput.fill(inlineCategoryName);
    await editPage.addCategoryConfirmButton.click();
    await expect(adminPage.getByText(copy.categoryCreateSuccess)).toBeVisible();
    await expect(editPage.categoryCheckbox(inlineCategoryName)).toBeChecked();
  });

  /** TC_AD_BLOGEDIT_016 */
  test('TC_AD_BLOGEDIT_016 disables preview for draft post', async ({ adminPage }) => {
    editPage = new BlogEditPage(adminPage, draftEditBlogId);
    await editPage.gotoAndWaitLoaded();
    await expect(editPage.viewPostHeaderButton).toBeDisabled();
    await expect(editPage.viewPostQuickButton).toBeDisabled();
  });

  /** TC_AD_BLOGEDIT_017 */
  test('TC_AD_BLOGEDIT_017 opens public preview in new tab for published post', async () => {
    await editPage.gotoAndWaitLoaded();
    const popupPromise = editPage.page.waitForEvent('popup');
    await editPage.viewPostHeaderButton.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(new RegExp(`/blog/${mockEditBlog.slug}`));
    await popup.close();
  });

  /** TC_AD_BLOGEDIT_018 */
  test('TC_AD_BLOGEDIT_018 duplicate confirms and navigates to create page', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.duplicateQuickButton.click();
    await expect(editPage.duplicateModal).toBeVisible();
    await editPage.duplicateModal.getByRole('button', { name: copy.confirmButton }).click();
    await expect(adminPage.getByText(copy.duplicateSuccess)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/create/);
  });

  /** TC_AD_BLOGEDIT_019 */
  test('TC_AD_BLOGEDIT_019 delete confirms and redirects to blog list', async ({ adminPage }) => {
    editPage = new BlogEditPage(adminPage, deleteEditBlogId);
    await editPage.gotoAndWaitLoaded();
    const deleteReq = editPage.waitForDelete();

    await editPage.deleteQuickButton.click();
    await expect(editPage.deleteModal).toBeVisible();
    await editPage.deleteConfirmButton.click();

    await deleteReq;
    await expect(adminPage.getByText(copy.deleteSuccess)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
    expect(getMockBlogPost(deleteEditBlogId)).toBeUndefined();
  });

  /** TC_AD_BLOGEDIT_020 */
  test('TC_AD_BLOGEDIT_020 header cancel navigates to blog list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.headerCancelButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGEDIT_021 */
  test('TC_AD_BLOGEDIT_021 back button navigates to blog list', async ({ adminPage }) => {
    await editPage.gotoAndWaitLoaded();
    await editPage.backButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGEDIT_022 */
  test('TC_AD_BLOGEDIT_022 shows error toast when update API fails', async ({ adminPage }) => {
    setBlogUpdateFail(true, defaultEditBlogId);
    await editPage.gotoAndWaitLoaded();
    const failReq = editPage.waitForUpdatePut();

    await editPage.titleInput.fill(updatedBlogTitle);
    await editPage.submit();
    await failReq;

    await expect(adminPage.getByText(copy.updateError)).toBeVisible();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${defaultEditBlogId}`));
  });

  /** TC_AD_BLOGEDIT_023 */
  test('TC_AD_BLOGEDIT_023 shows not found panel for missing blog post', async ({ adminPage }) => {
    setBlogDetailFailForId(notFoundBlogId, 404);
    editPage = new BlogEditPage(adminPage, notFoundBlogId);
    await editPage.goto();
    await expect(editPage.notFoundTitle).toBeVisible();
    await editPage.notFoundBackButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGEDIT_024 */
  test('TC_AD_BLOGEDIT_024 loads all categories in sidebar', async () => {
    await editPage.gotoAndWaitLoaded();
    for (const cat of mockBlogCategories) {
      await expect(editPage.formSidebar.getByText(cat.name)).toBeVisible();
    }
  });
});
