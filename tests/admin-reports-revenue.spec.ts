import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Admin Revenue Report E2E & Visual QA Spec', () => {
    const screenshotsDir = path.join('d:', 'DATN', 'danangtrip-admin', 'test-results', 'screenshots');
    const artifactScreenshotsDir = path.join('C:', 'Users', 'TUF', '.gemini', 'antigravity', 'brain', '619ff4e1-dfe8-495c-899b-43bd9df0fcc7');

    test.beforeAll(() => {
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        if (!fs.existsSync(artifactScreenshotsDir)) {
            fs.mkdirSync(artifactScreenshotsDir, { recursive: true });
        }
    });

    async function takeScreenshot(page: Page, filename: string) {
        await page.screenshot({ path: path.join(screenshotsDir, filename) });
        await page.screenshot({ path: path.join(artifactScreenshotsDir, filename) });
        console.log(`Saved screenshot: ${filename}`);
    }

    test('1. Unauthenticated user redirect to login', async ({ page }) => {
        // Intercept auth refresh-token to ensure instant unauthenticated failure
        await page.route('**/api/v1/auth/refresh-token', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' })
            });
        });

        await page.goto('http://localhost:5173/admin/reports/revenue');
        await page.waitForURL('**/login', { timeout: 20000 });
        expect(page.url()).toContain('/login');
    });

    test('2. Happy Path - Flow & Visual & Interactive QA', async ({ page }) => {
        test.setTimeout(120000);

        // Collect console errors & warnings
        const consoleMessages: { type: string; text: string }[] = [];
        page.on('console', msg => {
            consoleMessages.push({ type: msg.type(), text: msg.text() });
        });

        // 2.1 Login
        console.log('Logging in...');
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
        await page.locator('input[type="password"]').fill('password');
        await page.locator('button[type="submit"]').click();

        await page.waitForURL('**/dashboard', { timeout: 20000 });
        await page.waitForLoadState('load');

        // 2.2 Navigate to reports page
        console.log('Navigating to Revenue Report Page...');
        await page.goto('http://localhost:5173/admin/reports/revenue');
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Verify page content loads
        await expect(page.locator('h1').filter({ hasText: 'Báo cáo Doanh thu' })).toBeVisible();

        // 2.3 Initial Screenshot (checks default layout, UI premium styling)
        await takeScreenshot(page, 'revenue_report_initial.png');

        // Ensure Mock Mode is ON to get consistent mock data
        const toggleMockButton = page.locator('button').filter({ hasText: /Giả lập|Dữ liệu/ }).first();
        const toggleText = await toggleMockButton.textContent();
        console.log('Mock toggle button text:', toggleText);
        if (toggleText && (toggleText.includes('Off') || toggleText.includes('Thật'))) {
            console.log('Toggling Mock Mode ON...');
            await toggleMockButton.click();
            await page.waitForTimeout(1000);
        }

        // Verify Mock Mode is active
        await expect(page.locator('body')).toContainText('Dữ liệu Giả lập (On)');
        await takeScreenshot(page, 'revenue_report_mock_on.png');

        // 2.4 Verify stats card values (Total Revenue, Daily Avg, Transactions, Refunded)
        await expect(page.locator('body')).toContainText('Tổng doanh thu');
        await expect(page.locator('body')).toContainText('TB / Ngày');
        await expect(page.locator('body')).toContainText('Tổng giao dịch');
        await expect(page.locator('body')).toContainText('Đã hoàn tiền');

        // 2.5 Verify Charts presence (Recharts Responsive Containers)
        const rechartsContainers = page.locator('.recharts-responsive-container');
        const chartCount = await rechartsContainers.count();
        console.log(`Found ${chartCount} chart containers.`);
        expect(chartCount).toBeGreaterThanOrEqual(4); // 4 charts expected

        // 2.6 Test Filter Bar & Pills
        console.log('Testing date filters & quick pills...');
        const fromInput = page.locator('input[type="date"]').first();
        const toInput = page.locator('input[type="date"]').nth(1);

        const initialFromValue = await fromInput.inputValue();
        const initialToValue = await toInput.inputValue();
        console.log(`Default dates: from=${initialFromValue}, to=${initialToValue}`);

        // Click quick filter pill (7 ngày)
        const sevenDaysPill = page.locator('button', { hasText: '7 ngày' });
        await sevenDaysPill.click();
        await page.waitForTimeout(500);

        const updatedFromValue = await fromInput.inputValue();
        console.log(`After clicking 7 days: from=${updatedFromValue}`);
        expect(updatedFromValue).not.toBe(initialFromValue);

        // Change Gateway filter to momo
        const gatewaySelect = page.locator('select').first();
        await gatewaySelect.selectOption('momo');

        // Click Apply
        const applyButton = page.locator('button', { hasText: 'Áp dụng' });
        await applyButton.click();
        await page.waitForTimeout(1000);

        // Verify URL parameters
        let currentUrl = page.url();
        expect(currentUrl).toContain('payment_gateway=momo');
        expect(currentUrl).toContain('from=');
        expect(currentUrl).toContain('to=');
        console.log('Filters applied & URL synced:', currentUrl);
        await takeScreenshot(page, 'revenue_report_filters_applied.png');

        // Reset filters
        const resetBtn = page.locator('button', { hasText: 'Mặc định' });
        await resetBtn.click();
        await page.waitForTimeout(1000);
        currentUrl = page.url();
        expect(currentUrl).toContain('payment_gateway=all');
        console.log('Filters reset successfully.');

        // 2.7 Test Transaction Table pagination
        console.log('Testing table pagination...');
        await expect(page.locator('table')).toBeVisible();

        const nextBtn = page.locator('button', { hasText: 'Sau' });
        const prevBtn = page.locator('button', { hasText: 'Trước' });

        if (await nextBtn.isEnabled()) {
            await nextBtn.click();
            await page.waitForTimeout(1000);
            expect(page.url()).toContain('page=2');
            console.log('Pagination page 2 loaded.');
            await takeScreenshot(page, 'revenue_report_page2.png');
            await prevBtn.click();
            await page.waitForTimeout(1000);
            expect(page.url()).toContain('page=1');
            console.log('Returned to page 1.');
        } else {
            console.log('Next button is disabled (only 1 page of data matches)');
        }

        // 2.8 Test Export Button
        console.log('Testing Export Excel...');
        const downloadPromise = page.waitForEvent('download');
        const exportBtn = page.locator('button', { hasText: 'Xuất Excel' });
        await exportBtn.click();
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        console.log('Downloaded file:', filename);
        expect(filename).toContain('bao-cao-doanh-thu');
        expect(filename).toContain('.csv'); // fallback in mock mode
        await page.waitForTimeout(1000);

        // 2.9 Test i18n locale switching
        console.log('Testing locale switching...');
        const langButton = page.locator('header button').filter({ hasText: /vi|en/i }).first();
        if (await langButton.isVisible()) {
            await langButton.click();
            await page.waitForTimeout(500);
            const enOption = page.locator('div button').filter({ hasText: /english|en/i }).first();
            if (await enOption.isVisible()) {
                await enOption.click();
                await page.waitForTimeout(1000);
                await expect(page.locator('body')).toContainText('Revenue Report');
                await takeScreenshot(page, 'revenue_report_english.png');
                console.log('English layout verified.');
                // Switch back to VI
                await langButton.click();
                await page.waitForTimeout(500);
                const viOption = page.locator('div button').filter({ hasText: /tiếng việt|vi/i }).first();
                await viOption.click();
                await page.waitForTimeout(1000);
            }
        } else {
            // Fallback: evaluate localStorage change
            console.log('Language switcher not interactable, changing localStorage...');
            await page.evaluate(() => localStorage.setItem('i18nextLng', 'en'));
            await page.reload();
            await page.waitForTimeout(2000);
            await expect(page.locator('body')).toContainText('Revenue Report');
            await takeScreenshot(page, 'revenue_report_english_forced.png');
            await page.evaluate(() => localStorage.setItem('i18nextLng', 'vi'));
            await page.reload();
            await page.waitForTimeout(2000);
        }

        // Log collected console errors
        console.log('=== Console Messages ===');
        consoleMessages.forEach(msg => {
            if (msg.type === 'error' || msg.text.includes('warning') || msg.text.includes('React')) {
                console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
            }
        });
        console.log('========================');
    });
});
