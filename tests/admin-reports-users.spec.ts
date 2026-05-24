import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Admin Users Report E2E & Visual QA Spec', () => {
    const screenshotsDir = path.join('D:', 'DATN', 'danangtrip-admin', 'test-results', 'screenshots');
    const artifactScreenshotsDir = path.join('C:', 'Users', 'NGUYEN DUY TAY', '.gemini', 'antigravity', 'brain', '18040d92-efcf-4a01-862c-ed4233b0d480', 'test-results-images');

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
    }

    async function selectReactSelectOption(page: Page, inputId: string, optionText: string) {
        // Click the control wrapper (grandparent of the input element) of CustomSelect
        const control = page.locator(`#${inputId}`).locator('xpath=../..');
        await control.click();
        await page.waitForTimeout(500); // Wait for dropdown list to open
        
        // Find option by text in react-select options list
        const option = page.locator('div[id^="react-select-"][id*="-option"]').filter({ hasText: optionText }).first();
        await option.click();
        await page.waitForTimeout(500); // Wait for close transition
    }

    test('1. Unauthenticated user redirect to login', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/reports/users');
        await page.waitForURL('**/login', { timeout: 20000 });
        expect(page.url()).toContain('/login');
    });

    test('2. Happy Path - Flow & Visual & Interactive QA', async ({ page }) => {
        test.setTimeout(120000);

        const consoleErrors: string[] = [];
        const consoleWarnings: string[] = [];

        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                if (!text.includes('lottie-web') && !text.includes('Chrome extension') && !text.includes('401 (Unauthorized)')) {
                    consoleErrors.push(text);
                }
            }
            if (msg.type() === 'warning') {
                if (text.includes('TypeError') || text.includes('React key') || text.includes('Each child in a list')) {
                    consoleWarnings.push(text);
                }
            }
        });

        page.on('pageerror', err => {
            consoleErrors.push(`Page Error: ${err.message}`);
        });

        // 2.1 Login
        console.log('Logging in...');
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
        await page.locator('input[type="password"]').fill('password');
        await page.locator('button[type="submit"]').click();

        await page.waitForURL('**/dashboard', { timeout: 20000 });
        await page.waitForLoadState('load');

        // 2.2 Navigate to users report page
        console.log('Navigating to Users Report Page...');
        await page.goto('http://localhost:5173/admin/reports/users');
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Verify page header
        await expect(page.locator('h1').filter({ hasText: 'Báo cáo người dùng' })).toBeVisible();

        // 2.3 Verify viewports responsiveness (Desktop, Tablet, Mobile)
        console.log('Testing Viewport Responsiveness...');
        
        // Desktop Viewport
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'users_report_desktop.png');
        console.log('Saved users_report_desktop.png');

        // Tablet Viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'users_report_tablet.png');
        console.log('Saved users_report_tablet.png');

        // Mobile Viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'users_report_mobile.png');
        console.log('Saved users_report_mobile.png');

        // Restore Desktop viewport size
        await page.setViewportSize({ width: 1280, height: 800 });

        // 2.4 Toggle Mock Mode and verify toast
        console.log('Testing Mock Mode Toggle...');
        const toggleMockBtn = page.locator('#users-report-mock-toggle');
        
        // Click to toggle Mock Mode ON
        await toggleMockBtn.click();
        await page.waitForTimeout(1000);
        
        // Verify toast and button text
        await expect(page.locator('body')).toContainText('Dữ liệu mẫu: Bật');
        console.log('Mock Mode toggled ON.');

        // 2.5 Test Filters and URL Syncing
        console.log('Testing Filters and URL Syncing...');
        
        // Set Year Filter using react-select helper
        await selectReactSelectOption(page, 'users-filter-year', 'Năm 2026');
        
        // Set Role Filter (for Export) using react-select helper
        await selectReactSelectOption(page, 'users-filter-role', 'Người dùng');
        
        // Set Status Filter (for Export) using react-select helper
        await selectReactSelectOption(page, 'users-filter-status', 'Hoạt động');

        // Apply Filters
        await page.locator('#users-filter-apply').click();
        await page.waitForTimeout(1000);

        // Verify URL query parameters are synced
        const filterUrl = page.url();
        expect(filterUrl).toContain('year=2026');
        expect(filterUrl).toContain('role=user');
        expect(filterUrl).toContain('status=active');
        console.log('Filters applied and synced in URL:', filterUrl);

        // Click Reset Filters
        await page.locator('#users-filter-reset').click();
        await page.waitForTimeout(1000);
        
        // Verify defaults are restored in URL
        const resetUrl = page.url();
        expect(resetUrl).toContain('year=');
        expect(resetUrl).toContain('role=all');
        expect(resetUrl).toContain('status=all');
        console.log('Filters reset and synced in URL:', resetUrl);

        // 2.6 Test Excel Export
        console.log('Testing Excel Export...');
        const exportBtn = page.locator('#users-report-export-btn');
        
        // Click to ensure we are in mock mode for faster download test
        const mockToggleText = (await page.locator('#users-report-mock-toggle').textContent()) ?? '';
        if (!mockToggleText.includes('On')) {
            await page.locator('#users-report-mock-toggle').click();
            await page.waitForTimeout(500);
        }

        const downloadPromise = page.waitForEvent('download');
        await exportBtn.click();
        
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        console.log('Suggested filename:', filename);
        expect(filename).toContain('bao-cao-nguoi-dung');
        console.log('Excel/CSV Export triggered successfully.');

        // 2.7 i18n Translation & Parity
        console.log('Testing i18n Language Toggle (Vietnamese <-> English)...');
        
        const langSwitcher = page.locator('button:has(img[src*="/images/lang/"])');

        // Open the language switcher dropdown
        await langSwitcher.click();
        await page.waitForTimeout(500);

        // Click the 'English' option
        await page.locator('button').filter({ hasText: 'English' }).click();
        await page.waitForTimeout(1500);

        // Verify English title
        await expect(page.locator('h1').filter({ hasText: 'Users Report' })).toBeVisible();
        await takeScreenshot(page, 'users_report_english.png');
        console.log('Saved users_report_english.png');

        // Switch back to Vietnamese by opening the dropdown
        await langSwitcher.click();
        await page.waitForTimeout(500);

        // Click the 'Tiếng Việt' option
        await page.locator('button').filter({ hasText: 'Tiếng Việt' }).click();
        await page.waitForTimeout(1500);

        // Verify it is back to Vietnamese
        await expect(page.locator('h1').filter({ hasText: 'Báo cáo người dùng' })).toBeVisible();

        // 2.8 Print Console Diagnostics
        console.log('Console Errors caught during test:', consoleErrors);
        console.log('Console Warnings caught during test:', consoleWarnings);
        
        expect(consoleErrors).toHaveLength(0);
        expect(consoleWarnings).toHaveLength(0);

        console.log('All Users Report E2E checks passed perfectly!');
    });
});
