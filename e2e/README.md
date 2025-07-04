# End-to-End Testing with Playwright

This directory contains Playwright end-to-end tests with enhanced debugging capabilities for the Hero Wars Helper application.

## Features

- **DOM Snapshots**: Automatically capture HTML and screenshots at key test steps
- **Console Error Tracking**: Monitor and capture all browser console messages, errors, and warnings
- **Debug Reports**: Generate comprehensive JSON reports with all captured data
- **Network Monitoring**: Wait for network idle states and track async operations
- **Responsive Testing**: Test across different viewport sizes and devices

## Running Tests

```bash
# Run all e2e tests
npm run e2e

# Run tests with browser UI visible
npm run e2e:headed

# Run tests in debug mode (step through tests)
npm run e2e:debug

# Run tests with Playwright UI
npm run e2e:ui

# View test results report
npm run e2e:report
```

### Running Specific Test Groups

```bash
# Run only debug helper validation tests
npm run e2e:debug-tools

# Run all tests except debug validation
npm run e2e:no-debug

# Run specific test file
npm run e2e e2e/helpers/debug-validation.spec.ts

# Alternative syntax for grep patterns
npm run e2e -- --grep "@debug-tools"
npm run e2e -- --grep-invert "@debug-tools"
```

## Debug Helper Usage

The `DebugHelper` class provides utilities for capturing debugging information:

```typescript
import { createDebugHelper } from './utils/debug-helpers';

test('my test', async ({ page }) => {
  const debug = createDebugHelper(page, 'my-test-name');
  
  await page.goto('/');
  
  // Take DOM snapshot
  await debug.takeDOMSnapshot('after-load');
  
  // Wait for network to stabilize
  await debug.waitForNetworkIdle();
  
  // Log current page state
  await debug.logPageState();
  
  // Assert no console errors
  await debug.assertNoConsoleErrors();
  
  // Generate final report
  await debug.generateDebugReport();
});
```

## Output Locations

- **Test Reports**: `playwright-report/index.html`
- **DOM Snapshots**: `playwright-report/snapshots/`
- **Debug Reports**: `playwright-report/debug-reports/`
- **Videos/Screenshots**: `test-results/`

## Debugging UI Issues

When you encounter wonky or unintuitive UI behavior:

1. **Run debug validation tests**: `npm run e2e -- --grep "@debug-tools"` to validate your debug setup
2. **Run headed mode**: `npm run e2e:headed` to see browser interactions in real-time
3. **Check console errors**: Look for JavaScript errors in the debug report (`playwright-report/debug-reports/`)
4. **Review DOM snapshots**: Compare HTML structure at different test steps (`playwright-report/snapshots/`)
5. **Analyze network activity**: Check if async operations are completing properly
6. **Test responsive behavior**: Verify UI works across different screen sizes

### Quick Debug Workflow
```bash
# First, validate debug tools are working
npm run e2e e2e/helpers/debug-validation.spec.ts

# Then run your specific test with debugging
npm run e2e:debug your-test.spec.ts
```

## Browser Support

Tests run against:
- Chromium (Desktop)
- Firefox (Desktop) 
- WebKit/Safari (Desktop)
- Mobile Chrome (Pixel 7)
- Mobile Safari (iPhone 15)
- Microsoft Edge
- Google Chrome

The configuration automatically starts your dev server before running tests and stops it after completion.