/**
 * Runtime console error smoke tests for critical admin routes.
 * Run: npm run test:console
 */
import { test, expect } from '@playwright/test';
import { seedAdminSession } from './fixtures/auth.fixture';
import { mockUsersApi } from './fixtures/api/users.mock';

const ROUTES = [
  '/',
  '/login',
  '/dashboard',
  '/admin/tours/list',
  '/admin/reports/users',
  '/admin/users',
];

test.describe('Runtime Console Error Check', () => {
  for (const route of ROUTES) {
    test(`Checking console errors on ${route}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      if (route !== '/login' && route !== '/') {
        await seedAdminSession(page);
        await mockUsersApi(page);
      }

      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      expect(errors, `Console errors on ${route}: ${errors.join('\n')}`).toEqual([]);
    });
  }
});
