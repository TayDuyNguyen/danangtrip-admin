import type { Page, Route } from '@playwright/test';
import { successEnvelope } from '../../../helpers/apiResponse';

/** Mocks layout-level polling endpoints so pages can settle without networkidle. */
export async function mockAdminLayoutApis(page: Page) {
  const passthrough = async (route: Route) => {
    const type = route.request().resourceType();
    if (type === 'document') {
      await route.continue();
      return;
    }

    const url = route.request().url();
    if (url.includes('/admin/dashboard/notification-counts')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(successEnvelope({ unread_total: 0, items: [] })),
      });
      return;
    }

    await route.continue();
  };

  await page.route('**/api/v1/**', passthrough);
}
