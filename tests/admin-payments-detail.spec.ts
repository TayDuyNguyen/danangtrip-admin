import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Admin Payments Detail E2E & Visual QA Spec', () => {
    const screenshotsDir = path.join('D:', 'DATN', 'danangtrip-admin', 'test-results', 'screenshots');

    test.beforeAll(() => {
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
    });

    test('1. Unauthenticated user redirect to login', async ({ page }) => {
        await page.goto('http://localhost:5173/admin/payments/1');
        await page.waitForURL('**/login', { timeout: 20000 });
        expect(page.url()).toContain('/login');
    });

    test('2. Happy Path - Flow & Interactive Review', async ({ page }) => {
        test.setTimeout(120000);

        // 2.1 Login
        console.log('Logging in...');
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
        await page.locator('input[type="password"]').fill('password');
        await page.locator('button[type="submit"]').click();

        await page.waitForURL('**/dashboard', { timeout: 20000 });
        await page.waitForLoadState('load');

        // 2.2 Go to Payments List
        console.log('Navigating to Payments List...');
        await page.goto('http://localhost:5173/admin/payments');
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Extract first payment row's link and transaction code
        const firstRowLink = page.locator('table tbody tr td a[href^="/admin/payments/"]').first();
        await expect(firstRowLink).toBeVisible({ timeout: 20000 });

        const transactionCode = await firstRowLink.innerText();
        console.log(`Found active transaction code: ${transactionCode}`);

        // Register robust dynamic happy-path mocks BEFORE clicking
        let paymentStatus = 'success';
        let refundReason: string | null = null;
        let refundedAt: string | null = null;

        await page.route(`**/api/v1/admin/payments/*`, async (route) => {
            if (route.request().method() === 'GET') {
                const url = route.request().url();
                const idStr = url.substring(url.lastIndexOf('/') + 1);
                
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        data: {
                            id: Number(idStr) || 47,
                            transaction_code: transactionCode || 'TXN-HAPPY-PATH',
                            amount: 1500000,
                            payment_method: 'momo',
                            payment_status: paymentStatus,
                            refunded_at: refundedAt,
                            refund_reason: refundReason,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            booking: {
                                id: 10,
                                booking_code: 'DT-162810',
                                customer_name: 'Trần Văn Tester',
                                customer_email: 'tester@example.com',
                                tour_name: 'Tour Ngũ Hành Sơn - Hội An 1 Ngày',
                                tour_thumbnail: ''
                            }
                        }
                    })
                });
            } else {
                await route.continue();
            }
        });

        await page.route(`**/api/v1/admin/payments/*/refund`, async (route) => {
            paymentStatus = 'refunded';
            refundReason = 'Khách hàng hủy tour trước 3 ngày khởi hành';
            refundedAt = new Date().toISOString();

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: {
                        id: 47,
                        transaction_code: transactionCode || 'TXN-HAPPY-PATH',
                        amount: 1500000,
                        payment_method: 'momo',
                        payment_status: 'refunded',
                        refunded_at: refundedAt,
                        refund_reason: refundReason,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        booking: {
                            id: 10,
                            booking_code: 'DT-162810',
                            customer_name: 'Trần Văn Tester',
                            customer_email: 'tester@example.com',
                            tour_name: 'Tour Ngũ Hành Sơn - Hội An 1 Ngày',
                            tour_thumbnail: ''
                        }
                    }
                })
            });
        });

        // Click to navigate to Detail page
        await firstRowLink.click();
        await page.waitForURL('**/admin/payments/*', { timeout: 20000 });
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        const detailUrl = page.url();
        const activeId = detailUrl.substring(detailUrl.lastIndexOf('/') + 1);
        console.log(`Navigated to detail page for payment ID: ${activeId}`);

        // 2.3 Visual Viewports (Desktop, Tablet, Mobile)
        console.log('Testing Responsive Layouts...');
        
        // Desktop Viewport
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotsDir, '03_detail_desktop.png') });
        console.log('Captured Desktop Viewport.');

        // Tablet Viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotsDir, '04_detail_tablet.png') });
        console.log('Captured Tablet Viewport.');

        // Mobile Viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotsDir, '05_detail_mobile.png') });
        console.log('Captured Mobile Viewport.');

        // Reset to Desktop for interaction tests
        await page.setViewportSize({ width: 1280, height: 800 });

        // 2.4 Localization Toggling (VI -> EN -> VI)
        console.log('Verifying translation locales...');
        // Default (VI) Copy verification
        await expect(page.locator('body')).toContainText('Thông tin Thanh toán', { timeout: 20000 });
        await expect(page.locator('body')).toContainText('Đơn đặt & Khách hàng', { timeout: 20000 });
        await expect(page.locator('body')).toContainText('Lịch sử Trạng thái', { timeout: 20000 });

        // Toggle to EN via language switcher dropdown
        const langButton = page.locator('header button').filter({ hasText: /vi|en/i }).first();
        await langButton.click();
        await page.waitForTimeout(500);

        const enOption = page.locator('div button').filter({ hasText: /english|en/i }).first();
        if (await enOption.isVisible()) {
            await enOption.click();
            await page.waitForTimeout(1000);
            
            // Verify English Copy
            await expect(page.locator('body')).toContainText('Payment Information', { timeout: 20000 });
            await expect(page.locator('body')).toContainText('Booking & Customer', { timeout: 20000 });
            await expect(page.locator('body')).toContainText('Status Timeline', { timeout: 20000 });
            await page.screenshot({ path: path.join(screenshotsDir, '06_detail_english.png') });
            console.log('Switch language to English successfully.');

            // Switch back to VI
            await langButton.click();
            await page.waitForTimeout(500);
            const viOption = page.locator('div button').filter({ hasText: /tiếng việt|vi/i }).first();
            await viOption.click();
            await page.waitForTimeout(1000);
        } else {
            console.log('Could not click English switcher options, fallback using localStorage...');
            await page.evaluate(() => {
                localStorage.setItem('i18nextLng', 'en');
            });
            await page.reload();
            await page.waitForTimeout(2000);
            await expect(page.locator('body')).toContainText('Payment Information', { timeout: 20000 });
            
            // Switch back to VI
            await page.evaluate(() => {
                localStorage.setItem('i18nextLng', 'vi');
            });
            await page.reload();
            await page.waitForTimeout(2000);
        }

        // 2.5 Navigation Linkages
        console.log('Testing Navigation Linkages...');
        // Deep-linking to Booking details
        const bookingLink = page.locator('a[href^="/admin/bookings/"]').first();
        await expect(bookingLink).toBeVisible({ timeout: 20000 });
        await bookingLink.click();
        await page.waitForURL('**/admin/bookings/*', { timeout: 20000 });
        expect(page.url()).toContain('/admin/bookings/');
        console.log('Successfully navigated to Booking Details page.');
        
        // Navigate back to payment details
        await page.goto(detailUrl);
        await page.waitForLoadState('load');

        // "Back to list" navigation
        const backBtn = page.locator('main button').first(); // Back Arrow
        await expect(backBtn).toBeVisible({ timeout: 20000 });
        await backBtn.click();
        await page.waitForURL('**/admin/payments', { timeout: 20000 });
        expect(page.url()).toContain('/admin/payments');
        console.log('Successfully navigated back to list using Back Arrow.');
        
        // Re-enter detail page
        await page.goto(detailUrl);
        await page.waitForLoadState('load');

        // 2.6 Refund Dialog Opening, Closing & Form Validation
        console.log('Testing Refund Dialog flows...');
        const refundBtn = page.locator('button:has-text("Hoàn tiền")').first();
        
        await expect(refundBtn).toBeVisible({ timeout: 20000 });
        if (await refundBtn.isEnabled()) {
            // Open Dialog
            await refundBtn.click();
            await page.waitForTimeout(1000);
            
            const dialog = page.locator('div[role="dialog"], div.fixed.inset-0.z-50').last();
            await expect(dialog).toBeVisible({ timeout: 20000 });
            await expect(dialog).toContainText('Xác nhận Hoàn tiền', { timeout: 20000 });
            await expect(dialog).toContainText('LƯU Ý QUAN TRỌNG:', { timeout: 20000 });

            // Close via Cancel button
            const cancelBtn = dialog.locator('button:has-text("Hủy bỏ")');
            await cancelBtn.click();
            await page.waitForTimeout(500);
            await expect(dialog).not.toBeVisible({ timeout: 20000 });
            console.log('Closed refund dialog via Cancel button.');

            // Open again and close via X button
            await refundBtn.click();
            await page.waitForTimeout(500);
            const xBtn = dialog.locator('button').first();
            await xBtn.click();
            await page.waitForTimeout(500);
            await expect(dialog).not.toBeVisible({ timeout: 20000 });
            console.log('Closed refund dialog via X close button.');

            // Open again for Validation testing
            await refundBtn.click();
            await page.waitForTimeout(500);

            const textarea = dialog.locator('textarea');
            const confirmRefundBtn = dialog.locator('button:has-text("Xác nhận hoàn tiền")');

            // Empty submission
            await confirmRefundBtn.click();
            await expect(dialog).toContainText('Lý do hoàn tiền là bắt buộc', { timeout: 20000 });

            // Too short input
            await textarea.fill('Lý do');
            await confirmRefundBtn.click();
            await expect(dialog).toContainText('Lý do hoàn tiền phải từ 10 ký tự trở lên', { timeout: 20000 });

            // Too long input
            const longReason = 'A'.repeat(260);
            await textarea.fill(longReason);
            await confirmRefundBtn.click();
            await expect(dialog).toContainText('Lý do hoàn tiền tối đa 255 ký tự', { timeout: 20000 });
            
            await page.screenshot({ path: path.join(screenshotsDir, '07_refund_form_validation.png') });
            console.log('Refund Form validation errors validated successfully.');

            // Reset and close
            await cancelBtn.click();
            await page.waitForTimeout(500);
        } else {
            console.log('Payment status is not "success" (Paid) or Refund button is not active. Skipping Dialog triggers.');
        }

        // 2.7 Successful Refund submission
        console.log('Testing successful refund submission using mock...');
        
        await expect(refundBtn).toBeVisible({ timeout: 20000 });
        if (await refundBtn.isEnabled()) {
            await refundBtn.click();
            await page.waitForTimeout(500);

            // Correctly target the dialog container matching the class markup (since role="dialog" is absent)
            const dialog = page.locator('div.fixed.inset-0.z-50').last();
            const textarea = dialog.locator('textarea');
            const confirmRefundBtn = dialog.locator('button:has-text("Xác nhận hoàn tiền")');

            await textarea.fill('Khách hàng hủy tour trước 3 ngày khởi hành');
            await confirmRefundBtn.click();

            // Wait for success toast and dialog close
            await expect(dialog).not.toBeVisible({ timeout: 20000 });
            await expect(page.locator('body')).toContainText('đã được thực hiện thành công', { timeout: 20000 });

            // Verify status timeline updates dynamically
            await expect(page.locator('body')).toContainText('Đã hoàn tiền', { timeout: 20000 });
            await expect(page.locator('body')).toContainText('Hoàn tiền thành công: Khách hàng hủy tour trước 3 ngày khởi hành', { timeout: 20000 });
            
            await page.screenshot({ path: path.join(screenshotsDir, '08_refund_success.png') });
            console.log('Refund completed and status timeline validated successfully!');
        }
    });

    test('3. Edge Case - Orphan Payment Handling', async ({ page }) => {
        // Log in
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
        await page.locator('input[type="password"]').fill('password');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 20000 });

        // Mock detail API to return orphan payment item (without booking relation)
        const orphanId = '99991';
        await page.route(`**/api/v1/admin/payments/${orphanId}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: {
                        id: Number(orphanId),
                        transaction_code: 'ORPHAN-GATEWAY-X1',
                        amount: 800000,
                        payment_method: 'vnpay',
                        payment_status: 'success',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        booking: null // Null booking relationship
                    }
                })
            });
        });

        // Navigate to orphan page
        await page.goto(`http://localhost:5173/admin/payments/${orphanId}`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Expect warning banner
        await expect(page.locator('body')).toContainText('Giao dịch không đính kèm thông tin đơn hàng', { timeout: 20000 });
        // Expect customer and booking detail widgets to be absent
        await expect(page.locator('body')).not.toContainText('Thông tin khách hàng', { timeout: 20000 });

        await page.screenshot({ path: path.join(screenshotsDir, '09_orphan_payment.png') });
        console.log('Orphan transaction warning banner validated successfully!');
    });

    test('4. Edge Case - Transaction Not Found', async ({ page }) => {
        // Log in
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
        await page.locator('input[type="password"]').fill('password');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 20000 });

        // Mock detail API to return 404
        const invalidId = '9999999';
        await page.route(`**/api/v1/admin/payments/${invalidId}`, async (route) => {
            await route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Payment transaction not found' })
            });
        });

        await page.goto(`http://localhost:5173/admin/payments/${invalidId}`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Expect "Không tìm thấy giao dịch" text and Go Back button
        await expect(page.locator('body')).toContainText('Không tìm thấy giao dịch', { timeout: 20000 });
        const goBackBtn = page.locator('button:has-text("Quay lại danh sách")');
        await expect(goBackBtn).toBeVisible({ timeout: 20000 });

        await page.screenshot({ path: path.join(screenshotsDir, '10_transaction_not_found.png') });

        // Click Go Back
        await goBackBtn.click();
        await page.waitForURL('**/admin/payments', { timeout: 20000 });
        expect(page.url()).toContain('/admin/payments');
        console.log('Redirection on 404 Transaction Not Found verified!');
    });

    test('5. Auth Restriction - Staff constraints', async ({ page }) => {
        // Log in first to load app
        await page.goto('http://localhost:5173/login');
        await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
        await page.locator('input[type="password"]').fill('password');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('**/dashboard', { timeout: 20000 });

        // Intercept user-storage in localStorage to inject staff role
        // We use ['admin', 'staff'] to bypass the PrivateRoute checks (which requires 'admin')
        // but render PaymentDetail as a non-admin (since user?.role === 'admin' is false)
        await page.evaluate(() => {
            const rawStorage = localStorage.getItem('user-storage');
            if (rawStorage) {
                const parsed = JSON.parse(rawStorage);
                if (parsed.state && parsed.state.user) {
                    parsed.state.user.role = ['admin', 'staff'];
                    parsed.state.user.full_name = 'Staff Member';
                    localStorage.setItem('user-storage', JSON.stringify(parsed));
                }
            }
        });

        // Mock a success payment detail so the refund button is rendered
        const staffTestId = '8888';
        await page.route(`**/api/v1/admin/payments/${staffTestId}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: {
                        id: Number(staffTestId),
                        transaction_code: 'STAFF-TEST-REFUND-LIMIT',
                        amount: 2500000,
                        payment_method: 'zalopay',
                        payment_status: 'success',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        booking: {
                            id: 15,
                            booking_code: 'DT-999912',
                            customer_name: 'Nguyễn Văn Staff',
                            customer_email: 'customer@staff.vn',
                            tour_name: 'Tour Bà Nà Hills VIP 1 Ngày',
                            tour_thumbnail: ''
                        }
                    }
                })
            });
        });

        // Refresh details page with staff authentication state
        await page.goto(`http://localhost:5173/admin/payments/${staffTestId}`);
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);

        // Expect Refund button to be disabled
        const refundBtn = page.locator('button:has-text("Hoàn tiền")').first();
        await expect(refundBtn).toBeDisabled({ timeout: 20000 });

        // Expect warning message to be visible
        await expect(page.locator('body')).toContainText('Chỉ người quản trị mới có quyền thực hiện hoàn tiền', { timeout: 20000 });

        await page.screenshot({ path: path.join(screenshotsDir, '11_staff_disabled_refund.png') });
        console.log('Gated Refund button and staff helper tooltip validated successfully!');
    });
});
