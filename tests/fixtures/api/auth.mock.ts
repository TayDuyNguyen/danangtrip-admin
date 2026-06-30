import type { Page, Route } from '@playwright/test';
import { createAdminToken } from '../../../utils/jwt';
import { mockAdminUser } from '../data/users.data';
import { successEnvelope } from '../../../helpers/apiResponse';

/** Prevents auth bootstrap / proactive refresh from logging out when real API is unreachable. */
export async function mockAuthRefreshApi(page: Page, userId = 1) {
  const token = createAdminToken(userId);
  const handler = async (route: Route) => {
    const url = route.request().url();
    if (!url.includes('/api/v1/auth/')) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        successEnvelope({
          token,
          user: { ...mockAdminUser, id: userId },
        })
      ),
    });
  };
  await page.route('**/api/v1/auth/**', handler);
}
