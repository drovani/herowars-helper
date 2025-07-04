import { test, expect } from '@playwright/test';
import { createDebugHelper } from '../utils/debug-helpers';

test.describe('Debug Helper Validation', () => {
  test('homepage loads without console errors', { tag: '@debug-tools' }, async ({ page }) => {
    const debug = createDebugHelper(page, 'homepage-load');

    // Navigate to homepage
    await page.goto('/');
    await debug.takeDOMSnapshot('initial-load');
    
    // Wait for the page to be fully loaded
    await debug.waitForNetworkIdle();
    
    // Log current page state
    await debug.logPageState();
    
    // Take another snapshot after network idle
    await debug.takeDOMSnapshot('after-network-idle');
    
    // Check page loaded correctly
    await expect(page).toHaveTitle(/Hero Wars Helper/);
    
    // Assert no console errors
    await debug.assertNoConsoleErrors();
    
    // Generate comprehensive debug report
    const report = await debug.generateDebugReport();
    
    console.log(`Test completed with ${report.consoleMessages.length} console messages`);
  });

  test('navigation works correctly', { tag: '@debug-tools' }, async ({ page }) => {
    const debug = createDebugHelper(page, 'navigation-test');

    await page.goto('/');
    await debug.takeDOMSnapshot('homepage');
    
    // Try to navigate to login if it exists
    const loginLink = page.locator('a[href*="login"], button:has-text("Login"), a:has-text("Login")').first();
    
    if (await loginLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginLink.click();
      await debug.takeDOMSnapshot('after-login-click');
      await debug.waitForNetworkIdle();
      await debug.logPageState();
    } else {
      console.log('No login link found, checking for other navigation options');
      
      // Look for any navigation links
      const navLinks = page.locator('nav a, [role="navigation"] a').first();
      if (await navLinks.isVisible({ timeout: 5000 }).catch(() => false)) {
        await navLinks.click();
        await debug.takeDOMSnapshot('after-nav-click');
        await debug.waitForNetworkIdle();
      }
    }
    
    // Check for errors after navigation
    const errors = debug.getErrors();
    if (errors.length > 0) {
      console.log('Navigation errors detected:', errors);
      await debug.takeDOMSnapshot('navigation-errors');
    }
    
    await debug.generateDebugReport();
  });

  test('form interactions (if forms exist)', { tag: '@debug-tools' }, async ({ page }) => {
    const debug = createDebugHelper(page, 'form-interactions');

    await page.goto('/');
    await debug.waitForNetworkIdle();
    
    // Look for any forms on the page
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      console.log(`Found ${formCount} forms on the page`);
      await debug.takeDOMSnapshot('forms-found');
      
      // Try to interact with the first form
      const firstForm = forms.first();
      const inputs = firstForm.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        console.log(`Found ${inputCount} form inputs`);
        
        // Try to fill the first text input
        const textInputs = inputs.locator('input[type="text"], input[type="email"], input:not([type]), textarea');
        if (await textInputs.count() > 0) {
          await textInputs.first().fill('test-value');
          await debug.takeDOMSnapshot('form-filled');
        }
      }
    } else {
      console.log('No forms found on the page');
      await debug.takeDOMSnapshot('no-forms');
    }
    
    await debug.logPageState();
    await debug.generateDebugReport();
  });

  test('responsive design check', { tag: '@debug-tools' }, async ({ page }) => {
    const debug = createDebugHelper(page, 'responsive-design');

    await page.goto('/');
    
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await debug.takeDOMSnapshot('desktop-view');
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await debug.takeDOMSnapshot('tablet-view');
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await debug.takeDOMSnapshot('mobile-view');
    
    await debug.logPageState();
    await debug.generateDebugReport();
  });
});