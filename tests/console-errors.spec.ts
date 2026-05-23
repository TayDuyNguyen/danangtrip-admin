import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/login',
  '/dashboard',
  '/admin/tours/list',
  '/admin/reports/users',
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Runtime Console Error Check', () => {
  for (const route of ROUTES) {
    test(`Checking console errors on ${route}`, async ({ page }) => {
      const errors: string[] = [];

      // Lắng nghe console events
      page.on('console', (msg) => {
        const text = msg.text();
        if (msg.type() === 'error') {
          // Whitelist specific third-party warnings and expected 401 unauthorized errors
          if (
            !text.includes('lottie-web') && 
            !text.includes('Chrome extension') && 
            !text.includes('401 (Unauthorized)') &&
            !text.includes('Failed to load resource')
          ) {
            errors.push(text);
          }
        }
        if (msg.type() === 'warning') {
          // Check for critical warnings
          if (text.includes('TypeError') || text.includes('Cannot read properties') || text.includes('Unhandled')) {
            errors.push(`Critical Warning: ${text}`);
          }
        }
      });

      // Lắng nghe page errors (crushes)
      page.on('pageerror', (err) => {
        errors.push(`Page Error: ${err.message}`);
      });

      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

      // Fail if any significant errors were found
      if (errors.length > 0) {
        console.error(`Found ${errors.length} error(s) on ${route}:`);
        errors.forEach((err, i) => console.error(`${i + 1}. ${err}`));
      }

      expect(errors).toHaveLength(0);
    });
  }
});
