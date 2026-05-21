import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
try {
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('input[name="email"]').fill('admin@danangtrip.vn');
  await page.locator('input[name="password"]').fill('password');
  await page.getByRole('button', { name: /đăng nhập|login/i }).click();
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:5173/admin/bookings/1', { waitUntil: 'networkidle', timeout: 30000 });
  const url = page.url();
  const bodyText = await page.locator('body').innerText();
  console.log(JSON.stringify({
    url,
    title: await page.title(),
    consoleErrors,
    bodySnippet: bodyText.slice(0, 1000)
  }, null, 2));
} catch (error) {
  console.log(JSON.stringify({ error: String(error), consoleErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
