import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Admin Bookings Report E2E & Visual QA Spec', () => {
    const screenshotsDir = path.join('D:', 'DATN', 'danangtrip-admin', 'test-results', 'screenshots');
    const artifactScreenshotsDir = path.join('C:', 'Users', 'TUF', '.gemini', 'antigravity-ide', 'brain', 'b32649e0-437a-4483-ac18-cee97ce4c141', 'test-results-images');

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
        // Intercept auth refresh-token to ensure instant unauthenticated failure
        await page.route('**/api/v1/auth/refresh-token', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' })
            });
        });

        await page.goto('http://localhost:5173/admin/reports/bookings');
        await page.waitForURL('**/login', { timeout: 20000 });
        expect(page.url()).toContain('/login');
    });

    test('2. Happy Path - Flow & Visual & Interactive QA', async ({ page }) => {
        test.setTimeout(120000);

        // 2.1 Login
        console.log('Logging in...');
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
        await page.locator('input[type="password"]').fill('password');
        await page.locator('button[type="submit"]').click();

        await page.waitForURL('**/dashboard', { timeout: 20000 });
        await page.waitForLoadState('load');

        // 2.2 Mock setup for API to simulate real mode vs mock fallback
        const mockApiResponse = {
            summary: {
                total_count: 120,
                completed_count: 80,
                cancelled_count: 10,
                total_revenue: 150000000,
                trends: {
                    total: 10,
                    completed: 15,
                    cancelled: -5,
                    revenue: 20
                },
                status_distribution: {
                    pending: 30,
                    confirmed: 0,
                    completed: 80,
                    cancelled: 10
                },
                trend_chart: [
                    { date: '2026-05-01', bookings: 5, revenue: 6000000 },
                    { date: '2026-05-15', bookings: 8, revenue: 10000000 },
                    { date: '2026-05-22', bookings: 12, revenue: 15000000 }
                ]
            },
            bookings_list: {
                data: [
                    {
                        id: 1,
                        booking_code: 'DT-MOCK101',
                        customer_name: 'Nguyen Van Real',
                        tour_name: 'Tour Ba Na Hills Sieu Cap',
                        total_amount: 1500000,
                        booking_status: 'completed',
                        payment_status: 'paid',
                        booked_at: '2026-05-22T08:30:00.000000Z'
                    },
                    {
                        id: 2,
                        booking_code: 'DT-MOCK102',
                        customer_name: 'Le Thi Real',
                        tour_name: 'Tour Ngu Hanh Son Sieu Re',
                        total_amount: 900000,
                        booking_status: 'pending',
                        payment_status: 'pending',
                        booked_at: '2026-05-21T09:15:00.000000Z'
                    }
                ],
                current_page: 1,
                last_page: 3,
                per_page: 10,
                total: 25
            }
        };

        // Intercept bookings report API request
        await page.route('**/api/v1/admin/reports/bookings*', async (route) => {
            console.log('Intercepted bookings report API call:', route.request().url());
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: mockApiResponse })
            });
        });

        // 2.3 Navigate to reports page
        console.log('Navigating to Bookings Report Page...');
        await page.goto('http://localhost:5173/admin/reports/bookings');
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Verify page content
        await expect(page.locator('h1').filter({ hasText: 'Báo cáo Đơn hàng' })).toBeVisible();
        await expect(page.locator('body')).toContainText('Nguyen Van Real');
        await expect(page.locator('body')).toContainText('DT-MOCK101');

        // Verify stats card content
        await expect(page.locator('body')).toContainText('120'); // Total orders
        await expect(page.locator('body')).toContainText('80');  // Completed orders
        await expect(page.locator('body')).toContainText('10');  // Cancelled orders

        // 2.4 Verify viewports responsiveness (Desktop, Tablet, Mobile)
        console.log('Testing Viewport Responsiveness...');
        
        // Desktop Viewport
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'bookings_report_desktop.png');
        console.log('Saved bookings_report_desktop.png');

        // Tablet Viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'bookings_report_tablet.png');
        console.log('Saved bookings_report_tablet.png');

        // Mobile Viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'bookings_report_mobile.png');
        console.log('Saved bookings_report_mobile.png');

        // Restore Desktop viewport size
        await page.setViewportSize({ width: 1280, height: 800 });

        // 2.5 Test Localization toggling
        console.log('Testing Localization Toggling (VI <-> EN)...');
        await expect(page.locator('body')).toContainText('Báo cáo Đơn hàng');

        // Toggle language using the dropdown
        const langButton = page.locator('header button').filter({ hasText: /vi|en/i }).first();
        await langButton.click();
        await page.waitForTimeout(500);

        const enOption = page.locator('div button').filter({ hasText: /english|en/i }).first();
        if (await enOption.isVisible()) {
            await enOption.click();
            await page.waitForTimeout(1000);
            
            // Check English header
            await expect(page.locator('body')).toContainText('Bookings Report');
            await takeScreenshot(page, 'bookings_report_english.png');
            console.log('Saved bookings_report_english.png');

            // Switch back to VI
            await langButton.click();
            await page.waitForTimeout(500);
            const viOption = page.locator('div button').filter({ hasText: /tiếng việt|vi/i }).first();
            await viOption.click();
            await page.waitForTimeout(1000);
            await expect(page.locator('body')).toContainText('Báo cáo Đơn hàng');
        } else {
            console.log('Language switcher options not interactable, modifying localStorage directly...');
            await page.evaluate(() => {
                localStorage.setItem('i18nextLng', 'en');
            });
            await page.reload();
            await page.waitForTimeout(2000);
            await expect(page.locator('body')).toContainText('Bookings Report');

            await page.evaluate(() => {
                localStorage.setItem('i18nextLng', 'vi');
            });
            await page.reload();
            await page.waitForTimeout(2000);
        }

        // 2.6 Test Interactive Filters
        console.log('Testing filter selection and URL sync...');
        
        // Select status filter "Chờ xử lý" (pending)
        const statusSelect = page.locator('select').first();
        await statusSelect.selectOption('pending');
        
        // Select payment status filter "Chờ thanh toán" (pending)
        const paymentStatusSelect = page.locator('select').nth(1);
        await paymentStatusSelect.selectOption('pending');

        // Click Apply filter button
        const applyButton = page.locator('button', { hasText: 'Áp dụng' });
        await applyButton.click();
        await page.waitForTimeout(1000);

        // Verify URL contains new parameters
        const currentUrl = page.url();
        expect(currentUrl).toContain('status=pending');
        expect(currentUrl).toContain('payment_status=pending');
        console.log('URL successfully synced with active filters:', currentUrl);

        // Test Quick Filter Pills
        const sevenDaysButton = page.locator('button', { hasText: '7 ngày' });
        await sevenDaysButton.click();
        await page.waitForTimeout(500);
        
        // Apply should sync new dates
        await applyButton.click();
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('from=');
        console.log('Quick date range applied successfully.');

        // Reset filter
        const resetButton = page.locator('button', { hasText: 'Mặc định' });
        await resetButton.click();
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('status=all');
        expect(page.url()).toContain('payment_status=all');
        console.log('Filters reset to defaults.');

        // 2.7 Test Toggle Mock Mode manually
        console.log('Testing Mock Mode toggle switch...');
        const toggleMockButton = page.locator('button').filter({ hasText: /Dữ liệu/ }).first();
        await toggleMockButton.click();
        await page.waitForTimeout(1000);
        
        // Verify mock banner status or toast message
        await expect(page.locator('body')).toContainText('Giả lập');
        
        // Table items should switch to mock items (e.g. DNT10452)
        await expect(page.locator('body')).toContainText('DNT10452');
        console.log('Mock Mode toggled ON successfully.');

        // 2.8 Test Excel export download
        console.log('Testing Excel export action...');
        
        // Intercept download event
        const downloadPromise = page.waitForEvent('download');
        const exportButton = page.locator('button', { hasText: 'Xuất Excel' });
        await exportButton.click();
        
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        console.log('Downloaded file:', filename);
        expect(filename).toContain('bao-cao-don-hang');
        expect(filename).toContain('.csv'); // Export fallback in mock mode downloads .csv
        
        // Toggle mock mode off again
        await toggleMockButton.click();
        await page.waitForTimeout(1000);
        console.log('Test sequence completed successfully.');
    });
});
