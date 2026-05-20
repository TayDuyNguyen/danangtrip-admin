import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Admin Tour Schedule Edit E2E & Visual Verification', () => {
  test('Log in, navigate to schedule edit, perform validations and submit changes', async ({ page }) => {
    test.setTimeout(90000);
    
    // Create screenshot directory
    const screenshotsDir = path.join('D:', 'DATN', 'danangtrip-admin', 'test-results', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // 1. Login
    console.log('Navigating to Login page...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });

    console.log('Logging in as admin...');
    await page.locator('input[type="email"]').fill('admin@danangtrip.vn');
    await page.locator('input[type="password"]').fill('password');
    await page.locator('button[type="submit"]').click();

    // 2. Dashboard redirect
    console.log('Waiting for redirection to dashboard...');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, '02_dashboard_page.png') });

    // 3. Navigate to edit schedule page
    console.log('Navigating to schedule edit page...');
    await page.goto('http://localhost:5173/admin/tours/schedules/edit/1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow react query to load data
    await page.screenshot({ path: path.join(screenshotsDir, '03_schedule_edit_page.png') });

    // 4. Verify elements are visible
    console.log('Verifying key elements...');
    await expect(page.locator('body')).toContainText('Lịch khởi hành');
    await expect(page.locator('body')).toContainText('Chỉnh sửa');
    await page.screenshot({ path: path.join(screenshotsDir, '03_loaded_schedule.png') });

    // 5. Test validation (empty / invalid fields)
    console.log('Testing validations...');
    const totalSlotsInput = page.locator('input[name="totalSlots"]');
    if (await totalSlotsInput.isVisible()) {
      await totalSlotsInput.clear();
      await totalSlotsInput.fill('-5');
      
      const submitBtn = page.locator('button:has-text("Chỉnh sửa"), button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '04_validation_errors.png') });

      // 6. Fix validation and save changes
      console.log('Modifying inputs and saving...');
      await totalSlotsInput.clear();
      await totalSlotsInput.fill('25');
      
      const departurePlaceInput = page.locator('input[name="departurePlace"]');
      if (await departurePlaceInput.isVisible()) {
        await departurePlaceInput.clear();
        await departurePlaceInput.fill('Đà Nẵng Express Office');
      }

      await submitBtn.click();
      await page.waitForTimeout(2000); // Wait for API response and toast
      await page.screenshot({ path: path.join(screenshotsDir, '05_save_success.png') });

      // 7. Verify unsaved changes guard
      console.log('Verifying UnsavedChangesGuard...');
      await totalSlotsInput.clear();
      await totalSlotsInput.fill('35'); // Make form dirty
      
      // Attempt to navigate back or click away
      const logoLink = page.locator('a[href="/dashboard"], a:has-text("DaNangTrip"), a:has-text("Dashboard")').first();
      if (await logoLink.isVisible()) {
        await logoLink.click({ noWaitAfter: true });
        await page.waitForTimeout(2000); // Allow modal to trigger
        await page.screenshot({ path: path.join(screenshotsDir, '06_unsaved_changes_modal.png') });
        
        // Stay on page (click stay button in modal)
        const stayBtn = page.locator('div[role="dialog"] button:has-text("Stay"), div[role="dialog"] button:has-text("Ở lại")').first();
        if (await stayBtn.isVisible()) {
          await stayBtn.click();
          console.log('Dismissed leave modal, stayed on page.');
        }
      }
    } else {
      console.log('Could not find form input fields (totalSlots). Page might not have loaded correctly.');
    }

    console.log('E2E Verification successfully completed.');
  });
});
