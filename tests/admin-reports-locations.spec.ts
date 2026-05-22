import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Admin Locations Report E2E & Visual QA Spec', () => {
    const screenshotsDir = path.join('D:', 'DATN', 'danangtrip-admin', 'test-results', 'screenshots');
    const artifactScreenshotsDir = path.join('C:', 'Users', 'TUF', '.gemini', 'antigravity', 'brain', '7ce866cf-eff0-4251-917d-20ac28948bce', 'test-results-images');

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

    test('1. Unauthenticated user redirect to login', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/reports/locations');
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

        // 2.2 Navigate to locations report page
        console.log('Navigating to Locations Report Page...');
        await page.goto('http://localhost:5173/admin/reports/locations');
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Verify page header
        await expect(page.locator('h1').filter({ hasText: 'Báo cáo Địa điểm' })).toBeVisible();

        // 2.3 Verify viewports responsiveness (Desktop, Tablet, Mobile)
        console.log('Testing Viewport Responsiveness...');
        
        // Desktop Viewport
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'locations_report_desktop.png');
        console.log('Saved locations_report_desktop.png');

        // Tablet Viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'locations_report_tablet.png');
        console.log('Saved locations_report_tablet.png');

        // Mobile Viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'locations_report_mobile.png');
        console.log('Saved locations_report_mobile.png');

        // Restore Desktop viewport size
        await page.setViewportSize({ width: 1280, height: 800 });

        // 2.4 Toggle Mock Mode and verify toast
        console.log('Testing Mock Mode Toggle...');
        const toggleMockBtn = page.locator('#location-report-mock-toggle');
        
        // Click to toggle Mock Mode ON
        await toggleMockBtn.click();
        await page.waitForTimeout(1000);
        
        // Verify toast and button text
        await expect(page.locator('body')).toContainText('Dữ liệu Giả lập (On)');
        console.log('Mock Mode toggled ON.');

        // 2.5 Switch between tables tabs (Views, Favorites, Ratings)
        console.log('Testing Tabs Switch & Ranking Numbers...');
        
        // Tab Views (default)
        await expect(page.locator('#location-tab-views')).toHaveClass(/bg-teal-500/);
        
        // Check ranking numbers exist and ranks are numbered correctly (index 1, 2, etc.)
        const firstRank = page.locator('tbody tr td').first();
        await expect(firstRank).toContainText('1');

        // Click Favorites tab
        const tabFavorites = page.locator('#location-tab-favorites');
        await tabFavorites.click();
        await page.waitForTimeout(500);
        await expect(tabFavorites).toHaveClass(/bg-teal-500/);
        
        // Click Ratings tab
        const tabRatings = page.locator('#location-tab-ratings');
        await tabRatings.click();
        await page.waitForTimeout(500);
        await expect(tabRatings).toHaveClass(/bg-teal-500/);
        
        // Switch back to Views
        await page.locator('#location-tab-views').click();
        await page.waitForTimeout(500);

        // 2.6 Test Pagination
        console.log('Testing Table Pagination...');
        const nextBtn = page.locator('button', { hasText: 'Sau' });
        if (await nextBtn.isVisible() && !(await nextBtn.isDisabled())) {
            await nextBtn.click();
            await page.waitForTimeout(1000);
            expect(page.url()).toContain('page=');
            
            const prevBtn = page.locator('button', { hasText: 'Trước' });
            await prevBtn.click();
            await page.waitForTimeout(1000);
        } else {
            console.log('Pagination buttons not active (single page or no data).');
        }

        // 2.7 Test Filters and URL Syncing
        console.log('Testing Filters and URL Syncing...');
        
        // Set dates
        await page.locator('#location-filter-from').fill('2026-05-01');
        await page.locator('#location-filter-to').fill('2026-05-22');
        
        // Set Category
        const catSelect = page.locator('#location-filter-category');
        await catSelect.selectOption({ index: 1 }); // Select first non-all category
        
        // Set District
        const distSelect = page.locator('#location-filter-district');
        await distSelect.selectOption({ index: 1 }); // Select first non-all district

        // Apply Filters
        await page.locator('#location-filter-apply').click();
        await page.waitForTimeout(1000);

        // Verify URL query parameters are synced
        const filterUrl = page.url();
        expect(filterUrl).toContain('from=2026-05-01');
        expect(filterUrl).toContain('to=2026-05-22');
        expect(filterUrl).toContain('category_id=');
        expect(filterUrl).toContain('district=');
        console.log('Filters applied and synced in URL:', filterUrl);

        // Click Reset Filters
        await page.locator('#location-filter-reset').click();
        await page.waitForTimeout(1000);
        
        // Verify defaults are restored in URL (defaults are dropped from URL)
        const resetUrl = page.url();
        expect(resetUrl).not.toContain('category_id=');
        expect(resetUrl).not.toContain('district=');
        console.log('Filters reset and synced in URL (defaults dropped):', resetUrl);

        // 2.8 Test CSV Export
        console.log('Testing CSV Export...');
        const exportBtn = page.locator('#location-report-export-btn');
        
        // Click to ensure we are in mock mode for faster download test
        const mockToggleText = (await page.locator('#location-report-mock-toggle').textContent()) ?? '';
        if (!mockToggleText.includes('On')) {
            await page.locator('#location-report-mock-toggle').click();
            await page.waitForTimeout(500);
        }

        const downloadPromise = page.waitForEvent('download');
        await exportBtn.click();
        
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        console.log('Suggested filename:', filename);
        expect(filename).toContain('bao-cao-dia-diem');
        expect(filename).toContain('.csv');
        console.log('CSV Export triggered successfully.');

        // 2.9 i18n Translation & Parity
        console.log('Testing i18n Language Toggle (Vietnamese <-> English)...');
        
        const langSwitcher = page.locator('button:has(img[src*="/images/lang/"])');

        // Open the language switcher dropdown
        await langSwitcher.click();
        await page.waitForTimeout(500);

        // Click the 'English' option
        await page.locator('button').filter({ hasText: 'English' }).click();
        await page.waitForTimeout(1500);

        // Verify English title
        await expect(page.locator('h1').filter({ hasText: 'Locations Report' })).toBeVisible();
        await takeScreenshot(page, 'locations_report_english.png');
        console.log('Saved locations_report_english.png');

        // Switch back to Vietnamese by opening the dropdown
        await langSwitcher.click();
        await page.waitForTimeout(500);

        // Click the 'Tiếng Việt' option
        await page.locator('button').filter({ hasText: 'Tiếng Việt' }).click();
        await page.waitForTimeout(1500);

        // Verify it is back to Vietnamese
        await expect(page.locator('h1').filter({ hasText: 'Báo cáo Địa điểm' })).toBeVisible();

        // 2.10 Print Console Diagnostics
        console.log('Console Errors caught during test:', consoleErrors);
        console.log('Console Warnings caught during test:', consoleWarnings);
        
        expect(consoleErrors).toHaveLength(0);
        expect(consoleWarnings).toHaveLength(0);

        console.log('All Locations Report E2E checks passed perfectly!');
    });
});
