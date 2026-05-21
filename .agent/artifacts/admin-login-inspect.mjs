import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
try {
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
  const inputs = await page.locator('input').evaluateAll(nodes => nodes.map((node, index) => ({
    index,
    type: node.getAttribute('type'),
    name: node.getAttribute('name'),
    placeholder: node.getAttribute('placeholder'),
    id: node.getAttribute('id'),
    ariaLabel: node.getAttribute('aria-label')
  })));
  const buttons = await page.locator('button').evaluateAll(nodes => nodes.map((node, index) => ({
    index,
    text: node.textContent?.trim()
  })));
  console.log(JSON.stringify({ inputs, buttons, consoleErrors }, null, 2));
} catch (error) {
  console.log(JSON.stringify({ error: String(error), consoleErrors }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
