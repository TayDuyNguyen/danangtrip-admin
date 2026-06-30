/**
 * Admin Blog Create — core (06b)
 */
import { test, expect } from '../fixtures/auth.fixture';
import { BlogCreatePage, blogCreateCopy as copy } from '../pages/admin/BlogCreatePage';
import { BlogListPage } from '../pages/admin/BlogListPage';
import { mockAdminLayoutApis } from '../fixtures/api/layout.mock';
import {
  findMockBlogPostByTitle,
  getLastCreatedBlogId,
  mockBlogsApi,
  resetMockBlogs,
  setBlogCreateFail,
} from '../fixtures/api/blogs.mock';
import { mockBlogCategories } from '../fixtures/data/blog-list.data';
import {
  expectedSlugFromTitle,
  inlineCategoryName,
  longBlogExcerpt,
  longBlogTitle,
  scheduledDate,
  scheduledTime,
  slugSourceTitle,
  validCreateBlog,
  validCreateBlogTitle,
  validationMessages,
} from '../fixtures/data/blog-create.data';

test.describe('Admin Blog Create @P1', () => {
  let createPage: BlogCreatePage;

  test.beforeEach(async ({ adminPage }) => {
    resetMockBlogs();
    await mockAdminLayoutApis(adminPage);
    await mockBlogsApi(adminPage);
    createPage = new BlogCreatePage(adminPage);
    await createPage.goto();
  });

  /** TC_AD_BLOGCREATE_001 */
  test('TC_AD_BLOGCREATE_001 renders heading publish sidebar and content form', async () => {
    await expect(createPage.heading).toBeVisible();
    await expect(createPage.titleInput).toBeVisible();
    await expect(createPage.contentEditor).toBeVisible();
    await expect(createPage.sidebar.getByText(copy.draftOption)).toBeVisible();
    await expect(createPage.sidebar.getByText(copy.publishedOption)).toBeVisible();
    await expect(createPage.sidebar.getByText(copy.scheduledOption)).toBeVisible();
    await expect(createPage.page.getByText(copy.guidelines)).toBeVisible();
  });

  /** TC_AD_BLOGCREATE_002 */
  test('TC_AD_BLOGCREATE_002 loads categories in sidebar', async () => {
    for (const cat of mockBlogCategories) {
      await expect(createPage.sidebar.getByText(cat.name)).toBeVisible();
    }
  });

  /** TC_AD_BLOGCREATE_003 */
  test('TC_AD_BLOGCREATE_003 shows validation errors on empty submit', async ({ adminPage }) => {
    await createPage.submit();
    await expect(adminPage.getByText(validationMessages.titleRequired)).toBeVisible();
    await expect(adminPage.getByText(validationMessages.contentRequired)).toBeVisible();
    await expect(adminPage.getByText(validationMessages.categoriesRequired)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/create/);
  });

  /** TC_AD_BLOGCREATE_004 */
  test('TC_AD_BLOGCREATE_004 rejects title longer than 255 characters', async ({ adminPage }) => {
    await createPage.titleInput.fill(longBlogTitle);
    await createPage.submit();
    await expect(adminPage.getByText(validationMessages.titleMax)).toBeVisible();
  });

  /** TC_AD_BLOGCREATE_005 */
  test('TC_AD_BLOGCREATE_005 rejects excerpt longer than 500 characters', async ({ adminPage }) => {
    await createPage.excerptTextarea.fill(longBlogExcerpt);
    await createPage.submit();
    await expect(adminPage.getByText(validationMessages.excerptMax)).toBeVisible();
  });

  /** TC_AD_BLOGCREATE_006 */
  test('TC_AD_BLOGCREATE_006 shows auto slug preview from title', async () => {
    await createPage.titleInput.fill(slugSourceTitle);
    await expect(createPage.slugPreview).toContainText(expectedSlugFromTitle);
    await expect(createPage.page.getByText(copy.slugAuto)).toBeVisible();
  });

  /** TC_AD_BLOGCREATE_007 */
  test('TC_AD_BLOGCREATE_007 accepts markdown content in editor', async () => {
    const markdown = '## Tiêu đề phụ\n\n**In đậm** và [link](https://danangtrip.vn)';
    await createPage.contentEditor.fill(markdown);
    await expect(createPage.contentEditor).toHaveValue(markdown);
  });

  /** TC_AD_BLOGCREATE_008 */
  test('TC_AD_BLOGCREATE_008 uploads featured image and shows preview', async () => {
    await createPage.uploadFeaturedImage();
    await expect(createPage.page.locator('img[alt="Featured"]')).toBeVisible();
  });

  /** TC_AD_BLOGCREATE_010 */
  test('TC_AD_BLOGCREATE_010 saves draft and redirects to edit page', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();
    await createPage.prepareValidSubmit(validCreateBlog);
    await createPage.selectPublishOption('draft');
    await createPage.submit();
    const res = await createReq;
    const body = res.request().postDataJSON() as { status?: string };
    expect(body.status).toBe('draft');
    await expect(adminPage.getByText(copy.draftSuccess)).toBeVisible();
    const createdId = getLastCreatedBlogId();
    expect(createdId).not.toBeNull();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${createdId}`));
    expect(findMockBlogPostByTitle(validCreateBlogTitle)?.status).toBe('draft');
  });

  /** TC_AD_BLOGCREATE_011 */
  test('TC_AD_BLOGCREATE_011 publishes post and redirects to edit page', async ({ adminPage }) => {
    const createReq = createPage.waitForCreatePost();
    await createPage.prepareValidSubmit(validCreateBlog);
    await createPage.selectPublishOption('published');
    await createPage.submit();
    const res = await createReq;
    const body = res.request().postDataJSON() as { status?: string };
    expect(body.status).toBe('published');
    await expect(adminPage.getByText(copy.publishSuccess)).toBeVisible();
    const createdId = getLastCreatedBlogId();
    expect(createdId).not.toBeNull();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${createdId}`));
    expect(findMockBlogPostByTitle(validCreateBlogTitle)?.status).toBe('published');
  });

  /** TC_AD_BLOGCREATE_012 */
  test('TC_AD_BLOGCREATE_012 schedules publish with future date in payload', async ({ adminPage }) => {
    const createReq = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/admin\/blog-posts\/?$/.test(new URL(res.url()).pathname.replace(/\/$/, '')) &&
        res.status() === 201
    );
    await createPage.prepareValidSubmit(validCreateBlog);
    await createPage.selectPublishOption('scheduled');
    await createPage.scheduleDateInput.fill(scheduledDate);
    await createPage.scheduleTimeInput.fill(scheduledTime);
    await createPage.submit();
    const res = await createReq;
    const body = res.request().postDataJSON() as { status?: string; published_at?: string };
    expect(body.status).toBe('published');
    expect(body.published_at).toContain(scheduledDate);
    await expect(adminPage.getByText(copy.publishSuccess)).toBeVisible();
    const createdId = getLastCreatedBlogId();
    expect(createdId).not.toBeNull();
    await expect(adminPage).toHaveURL(new RegExp(`/admin/blog-posts/edit/${createdId}`));
  });

  /** TC_AD_BLOGCREATE_013 */
  test('TC_AD_BLOGCREATE_013 requires schedule date when scheduled option selected', async ({ adminPage }) => {
    await createPage.prepareValidSubmit(validCreateBlog);
    await createPage.selectPublishOption('scheduled');
    await createPage.submit();
    await expect(adminPage.getByText(validationMessages.scheduleDateRequired)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/create/);
  });

  /** TC_AD_BLOGCREATE_014 */
  test('TC_AD_BLOGCREATE_014 creates inline category and auto-selects it', async ({ adminPage }) => {
    await createPage.addCategoryToggle.click();
    await createPage.newCategoryInput.fill(inlineCategoryName);
    await createPage.addCategoryConfirmButton.click();
    await expect(adminPage.getByText(copy.categoryCreateSuccess)).toBeVisible();
    await expect(createPage.categoryCheckbox(inlineCategoryName)).toBeChecked();
  });

  /** TC_AD_BLOGCREATE_015 */
  test('TC_AD_BLOGCREATE_015 mobile sidebar cancel navigates to blog list', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 390, height: 844 });
    await createPage.sidebarCancelButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGCREATE_016 */
  test('TC_AD_BLOGCREATE_016 header cancel navigates to blog list', async ({ adminPage }) => {
    await createPage.headerCancelButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGCREATE_017 */
  test('TC_AD_BLOGCREATE_017 back button navigates to blog list', async ({ adminPage }) => {
    await createPage.backButton.click();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/?$/);
  });

  /** TC_AD_BLOGCREATE_018 */
  test('TC_AD_BLOGCREATE_018 shows error toast when create API fails', async ({ adminPage }) => {
    setBlogCreateFail(true);
    await createPage.prepareValidSubmit(validCreateBlog);
    const failRes = adminPage.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/admin\/blog-posts\/?$/.test(new URL(res.url()).pathname.replace(/\/$/, '')) &&
        res.status() === 422
    );
    await createPage.submit();
    await failRes;
    await expect(adminPage.getByText(copy.networkError)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/create/);
  });

  /** TC_AD_BLOGCREATE_019 */
  test('TC_AD_BLOGCREATE_019 published option changes header submit label', async () => {
    await createPage.selectPublishOption('published');
    await expect(createPage.headerSubmitButton).toHaveText(copy.publishBtn);
  });

  /** TC_AD_BLOGCREATE_020 */
  test('TC_AD_BLOGCREATE_020 created draft appears in blog list after save', async ({ adminPage }) => {
    await createPage.prepareValidSubmit(validCreateBlog);
    await createPage.selectPublishOption('draft');
    await createPage.submit();
    await expect(adminPage.getByText(copy.draftSuccess)).toBeVisible();
    await expect(adminPage).toHaveURL(/\/admin\/blog-posts\/edit\/\d+/);

    const listPage = new BlogListPage(adminPage);
    await listPage.goto();
    await listPage.waitForTableLoaded();
    await listPage.search(validCreateBlogTitle);
    await expect(listPage.rowByTitle(validCreateBlogTitle)).toBeVisible();
  });
});
